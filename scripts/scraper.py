import json
import re
import time
from pathlib import Path

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

BASE_URL = "https://cyberpunktcg.com"
CARDS_URL = f"{BASE_URL}/cards"

# FIX: Path correcto desde scripts/ hacia src/data/
SCRIPT_DIR = Path(__file__).resolve().parent  # scripts/
PROJECT_ROOT = SCRIPT_DIR.parent  # Cyberpunktcg_Deckbuilder/
OUTPUT_FILE = PROJECT_ROOT / "src" / "data" / "cards.json"

# Valid factions (hardcoded from game knowledge)
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
}


def setup_driver():
    """Setup Chrome driver sin dependencias externas innecesarias."""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # En versiones modernas de Selenium, no necesitas Service(ChromeDriverManager().install())
    # Selenium buscará Chrome automáticamente en tu sistema.
    driver = webdriver.Chrome(options=chrome_options)
    return driver


def extract_card_links(driver):
    """Extrae todos los links de cartas."""
    driver.get(CARDS_URL)
    time.sleep(3)

    soup = BeautifulSoup(driver.page_source, "html.parser")
    links = []

    for link in soup.find_all("a", href=True):
        href = link["href"]
        if href.startswith("/cards/") and href != "/cards":
            full_url = BASE_URL + href
            if full_url not in links:
                links.append(full_url)

    return links


def safe_text(element):
    """Extrae texto seguro de un elemento."""
    return element.text.strip() if element else ""


def parse_card_page(driver, url):
    """Parsea una página individual de carta."""
    try:
        driver.get(url)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "h1"))
        )
        time.sleep(2)

        soup = BeautifulSoup(driver.page_source, "html.parser")

        # Nombre y subtítulo
        h1 = soup.find("h1")
        name = safe_text(h1)
        subtitle_elem = h1.find_next("p") if h1 else None
        subtitle = safe_text(subtitle_elem)

        # FIX: Ignorar subtítulos de placeholder
        if "Subscribe to updates" in subtitle or "follow us on socials" in subtitle:
            subtitle = ""

        card_data = {
            "id": url.split("/")[-1],
            "name": name,
            "subtitle": subtitle,
            "url": url,
        }

        # Extraer COST, PWR, RAM
        stats_divs = soup.find_all("div", class_=re.compile(r"inline-flex.*gap-2"))
        for div in stats_divs:
            label_span = div.find("span", class_="hud-label")
            value_span = div.find(
                "span", class_=lambda c: c and "hud-label" in c and "text-white" in c
            )

            if label_span and value_span:
                label = safe_text(label_span)
                value = safe_text(value_span)

                if label == "COST" and value:
                    card_data["cost"] = int(value)
                elif label == "PWR" and value:
                    card_data["power"] = int(value)
                elif label == "RAM" and value:
                    card_data["ram"] = int(value)

        # Tipo (LEGEND, UNIT, GEAR, PROGRAM)
        type_chip = soup.find(
            "span",
            class_="chip-cyber",
            string=re.compile(r"^(LEGEND|UNIT|GEAR|PROGRAM)$"),
        )
        if type_chip:
            card_data["type"] = safe_text(type_chip)

        # FIX: Facción (filtrar solo VALID_FACTIONS)
        faction_chips = soup.find_all("span", class_="chip-cyber")
        factions = []
        for chip in faction_chips:
            text = safe_text(chip).upper()
            if text in VALID_FACTIONS:
                factions.append(text)

        card_data["faction"] = factions[0] if factions else None

        # Keywords
        keywords_section = soup.find(string=re.compile(r"KEYWORDS:"))
        if keywords_section:
            parent = keywords_section.find_parent()
            if parent:
                keywords_text = safe_text(parent).replace("KEYWORDS:", "").strip()
                card_data["keywords"] = [
                    k.strip() for k in keywords_text.split(",") if k.strip()
                ]
        else:
            card_data["keywords"] = []

        # Texto de reglas
        rules_label = soup.find("div", class_="hud-label", string="RULES TEXT")
        if rules_label:
            rules_div = rules_label.find_next(
                "div", class_=re.compile(r"whitespace-pre-wrap")
            )
            card_data["text"] = safe_text(rules_div) if rules_div else ""
        else:
            card_data["text"] = ""

        # Imagen
        img = soup.find("img", src=re.compile(r"cloudfront"))
        if img and img.get("src"):
            card_data["image_url"] = img["src"]

        # FIX: Set, Number, Artist (buscar <span class="font-medium">)
        # Set
        set_label = soup.find(
            "span", class_="text-muted-foreground", string=re.compile(r"SET:")
        )
        if set_label:
            set_value = set_label.find_next_sibling("span", class_="font-medium")
            card_data["set"] = safe_text(set_value) if set_value else ""
        else:
            card_data["set"] = ""

        # Number
        number_label = soup.find(
            "span", class_="text-muted-foreground", string=re.compile(r"NUMBER:")
        )
        if number_label:
            number_value = number_label.find_next_sibling("span", class_="font-medium")
            card_data["number"] = safe_text(number_value) if number_value else ""
        else:
            card_data["number"] = ""

        # Artist
        artist_label = soup.find(
            "span",
            class_="text-muted-foreground",
            string=re.compile(r"ILLUSTRATED BY:"),
        )
        if artist_label:
            artist_value = artist_label.find_next_sibling("span", class_="font-medium")
            card_data["artist"] = safe_text(artist_value) if artist_value else ""
        else:
            card_data["artist"] = ""

        # Detectar color de RAM por el dot
        ram_dot = soup.find("span", class_=re.compile(r"bg-card-"))
        if ram_dot:
            classes = ram_dot.get("class", [])
            for cls in classes:
                if "bg-card-" in cls:
                    color = cls.replace("bg-card-", "")
                    card_data["ram_color"] = color.title()
                    break

        return card_data

    except Exception as e:
        print(f"❌ Error parsing {url}: {e}")
        return None


