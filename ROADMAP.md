# 📋 ROADMAP — AFTERLIFE DECKS

**Last Updated:** 2026-04-17 | **Version:** v1.0.0

---

## ✅ FASE 1: DECK BUILDING CORE (100%)

| #   | Feature                    | Status | Files                              |
| :-- | :------------------------- | :----- | :--------------------------------- |
| 1   | Search & Extreme Filtering | ✅     | `FilterPanel.jsx`, `SearchBar.jsx` |
| 2   | Real-time Rules Validator  | ✅     | `deckValidator.js`                 |
| 3   | Dynamic RAM Wall           | ✅     | `DeckArea.jsx`                     |
| 3.5 | FREE BUILD MODE            | ✅     | `DeckArea.jsx`                     |
| 4   | Analytics Panel            | ✅     | `DeckAnalytics.jsx`                |
| 5   | Plain Text Export          | ✅     | `ExportModal.jsx`                  |
| 6   | Sideboard Zone (0/15)      | ✅     | `DeckArea.jsx`                     |
| 6.5 | Alt Art ID Refactor        | ✅     | `cards.json`                       |

## ✅ FASE 2: SIMULATORS (100%)

| #   | Feature                           | Status | Files                   |
| :-- | :-------------------------------- | :----- | :---------------------- |
| 7   | Mulligan Simulator                | ✅     | `MulliganSimulator.jsx` |
| 8   | Pack Opener + Beta Kit Pull Rates | ✅     | `PackOpener.jsx`        |

## ✅ FASE 3: SUPABASE MIGRATION (100%)

Auth, CRUD decks, collection, feedback, hybrid image fallback — all done.

## ✅ FASE 4: ONBOARDING & EDUCATIONAL (100%)

Landing page, tooltips, beginner guide, precon explainers, legality warnings, AI suggestions — all done.

## ✅ FASE 5: EXPORT, ANALYTICS & PROXIES (100%) 🆕

| #   | Feature                         | Status | Files                 |
| :-- | :------------------------------ | :----- | :-------------------- |
| 24  | Eddies Curve                    | ✅     | `DeckAnalytics.jsx`   |
| 25  | Plain Text Export               | ✅     | `ExportModal.jsx`     |
| 26  | "Slow Deck" Warning             | ✅     | `DeckAnalytics.jsx`   |
| 27  | Proxy Generator                 | ✅     | `ProxyModal.jsx`      |
| 28  | Tag Synergy (%)                 | ✅     | `DeckAnalytics.jsx`   |
| 29  | T1 Playability (hypergeometric) | ✅ 🆕  | `DeckAnalytics.jsx`   |
| 30  | Import from Text                | ✅     | `ImportDeckModal.jsx` |

## ✅ FASE 6: THE VAULT (100%)

Collection tracker, pack→collection integration, analytics, wishlist — all done.

## ✅ FASE 7: CLOUD SHARING & COMMUNITY (100%) 🆕

| #   | Feature                       | Status     | Files                             |
| :-- | :---------------------------- | :--------- | :-------------------------------- |
| 35  | URL Sharing (Base64 fallback) | ✅         | `deckService.js`                  |
| 36  | Advanced Deck Management      | ✅         | `MyDecksView.jsx`                 |
| 37  | Clean UUID Cloud Links        | ✅ 🆕      | `shareService.js` — `/deck/:uuid` |
| 38  | Legal Page                    | ✅         | `LegalDisclaimer.jsx`             |
| 39  | Image Lazy Loading            | ✅         | `SmartCardImage.jsx`              |
| 40  | Multi-language                | ⏳ PARTIAL | `LanguageContext.jsx`             |
| 41  | Black Market                  | ✅         | `BlackMarketView.jsx`             |
| 42  | Comments & Ratings            | ✅         | `PublicDeckView.jsx`              |

## ⏳ FASE 8: UI/UX ENHANCEMENTS (92%)

| #                   | Feature                                            | Status                    |
| :------------------ | :------------------------------------------------- | :------------------------ |
| 43-44, 46-47, 51-56 | Animations, skeletons, toasts, PWA, mobile, export | ✅                        |
| 50                  | Gacha Polish (sequential reveal + rarity glow)     | ✅ 🆕                     |
| 45                  | Drag & Drop Deck Building                          | ❌ TODO — `@dnd-kit/core` |

## ⏳ FASE 9: THE ARENA (56%)

| #     | Feature                                           | Status                         |
| :---- | :------------------------------------------------ | :----------------------------- |
| 48-52 | Game engine, UI, combat, feature flag, Playmat V2 | ✅                             |
| 53    | Drag to Zone                                      | ⏳ tap/flip done, drag pending |
| 54    | Card Hover Preview in Simulator                   | ❌ TODO                        |
| 55    | AI Opponent                                       | ❌ Phase 9.5                   |
| 56    | Multiplayer P2P                                   | ❌ Phase 10                    |

## ✅ FASE 10: BLACK MARKET (100%)

