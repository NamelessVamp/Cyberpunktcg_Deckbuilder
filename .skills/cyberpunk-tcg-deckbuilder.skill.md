---
name: cyberpunk-tcg-deckbuilder
description: Expert knowledge for building the Afterlife Decks deck builder for Cyberpunk 2077 TCG. Contains game rules, technical architecture, UI patterns, and anti-patterns to avoid. Use when working on any aspect of this specific project.
version: 1.0.0
author: Vamp (Inti)
created: 2026-04-04
license: Project-specific - CD PROJEKT RED IP, MIT code
---

# CYBERPUNK TCG DECK BUILDER SKILL

## PROJECT IDENTITY

**Name:** Afterlife Decks
**Purpose:** Professional deck building tool for Cyberpunk 2077 Trading Card Game (WeirdCo, Alpha/Beta Kit 2026)
**Goal:** Surpass choom.gg by learning from its documented errors
**Status:** Phase 8 (UI/UX Polish) - 96% deployment ready

**CRITICAL:** A deck builder is a tool for creating, organizing, analyzing, and sharing decks BEFORE playing. It is NOT a game simulator. The offline simulator is a future Phase 9 feature.

---

## TECH STACK

**Frontend:** React 19.2.4 + Vite
**Backend:** Supabase (Auth + Database)
**Styling:** Tailwind CSS with custom terminal theme
**Animations:** Framer Motion
**State:** React hooks (no Redux)
**Data:** Local JSON (cards.json) + Supabase for user data
**Deployment:** Vercel (target), GitHub Pages (alternative)

**IMPORTANT:** No backend server, no API calls for card data. Cards are loaded from local JSON for zero-latency filtering.

---

## GAME RULES (OFFICIAL CYBERPUNK TCG)

### DECK CONSTRUCTION (TOURNAMENT LEGAL)

1. **Exactly 3 Legends** with unique names
2. **40-50 cards** in main deck (excluding Legends)
3. **Max 3 copies** of any card (by name, not ID)
4. **RAM limits** enforced by Legend colors
5. **Sideboard:** 0-15 cards (max 3 copies by name) - NOT in Alpha Kit, future feature

### RAM SYSTEM (CRITICAL - NEVER HARDCODE COMBINATIONS)

**How it works:**
- Each Legend has a RAM color (Red, Yellow, Green, Blue) and RAM value
- Cumulative RAM = sum of all 3 Legends of the same color
- Cards can only be included if their RAM requirement ≤ Legend total for that color

**Example:**
```
Legends:
- Goro Takemura (2 Green RAM)
- Saburo Arasaka (2 Green RAM)  
- Yorinobu Arasaka (2 Red RAM)

Deck limits:
- Green cards: up to 4 RAM
- Red cards: up to 2 RAM
- Yellow/Blue cards: 0 RAM (cannot include)
```

**ANTI-PATTERN:** Never assume color combinations (e.g., "Red/Green decks"). The validator must read the 3 chosen Legends dynamically and calculate available RAM per color.

### CARD TYPES

**4 Official Types:**
1. **LEGEND** - Leaders of your crew, start face-down
2. **UNIT** - Crew members that attack
3. **PROGRAM** - One-time tactical plays (like "instants")
4. **GEAR** - Equipment that attaches to Units

**Tags (Subtipos):** Merc, Arasaka, Cyberware, etc. Used for tribal synergies.

**NO "Events" or "Assets"** - Those don't exist in this game.

### WIN CONDITIONS

1. **Normal Win:** Start your turn with 6+ Gig Dice
2. **Overtime Win:** If both players complete a turn WITHOUT taking a new Gig, the game enters Overtime. First player to gain MAJORITY of Gigs (7+ of 12 total) wins IMMEDIATELY (no waiting for turn start).
3. **Deck Out:** 0 cards in deck = instant loss

### MULLIGAN RULES

