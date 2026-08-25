"""
Cyberpunk TCG Card Database Scraper

Source:
    https://cyberpunktcg.com/cards

Responsibilities:
    1. Discover every card detail page exposed by the official gallery.
    2. Traverse paginated gallery results.
    3. Parse current card data from each detail page.
    4. Preserve existing cards when a temporary scrape misses a record.
    5. Never overwrite cards.json with an unsafe or incomplete result.
    6. Preserve the original date_added value for existing cards.
    7. Write through a temporary file and validate before replacement.

This scraper stores one canonical record per card slug. Multiple physical
printings of the same card are not expanded into separate records yet.
"""

import json
import re
import shutil
import time
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.common.exceptions import (
    StaleElementReferenceException,
    TimeoutException,
    WebDriverException,
)
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


# ============================================================================
# CONFIGURATION
# ============================================================================

BASE_URL = "https://cyberpunktcg.com"
CARDS_URL = f"{BASE_URL}/cards"

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent

OUTPUT_FILE = PROJECT_ROOT / "src" / "data" / "cards.json"
TEMP_OUTPUT_FILE = OUTPUT_FILE.with_suffix(".tmp.json")
BACKUP_OUTPUT_FILE = OUTPUT_FILE.with_suffix(".pre-scrape.json")

PAGE_WAIT_SECONDS = 2
CARD_WAIT_SECONDS = 0.5
MAX_GALLERY_PAGES = 20

# The official gallery currently exposes substantially more than 48 cards.
# This threshold protects the existing dataset if page discovery breaks.
MIN_EXPECTED_DISCOVERED_LINKS = 100

# At least this percentage of discovered pages must parse successfully.
MIN_PARSE_SUCCESS_RATIO = 0.90

VALID_CARD_TYPES = {
    "LEGEND",
    "UNIT",
    "GEAR",
    "PROGRAM",
}

VALID_FACTIONS = {
    "ARASAKA",
    "MERC",
    "CORPO",
    "NETRUNNER",
    "NOMAD",
    "GANGER",
    "ROCKERBOY",
    "RIPPERDOC",
    "NCPD",
    "ALDECADO",
    "ALDECALDO",
    "DOLL",
    "OVERCLOCKING",
    "ZETATECH",
    "MILITECH",
    "VEHICLE",
    "CYBERWARE",
    "WEAPON",
    "PLAN",
    "BRAINDANCE",
    "QUICKHACK",
    "TECH",
    "MAELSTROM",
    "MOX",
    "TYGER CLAW",
    "VALENTINO",
    "VOODOO BOY",
    "ANIMAL",
    "NOMADS",
    "ROCKER",
}

KNOWN_RAM_COLORS = {
    "RED": "Red",
    "BLUE": "Blue",
    "GREEN": "Green",
    "YELLOW": "Yellow",
}


# ============================================================================
# FILE HANDLING
# ============================================================================


def load_existing_cards():
    """
    Load the existing card dataset.

    Returns:
        dict[str, dict]: Existing cards keyed by ID.
    """
    if not OUTPUT_FILE.exists():
        return {}

    try:
        with OUTPUT_FILE.open("r", encoding="utf-8") as file:
            cards = json.load(file)

        if not isinstance(cards, list):
            raise ValueError("cards.json root must be a JSON array.")

        valid_cards = {}

        for card in cards:
            if not isinstance(card, dict):
                continue

            card_id = card.get("id")

            if not card_id:
                continue

            valid_cards[card_id] = card

        return valid_cards

    except (OSError, json.JSONDecodeError, ValueError) as error:
        raise RuntimeError(
            f"Could not safely load existing cards.json: {error}"
        ) from error


def create_dataset_backup():
    """
    Create a local pre-scrape backup before modifying cards.json.
    """
    if not OUTPUT_FILE.exists():
        return

    shutil.copy2(OUTPUT_FILE, BACKUP_OUTPUT_FILE)

    print(f"[BACKUP] Created: {BACKUP_OUTPUT_FILE}")


