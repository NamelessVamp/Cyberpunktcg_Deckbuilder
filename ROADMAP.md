# 📋 ROADMAP COMPLETO — AFTERLIFE DECKS

**Last Updated:** 2026-04-14

## ✅ FASE 1: DECK BUILDING CORE (100% COMPLETE)

| #   | Feature                            | Status  | Files / Notes                                 |
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

| #   | Feature                                       | Status  | Files / Notes                                |
| :-- | :-------------------------------------------- | :------ | :------------------------------------------- |
| 7   | Mulligan Simulator                            | ✅ DONE | `MulliganSimulator.jsx`, `MulliganModal.jsx` |
| 8   | Pack Opener + Pull Rates oficiales (Beta Kit) | ✅ DONE | `PackOpener.jsx`                             |

## ✅ FASE 3: SUPABASE MIGRATION (100% COMPLETE)

| #    | Feature              | Status  | Notes                                                                 |
| :--- | :------------------- | :------ | :-------------------------------------------------------------------- |
| 9-16 | Backend Architecture | ✅ DONE | Auth, CRUD decks, collection tracker, feedback, hybrid image fallback |

## ✅ FASE 4: ONBOARDING & EDUCATIONAL (100% COMPLETE)

| #   | Feature                        | Status  | Files / Notes                                                     |
| :-- | :----------------------------- | :------ | :---------------------------------------------------------------- |
| 17  | Landing Page / Home Dashboard  | ✅ DONE | `LandingPage.jsx`                                                 |
| 18  | Sistema de Tooltips Educativos | ✅ DONE | `Tooltip.jsx`                                                     |
| 19  | Guía de Principiantes (Modal)  | ✅ DONE | `GuideModal.jsx`                                                  |
| 21  | Precon Deck Explainers         | ✅ DONE | `preconGuides.json`, `PreconDecksView.jsx`, `PreconExplainer.jsx` |
| 22  | Card Legality Warnings         | ✅ DONE | `LegalityBadge.jsx`, `LegalityInfoModal.jsx`, `cardLegality.json` |
| 23  | Suggested Cards (AI Helper)    | ✅ DONE | `SuggestedCards.jsx`                                              |

## ⏳ FASE 5: EXPORT, ANALYTICS & PROXIES (86% COMPLETE)

| #   | Feature                                       | Status     | Files / Notes             |
| :-- | :-------------------------------------------- | :--------- | :------------------------ |
| 24  | Curva de Eddies                               | ✅ DONE    | `DeckAnalytics.jsx`       |
| 25  | Export Texto Plano                            | ✅ DONE    | `ExportModal.jsx`         |
| 26  | Alerta "Mazo Lento" (Soft Warning)            | ✅ DONE    | `DeckAnalytics.jsx`       |
| 27  | Generador de Proxies                          | ✅ DONE    | `ProxyModal.jsx`          |
| 28  | Sinergia de Tags (%)                          | ✅ DONE    | `DeckAnalytics.jsx`       |
| 30  | Import desde Texto                            | ✅ DONE    | `ImportDeckModal.jsx`     |
| 29  | Estadísticas de Consistencia (T1 Playability) | ⏳ PENDING | Needs hypergeometric calc |

## ✅ FASE 6: THE VAULT (100% COMPLETE)

| #   | Feature                              | Status  | Files / Notes                                                                             |
| :-- | :----------------------------------- | :------ | :---------------------------------------------------------------------------------------- |
| 31  | Collection Tracker                   | ✅ DONE | `CollectionView.jsx`                                                                      |
| 32  | Pack Opener → Collection Integration | ✅ DONE | `PackOpener.jsx`, `collectionService.js`                                                  |
| 33  | Collection Analytics                 | ✅ DONE | `CollectionView.jsx`                                                                      |
| 34  | Wishlist / Collection Gallery        | ✅ DONE | `CollectionView.jsx` — ALL/OWNED/MISSING/WISHLIST filters, owned en color, missing grayed |

## ⏳ FASE 7: CLOUD SHARING & COMMUNITY (86% COMPLETE)