- **Starting hand:** 6 cards
- **Mulligan:** Once per game - shuffle hand back, draw 6 new cards
- **Going first penalty:** Player going first must spend (tap) 2 Legends before their first turn

### COMBAT MECHANICS (PHASE 9 SIMULATOR)

**Power Scaling:**
- Base attack: steal 1 Gig
- **10+ power:** steal 2 Gigs
- **20+ power:** steal 3 Gigs
- Formula: `gigsStolen = 1 + Math.floor(attackerPower / 10)`

**Street Cred (☆):**
- Sum of all Gig Dice VALUES (not quantity)
- Example: d4=3, d6=5, d8=2 → Street Cred = 10

### BANNED/RESTRICTED CARDS

**Current:** None (Alpha Kit is closed experience)
**Future:** Implement banlist service in `src/lib/legalityService.js`

---

## CARD DATA SCHEMA

### cards.json Structure

```json
{
  "id": "v-streetkid",
  "name": "V",
  "subtitle": "Streetkid",
  "url": "https://cyberpunktcg.com/cards/v-streetkid",
  "cost": 4,
  "power": 3,
  "ram": 2,
  "ram_color": "Red",
  "type": "LEGEND",
  "faction": "MERC",
  "keywords": ["GO SOLO"],
  "text": "GO SOLO DEFEATED Discard the top 3 cards...",
  "image_url": "https://dstcynss47vun.cloudfront.net/...",
  "set": "Alpha Kit",
  "number": "001",
  "artist": "Artist Name"
}
```

### MISSING FIELDS (Future Enhancement)

Add these when expanding:
```json
{
  "sellable": true,  // Has Sell Tag (€$)
  "rarity": "Nova Rare"  // For collection tracking
}
```

### ERRATAS vs ALT ARTS

**Erratas:** 
- Same ID, update `text` field
- Auto-propagates to all saved decks
- Preserves deck integrity

**Alt Arts:**
- NEW ID (e.g., `v-streetkid-promo`)
- SAME `name` field
- Validator checks by name (prevents 6 copies of same card)
- Gallery shows both versions

---

## UI/UX PHILOSOPHY

### TARGET AUDIENCE

**Primary:** Beginners learning the game
**Secondary:** Competitive players needing pro tools
**Approach:** Onboarding features (Precon Guides, Analytics) + Power tools (Export, RAM validator, Proxy generator)

### VISUAL IDENTITY

**Theme:** Cyberpunk Terminal Aesthetic
**Palette:**
```js
// tailwind.config.js
colors: {
  "term-black": "#0a0a0a",
  "term-gray": "#1a1a1a",
  "term-gray-light": "#2a2a2a",
  "term-amber": "#ffb300",  // PRIMARY
  "term-green": "#00ff41",
  "term-red": "#ff1744",
  "term-blue": "#00e5ff",
}
```

**Typography:**
- **UI Chrome:** Fira Code monospace
- **Readable Text:** Inter sans-serif
- **Never use:** Arial, Roboto, System fonts

**Effects:**
- Scanline overlays
- Glitch text
- Terminal cursor animations
- CRT phosphor glow

### THE 6 ANTI-REQUIREMENTS (Choom.gg Mistakes)

1. ❌ **NO neon high-contrast colors** - Dark mode pure, text amber/green on black
2. ❌ **NO hardcoded RAM combinations** - Dynamic reading of 3 Legends
3. ❌ **Search/filter MANDATORY** - Not optional features
4. ❌ **Analytics from day one** - Eddies curve minimum before first release
5. ❌ **Text-only export** - Bypass Discord URL censorship
6. ❌ **Future-proof architecture** - Separate rules engine from UI for Phase 9 simulator

### DUELFRONTIER.COM STRENGTHS (To Replicate)

✅ Typographic cleanliness
✅ High information density (many cards on screen)
✅ Readable statistics graphics
✅ Skeleton states (loading placeholders)

---

## THE 4 PILLARS (Construction Order)