def write_validated_dataset(cards, existing_count):
    """
    Write the dataset through a temporary JSON file.

    The final file is replaced only after the temporary output passes
    structural and count validation.
    """
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with TEMP_OUTPUT_FILE.open("w", encoding="utf-8") as file:
        json.dump(cards, file, indent=2, ensure_ascii=False)

    try:
        with TEMP_OUTPUT_FILE.open("r", encoding="utf-8") as file:
            validated_cards = json.load(file)
    except (OSError, json.JSONDecodeError) as error:
        raise RuntimeError(
            f"Temporary dataset validation failed: {error}"
        ) from error

    validate_dataset(validated_cards, existing_count)

    TEMP_OUTPUT_FILE.replace(OUTPUT_FILE)

    print(f"[SAVE] Dataset written safely to: {OUTPUT_FILE}")


def validate_dataset(cards, existing_count):
    """
    Validate the complete dataset before replacing cards.json.
    """
    if not isinstance(cards, list):
        raise RuntimeError("Dataset validation failed: root is not a list.")

    if len(cards) < existing_count:
        raise RuntimeError(
            "Dataset validation failed: refusing to shrink the dataset "
            f"from {existing_count} to {len(cards)} cards."
        )

    ids = []
    invalid_cards = []

    for card in cards:
        if not isinstance(card, dict):
            invalid_cards.append(
                {
                    "id": None,
                    "reason": "Record is not an object",
                }
            )
            continue

        card_id = card.get("id")
        card_name = card.get("name")
        card_type = card.get("type")

        if not card_id or not card_name or card_type not in VALID_CARD_TYPES:
            invalid_cards.append(
                {
                    "id": card_id,
                    "name": card_name,
                    "type": card_type,
                }
            )
            continue

        ids.append(card_id)

    duplicate_ids = sorted(
        {
            card_id
            for card_id in ids
            if ids.count(card_id) > 1
        }
    )

    if duplicate_ids:
        raise RuntimeError(
            "Dataset validation failed: duplicate IDs found: "
            + ", ".join(duplicate_ids)
        )

    if invalid_cards:
        print(
            "[WARN] Dataset contains records that require review:"
        )

        for invalid_card in invalid_cards:
            print(f"       {invalid_card}")


# ============================================================================
# DRIVER
# ============================================================================


def setup_driver():
    """
    Create a headless Chrome driver suitable for local runs and GitHub Actions.
    """
    options = Options()

    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--lang=en-US")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-notifications")
    options.add_argument("--disable-popup-blocking")

    options.page_load_strategy = "eager"

    driver = webdriver.Chrome(options=options)
    driver.set_page_load_timeout(45)

    return driver


# ============================================================================
# GENERAL HELPERS
# ============================================================================


def safe_text(element):
    """
    Return normalized text from a BeautifulSoup element.
    """
    if element is None:
        return ""

    return " ".join(element.get_text(" ", strip=True).split())


def normalize_url(value):
    """
    Normalize either a standard URL or an accidental HTML anchor string.

    This also protects against old records that contain:
        <a href="https://...">https://...</a>
    """
    if not isinstance(value, str):
        return ""

    value = value.strip()

    if not value:
        return ""

    href_match = re.search(
        r'href=https?://[^"\']+["\']',
        value,
        flags=re.IGNORECASE,
    )

    if href_match:
        return href_match.group(1)

    direct_match = re.search(
        r"https?://[^\s\"'<>]+",
        value,
        flags=re.IGNORECASE,
    )

    return direct_match.group(0) if direct_match else ""


def normalize_card_href(href):
    """
    Convert an official card href into a canonical absolute card URL.
    """
    if not isinstance(href, str):
        return None

    href = href.strip()

    if not href:
        return None

    absolute_url = urljoin(BASE_URL, href)
    parsed = urlparse(absolute_url)

    if parsed.netloc not in {
        "cyberpunktcg.com",
        "www.cyberpunktcg.com",
    }:
        return None

    clean_path = parsed.path.rstrip("/")

    if not clean_path.startswith("/cards/"):
        return None

    path_parts = [
        part
        for part in clean_path.split("/")
        if part
    ]

    if len(path_parts) != 2:
        return None

    if path_parts[0] != "cards":
        return None

    slug = path_parts[1].strip()

    if not slug:
        return None

    return f"{BASE_URL}/cards/{slug}"


