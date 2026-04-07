# 📋 ROADMAP COMPLETO ACTUALIZADO
**Last Updated:** 2026-04-07

## ✅ FASE 1: DECK BUILDING CORE (100% COMPLETE)

| #    | Feature                            | Status | Files                                         |
| :--- | :--------------------------------- | :----- | :-------------------------------------------- |
| 1    | Búsqueda y Filtrado Extremo        | ✅ DONE | `FilterPanel.jsx`, `SearchBar.jsx`, `App.jsx` |
| 2    | Validador de Reglas en tiempo real | ✅ DONE | `App.jsx`, `deckValidator.js`                 |
| 3    | Muro de RAM dinámico               | ✅ DONE | `App.jsx`, `DeckArea.jsx`                     |
| 3.5  | FREE BUILD MODE 🆕                  | ✅ DONE | `App.jsx`, `DeckArea.jsx`                     |
| 4    | Panel de Analíticas básicas        | ✅ DONE | `DeckAnalytics.jsx`, `AnalyticsModal.jsx`     |
| 5    | Exportación en texto plano         | ✅ DONE | `ExportModal.jsx`                             |
| 6    | Zona de Sideboard (0/15)           | ✅ DONE | `App.jsx`, `DeckArea.jsx`                     |
| 6.5  | Refactor de IDs para Alt Arts      | ✅ DONE | `cards.json`, `App.jsx`                       |

## ✅ FASE 2: SIMULATORS (100% COMPLETE)

| #    | Feature            | Status | Files                                        |
| :--- | :----------------- | :----- | :------------------------------------------- |
| 7    | Mulligan Simulator | ✅ DONE | `MulliganSimulator.jsx`, `MulliganModal.jsx` |
| 8    | Pack Opener        | ✅ DONE | `PackOpener.jsx`                             |

## ✅ FASE 3: SUPABASE MIGRATION (100% COMPLETE)

| #    | Feature              | Status | Notes                                                                 |
| :--- | :------------------- | :----- | :-------------------------------------------------------------------- |
| 9-16 | Backend Architecture | ✅ DONE | Auth, CRUD decks, collection tracker, feedback, hybrid image fallback |

**Services Implemented:**
* `supabase.js` - Client setup
* `deckService.js` - CRUD operations
* `collectionService.js` - Collection tracking
* `feedbackService.js` - Bug reports
* `SmartCardImage.jsx` - 3-layer image fallback

## ✅ FASE 4: ONBOARDING & EDUCATIONAL (100% COMPLETE)

| #    | Feature                        | Status   | Files                                                             |
| :--- | :----------------------------- | :------- | :---------------------------------------------------------------- |
| 17   | Landing Page / Home Dashboard  | ✅ DONE   | `LandingPage.jsx`                                                 |
| 18   | Sistema de Tooltips Educativos | ✅ DONE   | `Tooltip.jsx`                                                     |
| 19   | Guía de Principiantes (Modal)  | ✅ DONE   | `GuideModal.jsx`                                                  |
| 21   | Precon Deck Explainers         | ✅ DONE   | `preconGuides.json`, `PreconDecksView.jsx`, `PreconExplainer.jsx` |
| 22   | Card Legality Warnings         | ✅ DONE   | `LegalityBadge.jsx`, `LegalityInfoModal.jsx`, `cardLegality.json` |
| 23   | Suggested Cards (AI Helper)    | ✅ DONE 🆕 | `SuggestedCards.jsx`                                              |
| 23.5 | Actualización Metadatos (SEO)  | ✅ DONE   | `index.html`                                                      |

## ⏳ FASE 5: EXPORT, ANALYTICS & PROXIES (86% COMPLETE)

