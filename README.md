# 🔥 Cyberpunk TCG Deck Builder

A modern, open-source deck builder for the Cyberpunk 2077 Trading Card Game.

## Features (Phase 1 - In Progress)

- 🔍 **Advanced Search & Filtering** - Fuzzy search by name, filter by type, cost, RAM, tags
- ✅ **Real-Time Validation** - Dynamic RAM calculator, deck size limits, copy restrictions
- 📊 **Deck Analytics** - Eddie curve, tribal synergy %, card type distribution
- 📤 **Export to Text** - Discord-friendly plain text format (stealth mode)
- ⭐ **Wishlist** - Mark cards you want to pull

## Tech Stack

- **Frontend**: React + Vite (coming soon)
- **Data**: JSON local database (no backend required)
- **Scraper**: Python + BeautifulSoup4
- **Hosting**: GitHub Pages (planned)

## Card Database

The scraper pulls card data from [cyberpunktcg.com/cards](https://cyberpunktcg.com/cards).

### Update Cards
```bash
# Activate virtual environment
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Run scraper
python scripts/scraper.py
```

## Installation (Dev)
```bash
# Clone repo
git clone https://github.com/NamelessVamp/Cyberpunktcg_Deckbuilder
cd Cyberpunktcg_Deckbuilder

# Setup Python venv
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Run scraper
python scripts/scraper.py
```

## Roadmap

- [x] Card scraper
- [ ] React boilerplate
- [ ] Search & filtering system
- [ ] RAM validator (dynamic, no hardcoded combos)
- [ ] Deck analytics
- [ ] Export to text
- [ ] GitHub Pages deployment

## Legal

This is a fan-made, non-commercial project. Cyberpunk 2077 and related trademarks are property of CD PROJEKT RED. Card data is sourced from the official [Cyberpunk TCG website](https://cyberpunktcg.com).

---

**"Never stop fighting."** — V