def parse_integer(value):
    """
    Extract the first integer from a text value.
    """
    if value is None:
        return None

    match = re.search(r"-?\d+", str(value))

    if not match:
        return None

    return int(match.group(0))


def get_card_id(url):
    """
    Extract a canonical card slug without query parameters.
    """
    parsed = urlparse(url)
    clean_path = parsed.path.rstrip("/")

    return clean_path.split("/")[-1]


# ============================================================================
# GALLERY DISCOVERY
# ============================================================================


def collect_links_from_current_page(driver):
    """
    Collect canonical card URLs from the currently rendered gallery page.
    """
    soup = BeautifulSoup(driver.page_source, "html.parser")
    collected_links = []

    for anchor in soup.find_all("a", href=True):
        normalized_url = normalize_card_href(anchor.get("href"))

        if normalized_url:
            collected_links.append(normalized_url)

    return list(dict.fromkeys(collected_links))


def scroll_gallery(driver):
    """
    Scroll through the current gallery to allow lazy-loaded links to render.
    """
    previous_height = 0

    for _ in range(20):
        current_height = driver.execute_script(
            "return document.body.scrollHeight"
        )

        driver.execute_script(
            "window.scrollTo(0, document.body.scrollHeight);"
        )

        time.sleep(0.5)

        new_height = driver.execute_script(
            "return document.body.scrollHeight"
        )

        if new_height == previous_height == current_height:
            break

        previous_height = new_height


def find_next_page_control(driver):
    """
    Find the next gallery page control.

    The official gallery may expose pagination as:
        - rel="next"
        - aria-label containing "next"
        - visible Next text
        - arrow icon
        - numeric page button
    """
    current_page_match = re.search(
        r"Page\s+(\d+)\s+of\s+(\d+)",
        driver.page_source,
        flags=re.IGNORECASE,
    )

    current_page = 1
    total_pages = None

    if current_page_match:
        current_page = int(current_page_match.group(1))
        total_pages = int(current_page_match.group(2))

        print(
            f"[PAGINATION] Current page: "
            f"{current_page}/{total_pages}"
        )

    selectors = [
        (By.CSS_SELECTOR, 'a[rel="next"]'),
        (By.CSS_SELECTOR, 'a[aria-label*="next" i]'),
        (By.CSS_SELECTOR, 'button[aria-label*="next" i]'),
        (
            By.XPATH,
            '//a[contains('
            'translate(normalize-space(.), '
            '"NEXT", "next"), "next")]',
        ),
        (
            By.XPATH,
            '//button[contains('
            'translate(normalize-space(.), '
            '"NEXT", "next"), "next")]',
        ),
        (
            By.XPATH,
            '//a[normalize-space(.)="›" '
            'or normalize-space(.)="→" '
            'or normalize-space(.)=">"]',
        ),
        (
            By.XPATH,
            '//button[normalize-space(.)="›" '
            'or normalize-space(.)="→" '
            'or normalize-space(.)=">"]',
        ),
    ]

    if total_pages and current_page < total_pages:
        next_page_number = current_page + 1

        selectors.extend(
            [
                (
                    By.XPATH,
                    f'//button[normalize-space(.)='
                    f'"{next_page_number}"]',
                ),
                (
                    By.XPATH,
                    f'//a[normalize-space(.)='
                    f'"{next_page_number}"]',
                ),
                (
                    By.CSS_SELECTOR,
                    f'[data-page="{next_page_number}"]',
                ),
                (
                    By.CSS_SELECTOR,
                    f'[aria-label*="page {next_page_number}" i]',
                ),
            ]
        )

    for by, selector in selectors:
        try:
            elements = driver.find_elements(by, selector)
        except WebDriverException:
            continue

        for element in elements:
            try:
                if not element.is_displayed():
                    continue

                disabled_attribute = element.get_attribute(
                    "disabled"
                )
                aria_disabled = element.get_attribute(
                    "aria-disabled"
                )
                classes = (
                    element.get_attribute("class") or ""
                ).lower()

                if (
                    disabled_attribute is not None
                    or aria_disabled == "true"
                    or "disabled" in classes
                ):
                    continue

                print(
                    "[PAGINATION] Control found: "
                    f"tag={element.tag_name}, "
                    f"text={element.text!r}, "
                    f"aria-label="
                    f"{element.get_attribute('aria-label')!r}"
                )

                return element

            except StaleElementReferenceException:
                continue

    print("[PAGINATION] No usable control detected.")

    return None