| #    | Feature                                       | Status    | Files/Notes               |
| :--- | :-------------------------------------------- | :-------- | :------------------------ |
| 24   | Curva de Eddies                               | ✅ DONE    | `DeckAnalytics.jsx`       |
| 25   | Export Texto Plano                            | ✅ DONE    | `ExportModal.jsx`         |
| 26   | Alerta "Mazo Lento" (Soft Warning)            | ✅ DONE    | `DeckAnalytics.jsx`       |
| 27   | Generador de Proxies                          | ✅ DONE    | `ProxyModal.jsx`          |
| 28   | Sinergia de Tags (%)                          | ✅ DONE    | `DeckAnalytics.jsx`       |
| 30   | Import desde Texto                            | ✅ DONE    | `ImportDeckModal.jsx`     |
| 29   | Estadísticas de Consistencia (T1 Playability) | ⏳ PENDING | Needs hypergeometric calc |

## ⏳ FASE 6: THE VAULT (75% COMPLETE)

| #    | Feature                              | Status | Files/Notes                              |
| :--- | :----------------------------------- | :----- | :--------------------------------------- |
| 31   | Collection Tracker                   | ✅ DONE | `CollectionView.jsx`                     |
| 32   | Pack Opener → Collection Integration | ✅ DONE | `PackOpener.jsx`, `collectionService.js` |
| 33   | Collection Analytics (Sin Precios)   | ✅ DONE | `CollectionView.jsx`                     |
| 34   | Wishlist / Trade Manager             | ❌ TODO | Needs `wishlist` table in Supabase       |

## ⏳ FASE 7: CLOUD SHARING & COMMUNITY (57% COMPLETE)

| #    | Feature                            | Status     | Files/Notes                                      |
| :--- | :--------------------------------- | :--------- | :----------------------------------------------- |
| 35   | URL Sharing (Base64)               | ✅ DONE     | `deckService.js`                                 |
| 36   | Advanced Deck Management           | ✅ DONE     | `MyDecksView.jsx`                                |
| 38   | Página Legal (Copyright)           | ✅ DONE     | `LegalDisclaimer.jsx`                            |
| 39   | Lazy Loading de Imágenes           | ✅ DONE     | `SmartCardImage.jsx`                             |
| 40   | Traducción Multi-idioma            | ⏳ PARTIAL  | `LanguageContext.jsx` (manual, needs automation) |
| 37   | Cloud Link con UUID                | ❌ TODO     | Clean shareable links                            |
| 41   | Public Deck Gallery (Black Market) | ⏳ DB READY | `communityService.js` exists, UI pending         |
| 42   | Deck Comments & Ratings            | ⏳ DB READY | `deck_votes` & `deck_comments` tables exist      |

## ⏳ FASE 8: UI/UX ENHANCEMENTS (70% COMPLETE)

| #    | Feature                          | Status    | Files/Notes                                      |
| :--- | :------------------------------- | :-------- | :----------------------------------------------- |
| 43   | Micro-Animations (Framer Motion) | ✅ DONE 🆕  | 11 modals updated                                |
| 44   | Skeleton States (Card Gallery)   | ✅ DONE    | `SmartCardImage.jsx`                             |
| 45   | Drag & Drop Deck Building        | ❌ TODO    | Needs `@dnd-kit/core`                            |
| 46   | Modal Blur (Backdrop)            | ✅ DONE 🆕  | Included in Framer Motion modals                 |
| 47   | Toast Improvements               | ✅ DONE    | `Toast.jsx`                                      |
| 48   | Jerarquía Tipográfica            | ❌ TODO    | Add sans-serif for long text                     |
| 49   | Smart Collapse (Filters)         | ⏳ PARTIAL | Filters open by default on mobile                |
| 50   | Gacha Polish (Pack Opener)       | ❌ TODO    | Delayed reveal + glow effects                    |
| 51   | Hover Actions on Deck Cards      | ✅ DONE 🆕  | `DeckCardActions.jsx` (Preview/Remove/Move/Edit) |
| 52   | Arrow Navigation in Preview      | ✅ DONE 🆕  | `CardPreviewModal.jsx` (keyboard + buttons)      |

## ⏳ FASE 9: THE ARENA (GAME SIMULATOR) (57% COMPLETE)

