# 📋 ROADMAP COMPLETO — AFTERLIFE DECKS

**Last Updated:** 2026-04-15

---

## ✅ FASE 1: DECK BUILDING CORE (100%)

| #   | Feature                    | Status  | Files                                         |
| :-- | :------------------------- | :------ | :-------------------------------------------- |
| 1   | Search & Extreme Filtering | ✅ DONE | `FilterPanel.jsx`, `SearchBar.jsx`, `App.jsx` |
| 2   | Real-time Rules Validator  | ✅ DONE | `App.jsx`, `deckValidator.js`                 |
| 3   | Dynamic RAM Wall           | ✅ DONE | `App.jsx`, `DeckArea.jsx`                     |
| 3.5 | FREE BUILD MODE            | ✅ DONE | `App.jsx`, `DeckArea.jsx`                     |
| 4   | Analytics Panel            | ✅ DONE | `DeckAnalytics.jsx`, `AnalyticsModal.jsx`     |
| 5   | Plain Text Export          | ✅ DONE | `ExportModal.jsx`                             |
| 6   | Sideboard Zone (0/15)      | ✅ DONE | `App.jsx`, `DeckArea.jsx`                     |
| 6.5 | Alt Art ID Refactor        | ✅ DONE | `cards.json`, `App.jsx`                       |

## ✅ FASE 2: SIMULATORS (100%)

| #   | Feature                                    | Status  | Files                                        |
| :-- | :----------------------------------------- | :------ | :------------------------------------------- |
| 7   | Mulligan Simulator                         | ✅ DONE | `MulliganSimulator.jsx`, `MulliganModal.jsx` |
| 8   | Pack Opener + Official Beta Kit Pull Rates | ✅ DONE | `PackOpener.jsx`                             |

## ✅ FASE 3: SUPABASE MIGRATION (100%)

| #    | Feature              | Status  | Notes                                                         |
| :--- | :------------------- | :------ | :------------------------------------------------------------ |
| 9-16 | Backend Architecture | ✅ DONE | Auth, CRUD decks, collection, feedback, hybrid image fallback |

## ✅ FASE 4: ONBOARDING & EDUCATIONAL (100%)

| #   | Feature                       | Status  | Files                                      |
| :-- | :---------------------------- | :------ | :----------------------------------------- |
| 17  | Landing Page / Home Dashboard | ✅ DONE | `LandingPage.jsx`                          |
| 18  | Educational Tooltips          | ✅ DONE | `Tooltip.jsx`                              |
| 19  | Beginner's Guide (Modal)      | ✅ DONE | `GuideModal.jsx`                           |
| 21  | Precon Deck Explainers        | ✅ DONE | `preconGuides.json`, `PreconDecksView.jsx` |
| 22  | Card Legality Warnings        | ✅ DONE | `LegalityBadge.jsx`, `cardLegality.json`   |
| 23  | Suggested Cards (AI Helper)   | ✅ DONE | `SuggestedCards.jsx`                       |

## ⏳ FASE 5: EXPORT, ANALYTICS & PROXIES (86%)

| #   | Feature                            | Status     | Files                      |
| :-- | :--------------------------------- | :--------- | :------------------------- |
| 24  | Eddies Curve                       | ✅ DONE    | `DeckAnalytics.jsx`        |
| 25  | Plain Text Export                  | ✅ DONE    | `ExportModal.jsx`          |
| 26  | "Slow Deck" Warning                | ✅ DONE    | `DeckAnalytics.jsx`        |
| 27  | Proxy Generator                    | ✅ DONE    | `ProxyModal.jsx`           |
| 28  | Tag Synergy (%)                    | ✅ DONE    | `DeckAnalytics.jsx`        |
| 30  | Import from Text                   | ✅ DONE    | `ImportDeckModal.jsx`      |
| 29  | Consistency Stats (T1 Playability) | ⏳ PENDING | Hypergeometric calc needed |

## ✅ FASE 6: THE VAULT (100%)

| #   | Feature                              | Status  | Files                                    |
| :-- | :----------------------------------- | :------ | :--------------------------------------- |
| 31  | Collection Tracker                   | ✅ DONE | `CollectionView.jsx`                     |
| 32  | Pack Opener → Collection Integration | ✅ DONE | `PackOpener.jsx`, `collectionService.js` |
| 33  | Collection Analytics                 | ✅ DONE | `CollectionView.jsx`                     |
| 34  | Wishlist / Collection Gallery        | ✅ DONE | `CollectionView.jsx`                     |

## ⏳ FASE 7: CLOUD SHARING & COMMUNITY (86%)