### Pilar 1 — Extreme Search & Filtering
- By name, type, tags (Merc/Arasaka/Cyberware)
- Sell tag (€$)
- Cost in Eddies
- Power value
- **This is the core** - without search bar there is nothing

### Pilar 2 — Real-Time Validator
- Max 3 copies per card (non-Legend)
- Main deck 40-50 cards
- Exactly 3 unique Legends
- **RAM Wall reads dynamically** - supports 1, 2, or 3 color decks
- Never assume color combinations

### Pilar 3 — Analytics Panel
- Eddies curve with "too slow" warning (avg cost > 3.5)
- Tag synergy with % tribal activation
- **Opening Hand Probability:** P(≥1 card cost ≤2) in 6-card hand using hypergeometric distribution
- Consistency score

### Pilar 4 — Export
- Plain text format: "2x Dying Night, 1x Viktor Vektor"
- No URLs (Discord moderation bypass)
- Copy to clipboard

---

## CODE CONVENTIONS

### File Structure

```
src/
├── components/        # React components
├── contexts/          # React contexts (AuthContext)
├── data/              # cards.json
├── lib/               # Business logic
│   ├── deckValidator.js
│   ├── deckService.js
│   ├── collectionService.js
│   ├── legalityService.js
│   ├── imageService.js
│   └── supabase.js
└── App.jsx
```

### Component Patterns

**Functional components only:**
```jsx
export default function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);
  
  // Logic
  
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

**Modal pattern with Framer Motion:**
```jsx
import { motion, AnimatePresence } from "framer-motion";

return (
  <AnimatePresence>
    <motion.div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm..."
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-term-gray border-2..."
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        style={{ position: "relative" }}
      >
        {/* Modal content */}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);
```

### Styling Rules

**Use Tailwind utility classes:**
```jsx
<div className="bg-term-gray border-2 border-term-amber rounded p-4">
```

**For complex animations, use Framer Motion:**
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
```

**Font hierarchy:**
- Headers/Buttons/Numbers: `font-mono`
- Paragraphs/Body text: `font-sans`

---

## VALIDATION LOGIC

### Name-Based Copy Limits

```js
// CORRECT - Checks by name
const cardCounts = {};
allCards.forEach(card => {
  cardCounts[card.name] = (cardCounts[card.name] || 0) + 1;
});

// WRONG - Checks by ID
const cardCounts = {};
allCards.forEach(card => {
  cardCounts[card.id] = (cardCounts[card.id] || 0) + 1;
});
```

**Why:** Alt arts have different IDs but same name. Validator must allow multiple art versions but enforce 3-copy limit by name.

### Dynamic RAM Calculation

```js
// CORRECT - Reads actual Legends
const ramLimits = {};
deck.legends.forEach(legend => {
  const color = legend.ram_color;
  ramLimits[color] = (ramLimits[color] || 0) + legend.ram;
});

// WRONG - Hardcoded combinations
if (deck.legends.includes("red") && deck.legends.includes("green")) {
  // ❌ NEVER DO THIS
}
```

---

## IMAGE SYSTEM (3-Layer Waterfall)

### Priority Order:

1. **Cloudfront URL** (original source, may expire)
2. **Supabase Storage** (`card-images` bucket, fallback)
3. **Local SVG Placeholder** (base64, last resort)

### Implementation:

```jsx
// SmartCardImage.jsx
const [currentSrc, setCurrentSrc] = useState(card.image_url);

const handleError = async () => {
  // Try Supabase Storage
  const supabaseUrl = await imageService.getFromStorage(card.id);
  if (supabaseUrl) {
    setCurrentSrc(supabaseUrl);
    return;
  }
  
  // Fallback to SVG placeholder
  setCurrentSrc(imageService.generatePlaceholder(card));
};
```

### Re-scraping Plan:

**Source:** Netdeck.gg (confirmed in cyberpunktcg.com footer)
**Method:** Web scraping scripts in `/scripts/`
**Trigger:** When Cloudfront URLs expire

