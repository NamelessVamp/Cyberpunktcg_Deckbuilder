# ROADMAP — AFTERLIFE DECKS

**Last Updated:** 2026-04-24 | **Version:** v1.3.0-dev
**URL:** https://afterlife-decks.vercel.app
**Repo:** https://github.com/NamelessVamp/Cyberpunktcg_Deckbuilder
**Supabase:** laxyrcvcovmwpywwfntz
**Vercel Project:** prj_ZF0RltwH1inPGq3UYGiEICg9Ynrb
**Vercel Team:** team_4LDlxzUKbdArrvYtsxZhF2I4

---

## PROGRESS SUMMARY

| Phase   | Description                  | Progress |
| :------ | :--------------------------- | :------- |
| 1-7     | Core → Cloud Sharing         | 100%     |
| 8       | UI/UX                        | 97%      |
| 9       | Game Simulator               | 75%      |
| 10-12   | Community, Filters, Wishlist | 100%     |
| 13      | Scraper                      | 33%      |
| 14      | Draft Simulator              | 100%     |
| 15-17.5 | Aesthetics → Security        | 100%     |
| 18-19   | Meta Analytics, Scanner      | 0%       |

**TOTAL: ~125/140 features (~89%) — v1.3.0-dev**

---

## FASES 1-8: COMPLETE

### FASE 8 — Pendiente

| #   | Feature                              | Status |
| --- | ------------------------------------ | ------ |
| 45  | Drag & Drop Deck Building (@dnd-kit) | TODO   |

---

## FASE 9: THE ARENA (75%) — ACTIVE SPRINT

### 9.1 Motor — COMPLETE

| Feature                                                   | Status |
| --------------------------------------------------------- | ------ |
| C.O.R.E. protocol (Check/Obtain/Roll/Energize)            | OK     |
| Eddie payment — sold cards spendable                      | OK     |
| Eddie counter badge                                       | OK     |
| Game log terminal                                         | OK     |
| Mulligan phase modal UI                                   | OK     |
| Unit dimming (summoning sickness — summonedThisTurn flag) | OK     |
| Hand AnimatePresence                                      | OK     |
| Stat buff display (base + modifier)                       | OK     |
| Cyberpsychosis fix                                        | OK     |
| activeEffects system                                      | OK     |
| Precon deck IDs fixed to match cards.json                 | OK     |
| advancePhase prototype preserved (Object.assign)          | OK     |
| Deck-out only triggers on END phase                       | OK     |
| endTurn calls energize() + cleanup                        | OK     |
| P1 penalty: legends[0]+[1] tapped en turno 1              | OK     |
| d20 candado (solo si es el ultimo dado)                   | OK     |
| Double draw fix turno 1                                   | OK     |
| handLocked flag en GameState                              | OK     |
| Gear cleanup recursivo en \_destroyUnit                   | OK     |

### 9.2 AIPlayer — COMPLETE

| Feature                                                 | Status |
| ------------------------------------------------------- | ------ |
| AIPlayer v2 — CORE+PLAY+ATTACK state machine            | OK     |
| AI respeta summonedThisTurn                             | OK     |
| AI attack target (shouldAttackDirect calculado y usado) | OK     |
| AI respondToAttack() — usa BLOCKER automaticamente      | OK     |
| AI vende Programs primero (guarda unidades)             | OK     |
| AI elige unidad por mayor Poder                         | OK     |

### 9.3 UI / Playmat — 85%