| #   | Feature                       | Status     | Files                                       |
| :-- | :---------------------------- | :--------- | :------------------------------------------ |
| 35  | URL Sharing (Base64)          | ✅ DONE    | `deckService.js`                            |
| 36  | Advanced Deck Management      | ✅ DONE    | `MyDecksView.jsx`                           |
| 37  | Clean UUID Cloud Links        | ❌ TODO    | Short shareable URLs                        |
| 38  | Legal Page (Copyright)        | ✅ DONE    | `LegalDisclaimer.jsx`                       |
| 39  | Image Lazy Loading            | ✅ DONE    | `SmartCardImage.jsx`                        |
| 40  | Multi-language                | ⏳ PARTIAL | `LanguageContext.jsx`                       |
| 41  | Black Market (Public Gallery) | ✅ DONE    | `BlackMarketView.jsx`, `PublicDeckView.jsx` |
| 42  | Deck Comments & Ratings       | ✅ DONE    | `PublicDeckView.jsx`                        |

## ⏳ FASE 8: UI/UX ENHANCEMENTS (92%)

| #   | Feature                          | Status     | Files                           |
| :-- | :------------------------------- | :--------- | :------------------------------ |
| 43  | Micro-Animations (Framer Motion) | ✅ DONE    | 11 modals updated               |
| 44  | Skeleton States                  | ✅ DONE    | `SmartCardImage.jsx`            |
| 45  | Drag & Drop Deck Building        | ❌ TODO    | Needs `@dnd-kit/core`           |
| 46  | Modal Blur Backdrop              | ✅ DONE    | Framer Motion                   |
| 47  | Toast Improvements               | ✅ DONE    | `Toast.jsx`                     |
| 50  | Gacha Polish (Pack Opener)       | ✅ DONE 🆕 | Sequential reveal + rarity glow |
| 51  | Hover/Click on Deck Cards        | ✅ DONE    | `CardPreviewModal.jsx`          |
| 52  | Arrow Navigation in Preview      | ✅ DONE    | `CardPreviewModal.jsx`          |
| 53  | Wishlist Star in Build Grid      | ✅ DONE    | `App.jsx`                       |
| 54  | PWA (manual sw.js + manifest)    | ✅ DONE    | `public/sw.js`, `index.html`    |
| 55  | Mobile Responsive Header         | ✅ DONE    | `App.jsx`                       |
| 56  | Deck Image Export (PNG + QR)     | ✅ DONE    | `DeckImageExport.jsx`           |

## ⏳ FASE 9: THE ARENA (GAME SIMULATOR) (56%)

| #   | Feature                         | Status     | Files                                |
| :-- | :------------------------------ | :--------- | :----------------------------------- |
| 48  | Game State Engine               | ✅ DONE    | `GameState.js`                       |
| 49  | Simulator UI (Beta)             | ✅ DONE    | `SimulatorBeta.jsx`, `PlaymatV2.jsx` |
| 50  | Card Logic & Combat             | ✅ DONE    | `CardLogic.js`, `CombatResolver.js`  |
| 51  | Feature Flag (Admin-Only)       | ✅ DONE    | `featureFlagService.js`              |
| 52  | Playmat V2                      | ✅ DONE    | `PlaymatV2.jsx`, `CyberCard.jsx`     |
| 53  | Drag to Zone                    | ⏳ PARTIAL | Tap/flip working                     |
| 54  | Card Hover Preview in Simulator | ❌ TODO    | Side panel                           |
| 55  | AI Opponent                     | ❌ TODO    | Phase 9.5                            |
| 56  | Multiplayer (P2P)               | ❌ TODO    | Phase 10                             |

## ✅ FASE 10: BLACK MARKET (100%)

| #     | Feature                                                                   | Status  |
| :---- | :------------------------------------------------------------------------ | :------ |
| 55-62 | Full Community Hub (feed, votes, clone, comments, archetype, Street Cred) | ✅ DONE |

## ✅ FASE 11: ENHANCED FILTERS (80%)

| #   | Feature                                    | Status     |
| :-- | :----------------------------------------- | :--------- |
| 63  | Card Number Filter                         | ✅ DONE    |
| 64  | Artist Filter (multi-select)               | ✅ DONE    |
| 65  | Enhanced Search (subtitle, number, artist) | ✅ DONE    |
| 66  | Auto-Detect Factions                       | ✅ DONE    |
| 67  | Multiple Factions Support                  | ⏳ PENDING |

## ✅ FASE 12: WISHLIST (100%)

| #     | Feature                                | Status  |
| :---- | :------------------------------------- | :------ |
| 68-72 | Wishlist DB, Service, Preview, UI Grid | ✅ DONE |

