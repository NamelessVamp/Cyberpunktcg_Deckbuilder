# 📋 ROADMAP COMPLETO ACTUALIZADO

**Last Updated:** 2026-04-10

## ✅ FASE 1: DECK BUILDING CORE (100% COMPLETE)

| #   | Feature                            | Status  | Files                                         |
| :-- | :--------------------------------- | :------ | :-------------------------------------------- |
| 1   | Búsqueda y Filtrado Extremo        | ✅ DONE | `FilterPanel.jsx`, `SearchBar.jsx`, `App.jsx` |
| 2   | Validador de Reglas en tiempo real | ✅ DONE | `App.jsx`, `deckValidator.js`                 |
| 3   | Muro de RAM dinámico               | ✅ DONE | `App.jsx`, `DeckArea.jsx`                     |
| 3.5 | FREE BUILD MODE                    | ✅ DONE | `App.jsx`, `DeckArea.jsx`                     |
| 4   | Panel de Analíticas básicas        | ✅ DONE | `DeckAnalytics.jsx`, `AnalyticsModal.jsx`     |
| 5   | Exportación en texto plano         | ✅ DONE | `ExportModal.jsx`                             |
| 6   | Zona de Sideboard (0/15)           | ✅ DONE | `App.jsx`, `DeckArea.jsx`                     |
| 6.5 | Refactor de IDs para Alt Arts      | ✅ DONE | `cards.json`, `App.jsx`                       |

## ✅ FASE 2: SIMULATORS (100% COMPLETE)

| #   | Feature            | Status  | Files                                        |
| :-- | :----------------- | :------ | :------------------------------------------- |
| 7   | Mulligan Simulator | ✅ DONE | `MulliganSimulator.jsx`, `MulliganModal.jsx` |
| 8   | Pack Opener        | ✅ DONE | `PackOpener.jsx`                             |

## ✅ FASE 3: SUPABASE MIGRATION (100% COMPLETE)

| #    | Feature              | Status  | Notes                                                                 |
| :--- | :------------------- | :------ | :-------------------------------------------------------------------- |
| 9-16 | Backend Architecture | ✅ DONE | Auth, CRUD decks, collection tracker, feedback, hybrid image fallback |

## ✅ FASE 4: ONBOARDING & EDUCATIONAL (100% COMPLETE)

| #    | Feature                        | Status  | Files                                                             |
| :--- | :----------------------------- | :------ | :---------------------------------------------------------------- |
| 17   | Landing Page / Home Dashboard  | ✅ DONE | `LandingPage.jsx`                                                 |
| 18   | Sistema de Tooltips Educativos | ✅ DONE | `Tooltip.jsx`                                                     |
| 19   | Guía de Principiantes (Modal)  | ✅ DONE | `GuideModal.jsx`                                                  |
| 21   | Precon Deck Explainers         | ✅ DONE | `preconGuides.json`, `PreconDecksView.jsx`, `PreconExplainer.jsx` |
| 22   | Card Legality Warnings         | ✅ DONE | `LegalityBadge.jsx`, `LegalityInfoModal.jsx`, `cardLegality.json` |
| 23   | Suggested Cards (AI Helper)    | ✅ DONE | `SuggestedCards.jsx`                                              |
| 23.5 | Actualización Metadatos (SEO)  | ✅ DONE | `index.html`                                                      |

## ⏳ FASE 5: EXPORT, ANALYTICS & PROXIES (86% COMPLETE)

| #   | Feature                                       | Status     | Files/Notes               |
| :-- | :-------------------------------------------- | :--------- | :------------------------ |
| 24  | Curva de Eddies                               | ✅ DONE    | `DeckAnalytics.jsx`       |
| 25  | Export Texto Plano                            | ✅ DONE    | `ExportModal.jsx`         |
| 26  | Alerta "Mazo Lento" (Soft Warning)            | ✅ DONE    | `DeckAnalytics.jsx`       |
| 27  | Generador de Proxies                          | ✅ DONE    | `ProxyModal.jsx`          |
| 28  | Sinergia de Tags (%)                          | ✅ DONE    | `DeckAnalytics.jsx`       |
| 30  | Import desde Texto                            | ✅ DONE    | `ImportDeckModal.jsx`     |
| 29  | Estadísticas de Consistencia (T1 Playability) | ⏳ PENDING | Needs hypergeometric calc |