| #   | Feature                            | Status     | Files / Notes                                    |
| :-- | :--------------------------------- | :--------- | :----------------------------------------------- |
| 35  | URL Sharing (Base64)               | ✅ DONE    | `deckService.js`                                 |
| 36  | Advanced Deck Management           | ✅ DONE    | `MyDecksView.jsx`                                |
| 38  | Página Legal (Copyright)           | ✅ DONE    | `LegalDisclaimer.jsx`                            |
| 39  | Lazy Loading de Imágenes           | ✅ DONE    | `SmartCardImage.jsx`                             |
| 41  | Public Deck Gallery (Black Market) | ✅ DONE    | `BlackMarketView.jsx`, `PublicDeckView.jsx`      |
| 42  | Deck Comments & Ratings            | ✅ DONE    | Voting + comments en `PublicDeckView.jsx`        |
| 40  | Traducción Multi-idioma            | ⏳ PARTIAL | `LanguageContext.jsx` (manual, needs automation) |
| 37  | Cloud Link con UUID                | ❌ TODO    | Clean shareable links                            |

## ⏳ FASE 8: UI/UX ENHANCEMENTS (85% COMPLETE)

| #   | Feature                           | Status  | Files / Notes                                                      |
| :-- | :-------------------------------- | :------ | :----------------------------------------------------------------- |
| 43  | Micro-Animations (Framer Motion)  | ✅ DONE | 11 modals updated                                                  |
| 44  | Skeleton States (Card Gallery)    | ✅ DONE | `SmartCardImage.jsx`                                               |
| 46  | Modal Blur (Backdrop)             | ✅ DONE | Framer Motion modals                                               |
| 47  | Toast Improvements                | ✅ DONE | `Toast.jsx`                                                        |
| 51  | Hover/Click Actions on Deck Cards | ✅ DONE | Click abre preview con deck controls (submit copies, move, remove) |
| 52  | Arrow Navigation in Preview       | ✅ DONE | `CardPreviewModal.jsx`                                             |
| 53  | Wishlist Star in Build Grid       | ✅ DONE | `App.jsx` — star con glow ámbar, sync con modal                    |
| 54  | PWA manual (sw.js + manifest)     | ✅ DONE | `vite.config.js`, `index.html` — installable en Android/iOS        |
| 55  | Mobile Responsive Header          | ✅ DONE | `App.jsx` — título compacto, login inline en mobile                |
| 56  | Deck Image Export                 | ✅ DONE | `DeckImageExport.jsx` (Share as PNG + QR code)                     |
| 45  | Drag & Drop Deck Building         | ❌ TODO | Needs `@dnd-kit/core`                                              |
| 50  | Gacha Polish (Pack Opener)        | ❌ TODO | Delayed reveal + glow effects                                      |

## ⏳ FASE 9: THE ARENA (GAME SIMULATOR) (56% COMPLETE)

| #   | Feature                          | Status     | Files / Notes                                |
| :-- | :------------------------------- | :--------- | :------------------------------------------- |
| 48  | Game State Engine (Core)         | ✅ DONE    | `GameState.js`                               |
| 49  | Simulator UI (Beta)              | ✅ DONE    | `SimulatorBeta.jsx`, `PlaymatV2.jsx`         |
| 50  | Card Logic & Combat              | ✅ DONE    | `CardLogic.js`, `CombatResolver.js`          |
| 51  | Feature Flag (Admin-Only)        | ✅ DONE    | `featureFlagService.js`, `useFeatureFlag.js` |
| 52  | Playmat V2 (Skeleton Overlay)    | ✅ DONE    | `PlaymatV2.jsx`, `CyberCard.jsx`             |
| 53  | Card Interactions (Drag to Zone) | ⏳ PARTIAL | Tap/flip working, drag-to-zone pending       |
| 54  | Card Hover Preview in Simulator  | ❌ TODO    | Zoom on hover o side panel                   |
| 55  | AI Opponent                      | ❌ TODO    | Phase 9.5                                    |
| 56  | Multiplayer (P2P)                | ❌ TODO    | Phase 10                                     |

## ✅ FASE 10: BLACK MARKET (COMMUNITY HUB) (100% COMPLETE)

| #     | Feature            | Status  | Files / Notes                                        |
| :---- | :----------------- | :------ | :--------------------------------------------------- |
| 55-62 | Full Community Hub | ✅ DONE | Feed, votes, clone, comments, archetype, Street Cred |