def click_next_page(driver, control):
    """
    Click a pagination control and verify that the gallery changed.
    """
    previous_url = driver.current_url
    previous_links = set(collect_links_from_current_page(driver))

    driver.execute_script(
        "arguments[0].scrollIntoView({block: 'center'});",
        control,
    )

    time.sleep(0.3)

    try:
        control.click()
    except WebDriverException:
        driver.execute_script(
            "arguments[0].click();",
            control,
        )

    def gallery_changed(current_driver):
        current_links = set(
            collect_links_from_current_page(current_driver)
        )

        url_changed = current_driver.current_url != previous_url
        links_changed = current_links != previous_links

        return url_changed or links_changed

    try:
        WebDriverWait(driver, 15).until(gallery_changed)
        return True
    except TimeoutException:
        return False


def extract_card_links(driver):
    """
    Discover every unique card detail link exposed by the official gallery.

    The function:
        1. Loads the official card gallery.
        2. Scrolls for lazy-loaded content.
        3. Collects links.
        4. Clicks the next pagination control.
        5. Stops when no new page can be reached.
    """
    print(f"[OPEN] Loading gallery: {CARDS_URL}")

    driver.get(CARDS_URL)

    WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.TAG_NAME, "body"))
    )

    time.sleep(PAGE_WAIT_SECONDS)

    all_links = []
    seen_links = set()
    page_signatures = set()

    for page_number in range(1, MAX_GALLERY_PAGES + 1):
        scroll_gallery(driver)

        page_links = collect_links_from_current_page(driver)
        page_signature = tuple(sorted(page_links))

        if page_signature in page_signatures:
            print(
                "[STOP] Gallery page repeated. "
                "Pagination loop prevented."
            )
            break

        page_signatures.add(page_signature)

        new_links = []

        for link in page_links:
            if link in seen_links:
                continue

            seen_links.add(link)
            all_links.append(link)
            new_links.append(link)

        print(
            f"[PAGE {page_number}] "
            f"{len(page_links)} visible links, "
            f"{len(new_links)} new, "
            f"{len(all_links)} total"
        )

        next_control = find_next_page_control(driver)

        if next_control is None:
            print("[STOP] No enabled next-page control found.")
            break

        if not click_next_page(driver, next_control):
            print(
                "[STOP] Next-page control did not change the gallery."
            )
            break

        time.sleep(PAGE_WAIT_SECONDS)

    return all_links


# ============================================================================
# CARD PAGE PARSING
# ============================================================================


def find_labeled_value(soup, label_text):
    """
    Find a value that follows a visible metadata label.

    Supports labels such as:
        SET:
        RARITY:
        NUMBER:
        ILLUSTRATED BY:
    """
    label_pattern = re.compile(
        rf"^\s*{re.escape(label_text)}\s*:?\s*$",
        flags=re.IGNORECASE,
    )

    label_element = soup.find(
        string=label_pattern,
    )

    if label_element is None:
        label_element = soup.find(
            ["span", "div", "p"],
            string=label_pattern,
        )

    if label_element is None:
        return ""

    parent = (
        label_element.parent
        if hasattr(label_element, "parent")
        else label_element
    )

    sibling = parent.find_next_sibling()

    if sibling:
        value = safe_text(sibling)

        if value:
            return value

    container = parent.parent

    if container:
        container_text = safe_text(container)
        match = re.search(
            rf"{re.escape(label_text)}\s*:?\s*(.+)",
            container_text,
            flags=re.IGNORECASE,
        )

        if match:
            return match.group(1).strip()

    return ""


def extract_stat_from_text(page_text, label):
    """
    Extract a numeric stat from visible page text.
    """
    match = re.search(
        rf"\b{re.escape(label)}\s*(\d+)\b",
        page_text,
        flags=re.IGNORECASE,
    )

    if not match:
        return None

    return int(match.group(1))


def extract_card_type(soup, page_text):
    """
    Extract one of the supported card types.
    """
    for element in soup.find_all(["span", "div", "p"]):
        value = safe_text(element).upper()

        if value in VALID_CARD_TYPES:
            return value

    match = re.search(
        r"\b(LEGEND|UNIT|GEAR|PROGRAM)\b",
        page_text,
        flags=re.IGNORECASE,
    )

    return match.group(1).upper() if match else ""