## ✅ FASE 6: THE VAULT (100% COMPLETE) 🆕

| #   | Feature                              | Status  | Files/Notes                                                                               |
| :-- | :----------------------------------- | :------ | :---------------------------------------------------------------------------------------- |
| 31  | Collection Tracker                   | ✅ DONE | `CollectionView.jsx`                                                                      |
| 32  | Pack Opener → Collection Integration | ✅ DONE | `PackOpener.jsx`, `collectionService.js`                                                  |
| 33  | Collection Analytics                 | ✅ DONE | `CollectionView.jsx`                                                                      |
| 34  | Wishlist / Collection Gallery 🆕     | ✅ DONE | `CollectionView.jsx` — ALL/OWNED/MISSING/WISHLIST filters, owned en color, missing grayed |

## ⏳ FASE 7: CLOUD SHARING & COMMUNITY (86% COMPLETE) 🆕

| #   | Feature                            | Status     | Files/Notes                                      |
| :-- | :--------------------------------- | :--------- | :----------------------------------------------- |
| 35  | URL Sharing (Base64)               | ✅ DONE    | `deckService.js`                                 |
| 36  | Advanced Deck Management           | ✅ DONE    | `MyDecksView.jsx`                                |
| 38  | Página Legal (Copyright)           | ✅ DONE    | `LegalDisclaimer.jsx`                            |
| 39  | Lazy Loading de Imágenes           | ✅ DONE    | `SmartCardImage.jsx`                             |
| 41  | Public Deck Gallery (Black Market) | ✅ DONE 🆕 | `BlackMarketView.jsx`, `PublicDeckView.jsx`      |
| 42  | Deck Comments & Ratings            | ✅ DONE 🆕 | Voting + comments en `PublicDeckView.jsx`        |
| 40  | Traducción Multi-idioma            | ⏳ PARTIAL | `LanguageContext.jsx` (manual, needs automation) |
| 37  | Cloud Link con UUID                | ❌ TODO    | Clean shareable links                            |

## ⏳ FASE 8: UI/UX ENHANCEMENTS (80% COMPLETE) 🆕

| #   | Feature                           | Status     | Files/Notes                                                        |
| :-- | :-------------------------------- | :--------- | :----------------------------------------------------------------- |
| 43  | Micro-Animations (Framer Motion)  | ✅ DONE    | 11 modals updated                                                  |
| 44  | Skeleton States (Card Gallery)    | ✅ DONE    | `SmartCardImage.jsx`                                               |
| 46  | Modal Blur (Backdrop)             | ✅ DONE    | Framer Motion modals                                               |
| 47  | Toast Improvements                | ✅ DONE    | `Toast.jsx`                                                        |
| 51  | Hover/Click Actions on Deck Cards | ✅ DONE 🆕 | Click abre preview con deck controls (submit copies, move, remove) |
| 52  | Arrow Navigation in Preview       | ✅ DONE    | `CardPreviewModal.jsx`                                             |
| 53  | Wishlist Star in Build Grid       | ✅ DONE 🆕 | App.jsx — star con glow ámbar, sync con modal                      |
| 45  | Drag & Drop Deck Building         | ❌ TODO    | Needs `@dnd-kit/core`                                              |
| 48  | Jerarquía Tipográfica             | ❌ TODO    | Add sans-serif for long text                                       |
| 50  | Gacha Polish (Pack Opener)        | ❌ TODO    | Delayed reveal + glow effects                                      |
| 54  | PWA (vite-plugin-pwa) 🆕          | ❌ TODO    | Install on mobile/desktop, ~15 min effort                          |

## ⏳ FASE 9: THE ARENA (GAME SIMULATOR) (71% COMPLETE)

| #   | Feature                         | Status     | Files/Notes                                  |
| :-- | :------------------------------ | :--------- | :------------------------------------------- |
| 48  | Game State Engine (Core)        | ✅ DONE    | `GameState.js`                               |
| 49  | Simulator UI (Beta)             | ✅ DONE    | `SimulatorBeta.jsx`, `PlaymatV2.jsx`         |
| 50  | Card Logic & Combat             | ✅ DONE    | `CardLogic.js`, `CombatResolver.js`          |
| 51  | Feature Flag (Admin-Only)       | ✅ DONE    | `featureFlagService.js`, `useFeatureFlag.js` |
| 52  | Playmat V2 (Skeleton Overlay)   | ✅ DONE    | `PlaymatV2.jsx`, `CyberCard.jsx`             |
| 53  | Card Interactions (Drag & Drop) | ⏳ PARTIAL | Tap/flip working, drag-to-zone pending       |
| 54  | Card Hover Preview              | ❌ TODO    | Zoom on hover o side panel                   |
| 55  | AI Opponent                     | ❌ TODO    | Phase 9.5                                    |
| 56  | Multiplayer (P2P)               | ❌ TODO    | Phase 10                                     |

