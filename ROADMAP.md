# 📋 ROADMAP — AFTERLIFE DECKS

**Last Updated:** 2026-04-20 | **Version:** v1.2.0-dev

---

## ✅ FASE 1-6: CORE COMPLETE (100%)

## ✅ FASE 7: CLOUD SHARING (100%)

## ✅ FASE 8: UI/UX ENHANCEMENTS (97%)

| 45 | Drag & Drop Deck Building | ❌ TODO — `@dnd-kit/core` |

## ⏳ FASE 9: THE ARENA (65%) — ACTIVE SPRINT

### 9.1 — Motor (GameState / CardLogic / CombatResolver)

| #   | Feature                                          | Status |
| :-- | :----------------------------------------------- | :----- |
| 9A  | Eddie payment fix — sold cards spendable         | ✅     |
| 9B  | Eddie counter badge                              | ✅     |
| 9C  | Game log terminal                                | ✅     |
| 9D  | Mulligan phase — modal UI                        | ✅     |
| 9E  | Unit dimming (summoning sickness)                | ✅     |
| 9F  | Hand AnimatePresence                             | ✅     |
| 9G  | Stat buff display (base + modifier)              | ✅     |
| 9H  | Cyberpsychosis fix                               | ✅     |
| 9I  | activeEffects system                             | ✅     |
| 9J  | Precon deck IDs fixed to match cards.json        | ✅     |
| 9K  | advancePhase prototype preserved (Object.assign) | ✅     |
| 9L  | Deck-out only triggers on END phase              | ✅     |
| 9M  | endTurn calls energize() + Reboot Optics cleanup | ✅     |

### 9.2 — UI / Playmat

| #      | Feature                                         | Status  |
| :----- | :---------------------------------------------- | :------ |
| —      | Rival zone visible + rotated 180°               | ✅      |
| —      | Hand card selection + PLAY/SELL/CANCEL buttons  | ✅      |
| —      | Field units clickable (declare attacker)        | ✅      |
| —      | Legend click → callLegend                       | ✅      |
| —      | Horizontal scroll (min-width 1250px)            | ✅      |
| TODO-A | Responsive layout (eliminate horizontal scroll) | ❌ TODO |

### 9.3 — Pendientes críticos para que sea jugable

| #   | Feature                                                     | Status       |
| :-- | :---------------------------------------------------------- | :----------- |
| —   | actionMode (IDLE/TARGETING/PAYING) para Gear/Program        | ❌ TODO      |
| —   | Phase locks — solo PLAY en fase PLAY, solo ATTACK en COMBAT | ❌ TODO      |
| —   | Mulligan modal aparece correctamente al iniciar             | ❌ TODO      |
| —   | Hotseat mode — turno P2 muestra su mano/field               | ❌ TODO      |
| —   | Blocker declaration UI                                      | ❌ TODO      |
| —   | Card hover preview en el simulator                          | ❌ TODO      |
| —   | Viktor Vektor FLIP effect (search top 5 for gear)           | ❌ TODO      |
| —   | Alt Cunningham GO SOLO effect                               | ❌ TODO      |
| —   | Kiroshi Optics ATTACK effect                                | ❌ TODO      |
| —   | Gorilla Arms ATTACK effect                                  | ❌ TODO      |
| —   | Placide PLAY/ATTACK effect                                  | ❌ TODO      |
| 53  | Drag to Zone (dnd-kit)                                      | ❌ TODO      |
| 55  | AI Opponent (State Machine)                                 | ❌ Phase 9.5 |
| 56  | P2P Multiplayer (WebSockets)                                | ❌ Phase 10  |

### 9.4 — UX improvements (post-jugabilidad)

| #   | Feature                                                   | Status  |
| :-- | :-------------------------------------------------------- | :------ |
| —   | Inspector flotante (card hover en field → preview grande) | ❌ TODO |
| —   | Cursor crosshair en targeting mode                        | ❌ TODO |
| —   | Undo button (snapshot del GameState)                      | ❌ TODO |
| —   | S/M/L card size toggle                                    | ❌ TODO |

## ✅ FASE 10-12: COMMUNITY & VAULT (100%)

## ⏳ FASE 11: ENHANCED FILTERS (87%)

## ⏳ FASE 13: SCRAPER (33%)

Subtitle + multiple factions ❌

## ✅ FASE 14: DRAFT SIMULATOR (100%)

## ✅ FASE 15-17.5: AESTHETICS → SECURITY (100%)

## 🔮 FASE 18: META ANALYTICS (0%) — esperar volumen Black Market

## 🔮 FASE 19: SCANNER & SMART IMPORT (0%)

---

## 📊 PROGRESS SUMMARY

| Phase   | Description                  | Progress |
| :------ | :--------------------------- | :------- |
| 1-7     | Core → Cloud Sharing         | ✅ 100%  |
| 8       | UI/UX                        | ✅ 97%   |
| 9       | Game Simulator               | ⏳ 65%   |
| 10-12   | Community, Filters, Wishlist | ✅ 100%  |
| 13      | Scraper                      | ⏳ 33%   |
| 14      | Draft Simulator              | ✅ 100%  |
| 15-17.5 | Aesthetics → Security        | ✅ 100%  |
| 18-19   | Meta Analytics, Scanner      | 🔮 0%    |

**TOTAL: ~118/140 features (~84%) — v1.2.0-dev**

---

## 🎯 NEXT PRIORITIES

### 🔴 v1.2.0 — Simulator jugable

1. Mulligan modal funcional
2. Phase locks (no atacar en PLAY, no jugar en COMBAT)
3. actionMode TARGETING para Gear/Program
4. Hotseat mode básico (turno P2 visible)
5. Blocker declaration UI

### 🔶 v1.3.0 — Simulator pulido

6. Card hover preview
7. Undo button
8. Inspector flotante
9. Efectos de carta pendientes (Viktor, Alt, Kiroshi, Gorilla, Placide)
10. AI Opponent básico

### 🔷 v2.0.0

11. Drag to Zone (dnd-kit)
12. Responsive playmat (TODO-A)
13. P2P Multiplayer
14. Fase 19 Scanner OCR

---

## 📝 CHANGELOG

**2026-04-20 — v1.2.0-dev**

- ✅ Rival zone visible + rotated 180°
- ✅ Precon IDs fixed to match cards.json
- ✅ advancePhase prototype fix (Object.assign)
- ✅ activeEffects + combatLog initialized in constructor
- ✅ Deck-out only on END phase
- ✅ Hand selection UI (PLAY/SELL/CANCEL)
- ✅ Field units clickable
- ✅ Horizontal scroll workaround
- ✅ ROADMAP expanded with all pending todos

**2026-04-17 — v1.1.0**

- ✅ UI/UX Roast Pass complete
- ✅ Fase 14 Draft History
- ✅ Fase 11 Multiple factions

**2026-04-17 — v1.0.0**

- ✅ T1 Playability, UUID share links, content moderation
