"""
NetDeck API discovery probe.

No modifica cards.json.
No descarga imágenes.
Sólo intenta descubrir endpoints válidos.
"""

import json
from pathlib import Path

import requests

BASE_URL = "https://api.netdeck.gg"

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ARTIFACT_DIR = PROJECT_ROOT / "artifacts" / "netdeck"

TIMEOUT_SECONDS = 30

CANDIDATE_ENDPOINTS = [
    "/",
    "/cyberpunk",
    "/cyberpunk/cards",
    "/api/cyberpunk/cards",
    "/v1/cyberpunk/cards",
    "/games/cyberpunk/cards",
]

def summarize_response(response):
    content_type = response.headers.get("content-type", "")

    summary = {
        "url": response.url,
        "status": response.status_code,
        "content_type": content_type,
        "content_length": len(response.content),
    }

    if "application/json" in content_type.lower():
        try:
            payload = response.json()

            summary["json_type"] = type(payload).__name__

            if isinstance(payload, list):
                summary["item_count"] = len(payload)
                summary["preview"] = payload[:2]

            elif isinstance(payload, dict):
                summary["keys"] = list(payload.keys())[:30]
                summary["preview"] = {
                    key: payload[key]
                    for key in list(payload.keys())[:5]
                }

        except Exception as error:
            summary["json_error"] = str(error)

    else:
        summary["text_preview"] = response.text[:500]

    return summary


def main():
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

    report = []

    session = requests.Session()

    session.headers.update(
        {
            "Accept": "application/json",
            "User-Agent": "Afterlife-Deckbuilder-Probe/1.0"
        }
    )

    for endpoint in CANDIDATE_ENDPOINTS:
        url = f"{BASE_URL}{endpoint}"

        print(f"[PROBE] {url}")

        try:
            response = session.get(
                url,
                timeout=TIMEOUT_SECONDS,
                allow_redirects=True
            )

            report.append(
                summarize_response(response)
            )

            print(
                f"       status={response.status_code}"
            )

        except Exception as error:
            report.append(
                {
                    "url": url,
                    "error": str(error),
                }
            )

            print(
                f"       error={error}"
            )

    output_file = ARTIFACT_DIR / "probe-report.json"

    output_file.write_text(
        json.dumps(
            report,
            indent=2,
            ensure_ascii=False
        ),
        encoding="utf-8",
    )

    print(f"\n[REPORT] {output_file}")


if __name__ == "__main__":
    main()