Feed, votes, clone, comments, archetype, Street Cred — all done.

## ⏳ FASE 11: ENHANCED FILTERS (80%)

Card number, artist, enhanced search, auto-detect factions ✅ | Multiple factions support ❌

## ✅ FASE 12: WISHLIST (100%)

## ⏳ FASE 13: SCRAPER (33%)

Number & artist extraction ✅ | Subtitle + multiple factions ❌

## ⏳ FASE 14: DRAFT SIMULATOR (75%)

| #     | Feature                                        | Status  |
| :---- | :--------------------------------------------- | :------ |
| 76-78 | Draft UI, pick interface, load to deck builder | ✅ 🆕   |
| 79    | Draft History                                  | ❌ TODO |

## ✅ FASE 15: CYBERSPACE AESTHETICS (100%)

Glitch hover, particles v2, loader, tab dissolve, point cloud, CRT scanlines — all done.

## ✅ FASE 16: ARCHITECTURE REFACTOR (100%)

4 hooks extracted: `useDeckBuilder`, `useFilters`, `useSavedDecks`, `useCollection` — App.jsx -32%.

## ✅ FASE 17: PLAYER PROFILES (100%)

Email auth, profile hub, avatar upload, Street Cred trigger, Discord handle — all done.

## ✅ FASE 17.5: SECURITY & MODERATION (100%) 🆕

| Feature                                                         | Status |
| :-------------------------------------------------------------- | :----- |
| RLS WITH CHECK on all UPDATE policies                           | ✅     |
| Payload CHECK constraints (name/bio/comment length)             | ✅     |
| Content moderation service (bio, deck names, comments, publish) | ✅ 🆕  |
| Avatar upload validation (2MB, type check)                      | ✅     |

## 🔮 FASE 18: META ANALYTICS (0%)

> Wait for Black Market volume before building.

Top cards, tier list, archetype trends, Red Stats tab, most cloned decks.

## 🔮 FASE 19: SCANNER & SMART IMPORT (0%)

Camera OCR + batch import to collection.

---

## 📊 PROGRESS SUMMARY

| Phase | Description                           | Progress   |
| :---- | :------------------------------------ | :--------- |
| 1-4   | Core, Simulators, Backend, Onboarding | ✅ 100%    |
| 5     | Export & Analytics                    | ✅ 100% 🆕 |
| 6     | The Vault                             | ✅ 100%    |
| 7     | Cloud Sharing                         | ✅ 100% 🆕 |
| 8     | UI/UX                                 | ⏳ 92%     |
| 9     | Game Simulator                        | ⏳ 56%     |
| 10-12 | Black Market, Filters, Wishlist       | ✅ 100%    |
| 13    | Scraper                               | ⏳ 33%     |
| 14    | Draft Simulator                       | ⏳ 75%     |
| 15-17 | Aesthetics, Refactor, Profiles        | ✅ 100%    |
| 17.5  | Security & Moderation                 | ✅ 100% 🆕 |
| 18-19 | Meta Analytics, Scanner               | 🔮 0%      |

**TOTAL: ~106/119 features (~89% complete) — v1.0.0 released ✅**

---

## 🎯 NEXT PRIORITIES

### 🔶 v1.1.0

1. **Fase 14 #79** — Draft History (save past drafts to Supabase)
2. **Fase 9 #53** — Drag to Zone in Simulator
3. **Fase 18** — Meta Analytics (wait for Black Market volume)

### 🔷 v2.0.0

4. Fase 9 #55 — AI Opponent
5. Fase 19 — Card Scanner OCR
6. Fase 7 #40 — Full multi-language
7. Fase 8 #45 — Drag & Drop deck building

---

## 📝 CHANGELOG

**2026-04-17 — v1.0.0 RELEASED 🚀**

- ✅ T1 Playability hypergeometric stat in DeckAnalytics
- ✅ Clean UUID share links — `/deck/:uuid` + `shareService.js`
- ✅ Content moderation — bio, deck names, comments, publish descriptions
- ✅ v1.0.0 git tag pushed

**2026-04-15 — Fases 14-17 complete**

- ✅ Fase 16: 4 custom hooks, App.jsx -32%
- ✅ Fase 17: email auth, profile hub, avatar upload, Street Cred trigger
- ✅ Fase 14 (75%): Draft Simulator — 4 packs × 10 picks
- ✅ Gacha Polish: sequential reveal, rarity glow, 12 cards guaranteed
- ✅ Security hardening: WITH CHECK policies, payload constraints

**2026-04-14 — Enhanced Filters + PWA + Cyberspace v2**

- ✅ Fase 11: artist + card number filters
- ✅ Pack Opener: Beta Kit pull rates
- ✅ CyberspaceParticles v2 + PWA fix

**2026-04-13 — Cyberspace Aesthetics (Fase 15)**

**2026-04-12 — PWA + Deck Image Export**

**2026-04-10 — Black Market + Wishlist (Fases 10 + 12)**