def extract_faction(soup):
    """
    Extract the first recognized faction or classification chip.
    """
    candidates = soup.find_all(
        ["span", "div"],
        class_=lambda classes: (
            classes
            and any(
                token in " ".join(classes)
                for token in ["chip", "badge", "hud"]
            )
        ),
    )

    for candidate in candidates:
        value = safe_text(candidate).upper()

        if value in VALID_FACTIONS:
            return value

    return None


def extract_keywords(soup):
    """
    Extract keyword labels from a visible KEYWORDS section.
    """
    keyword_text_node = soup.find(
        string=re.compile(r"KEYWORDS\s*:", re.IGNORECASE)
    )

    if keyword_text_node is None:
        return []

    parent = keyword_text_node.parent

    if parent is None:
        return []

    combined_text = safe_text(parent)

    combined_text = re.sub(
        r"KEYWORDS\s*:",
        "",
        combined_text,
        flags=re.IGNORECASE,
    ).strip()

    if not combined_text:
        sibling = parent.find_next_sibling()

        if sibling:
            combined_text = safe_text(sibling)

    if not combined_text:
        return []

    keywords = re.split(
        r"[,|•]+",
        combined_text,
    )

    return [
        keyword.strip()
        for keyword in keywords
        if keyword.strip()
    ]


def extract_rules_text(soup):
    """
    Extract printed rules text from the card detail page.
    """
    label = soup.find(
        string=re.compile(r"^\s*RULES TEXT\s*$", re.IGNORECASE)
    )

    if label is None:
        return ""

    parent = label.parent

    if parent is None:
        return ""

    candidate = parent.find_next_sibling()

    if candidate:
        candidate_text = safe_text(candidate)

        if candidate_text:
            return candidate_text

    candidate = parent.find_next(
        ["div", "p"],
        class_=lambda classes: (
            classes
            and "whitespace-pre-wrap" in classes
        ),
    )

    return safe_text(candidate)


def extract_image_url(soup):
    """
    Extract the highest-quality card image URL available on the page.
    """
    image_candidates = soup.find_all("img", src=True)

    preferred_patterns = [
        r"cloudfront",
        r"cyberpunk",
        r"card",
    ]

    for pattern in preferred_patterns:
        for image in image_candidates:
            source = normalize_url(image.get("src", ""))

            if source and re.search(
                pattern,
                source,
                flags=re.IGNORECASE,
            ):
                return source

    for image in image_candidates:
        source = normalize_url(image.get("src", ""))

        if source.endswith(
            (".webp", ".png", ".jpg", ".jpeg")
        ):
            return source

    return ""


def extract_ram_color(soup):
    """
    Extract RAM color from card color CSS classes or visible labels.
    """
    elements = soup.find_all(
        ["span", "div"],
        class_=lambda classes: (
            classes
            and any(
                "card-" in class_name
                for class_name in classes
            )
        ),
    )

    for element in elements:
        classes = element.get("class", [])

        for class_name in classes:
            match = re.search(
                r"(?:bg|text|border)-card-"
                r"(red|blue|green|yellow)",
                class_name,
                flags=re.IGNORECASE,
            )

            if match:
                return KNOWN_RAM_COLORS[
                    match.group(1).upper()
                ]

    page_text = safe_text(soup)

    match = re.search(
        r"\b(RED|BLUE|GREEN|YELLOW)\b",
        page_text,
        flags=re.IGNORECASE,
    )

    if match:
        return KNOWN_RAM_COLORS.get(
            match.group(1).upper(),
            "",
        )

    return ""