## ⏳ FASE 11: ENHANCED FILTERS & SEARCH (80% COMPLETE) 🆕

| #   | Feature                   | Status     | Description                            |
| :-- | :------------------------ | :--------- | :------------------------------------- |
| 63  | Card Number Filter        | ✅ DONE    | Search by "α009", "132a", "019"        |
| 64  | Artist Filter             | ✅ DONE    | Multi-select dropdown (auto-populated) |
| 65  | Enhanced Search           | ✅ DONE    | Search by subtitle, number, artist     |
| 66  | Auto-Detect Factions      | ✅ DONE    | Dynamic faction list from `cards.json` |
| 67  | Multiple Factions Support | ⏳ PENDING | Cards with 2+ factions                 |

## ✅ FASE 12: WISHLIST FEATURE (100% COMPLETE)

| #     | Feature                                | Status  | Files / Notes                                   |
| :---- | :------------------------------------- | :------ | :---------------------------------------------- |
| 68-72 | Wishlist DB, Service, Preview, UI Grid | ✅ DONE | Supabase `wishlist` table con RLS, UI Integrada |

## ⏳ FASE 13: SCRAPER ENHANCEMENTS (33% COMPLETE)

| #   | Feature                   | Status  | Description                        |
| :-- | :------------------------ | :------ | :--------------------------------- |
| 73  | Extract Subtitle          | ⏳ TODO | "La Venganza Lenta" from card page |
| 74  | Extract Multiple Factions | ⏳ TODO | Parse all faction tags             |
| 75  | Verify Number & Artist    | ✅ DONE | Already extracting                 |

## ⏳ FASE 14: PACK DRAFT SIMULATOR (0% COMPLETE) 🆕

> **Evolución del Pack Opener:** "Abrir 4 sobres y armar un mazo de 40 cartas solo con lo que salió".  
> **Ventaja técnica:** Ya tenemos el motor del Pack Opener funcionando perfectamente.

| #   | Feature              | Priority  | Description                                  |
| :-- | :------------------- | :-------- | :------------------------------------------- |
| 76  | Draft Mode UI        | 🔴 HIGH   | Abrir 4 sobres virtuales secuencialmente     |
| 77  | Draft Pick Interface | 🔴 HIGH   | Elegir 1 carta por ronda, estilo real draft  |
| 78  | Draft Deck Validator | 🔶 MEDIUM | Validar mazo de 40 construido solo con picks |
| 79  | Draft History        | 🔶 MEDIUM | Ver mazos de draft anteriores                |

_Prereqs: Pull rates estables (Fase 8 Pack Opener ✅). Estimado: 1 semana._

## ✅ FASE 15: CYBERSPACE AESTHETICS (100% COMPLETE) 🆕

> **Inspirado en "The Tech and Art of Cyberspaces in Cyberpunk 2077" (CDPR / SIGGRAPH 2021)** > Técnicas integradas: Datamoshing, Pixel Sorting, Point Clouds.

| #   | Feature                            | Status  | Descripción                                      |
| :-- | :--------------------------------- | :------ | :----------------------------------------------- |
| 80  | Glitch Hover en Build Grid         | ✅ DONE | CSS chromatic aberration + clip-path animation   |
| 81  | CyberspaceParticles v2             | ✅ DONE | Lluvia vertical cian + fondo global toda la app  |
| 82  | Point Cloud Loading Screen         | ✅ DONE | `CyberspaceLoader.jsx` — logo AD + point cloud   |
| 83  | Tab Transition Braindance Dissolve | ✅ DONE | `AnimatePresence` mode=sync en todos los tabs    |
| 86  | CRT Scanlines Global               | ✅ DONE | `body::after` en index.css — overlay toda la app |
| 84  | Card Preview Point Cloud Reveal    | ✅ DONE | Carta se materializa al abrir preview            |
| 85  | Simulator Cyberspace Mode          | ✅ DONE | Tema visual alternativo para el playmat          |

## 🔴 FASE 16: REFACTOR ARQUITECTURA (0% COMPLETE) 🆕 — URGENTE

> **Feedback técnico recibido:** `App.jsx` tiene +1,500 líneas (Fat Component).

