"""
Afterlife NetDeck ingestion pipeline.

This script:
1. Enumerates every Cyberpunk TCG card slug.
2. Fetches one complete detail record per slug.
3. Preserves all printing information.
4. Normalizes records into Afterlife's current card schema.
5. Writes raw and candidate snapshots.
6. NEVER overwrites cards.json.

Source API:
    https://api.netdeck.gg/api/cards/cyberpunk

Important:
    The NetDeck API is currently undocumented for general public access.
    The pipeline therefore validates every structural assumption and
    fails closed if the source changes.
"""

from __future__ import annotations

import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import quote

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


API_URL = "https://api.netdeck.gg/api/cards/cyberpunk"
OFFICIAL_CARD_URL = "https://cyberpunktcg.com/cards"

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIRECTORY = PROJECT_ROOT / "src" / "data"

CURRENT_DATASET_FILE = DATA_DIRECTORY / "cards.json"
RAW_OUTPUT_FILE = DATA_DIRECTORY / "cards.netdeck.raw.json"
CANDIDATE_OUTPUT_FILE = DATA_DIRECTORY / "cards.candidate.json"

PAGE_LIMIT = 100
CONCURRENCY = 8
REQUEST_TIMEOUT_SECONDS = 30

MIN_EXPECTED_CARDS = 120
MAX_EXPECTED_CARDS = 200

VALID_CARD_TYPES = {
    "LEGEND",
    "UNIT",
    "PROGRAM",
    "GEAR",
}

VALID_COLORS = {
    "RED",
    "BLUE",
    "GREEN",
    "YELLOW",
}


def create_session() -> requests.Session:
    """
    Create a requests session with bounded retries and backoff.
    """
    retry_policy = Retry(
        total=4,
        connect=4,
        read=4,
        status=4,
        backoff_factor=0.75,
        status_forcelist=[
            408,
            429,
            500,
            502,
            503,
            504,
        ],
        allowed_methods={"GET"},
        respect_retry_after_header=True,
    )

    adapter = HTTPAdapter(
        max_retries=retry_policy,
        pool_connections=CONCURRENCY,
        pool_maxsize=CONCURRENCY,
    )

    session = requests.Session()

    session.headers.update(
        {
            "Accept": "application/json",
            "User-Agent": (
                "Afterlife-Decks/0.5.6 "
                "(unofficial Cyberpunk TCG fan project)"
            ),
        }
    )

    session.mount("https://", adapter)

    return session


def fetch_json(
    session: requests.Session,
    url: str,
) -> Any:
    """
    Fetch and decode one JSON response.
    """
    response = session.get(
        url,
        timeout=REQUEST_TIMEOUT_SECONDS,
    )

    response.raise_for_status()

    content_type = response.headers.get(
        "content-type",
        "",
    ).lower()

    if "json" not in content_type:
        raise RuntimeError(
            f"Expected JSON from {url}, "
            f"received content-type {content_type!r}."
        )

    return response.json()