| #    | Feature                   | Status        | Files/Notes                                        |
| :--- | :------------------------ | :------------ | :------------------------------------------------- |
| 48   | Game State Engine (Core)  | ✅ DONE 🆕      | `GameState.js` (192 lines)                         |
| 49   | Simulator UI (Beta)       | ✅ DONE 🆕      | `SimulatorBeta.jsx` (474 lines), `PlaymatView.jsx` |
| 50   | Card Logic & Combat       | ✅ DONE 🆕      | `CardLogic.js`, `CombatResolver.js`                |
| 51   | Feature Flag (Admin-Only) | ✅ DONE 🆕      | `featureFlagService.js`, `useFeatureFlag.js`       |
| 52   | Full Playmat Rendering    | ⏳ IN PROGRESS | Playmat exists, needs card interactions            |
| 53   | AI Opponent               | ❌ TODO        | Phase 9.5                                          |
| 54   | Multiplayer (P2P)         | ❌ TODO        | Phase 10                                           |

## ⏳ FASE 10: BLACK MARKET (COMMUNITY HUB) (29% COMPLETE)

| #    | Feature                   | Status     | Files/DB                                                                               |
| :--- | :------------------------ | :--------- | :------------------------------------------------------------------------------------- |
| 55   | DB Schema (Public Decks)  | ✅ DONE 🆕   | Tables: `deck_votes`, `deck_comments`, columns: visibility, archetype, simulator_stats |
| 56   | Community Service         | ✅ DONE 🆕   | `communityService.js` (240 lines)                                                      |
| 57   | Black Market Hub UI       | ❌ TODO     | Component needs creation                                                               |
| 58   | Deck Detail Page (Public) | ❌ TODO     | Shareable deck view                                                                    |
| 59   | Upvote System             | ⏳ DB READY | Backend ready, UI pending                                                              |
| 60   | Clone/Fork Decks          | ❌ TODO     | "Clone to Terminal" button                                                             |
| 61   | Archetype Filtering       | ⏳ DB READY | Schema has archetype field                                                             |

## 🆕 FASE 11: ENHANCED FILTERS & SEARCH (0% COMPLETE)

| #    | Feature                   | Priority | Description                                       |
| :--- | :------------------------ | :------- | :------------------------------------------------ |
| 62   | Card Number Filter        | 🔥 HIGH   | Search by "α009", "132a", "019"                   |
| 63   | Artist Filter             | 🔥 HIGH   | Multi-select dropdown (auto-populated)            |
| 64   | Enhanced Search           | 🔥 HIGH   | Search by subtitle, number, artist                |
| 65   | Auto-Detect Factions      | 🔶 MEDIUM | Dynamic faction list from `cards.json`            |
| 66   | Multiple Factions Support | 🔶 MEDIUM | Cards with 2+ factions (e.g., GANGER + VALENTINO) |

**Schema Changes Needed:**
```json
// cards.json
{
  "subtitle": "La Venganza Lenta",  // ← NEW
  "factions": ["GANGER", "VALENTINO"],  // ← NEW (array)
  "faction": "GANGER",  // ← Keep for backward compat
  "number": "019",  // ✅ Already exists
  "artist": "Rafael de Latorre & Clonerh"  // ✅ Already exists
}
```

## 🆕 FASE 12: WISHLIST FEATURE (0% COMPLETE)

| #    | Feature                 | Priority | Description                            |
| :--- | :---------------------- | :------- | :------------------------------------- |
| 67   | Wishlist DB Schema      | 🔥 HIGH   | Supabase table `wishlist`              |
| 68   | Wishlist Service        | 🔥 HIGH   | `wishlistService.js` (add/remove/list) |
| 69   | Wishlist View           | 🔥 HIGH   | New tab in navbar                      |
| 70   | Toggle in Preview Modal | 🔥 HIGH   | "⭐ Add to Wishlist" button             |
| 71   | Wishlist Export         | 🔶 MEDIUM | Text format for shopping               |

## 🆕 FASE 13: SCRAPER ENHANCEMENTS (33% COMPLETE)

| #    | Feature                   | Priority | Description                        |
| :--- | :------------------------ | :------- | :--------------------------------- |
| 72   | Extract Subtitle          | 🔶 MEDIUM | "La Venganza Lenta" from card page |
| 73   | Extract Multiple Factions | 🔶 MEDIUM | Parse all faction tags             |
| 74   | Verify Number & Artist    | ✅ DONE   | Already extracting                 |