| Feature                                                 | Status |
| ------------------------------------------------------- | ------ |
| Mirror board (PlayerBoard x2, rival rotado 180)         | OK     |
| Zona central compartida de GIGS                         | OK     |
| Framer Motion game feel (spring, flash, hover)          | OK     |
| CyberCard V3 (1:1.4 ratio, sin HP, gradiente)           | OK     |
| Online Play menu (VS AI / Hotseat) con AnimatePresence  | OK     |
| Win screen dramatico fullscreen + REMATCH + MAIN MENU   | OK     |
| Go Solo UI button (legends face-up con GO SOLO keyword) | OK     |
| Combat flash animation (field shrink trigger)           | OK     |
| Hover preview card (fixed top-right tooltip)            | OK     |
| Fog of War (isFlipped en cartas rival)                  | OK     |
| Hand locked visual en ATTACK phase                      | OK     |
| Toast system (reemplaza 10 alert() en SimulatorBeta)    | OK     |
| Drag to Zone (dnd-kit UNIT→field, card→eddies)          | OK     |
| Pass device screen (Hotseat)                            | OK     |
| Mulligan modal con cards preview                        | OK     |
| Rival gigs counter en controls bar con warning pulse 5+ | OK     |
| **Responsive layout (eliminar horizontal scroll)**      | TODO-A |

### 9.4 Pendientes criticos (jugabilidad)

| Feature                                                         | Status |
| --------------------------------------------------------------- | ------ |
| Sistema de pagos inteligente (pre-cargar Eddies antes del drop) | TODO   |
| actionMode (IDLE/TARGETING/PAYING) para Gear/Program            | TODO   |
| Hotseat mode — P2 ve su propia mano/field                       | TODO   |
| Blocker declaration UI mejorada                                 | TODO   |
| Viktor Vektor FLIP effect (search top 5 for gear)               | TODO   |
| Alt Cunningham GO SOLO effect                                   | TODO   |
| Kiroshi Optics ATTACK effect                                    | TODO   |
| Gorilla Arms ATTACK effect                                      | TODO   |
| Placide PLAY/ATTACK effect                                      | TODO   |
| AI Opponent avanzado (Phase 9.5)                                | TODO   |
| P2P Multiplayer (WebSockets) — Phase 10                         | TODO   |

### 9.5 UX improvements

| Feature                                  | Status |
| ---------------------------------------- | ------ |
| Inspector flotante (card hover en field) | TODO   |
| Cursor crosshair en targeting mode       | TODO   |
| Undo button (snapshot del GameState)     | TODO   |
| S/M/L card size toggle                   | TODO   |

---

## FASE 10-12: COMPLETE (100%)

Community hub, Enhanced Filters, Wishlist — todo OK.

### FASE 11 — Pendiente

| Feature                             | Status |
| ----------------------------------- | ------ |
| Subtitle + multiple factions filter | TODO   |

---

## FASE 13: SCRAPER (33%)

| Feature                               | Status |
| ------------------------------------- | ------ |
| Subtitle + multiple factions scraping | TODO   |

---

## FASE 14: DRAFT SIMULATOR (100%) — OK

---

## FASE 15-17.5: AESTHETICS → SECURITY (100%) — OK

---

## FASE 18: META ANALYTICS (0%)

Esperar volumen Black Market.

---

## FASE 19: SCANNER OCR (0%)

**Stack:** react-webcam + PHash (blockhash-js)
**Referencia:** Card Nexus
**Arquitectura:**

- Frontend: navigator.mediaDevices.getUserMedia
- Motor: PHash — hash de imagenes limpias vs foto capturada
- Bucle continuo: 1 frame/seg automatico
- Toast feedback: "Detectado: Goro Takemura — Foil o Regular?"
- Destino toggle: [A MI INVENTARIO] | [AL MAZO ACTUAL]
  **Nota:** Mobile-First obligatorio.

---

## DECK BUILDER IMPROVEMENTS

| Feature                                           | Status |
| ------------------------------------------------- | ------ |
| RAM display (max por color + illegal card count)  | OK     |
| Dynamic deck name (deck.\_name via useSavedDecks) | OK     |
| DeckAnalytics barras animadas con Framer Motion   | OK     |
| Warning section (slow/fast/low draw)              | OK     |
| RAM wall — bloquear save si excede RAM            | TODO   |
| Sistema de pagos inteligente                      | TODO   |
| Floating deck drawer (mobile)                     | TODO   |

---

## MOBILE-FIRST IMPROVEMENTS (TODO)