def enumerate_slugs(
    session: requests.Session,
    ) -> list: 

    """
        Enumerate every card slug through the paginated list endpoint.

        The list endpoint is used only for slug discovery because printings
        are omitted from list records.
        """
    slugs: list[str] = []
    expected_total: int | None = None
    offset = 0

    while expected_total is None or len(slugs) < expected_total:
        page_url = (
            f"{API_URL}"
            f"?limit={PAGE_LIMIT}"
            f"&offset={offset}"
        )

        print(f"[LIST] {page_url}")

        payload = fetch_json(
            session,
            page_url,
        )

        if not isinstance(payload, dict):
            raise RuntimeError(
                "List endpoint did not return a JSON object."
            )

        items = payload.get("items")
        total = payload.get("total")
        limit = payload.get("limit")
        returned_offset = payload.get("offset")

        if not isinstance(items, list):
            raise RuntimeError(
                "List response is missing an items array."
            )

        if not isinstance(total, int):
            raise RuntimeError(
                "List response is missing an integer total."
            )

        if expected_total is None:
            expected_total = total

            print(
                f"[LIST] API reports "
                f"{expected_total} cards."
            )

            if not (
                MIN_EXPECTED_CARDS
                <= expected_total
                <= MAX_EXPECTED_CARDS
            ):
                raise RuntimeError(
                    "Source count failed safety range: "
                    f"{expected_total}. Expected between "
                    f"{MIN_EXPECTED_CARDS} and "
                    f"{MAX_EXPECTED_CARDS}."
                )

        elif total != expected_total:
            raise RuntimeError(
                "API total changed during pagination: "
                f"{expected_total} -> {total}."
            )

        page_slugs = []

        for item in items:
            if not isinstance(item, dict):
                continue

            slug = item.get("slug")

            if isinstance(slug, str) and slug.strip():
                page_slugs.append(slug.strip())

        if not page_slugs:
            break

        slugs.extend(page_slugs)

        print(
            f"[LIST] offset={returned_offset} "
            f"limit={limit} "
            f"received={len(page_slugs)} "
            f"accumulated={len(slugs)}"
        )

        offset += PAGE_LIMIT

        if offset > MAX_EXPECTED_CARDS + PAGE_LIMIT:
            raise RuntimeError(
                "Pagination safety limit reached."
            )

    unique_slugs = list(dict.fromkeys(slugs))

    if expected_total is None:
        raise RuntimeError(
            "API did not report a total."
        )

    if len(unique_slugs) != expected_total:
        raise RuntimeError(
            f"Enumerated {len(unique_slugs)} unique slugs, "
            f"but API reported {expected_total}."
        )

    return unique_slugs


def fetch_card_detail(
    session: requests.Session,
    slug: str,
) -> dict[str, Any]:
    """
    Fetch one complete card through its canonical slug.
    """
    encoded_slug = quote(
        slug,
        safe="-",
    )

    detail_url = f"{API_URL}/{encoded_slug}"

    payload = fetch_json(
        session,
        detail_url,
    )

    if not isinstance(payload, dict):
        raise RuntimeError(
            f"Detail endpoint returned invalid data "
            f"for {slug}."
        )

    returned_slug = payload.get("slug")

    if returned_slug != slug:
        raise RuntimeError(
            f"Slug mismatch for {slug}: "
            f"{returned_slug!r}."
        )

    printings = payload.get("printings")

    if not isinstance(printings, list):
        raise RuntimeError(
            f"Card {slug} is missing printings[]."
        )

    if not printings:
        raise RuntimeError(
            f"Card {slug} returned zero printings."
        )

    return payload


def fetch_all_details(
    session: requests.Session,
    slugs: list[str],
) -> list[dict[str, Any]]:
    """
    Fetch every detail record with bounded concurrency.
    """
    cards_by_slug: dict[str, dict[str, Any]] = {}
    failures: list[dict[str, str]] = []

    with ThreadPoolExecutor(
        max_workers=CONCURRENCY,
    ) as executor:
        futures = {
            executor.submit(
                fetch_card_detail,
                session,
                slug,
            ): slug
            for slug in slugs
        }

        total = len(futures)
        completed = 0

        for future in as_completed(futures):
            slug = futures[future]
            completed += 1

            try:
                card = future.result()
                cards_by_slug[slug] = card

                print(
                    f"[DETAIL {completed}/{total}] "
                    f"{slug} [OK]"
                )

            except Exception as error:
                failures.append(
                    {
                        "slug": slug,
                        "error": str(error),
                    }
                )

                print(
                    f"[DETAIL {completed}/{total}] "
                    f"{slug} [FAIL] {error}"
                )

    if failures:
        failure_summary = "\n".join(
            f"  - {failure['slug']}: "
            f"{failure['error']}"
            for failure in failures
        )

        raise RuntimeError(
            "One or more card details failed:\n"
            f"{failure_summary}"
        )

    ordered_cards = [
        cards_by_slug[slug]
        for slug in slugs
    ]

    if len(ordered_cards) != len(slugs):
        raise RuntimeError(
            "Detail result count does not match slug count."
        )

    return ordered_cards