## ✅ FASE 10: BLACK MARKET (COMMUNITY HUB) (100% COMPLETE) 🆕

| #   | Feature                   | Status     | Files                                                      |
| :-- | :------------------------ | :--------- | :--------------------------------------------------------- |
| 55  | DB Schema (Public Decks)  | ✅ DONE    | `deck_votes`, `deck_comments`, visibility, archetype       |
| 56  | Community Service         | ✅ DONE    | `communityService.js`                                      |
| 57  | Black Market Hub UI       | ✅ DONE 🆕 | `BlackMarketView.jsx` — feed, filtros, Street Cred         |
| 58  | Deck Detail Page (Public) | ✅ DONE 🆕 | `PublicDeckView.jsx` — card list, Eddies Curve, comments   |
| 59  | Upvote System             | ✅ DONE 🆕 | Voting UP/DOWN con toggle en `PublicDeckView.jsx`          |
| 60  | Clone/Fork Decks          | ✅ DONE 🆕 | `[>_ CLONE TO TERMINAL]` — copia a My Decks                |
| 61  | Archetype Filtering       | ✅ DONE 🆕 | `PublishDeckModal.jsx` — aggro/control/combo/midrange/jank |
| 62  | Owner/Admin Delete + Edit | ✅ DONE 🆕 | Edit description + delete desde `PublicDeckView.jsx`       |

## ⏳ FASE 11: ENHANCED FILTERS & SEARCH (0% COMPLETE)

| #   | Feature                   | Priority  | Description                            |
| :-- | :------------------------ | :-------- | :------------------------------------- |
| 63  | Card Number Filter        | 🔥 HIGH   | Search by "α009", "132a", "019"        |
| 64  | Artist Filter             | 🔥 HIGH   | Multi-select dropdown (auto-populated) |
| 65  | Enhanced Search           | 🔥 HIGH   | Search by subtitle, number, artist     |
| 66  | Auto-Detect Factions      | 🔶 MEDIUM | Dynamic faction list from `cards.json` |
| 67  | Multiple Factions Support | 🔶 MEDIUM | Cards with 2+ factions                 |

## ✅ FASE 12: WISHLIST FEATURE (100% COMPLETE) 🆕

| #   | Feature                 | Status     | Files                                              |
| :-- | :---------------------- | :--------- | :------------------------------------------------- |
| 68  | Wishlist DB Schema      | ✅ DONE 🆕 | Supabase `wishlist` table con RLS                  |
| 69  | Wishlist Service        | ✅ DONE 🆕 | `wishlistService.js` (add/remove/list/export)      |
| 70  | Wishlist en Collection  | ✅ DONE 🆕 | `CollectionView.jsx` — filtro WISHLIST, star hover |
| 71  | Toggle en Preview Modal | ✅ DONE 🆕 | `CardPreviewModal.jsx` — star top-left con glow    |
| 72  | Star en Build Grid      | ✅ DONE 🆕 | `App.jsx` — star bottom-right, sync tiempo real    |

## ⏳ FASE 13: SCRAPER ENHANCEMENTS (33% COMPLETE)

| #   | Feature                   | Status  | Description                        |
| :-- | :------------------------ | :------ | :--------------------------------- |
| 73  | Extract Subtitle          | ⏳ TODO | "La Venganza Lenta" from card page |
| 74  | Extract Multiple Factions | ⏳ TODO | Parse all faction tags             |
| 75  | Verify Number & Artist    | ✅ DONE | Already extracting                 |

## 🔮 FASE 14: SCANNER & SMART IMPORT (FUTURE)

| #   | Feature                   | Priority  | Description                                   |
| :-- | :------------------------ | :-------- | :-------------------------------------------- |
| 76  | Card Scanner (Camera OCR) | 🔶 MEDIUM | Web Camera API + Google Vision o Tesseract.js |
| 77  | Batch Import via Scanner  | 🔶 MEDIUM | Scan múltiples cartas → auto-add a Collection |