def parse_card_page(driver, url, existing_card=None):
    """
    Parse one official card detail page.

    Existing card data is used only as a fallback for values that cannot
    be recovered during the current run.
    """
    existing_card = existing_card or {}

    try:
        driver.get(url)

        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.TAG_NAME, "h1"))
        )

        time.sleep(CARD_WAIT_SECONDS)

        soup = BeautifulSoup(driver.page_source, "html.parser")
        page_text = safe_text(soup)

        h1 = soup.find("h1")
        name = safe_text(h1)

        if not name:
            raise ValueError("Card name was not found.")

        subtitle = ""

        if h1:
            subtitle_candidate = h1.find_next(
                ["p", "h2", "span"]
            )
            subtitle = safe_text(subtitle_candidate)

        invalid_subtitle_fragments = [
            "subscribe to updates",
            "follow us on socials",
            "card database",
            "home cards gameplay",
        ]

        if any(
            fragment in subtitle.lower()
            for fragment in invalid_subtitle_fragments
        ):
            subtitle = ""

        card_id = get_card_id(url)

        card_type = extract_card_type(soup, page_text)

        if card_type not in VALID_CARD_TYPES:
            card_type = existing_card.get("type", "")

        cost = extract_stat_from_text(page_text, "COST")
        power = extract_stat_from_text(page_text, "PWR")
        ram = extract_stat_from_text(page_text, "RAM")

        image_url = extract_image_url(soup)

        card_data = {
            "id": card_id,
            "name": name,
            "subtitle": subtitle,
            "url": url,
            "cost": (
                cost
                if cost is not None
                else existing_card.get("cost")
            ),
            "power": (
                power
                if power is not None
                else existing_card.get("power")
            ),
            "ram": (
                ram
                if ram is not None
                else existing_card.get("ram")
            ),
            "type": card_type,
            "faction": (
                extract_faction(soup)
                or existing_card.get("faction")
            ),
            "keywords": (
                extract_keywords(soup)
                or existing_card.get("keywords", [])
            ),
            "text": (
                extract_rules_text(soup)
                or existing_card.get("text", "")
            ),
            "image_url": (
                image_url
                or normalize_url(
                    existing_card.get("image_url", "")
                )
            ),
            "set": (
                find_labeled_value(soup, "SET")
                or existing_card.get("set", "")
            ),
            "rarity": (
                find_labeled_value(soup, "RARITY")
                or existing_card.get("rarity", "")
            ),
            "number": (
                find_labeled_value(soup, "NUMBER")
                or existing_card.get("number", "")
            ),
            "artist": (
                find_labeled_value(soup, "ILLUSTRATED BY")
                or existing_card.get("artist", "")
            ),
            "ram_color": (
                extract_ram_color(soup)
                or existing_card.get("ram_color", "")
            ),
            "date_added": existing_card.get(
                "date_added",
                datetime.now().strftime("%Y-%m-%d"),
            ),
            "last_synced_at": datetime.now().isoformat(
                timespec="seconds"
            ),
        }

        if not card_data["type"]:
            raise ValueError("Card type was not found.")

        if not card_data["image_url"]:
            print(
                f"[WARN] No image URL found for {card_id}. "
                "The frontend fallback will be used."
            )

        return card_data

    except (
        TimeoutException,
        WebDriverException,
        ValueError,
    ) as error:
        print(f"[ERROR] Failed to parse {url}: {error}")
        return None

    except Exception as error:
        print(
            f"[ERROR] Unexpected failure while parsing "
            f"{url}: {error}"
        )
        return None


# ============================================================================
# REPORTING
# ============================================================================


def print_dataset_summary(cards):
    """
    Print type and data-quality totals for the generated dataset.
    """
    type_counts = {
        card_type: 0
        for card_type in sorted(VALID_CARD_TYPES)
    }

    missing_images = []
    missing_types = []
    missing_rarity = []

    for card in cards:
        card_type = card.get("type")

        if card_type in type_counts:
            type_counts[card_type] += 1
        else:
            missing_types.append(card.get("id"))

        if not card.get("image_url"):
            missing_images.append(card.get("id"))

        if not card.get("rarity"):
            missing_rarity.append(card.get("id"))

    print("")
    print("=" * 72)
    print("DATASET SUMMARY")
    print("=" * 72)
    print(f"Total cards: {len(cards)}")

    for card_type, count in type_counts.items():
        print(f"{card_type}: {count}")

    print(f"Missing image URLs: {len(missing_images)}")
    print(f"Missing types: {len(missing_types)}")
    print(f"Missing rarity: {len(missing_rarity)}")

    if missing_images:
        print(
            "Missing image IDs: "
            + ", ".join(
                str(card_id)
                for card_id in missing_images
            )
        )

    if missing_types:
        print(
            "Missing type IDs: "
            + ", ".join(
                str(card_id)
                for card_id in missing_types
            )
        )