---

## SUPABASE ARCHITECTURE

### What Goes Where:

**Supabase (Cloud):**
- User authentication (Discord OAuth)
- Saved decks
- Collection tracking
- Feedback submissions
- Card images (backup in Storage)

**Local (Client):**
- Card database (cards.json)
- Deck validation logic
- Analytics calculations
- Filter/search operations

**Why:** Zero-latency filtering, offline-first, 99% reduction in DB read quota.

---

## DEPLOYMENT STRATEGY

### Target Platform: Vercel

**Advantages:**
- Automatic React/Vite optimization
- Free tier for hobby projects
- Custom domains
- GitHub integration

**Alternative:** GitHub Pages (backup)

### Domain: afterlifedecks.com

**Status:** To be purchased
**Purpose:** SEO, branding, professional presence

### Version Control:

**GitHub:** Private repository
**Semantic Versioning:**
- v0.1.0 - v0.5.0: Phase 1-5 (Core features)
- v0.6.0 - v0.8.0: Phase 6-8 (Polish)
- v1.0.0: Public launch
- v1.x.x: Iteration post-launch
- v2.0.0: Simulator (Phase 9)

---

## FEATURE ROADMAP

### ✅ COMPLETED (100%)

**Phase 1-3: CORE**
- Advanced search & filtering
- Real-time deck validator
- RAM Wall with dynamic color reading
- Card preview modal
- Deck area with visual feedback

**Phase 4: ONBOARDING (95%)**
- Precon decks with guides
- Suggested Cards (algorithmic, no AI)
- Legal disclaimer
- How to Play modal

**Phase 5: EXPORT & ANALYTICS (100%)**
- Text-only export
- Eddies curve analysis
- Tag synergy breakdown
- Consistency score
- Opening hand probability (hypergeometric distribution)

### 🟡 IN PROGRESS

**Phase 8: UI/UX POLISH (50%)**
- ✅ Modal blur backdrop
- ✅ Micro-animations (modals complete)
- ❌ Button hover/tap feedback
- ❌ Card animations
- ❌ Deck area improvements
- ❌ Drag & drop

### 🔵 PLANNED

**Phase 6: THE VAULT**
- Collection tracker (add/remove owned cards)
- Pack opener simulator
- Collection completion analytics

**Phase 7: CLOUD & COMMUNITY**
- Short UUID deck links
- Public deck gallery
- Deck cloning
- Netdecking features

**Phase 9: THE ARENA (SIMULATOR)**
- Offline game engine
- Rules automation
- Mulligan/hand testing
- Goldfishing (solo playtest)
- (Future) P2P multiplayer via WebSockets

---

## ANALYTICS FORMULAS

### Hypergeometric Probability (Opening Hand)

**Question:** What's the probability of drawing at least 1 playable card (cost ≤2) in a 6-card opening hand?

**Formula:**
```js
function calculateHypergeometric(N, K, n) {
  // N = deck size
  // K = cheap cards (cost ≤ 2)
  // n = hand size (6)
  
  // P(X ≥ 1) = 1 - P(X = 0)
  const pZero = binomial(N - K, n) / binomial(N, n);
  return 1 - pZero;
}

function binomial(n, k) {
  if (k > n || k < 0) return 0;
  if (k === 0 || k === n) return 1;
  
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result *= (n - i + 1) / i;
  }
  return result;
}
```

**Evaluation:**
- ≥85%: Excellent (green)
- 65-85%: Good (yellow)
- <65%: Low (red)

### Eddies Curve Warning

```js
const avgCost = allCards.reduce((sum, card) => sum + card.cost, 0) / allCards.length;

if (avgCost > 3.5) {
  return "TOO SLOW - May struggle against aggro";
} else if (avgCost <= 2.5) {
  return "FAST AGGRO - Excellent early pressure";
} else {
  return "BALANCED MIDRANGE - Good tempo";
}
```