## ⏳ FASE 13: SCRAPER ENHANCEMENTS (33%)

| #   | Feature                   | Status  |
| :-- | :------------------------ | :------ |
| 73  | Extract Subtitle          | ⏳ TODO |
| 74  | Extract Multiple Factions | ⏳ TODO |
| 75  | Verify Number & Artist    | ✅ DONE |

## ✅ FASE 14: PACK DRAFT SIMULATOR (75%) 🆕

| #   | Feature                    | Status     | Files                         |
| :-- | :------------------------- | :--------- | :---------------------------- |
| 76  | Draft Mode UI              | ✅ DONE 🆕 | `DraftSimulator.jsx`          |
| 77  | Draft Pick Interface       | ✅ DONE 🆕 | 4 packs × 10 picks = 40 cards |
| 78  | Load Draft to Deck Builder | ✅ DONE 🆕 | `onLoadDraft` → Build tab     |
| 79  | Draft History              | ❌ TODO    | Save past drafts              |

## ✅ FASE 15: CYBERSPACE AESTHETICS (100%)

| #   | Feature                         | Status  |
| :-- | :------------------------------ | :------ |
| 80  | Glitch Hover on Build Grid      | ✅ DONE |
| 81  | CyberspaceParticles v2 (global) | ✅ DONE |
| 82  | Point Cloud Loading Screen      | ✅ DONE |
| 83  | Tab Transition Dissolve         | ✅ DONE |
| 84  | Card Preview Point Cloud Reveal | ✅ DONE |
| 85  | Simulator Cyberspace Mode       | ✅ DONE |
| 86  | CRT Scanlines Global            | ✅ DONE |

## ✅ FASE 16: ARCHITECTURE REFACTOR (100%) 🆕

| #   | Feature                  | Status     | Files                         |
| :-- | :----------------------- | :--------- | :---------------------------- |
| 88  | `useDeckBuilder.js` hook | ✅ DONE 🆕 | `src/hooks/useDeckBuilder.js` |
| 89  | `useFilters.js` hook     | ✅ DONE 🆕 | `src/hooks/useFilters.js`     |
| 90  | `useSavedDecks.js` hook  | ✅ DONE 🆕 | `src/hooks/useSavedDecks.js`  |
| 91  | `useCollection.js` hook  | ✅ DONE 🆕 | `src/hooks/useCollection.js`  |

> App.jsx: 1933 → 1306 lines (-627 lines, -32%)

## ✅ FASE 17: PLAYER PROFILES & IDENTITY (100%) 🆕

| #   | Feature                          | Status     | Files                                 |
| :-- | :------------------------------- | :--------- | :------------------------------------ |
| 92  | Email/Password Registration      | ✅ DONE 🆕 | `LoginModal.jsx`, `AuthContext.jsx`   |
| 93  | User Profile Hub                 | ✅ DONE 🆕 | `UserProfileModal.jsx` — click avatar |
| 94  | Street Cred Score (auto trigger) | ✅ DONE 🆕 | DB trigger on `deck_votes`            |
| 95  | Discord Handle in Profile        | ✅ DONE 🆕 | `UserProfileModal.jsx`                |
| 96  | Avatar Upload                    | ✅ DONE 🆕 | Supabase Storage `avatars` bucket     |
| 97  | Profile Stats                    | ✅ DONE 🆕 | Decks count + Street Cred displayed   |

## 🔮 FASE 18: META ANALYTICS — "RED STATS" (0%)

> Needs Black Market volume first. Build when community grows.

| #   | Feature               | Priority  | Description                                   |
| :-- | :-------------------- | :-------- | :-------------------------------------------- |
| 98  | Top 5 Most Used Cards | 🔴 HIGH   | JSONB query over saved_decks — weekly ranking |
| 99  | Automatic Tier List   | 🔴 HIGH   | Upvotes + winrate from Simulator              |
| 100 | Archetype Trend Chart | 🔶 MEDIUM | % by archetype this week vs last week         |
| 101 | "Red Stats" Tab       | 🔶 MEDIUM | New tab with auto charts                      |
| 102 | Most Cloned Decks     | 🔷 LOW    | Clone ranking                                 |

## 🔮 FASE 19: SCANNER & SMART IMPORT (FUTURE)

| #   | Feature                   | Priority  | Description                         |
| :-- | :------------------------ | :-------- | :---------------------------------- |
| 103 | Card Scanner (Camera OCR) | 🔶 MEDIUM | Web Camera API + Tesseract.js       |
| 104 | Batch Import via Scanner  | 🔶 MEDIUM | Scan cards → auto-add to Collection |