| #   | Feature                         | Priority   | Description                                                                      |
| :-- | :------------------------------ | :--------- | :------------------------------------------------------------------------------- |
| 88  | Custom Hook `useDeckBuilder.js` | 🔴 CRÍTICO | Extraer handleAddToDeck, handleRemoveCard, ramBudget. App.jsx → 50% menos líneas |
| 89  | Custom Hook `useFilters.js`     | 🔴 CRÍTICO | Extraer filteredCards, filters state, resetFilters                               |
| 90  | DeckContext / CollectionContext | 🔶 MEDIUM  | Eliminar prop drilling (deck, user, collection) de 4+ niveles                    |
| 91  | AuthContext ya existe           | ✅ PARTIAL | Ya tenemos AuthContext, expandir arquitectura global                             |

_Orden recomendado (Valve — fail fast): 1. useDeckBuilder.js 2. useFilters.js 3. DeckContext (post v1.1.0)._

## ⏳ FASE 17: PLAYER PROFILES & IDENTITY (0% COMPLETE) 🆕

> **Feedback:** Click en foto de usuario → Profile hub. Registro por email (no solo Gmail).  
> **Inspirado en:** Comunidades de TCGs competitivos + identidad "Street Cred" de CP2077.

| #   | Feature                     | Priority   | Description                                                    |
| :-- | :-------------------------- | :--------- | :------------------------------------------------------------- |
| 92  | Email/Password Registration | 🔴 CRÍTICO | Supabase Auth email provider — no solo OAuth/Google            |
| 93  | User Profile Page           | 🔴 ALTO    | Click en avatar → /profile — nombre, foto, bio, Discord handle |
| 94  | Street Cred Score           | 🔶 MEDIUM  | Reputación basada en upvotes recibidos en mazos publicados     |
| 95  | Discord Handle en perfil    | 🔶 MEDIUM  | Campo en profile para contacto directo                         |
| 96  | Avatar Upload               | 🔶 MEDIUM  | Upload foto a Supabase Storage                                 |
| 97  | Profile Stats               | 🔷 LOW     | Mazos publicados, total upvotes, cartas en colección           |

## 🔮 FASE 18: META ANALYTICS — "ESTADÍSTICAS DE LA RED" (0% COMPLETE) 🆕

> **Visión:** Automatizar contenido de metajuego. Nosotros usamos datos puros de la base de datos para crear una ventaja competitiva técnica clave en la comunidad.

| #   | Feature                 | Priority  | Description                                              |
| :-- | :---------------------- | :-------- | :------------------------------------------------------- |
| 98  | Top 5 Cartas Más Usadas | 🔴 ALTO   | Query sobre saved_decks JSONB — ranking semanal          |
| 99  | Tier List Automática    | 🔴 ALTO   | Basada en winrate (Simulador) + upvotes del Black Market |
| 100 | Arquetipo Trend Chart   | 🔶 MEDIUM | % de mazos por archetype esta semana vs semana anterior  |
| 101 | "Red Stats" Tab         | 🔶 MEDIUM | Nueva pestaña en app con gráficas automáticas            |
| 102 | Most Copied Decks       | 🔷 LOW    | Ranking de mazos más clonados al terminal                |

## 🔮 FASE 19: SCANNER & SMART IMPORT (FUTURE)

| #   | Feature                   | Priority  | Description                                   |
| :-- | :------------------------ | :-------- | :-------------------------------------------- |
| 103 | Card Scanner (Camera OCR) | 🔶 MEDIUM | Web Camera API + Google Vision o Tesseract.js |
| 104 | Batch Import via Scanner  | 🔶 MEDIUM | Scan múltiples cartas → auto-add a Collection |

---

## 📊 PROGRESS SUMMARY

