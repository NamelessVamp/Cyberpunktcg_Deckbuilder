import json
import re
import time

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://cyberpunktcg.com"
CARDS_URL = f"{BASE_URL}/cards"
OUTPUT_FILE = "src/data/cards.json"


def extract_card_links(soup):
    """Extrae todos los links de cartas de la página principal."""
    cards = []
    for link in soup.find_all("a", href=True):
        href = link["href"]
        if href.startswith("/cards/") and href != "/cards":
            cards.append(BASE_URL + href)
    return list(set(cards))  # Remove duplicates


def parse_card_page(url):
    """Parsea la página individual de una carta."""
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.content, "html.parser")

        # Extraer datos básicos
        name = soup.find("h1")
        subtitle = soup.find("h1").find_next_sibling("p") if name else None

        card_data = {
            "id": url.split("/")[-1],
            "name": name.text.strip() if name else "Unknown",
            "subtitle": subtitle.text.strip() if subtitle else "",
            "url": url,
        }

        # Extraer stats (COST, PWR, RAM)
        stats = soup.find_all(string=re.compile(r"(COST|PWR|RAM)"))
        for stat in stats:
            parent = stat.find_parent()
            if parent:
                text = parent.text.strip()
                if "COST" in text:
                    card_data["cost"] = (
                        int(re.search(r"\d+", text).group())
                        if re.search(r"\d+", text)
                        else None
                    )
                elif "PWR" in text:
                    card_data["power"] = (
                        int(re.search(r"\d+", text).group())
                        if re.search(r"\d+", text)
                        else None
                    )
                elif "RAM" in text:
                    card_data["ram"] = (
                        int(re.search(r"\d+", text).group())
                        if re.search(r"\d+", text)
                        else None
                    )

        # Extraer tipo (LEGEND, UNIT, GEAR, PROGRAM)
        type_tags = ["LEGEND", "UNIT", "GEAR", "PROGRAM"]
        for tag in type_tags:
            if soup.find(string=tag):
                card_data["type"] = tag
                break

        # Extraer facción (MERC, ARASAKA, etc.)
        faction_elem = soup.find(
            string=re.compile(r"(MERC|ARASAKA|CORPO|NOMAD|NETRUNNER)")
        )
        card_data["faction"] = faction_elem.strip() if faction_elem else None

        # Extraer keywords
        keywords_elem = soup.find(string=re.compile(r"KEYWORDS:"))
        if keywords_elem:
            keywords_text = (
                keywords_elem.find_next().text if keywords_elem.find_next() else ""
            )
            card_data["keywords"] = [
                k.strip() for k in keywords_text.split(",") if k.strip()
            ]
        else:
            card_data["keywords"] = []

        # Extraer texto de reglas
        rules_header = soup.find(string=re.compile(r"RULES TEXT"))
        if rules_header:
            rules_elem = (
                rules_header.find_next("p") if rules_header.find_next() else None
            )
            card_data["text"] = rules_elem.text.strip() if rules_elem else ""
        else:
            card_data["text"] = ""

        # Extraer imagen
        img = soup.find("img", alt=True, src=True)
        if img and "cloudfront" in img["src"]:
            card_data["image_url"] = img["src"]

        # Extraer set y número
        set_elem = soup.find(string=re.compile(r"SET:"))
        if set_elem:
            card_data["set"] = (
                set_elem.find_next().text.strip() if set_elem.find_next() else ""
            )

        number_elem = soup.find(string=re.compile(r"NUMBER:"))
        if number_elem:
            card_data["number"] = (
                number_elem.find_next().text.strip() if number_elem.find_next() else ""
            )

        # Extraer artista
        artist_elem = soup.find(string=re.compile(r"ILLUSTRATED BY:"))
        if artist_elem:
            card_data["artist"] = (
                artist_elem.find_next().text.strip() if artist_elem.find_next() else ""
            )

        return card_data

    except Exception as e:
        print(f"❌ Error parsing {url}: {e}")
        return None


import os  # Agrega esto al inicio del archivo


def main():
    print("🔥 CYBERPUNK TCG SCRAPER v1.0")
    print("=" * 50)

    # Fetch main cards page
    print(f"📡 Fetching {CARDS_URL}...")
    response = requests.get(CARDS_URL)
    soup = BeautifulSoup(response.content, "html.parser")

    # Extract all card links
    card_links = extract_card_links(soup)
    print(f"✅ Found {len(card_links)} cards")

    # Parse each card
    cards = []
    for i, link in enumerate(card_links, 1):
        print(f"⚡ [{i}/{len(card_links)}] Scraping {link.split('/')[-1]}...")
        card = parse_card_page(link)
        if card:
            cards.append(card)
        time.sleep(0.5)

    # Create directory if it doesn't exist
    output_dir = os.path.dirname(OUTPUT_FILE)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"📁 Created directory: {output_dir}")

    # Save to JSON
    print(f"\n💾 Saving to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(cards, f, indent=2, ensure_ascii=False)

    print(f"✅ COMPLETE! {len(cards)} cards saved.")
    print(f"📂 Output: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