> **Prereqs:** Set de imágenes de referencia para matching, API Vision o modelo local. Estimado: 2-3 semanas.

---

## 📊 PROGRESS SUMMARY

| Fase    | Completado | Pendiente | Progreso   |
| :------ | :--------- | :-------- | :--------- |
| Fase 1  | 8/8        | 0         | 100% ✅    |
| Fase 2  | 2/2        | 0         | 100% ✅    |
| Fase 3  | 8/8        | 0         | 100% ✅    |
| Fase 4  | 7/7        | 0         | 100% ✅    |
| Fase 5  | 6/7        | 1         | 86% ⏳     |
| Fase 6  | 4/4        | 0         | 100% ✅ 🆕 |
| Fase 7  | 6/7        | 1         | 86% ⏳ 🆕  |
| Fase 8  | 8/11       | 3         | 80% ⏳ 🆕  |
| Fase 9  | 5/9        | 4         | 56% ⏳     |
| Fase 10 | 8/8        | 0         | 100% ✅ 🆕 |
| Fase 11 | 0/5        | 5         | 0% ❌      |
| Fase 12 | 5/5        | 0         | 100% ✅ 🆕 |
| Fase 13 | 1/3        | 2         | 33% ⏳     |
| Fase 14 | 0/2        | 2         | 0% 🔮      |

**TOTAL: 68/85 features completadas (80% del proyecto)** 🆕

---

## 🎯 PRÓXIMOS PASOS

1. **PWA** — `vite-plugin-pwa`, 15 min, cierra Fase 8 al 90%
2. **Fase 11** — Enhanced Filters (card number, artist, subtitle)
3. **Fase 9 Polish** — Drag-to-zone en Playmat, card hover preview
4. **v1.0.0 tag** — PWA + Fase 11 = milestone de release

## IDEAS EMERGENTES

- **Escáner de cartas (Fase 14):** OCR con cámara para auto-agregar a Collection. Prereqs: imagen DB de referencia. Estimado post-v1.0.0.
- **PWA (Fase 8):** `vite-plugin-pwa` — instalar en celular como app nativa. ~15 min. Próxima sesión.

---

## 📝 CHANGELOG

**2026-04-10 (BLACK MARKET + WISHLIST RELEASE):** 🆕

- ✨ **ADDED:** Black Market Hub (`BlackMarketView.jsx`)
  - Feed de mazos públicos con filtros por archetype, color RAM, búsqueda
  - Street Cred (upvote/downvote system)
  - Clone to Terminal — copia mazos de la comunidad a My Decks
  - Refresh automático al borrar deck
- ✨ **ADDED:** PublicDeckView modal
  - Lista de cartas con RAM dots y costo en Eddies
  - Eddies Curve (excluye leyendas, fix de barras vacías)
  - Intel Comments — post y lectura en tiempo real
  - Owner/Admin: editar descripción y borrar deck del mercado
- ✨ **ADDED:** PublishDeckModal — reemplaza prompt() nativo
  - Selector de archetype (Aggro/Control/Combo/Midrange/Jank)
  - Textarea para strategy notes con contador de caracteres
  - Preview de stats del deck antes de publicar
- ✨ **ADDED:** Wishlist System
  - Star en Build grid (bottom-right de imagen, glow ámbar)
  - Star en CardPreviewModal (top-left, toggle con sync)
  - Collection v2: todas las cartas, owned en color, missing grayed 40%
  - Filtros ALL/OWNED/MISSING/WISHLIST en Collection tab
- ✨ **IMPROVED:** DeckArea UX
  - Click en carta del deck → abre CardPreviewModal con deck controls
  - Copies stepper muestra cantidad actual, permite bajar a 0
  - Submit copies calcula diff y aplica add/remove automático
  - Deck count badge en Build grid (azul, x1/x2/x3)
- 🔧 **FIXED:** Supabase
  - Columnas discord_username/discord_avatar en profiles
  - FK profiles para PostgREST joins (PGRST200 fix)
  - .maybeSingle() en wishlist/votes (406 fix)
  - Removidas constraints check_legends_count/check_main_deck_count
  - Admin RLS policies para decks y deck_comments

**2026-04-07 (PLAYMAT V2 RELEASE):**
[... changelog anterior sin cambios ...]