| Fase | Descripción              | Completado | Progreso   |
| :--- | :----------------------- | :--------- | :--------- |
| 1    | Deck Building Core       | 8/8        | 100% ✅    |
| 2    | Simulators               | 2/2        | 100% ✅    |
| 3    | Supabase Migration       | 8/8        | 100% ✅    |
| 4    | Onboarding & Educational | 7/7        | 100% ✅    |
| 5    | Export & Analytics       | 6/7        | 86% ⏳     |
| 6    | The Vault                | 4/4        | 100% ✅ 🆕 |
| 7    | Cloud Sharing            | 6/7        | 86% ⏳     |
| 8    | UI/UX Enhancements       | 10/12      | 85% ⏳ 🆕  |
| 9    | Game Simulator           | 5/9        | 56% ⏳     |
| 10   | Black Market Hub         | 8/8        | 100% ✅ 🆕 |
| 11   | Enhanced Filters         | 4/5        | 80% ⏳ 🆕  |
| 12   | Wishlist                 | 5/5        | 100% ✅ 🆕 |
| 13   | Scraper Enhancements     | 1/3        | 33% ⏳     |
| 14   | Pack Draft Simulator     | 0/4        | 0% 🔮      |
| 15   | Cyberspace Aesthetics    | 7/7        | 100% ✅ 🆕 |
| 16   | Refactor Arquitectura    | 0/4        | 0% 🔴 🆕   |
| 17   | Player Profiles          | 0/6        | 0% 🔴 🆕   |
| 18   | Meta Analytics           | 0/5        | 0% 🔮 🆕   |
| 19   | Scanner & Smart Import   | 0/2        | 0% 🔮      |

**TOTAL: ~91/113 features completadas (~80% del proyecto)**

---

## 🎯 PRIORIDADES — PRÓXIMAS SESIONES

### 🔴 URGENTE (Antes de v1.1.0)

- **Fase 16 — Refactor:** `useDeckBuilder.js` hook — Extraer lógica pesada, `App.jsx` es un fat component crítico.
- **Fase 17 — Email Auth:** Registro por email/password mediante Supabase (no depender solo de Google OAuth).
- **Fase 17 — User Profile:** Click en avatar → página de perfil público editable.

### 🔶 IMPORTANTE (v1.1.0 → v1.2.0)

- **Fase 18 — Meta Analytics:** "Top 5 cartas más usadas" — ventaja competitiva de la comunidad con datos duros.
- **Fase 14 — Draft Simulator:** Como ya tenemos el Pack Opener funcional, extenderlo al formato Draft es el paso lógico y natural.
- **Fase 17 — Street Cred:** Sistema de reputación en el Black Market vinculado a los perfiles de usuario.

### 🔷 FUTURO (Post v1.2.0)

- **Fase 9:** Oponente AI en el Simulator.
- **Fase 19:** Card Scanner (Lector óptico OCR).
- **Fase 18:** Tier List totalmente automatizada.

---

## 📝 CHANGELOG

**2026-04-14 (ENHANCED FILTERS + PWA FIX + CYBERSPACE v2):** 🆕

- ✅ **Fase 11 completa:** Artist multi-select, Card Number filter añadidos al Filter Panel.
- ✅ **Pack Opener:** Pull rates oficiales Beta Kit (Epic/Secret Rare + distribución simulada).
- ✅ **CyberspaceParticles v2:** Lluvia vertical cian + fondo global añadido a toda la app.
- ✅ **PWA fix definitivo:** sw.js manual, network-first strategy, desvinculación de vite-plugin-pwa problemática.
- ✅ **Vercel.json deploy:** Archivo configurado sin rewrites — soluciona errores MIME type en assets JS/CSS.
- ✅ **AnimatePresence:** mode=wait implementado + Modales de "Share Deck" con [COPY LINK] y [SHARE AS IMAGE] estables y sin parpadeos.

**2026-04-13 (CYBERSPACE AESTHETICS + FIXES):**

- ✅ **Fase 15 Cyberspace Aesthetics:** Glitch effects, Partículas 3D, Loading Screens, CRT scanlines, PointCloud Reveal, CyberspaceMode.
- 🔧 **FIX:** Ajuste de AnimatePresence en los tabs, LandingPage precon redirect fix resuelto.

**2026-04-12 (PWA + DECK IMAGE EXPORT):**

- ✅ PWA installable native logic Android/iOS.
- ✅ `DeckImageExport.jsx` construido con auto-scale 5:7 aspect ratio y renderizado de QR.

**2026-04-10 (BLACK MARKET + WISHLIST RELEASE):**

- ✅ **Fase 10 completa:** Black Market feed, upvotes, clonado de mazos a terminal personal, sistema de comentarios e intel.
- ✅ **Fase 12 completa:** Wishlist system integral (BD + UI sync).