| Component            | Issue                       | Fix                                  |
| -------------------- | --------------------------- | ------------------------------------ |
| App.jsx              | Header p-8 demasiado grande | p-4 sm:p-8                           |
| App.jsx              | DeckTabs dificil en movil   | Bottom nav o hamburger               |
| DeckArea.jsx         | Scroll de 40 cartas         | Floating drawer / "Ver Carrito"      |
| PlaymatV2.jsx        | 100vh + dnd-kit en movil    | Landscape forzado o sistema de capas |
| CardPreviewModal.jsx | Botones pequenos            | 44px min height, bottom placement    |
| CollectionView.jsx   | grid-cols-2 en <320px       | grid-cols-1                          |
| Modals               | No full screen en movil     | 100% screen en movil                 |

---

## NOTAS TECNICAS CRITICAS

### Bugs conocidos evitados

- `setGame({...game})` destruye metodos de clase — SIEMPRE usar `gameRef.current`
- `refresh()` hace deep spread de `players.gigs` para forzar re-render
- `hasRolledThisTurn` bloquea NEXT PHASE en CORE hasta roll
- CyberCard: guard `if (!card) return null` DESPUES de todos los hooks
- Encoding: SIEMPRE UTF-8 limpio, NUNCA `ÔÇö` ni `Ôé¼`
- Turno 1: NO draw carta en \_executeCore (hand ya fue dealt)

### Archivos clave

src/lib/game/GameState.js — motor principal CORE protocol
src/lib/game/AIPlayer.js — AI v2
src/lib/CardLogic.js — play/sell/callLegend/goSolo
src/lib/CombatResolver.js — combat, stealGigs, \_destroyUnit
src/components/SimulatorBeta.jsx — UI simulador, Online Play menu
src/components/PlaymatV2.jsx — tapete mirror board
src/components/simulator/CyberCard.jsx
src/components/DeckArea.jsx — deck builder
src/hooks/useDeckBuilder.js
src/hooks/useSavedDecks.js — handleLoadDeck preserva deck.\_name
src/data/cards.json — 48 cartas Alpha Kit

---

## NEXT PRIORITIES

### v1.3.0 — Simulator jugable

1. Sistema de pagos inteligente (pre-cargar Eddies antes del drop)
2. Responsive playmat (TODO-A — eliminar horizontal scroll)
3. Hotseat mode P2 visible
4. actionMode TARGETING para Gear/Program

### v1.4.0 — Simulator pulido

5. Efectos de carta (Viktor, Alt, Kiroshi, Gorilla, Placide)
6. Undo button (snapshot GameState)
7. Inspector flotante en field

### v2.0.0

8. P2P Multiplayer (Supabase Realtime)
9. Fase 19 Scanner OCR (react-webcam + PHash)
10. Mobile-First completo

---

## CHANGELOG

**2026-04-24 — v1.3.0-dev**

- OK Toast system — 10 alert() reemplazados en SimulatorBeta
- OK Dynamic deck name via deck.\_name
- OK RAM display correcto (max por color + illegal card count)
- OK DeckAnalytics barras animadas + warnings
- OK GameState: double draw fix, er.eddies typo, dead code after return
- OK AIPlayer: duplicate declarations, summonedThisTurn, attack target
- OK Mirror board PlaymatV2 (PlayerBoard component reutilizable)
- OK Online Play menu (VS AI / Hotseat) con AnimatePresence
- OK Win screen dramatico + REMATCH + MAIN MENU
- OK Go Solo UI button
- OK Combat flash animation
- OK CLAUDE.md para Claude Code handoff

**2026-04-20 — v1.2.0**

- OK Rival zone visible + rotated 180
- OK Precon IDs fixed to match cards.json
- OK advancePhase prototype fix (Object.assign)
- OK activeEffects + combatLog initialized in constructor
- OK Deck-out only on END phase
- OK Hand selection UI (PLAY/SELL/CANCEL)
- OK Field units clickable
- OK Horizontal scroll workaround
- OK ROADMAP expanded with all pending todos

**2026-04-17 — v1.1.0**

- OK UI/UX Roast Pass complete
- OK Fase 14 Draft History
- OK Fase 11 Multiple factions

**2026-04-17 — v1.0.0**

- OK T1 Playability, UUID share links, content moderation