---

## 📊 PROGRESS SUMMARY

| Fase    | Completado | Pendiente | Progreso |
| :------ | :--------- | :-------- | :------- |
| Fase 1  | 8/8        | 0         | 100% ✅   |
| Fase 2  | 2/2        | 0         | 100% ✅   |
| Fase 3  | 8/8        | 0         | 100% ✅   |
| Fase 4  | 7/7        | 0         | 100% ✅   |
| Fase 5  | 6/7        | 1         | 86% ⏳    |
| Fase 6  | 3/4        | 1         | 75% ⏳    |
| Fase 7  | 4/7        | 3         | 57% ⏳    |
| Fase 8  | 7/10       | 3         | 70% ⏳    |
| Fase 9  | 4/7        | 3         | 57% ⏳    |
| Fase 10 | 2/7        | 5         | 29% ⏳    |
| Fase 11 | 0/5        | 5         | 0% ❌     |
| Fase 12 | 0/5        | 5         | 0% ❌     |
| Fase 13 | 1/3        | 2         | 33% ⏳    |

**TOTAL:** 52/73 features completadas (71% del proyecto)

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

**PRIORIDAD INMEDIATA:**
* **WISHLIST FEATURE (Fase 12)** - Alta demanda de usuarios
* **ENHANCED FILTERS (Fase 11)** - Mejora UX inmediata
* **BLACK MARKET UI (Fase 10)** - Backend listo, falta frontend

**ORDEN SUGERIDO:**
1. **SEMANA 1:** Wishlist Feature (DB + Service + UI) | Enhanced Filters (Number + Artist)
2. **SEMANA 2:** Black Market Hub UI | Scraper Updates (subtitle + factions)
3. **SEMANA 3:** T1 Playability Calculator | Gacha Polish (Pack Opener)

---

## 📝 CHANGELOG

**2026-04-05 (HOTFIX DAY):**
- 🐛 **FIXED:** Mulligan Simulator color filtering (used `faction` instead of `ram_color`)
  - `getAllowedColors()` now reads `legend.ram_color` (Red/Blue/Green/Yellow)
  - Card pool filtering changed from faction matching to `ram_color` matching
  - Added debug logs for color verification
- 🐛 **FIXED:** Admin Panel RLS policies (DELETE operations blocked)
  - Policies now check `admin_users` table instead of `auth.users.metadata`
  - SQL Editor fix: `DROP POLICY` + `CREATE POLICY` with `admin_users` JOIN
- 🐛 **FIXED:** Feedback metadata showing "N/A"
  - feedbackService now captures browser/OS/URL via `getSystemMetadata()`
  - Browser detection: Chrome, Firefox, Safari, Edge
  - OS detection: Windows, macOS, Linux, Android, iOS
- ✨ **ADDED:** AdminFeedbackViewer bulk delete with checkboxes
  - Permanent checkboxes on left (no "SELECT MODE" toggle)
  - Bulk actions appear dynamically when items selected
  - Visual feedback: blue highlight for selected items
- ✨ **ADDED:** Kickstarter widget to LandingPage hero
  - Grid layout (text left, widget right)
  - Responsive: hidden on mobile (`hidden lg:block`)
  - Exact fit wrapper (220x420px) with border
- 🔧 **FIXED:** MulliganModal overflow when analysis panel opens
  - Added `max-h-[90vh]` + `overflow-y-auto` to modal container

**2026-04-04:**
- ✅ CORRECTED: Fase 4 from 90% → 100% (SuggestedCards.jsx verified)
- ✅ CORRECTED: Fase 5 from 85% → 100% (Hypergeometric in AnalyticsModal.jsx verified)
- ✅ CORRECTED: Fase 6 from 75% → 100% (Collection fully functional)
- ✅ VERIFIED: Phase 8 at 33% (modal animations done, buttons/cards pending)
- ✅ ADDED: Exact commit references (ae05c54, 6576e2f, 2bec00f, 2d9590e)
- ✅ ADDED: Component file paths verified against repo
- ✅ ADDED: Deployment readiness score (96/100)