---

## LEGAL & BRANDING

### Copyright Notice

**Always include:**
```
Afterlife Decks is an unofficial fan project.
All Cyberpunk 2077™ content is owned by CD Projekt Red.
Cyberpunk TCG produced by Weird Co.
Card database powered by Netdeck.gg.
```

### License Structure:

**Code:** MIT (open source)
**Assets/Images:** CD PROJEKT RED (do not claim ownership)
**Disclaimer:** Prominent LegalDisclaimer.jsx component

---

## DEBUGGING PATTERNS

### Common Issues:

**1. Modal Z-Index Bug:**
```jsx
// Problem: Close button renders outside modal
// Solution: Add position: relative
<motion.div style={{ position: "relative" }}>
```

**2. RAM Validator False Positives:**
```js
// Problem: Assumes hardcoded color combinations
// Solution: Read Legend colors dynamically
const ramLimits = {};
deck.legends.forEach(legend => {
  ramLimits[legend.ram_color] = (ramLimits[legend.ram_color] || 0) + legend.ram;
});
```

**3. Image Loading Failures:**
```js
// Problem: Cloudfront URLs expired
// Solution: 3-layer waterfall (Cloudfront → Supabase → SVG)
```

---

## METHODOLOGY: VALVE FAIL-FAST

**Philosophy:**
1. Build ONE functional module before next
2. Test immediately
3. Iterate based on feedback
4. No over-engineering upfront

**Example:**
- Phase 1: Search works → Ship it
- Phase 2: Validator works → Ship it
- Phase 3: Analytics works → Ship it

**NOT:**
- Build everything → Test everything → Nothing works

---

## VAMP'S IDENTITY & PREFERENCES

**Developer:** Inti "Vamp" (22, AI & Automation Developer, Emerson FTEC)
**Aesthetic:** Gótico, Emo, Punk, Neo Tribal (Red/Black)
**Music:** HIM, MCR, Slipknot, Ghost, Tainy
**Games:** Cyberpunk 2077, Silent Hill 2, LoL, FNAF, Sonic Adventure 2
**Motto:** "We'll Never Fade Away" (Cyberpunk ethos)

**Communication Style:**
- Technical but passionate
- Valve methodology (fail fast, iterate)
- Prefers line-by-line explanations over code dumps
- Values learning the "why" behind code

---

## SKILL USAGE TRIGGERS

**Activate this skill when:**
- Building/modifying Cyberpunk TCG Deck Builder
- Implementing game rules validation
- Designing UI for terminal aesthetic
- Debugging RAM system
- Planning analytics features
- Structuring Supabase schema
- Writing export/import logic
- Creating Phase 9 simulator

**Do NOT activate for:**
- Generic React questions (use frontend-design skill)
- General Supabase setup (use product docs)
- Unrelated TCG projects (this skill is Cyberpunk-specific)

---

## REFERENCES

**Official Sources:**
- https://cyberpunktcg.com/gameplay-guide
- https://cyberpunktcg.com/cards
- https://cyberpunktcg.com/faq
- https://netdeck.gg (card database)

**Project Links:**
- Repository: https://github.com/NamelessVamp/Cyberpunktcg_Deckbuilder
- README: Project overview and features
- cards.json: /src/data/cards.json

**Community References:**
- Choom.gg (competitor - learn from mistakes)
- Duelfrontier.com (reference - learn from strengths)

---

## VERSION HISTORY

**v1.0.0 (2026-04-04):**
- Initial skill creation
- Game rules verified against official sources
- Technical architecture documented
- UI patterns and anti-patterns defined
- Verified accuracy: 98/100

**Future Updates:**
- v1.1.0: Add Phase 9 simulator rules
- v1.2.0: Beta Kit card updates
- v2.0.0: Full release adjustments

---

**END OF SKILL**

*"In 2077, what makes someone a legend? Getting shit done."*
*— Dex DeShawn, Cyberpunk 2077*