def load_existing_date_map() -> dict[str, str]:
    """
    Preserve date_added for already-known valid card slugs.
    """
    if not CURRENT_DATASET_FILE.exists():
        return {}

    try:
        current_cards = json.loads(
            CURRENT_DATASET_FILE.read_text(
                encoding="utf-8",
            )
        )

    except (
        OSError,
        json.JSONDecodeError,
    ):
        return {}

    date_map = {}

    if not isinstance(current_cards, list):
        return date_map

    for card in current_cards:
        if not isinstance(card, dict):
            continue

        card_id = card.get("id")
        date_added = card.get("date_added")

        if not isinstance(card_id, str):
            continue

        canonical_id = card_id.split("?")[0]

        if isinstance(date_added, str):
            date_map[canonical_id] = date_added

    return date_map


def normalize_set(
    value: Any,
) -> dict[str, str]:
    """
    Normalize a NetDeck set reference.
    """
    if not isinstance(value, dict):
        return {
            "code": "",
            "name": "",
        }

    return {
        "code": str(
            value.get("code") or ""
        ),
        "name": str(
            value.get("name") or ""
        ),
    }


def normalize_printing(
    printing: dict[str, Any],
) -> dict[str, Any]:
    """
    Normalize one physical printing.
    """
    return {
        "id": str(
            printing.get("id") or ""
        ),
        "collector_number": str(
            printing.get("collector_number") or ""
        ),
        "set": normalize_set(
            printing.get("set")
        ),
        "rarity": str(
            printing.get("rarity") or ""
        ),
        "artist": str(
            printing.get("artist") or ""
        ),
        "finish": printing.get("finish"),
        "image_url": str(
            printing.get("image_url") or ""
        ),
        "source_image_url": str(
            printing.get("source_image_url") or ""
        ),
    }