---

## 📊 PROGRESS SUMMARY

| Phase | Description           | Done  | Progress   |
| :---- | :-------------------- | :---- | :--------- |
| 1     | Deck Building Core    | 8/8   | ✅ 100%    |
| 2     | Simulators            | 2/2   | ✅ 100%    |
| 3     | Supabase Migration    | 8/8   | ✅ 100%    |
| 4     | Onboarding            | 7/7   | ✅ 100%    |
| 5     | Export & Analytics    | 6/7   | ⏳ 86%     |
| 6     | The Vault             | 4/4   | ✅ 100%    |
| 7     | Cloud Sharing         | 6/8   | ⏳ 75%     |
| 8     | UI/UX                 | 11/12 | ⏳ 92%     |
| 9     | Game Simulator        | 5/9   | ⏳ 56%     |
| 10    | Black Market          | 8/8   | ✅ 100%    |
| 11    | Enhanced Filters      | 4/5   | ⏳ 80%     |
| 12    | Wishlist              | 5/5   | ✅ 100%    |
| 13    | Scraper               | 1/3   | ⏳ 33%     |
| 14    | Draft Simulator       | 3/4   | ⏳ 75% 🆕  |
| 15    | Cyberspace Aesthetics | 7/7   | ✅ 100%    |
| 16    | Architecture Refactor | 4/4   | ✅ 100% 🆕 |
| 17    | Player Profiles       | 6/6   | ✅ 100% 🆕 |
| 18    | Meta Analytics        | 0/5   | 🔮 0%      |
| 19    | Scanner               | 0/2   | 🔮 0%      |

**TOTAL: ~100/117 features (~85% complete)**

---

## 🎯 NEXT PRIORITIES

### 🔴 NOW (v1.0.0 release blockers)

1. **Fase 5 #29** — T1 Playability hypergeometric stat in `DeckAnalytics.jsx`
2. **Fase 7 #37** — Clean UUID cloud links (short shareable URLs)
3. **Content moderation** — bio/display name filtering (bad words)
4. **v1.0.0 tag** — after above 3 are done

### 🔶 SOON (v1.1.0)

5. **Fase 18** — Meta Analytics (wait for Black Market volume)
6. **Fase 14 #79** — Draft History
7. **Fase 9** — Drag to Zone in Simulator

### 🔷 FUTURE (v2.0.0)

8. Fase 9 — AI Opponent
9. Fase 19 — Card Scanner OCR
10. Fase 7 #40 — Full multi-language automation

---

## 📝 CHANGELOG

**2026-04-15 (MAJOR SESSION — Fases 14-17 complete):** 🆕

- ✅ **Fase 16 COMPLETE:** 4 custom hooks extracted from App.jsx (useDeckBuilder, useFilters, useSavedDecks, useCollection) — 1933→1306 lines (-32%)
- ✅ **Fase 17 COMPLETE:** Email/password auth, User Profile Hub, Avatar upload (Supabase Storage), Street Cred auto-trigger on votes, Discord handle
- ✅ **Fase 14 (75%):** Draft Simulator — 4 packs × 10 picks = 40 cards, loads to Deck Builder
- ✅ **Gacha Polish:** Sequential card reveal (120ms), rarity glow per rarity tier, 12 cards guaranteed
- ✅ **Street Cred trigger:** DB auto-recalculates on every vote INSERT/UPDATE/DELETE
- ✅ **Security hardening pass 2:** WITH CHECK on all UPDATE policies, payload size CHECK constraints
- 🔧 **Fixed:** handlePublishDeck missing after refactor, iconicRares pool undefined, slot11Card never pushed

**2026-04-14 (ENHANCED FILTERS + PWA + CYBERSPACE v2):**

- ✅ Fase 11: Artist + Card Number filters
- ✅ Pack Opener: Official Beta Kit pull rates
- ✅ CyberspaceParticles v2 + global background
- ✅ PWA manual fix + vercel.json without rewrites
- ✅ Share Deck modal + AnimatePresence mode=wait

**2026-04-13 (CYBERSPACE AESTHETICS):**

- ✅ Fase 15 complete: Glitch, Particles, Loader, CRT, PointCloud, CyberspaceMode

**2026-04-12 (PWA + DECK IMAGE EXPORT):**

- ✅ PWA installable Android/iOS
- ✅ DeckImageExport.jsx with QR code

**2026-04-10 (BLACK MARKET + WISHLIST):**

- ✅ Fase 10 complete: Black Market hub
- ✅ Fase 12 complete: Wishlist system