def main():
    print("🔥 CYBERPUNK TCG SCRAPER v2.3 (Path Fix)")
    print("=" * 50)
    print(f"📂 Output: {OUTPUT_FILE}")
    print("=" * 50)

    driver = setup_driver()

    try:
        # Extract card links
        print(f"📡 Fetching {CARDS_URL}...")
        card_links = extract_card_links(driver)
        print(f"✅ Found {len(card_links)} cards")

        # Parse each card
        cards = []
        for i, link in enumerate(card_links, 1):
            print(f"⚡ [{i}/{len(card_links)}] Scraping {link.split('/')[-1]}...")
            card = parse_card_page(driver, link)
            if card:
                cards.append(card)
            time.sleep(1)

        # Save to JSON
        output_dir = OUTPUT_FILE.parent
        output_dir.mkdir(parents=True, exist_ok=True)

        print(f"\n💾 Saving to {OUTPUT_FILE}...")
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(cards, f, indent=2, ensure_ascii=False)

        print(f"✅ COMPLETE! {len(cards)} cards saved to:")
        print(f"   {OUTPUT_FILE.absolute()}")

    finally:
        driver.quit()


if __name__ == "__main__":
    main()
    
#TODO: RARITY SCRAPING
#======================
# WeirdCo has not published official rarity data yet.
#Once available, scrape from official sources:
#- choom.gg API (if they add rarity field)
#- Official WeirdCo card database
#- Reddit AMA updates
#CURRENT WORKAROUND:
#  PackOpener.jsx uses injectRarity() function to assign
# temporary rarities based on set/number/cost analysis.
# WHEN UPDATING:
# 1. Add 'rarity' field to cards.json
# 2. Remove injectRarity() from PackOpener.jsx
#3. Update pull rates if official rates differ from temp rates