def select_printing(
    raw_card: dict[str, Any],
    printings: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Resolve the API-selected default printing.
    """
    selected_printing_id = raw_card.get(
        "selected_printing_id"
    )

    for printing in printings:
        if printing.get("id") == selected_printing_id:
            return printing

    printing_id = raw_card.get("printing_id")

    for printing in printings:
        if printing.get("id") == printing_id:
            return printing

    return printings[0]


def normalize_card(
    raw_card: dict[str, Any],
    date_map: dict[str, str],
) -> dict[str, Any]:
    """
    Convert one complete NetDeck card into Afterlife's schema.

    Extra structured fields are preserved for future variants and filters.
    """
    slug = str(
        raw_card.get("slug") or ""
    ).strip()

    if not slug:
        raise RuntimeError(
            "Cannot normalize a card without a slug."
        )

    raw_printings = raw_card.get("printings")

    if not isinstance(raw_printings, list):
        raise RuntimeError(
            f"Card {slug} has invalid printings."
        )

    printings = [
        normalize_printing(printing)
        for printing in raw_printings
        if isinstance(printing, dict)
    ]

    if not printings:
        raise RuntimeError(
            f"Card {slug} has no valid printings."
        )

    selected_printing = select_printing(
        raw_card,
        printings,
    )

    card_type = str(
        raw_card.get("card_type") or ""
    ).upper()

    color = str(
        raw_card.get("color") or ""
    ).upper()

    classifications = raw_card.get(
        "classifications"
    )

    if not isinstance(classifications, list):
        classifications = []

    keywords = raw_card.get("keywords")

    if not isinstance(keywords, list):
        keywords = []

    name = str(
        raw_card.get("name")
        or raw_card.get("display_name")
        or slug
    )

    subtitle = str(
        raw_card.get("subname") or ""
    )

    today = datetime.now(
        timezone.utc
    ).date().isoformat()

    synced_at = datetime.now(
        timezone.utc
    ).isoformat(
        timespec="seconds"
    )

    selected_set = selected_printing.get(
        "set",
        {
            "code": "",
            "name": "",
        },
    )

    return {
        "id": slug,
        "netdeck_id": str(
            raw_card.get("id") or ""
        ),
        "external_id": str(
            raw_card.get("external_id") or ""
        ),
        "slug": slug,
        "name": name,
        "subtitle": subtitle,
        "display_name": str(
            raw_card.get("display_name")
            or name
        ),
        "url": f"{OFFICIAL_CARD_URL}/{slug}",
        "cost": raw_card.get("cost"),
        "power": raw_card.get("power"),
        "ram": raw_card.get("ram"),
        "type": card_type,
        "faction": (
            str(classifications[0]).upper()
            if classifications
            else None
        ),
        "classifications": [
            str(value)
            for value in classifications
        ],
        "keywords": [
            str(value)
            for value in keywords
        ],
        "text": str(
            raw_card.get("rules_text") or ""
        ),
        "flavor_text": (
            raw_card.get("flavor_text")
        ),
        "ram_color": (
            color.title()
            if color
            else ""
        ),
        "color": (
            color.title()
            if color
            else ""
        ),
        "is_eddiable": bool(
            raw_card.get("is_eddiable", False)
        ),
        "legality": str(
            raw_card.get("legality") or ""
        ),
        "selected_printing_id": str(
            raw_card.get("selected_printing_id")
            or selected_printing.get("id")
            or ""
        ),
        "printing_id": str(
            selected_printing.get("id") or ""
        ),
        "set": str(
            selected_set.get("name") or ""
        ),
        "set_code": str(
            selected_set.get("code") or ""
        ),
        "rarity": str(
            selected_printing.get("rarity") or ""
        ),
        "number": str(
            selected_printing.get(
                "collector_number"
            ) or ""
        ),
        "artist": str(
            selected_printing.get("artist") or ""
        ),
        "image_url": str(
            selected_printing.get(
                "image_url"
            )
            or raw_card.get("image_url")
            or ""
        ),
        "source_image_url": str(
            selected_printing.get(
                "source_image_url"
            )
            or raw_card.get(
                "source_image_url"
            )
            or ""
        ),
        "printings": printings,
        "date_added": date_map.get(
            slug,
            today,
        ),
        "last_synced_at": synced_at,
    }


def validate_candidate(
    cards: list[dict[str, Any]],
) -> None:
    """
    Validate the complete Afterlife candidate snapshot.
    """
    count = len(cards)

    if not (
        MIN_EXPECTED_CARDS
        <= count
        <= MAX_EXPECTED_CARDS
    ):
        raise RuntimeError(
            f"Candidate count {count} is outside "
            "the configured safety range."
        )

    ids = [
        card.get("id")
        for card in cards
    ]

    duplicate_ids = sorted(
        {
            card_id
            for card_id in ids
            if ids.count(card_id) > 1
        }
    )

    if duplicate_ids:
        raise RuntimeError(
            "Duplicate canonical IDs: "
            + ", ".join(duplicate_ids)
        )

    invalid_cards = []

    for card in cards:
        card_id = card.get("id")
        card_name = card.get("name")
        card_type = card.get("type")
        card_color = str(
            card.get("color") or ""
        ).upper()
        printings = card.get("printings")

        reasons = []

        if not card_id:
            reasons.append("missing id")

        if not card_name:
            reasons.append("missing name")

        if card_type not in VALID_CARD_TYPES:
            reasons.append(
                f"invalid type {card_type!r}"
            )

        if card_color not in VALID_COLORS:
            reasons.append(
                f"invalid color {card_color!r}"
            )

        if not isinstance(printings, list) or not printings:
            reasons.append("missing printings")

        if not card.get("image_url"):
            reasons