# ============================================================================
# MAIN
# ============================================================================


def main():
    print("=" * 72)
    print("CYBERPUNK TCG CARD SCRAPER")
    print("MODE: SAFE UPSERT + PAGINATION + DATASET VALIDATION")
    print("=" * 72)
    print(f"Source: {CARDS_URL}")
    print(f"Output: {OUTPUT_FILE}")
    print("")

    existing_cards = load_existing_cards()
    existing_count = len(existing_cards)

    print(
        f"[LOAD] {existing_count} existing cards loaded."
    )

    create_dataset_backup()

    driver = None

    try:
        driver = setup_driver()

        card_links = extract_card_links(driver)
        discovered_count = len(card_links)

        print("")
        print(
            f"[DISCOVERY] {discovered_count} unique card "
            "detail links found."
        )

        if discovered_count < MIN_EXPECTED_DISCOVERED_LINKS:
            raise RuntimeError(
                "Safety check failed: the official gallery discovery "
                f"returned only {discovered_count} links. "
                f"Minimum expected: {MIN_EXPECTED_DISCOVERED_LINKS}. "
                "cards.json was not overwritten."
            )

        final_cards_by_id = dict(existing_cards)
        scraped_ids = set()
        failed_links = []

        new_cards_count = 0
        updated_cards_count = 0

        for index, card_url in enumerate(
            card_links,
            start=1,
        ):
            card_id = get_card_id(card_url)
            existing_card = existing_cards.get(card_id)

            print(
                f"[SYNC {index}/{discovered_count}] "
                f"{card_id}",
                end=" ",
                flush=True,
            )

            scraped_card = parse_card_page(
                driver,
                card_url,
                existing_card=existing_card,
            )

            if scraped_card is None:
                failed_links.append(card_url)
                print("[FAILED]")
                continue

            final_cards_by_id[card_id] = scraped_card
            scraped_ids.add(card_id)

            if existing_card:
                updated_cards_count += 1
                print("[UPDATED]")
            else:
                new_cards_count += 1
                print("[NEW]")

        parsed_count = len(scraped_ids)
        success_ratio = (
            parsed_count / discovered_count
            if discovered_count
            else 0
        )

        print("")
        print(
            f"[PARSE] {parsed_count}/{discovered_count} "
            f"pages parsed successfully "
            f"({success_ratio:.1%})."
        )

        if success_ratio < MIN_PARSE_SUCCESS_RATIO:
            raise RuntimeError(
                "Safety check failed: parse success ratio was "
                f"{success_ratio:.1%}. "
                f"Minimum required: "
                f"{MIN_PARSE_SUCCESS_RATIO:.0%}. "
                "cards.json was not overwritten."
            )

        final_cards = list(
            final_cards_by_id.values()
        )

        final_cards.sort(
            key=lambda card: (
                str(card.get("set", "")),
                str(card.get("number", "")),
                str(card.get("name", "")),
                str(card.get("id", "")),
            )
        )

        print_dataset_summary(final_cards)

        print("")
        print("[VALIDATE] Validating generated dataset...")

        write_validated_dataset(
            final_cards,
            existing_count=existing_count,
        )

        print("")
        print("=" * 72)
        print("SCRAPE COMPLETED")
        print("=" * 72)
        print(f"Existing before run: {existing_count}")
        print(f"Discovered: {discovered_count}")
        print(f"Parsed successfully: {parsed_count}")
        print(f"New cards: {new_cards_count}")
        print(f"Updated cards: {updated_cards_count}")
        print(f"Failed pages: {len(failed_links)}")
        print(f"Final dataset: {len(final_cards)}")
        print(f"Saved to: {OUTPUT_FILE}")

        if failed_links:
            print("")
            print("FAILED URLS:")

            for failed_url in failed_links:
                print(f"  - {failed_url}")

    finally:
        if driver is not None:
            driver.quit()

        if TEMP_OUTPUT_FILE.exists():
            TEMP_OUTPUT_FILE.unlink(missing_ok=True)


if __name__ == "__main__":
    main()