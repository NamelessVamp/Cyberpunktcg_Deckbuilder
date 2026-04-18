a# 📋 ROADMAP — AFTERLIFE DECKS
**Last Updated:** 2026-04-17 | **Version:** v1.1.0

---

## ✅ FASE 1-6: CORE COMPLETE (100%)
Deck building, simulators, Supabase backend, onboarding, analytics, vault — all done.

## ✅ FASE 7: CLOUD SHARING (100%)
Base64 fallback, UUID links `/deck/:uuid`, Black Market, comments, ratings — all done.

## ✅ FASE 8: UI/UX ENHANCEMENTS (97%) 🆕
| # | Feature | Status |
|:--|:--------|:-------|
| 43-44, 46-47, 51-56 | Animations, skeletons, toasts, PWA, mobile, export | ✅ |
| 50 | Gacha Polish (sequential reveal + rarity glow) | ✅ |
| UI Roast Pass | Favicon, email truncation, tab cleanup, empty states | ✅ 🆕 |
| UI Roast Pass | Action cards redesign, ASCII symbols, no emojis | ✅ 🆕 |
| UI Roast Pass | LEGAL → footer, PRECON tab removed, scroll hint mobile | ✅ 🆕 |
| UI Roast Pass | Black Market badge, game context in hero | ✅ 🆕 |
| UI Roast Pass | Smart empty state for new users | ✅ 🆕 |
| 45 | Drag & Drop Deck Building | ❌ TODO — `@dnd-kit/core` |

## ⏳ FASE 9: THE ARENA (56%)
Engine, UI, combat, feature flag, Playmat V2 ✅ | Drag to Zone ⏳ | Hover preview, AI, P2P ❌

## ✅ FASE 10-12: COMMUNITY & VAULT (100%)
Black Market, Enhanced Filters, Wishlist — all done.

## ⏳ FASE 11: ENHANCED FILTERS (87%) 🆕
Card number, artist, search, auto-detect factions, **multi-faction arrays** ✅ 🆕

## ⏳ FASE 13: SCRAPER (33%)
Number & artist ✅ | Subtitle + multiple factions ❌

## ✅ FASE 14: DRAFT SIMULATOR (100%) 🆕
| # | Feature | Status |
|:--|:--------|:-------|
| 76-78 | Draft UI, pick interface, load to deck builder | ✅ |
| 79 | Draft History — Supabase + recent drafts panel | ✅ 🆕 |

## ✅ FASE 15-17: AESTHETICS, REFACTOR, PROFILES (100%)
Cyberspace aesthetics, 4 custom hooks, email auth, profile hub, avatar, Street Cred — all done.

## ✅ FASE 17.5: SECURITY & MODERATION (100%)
RLS WITH CHECK, payload constraints, content moderation service, avatar validation — all done.

## 🔮 FASE 18: META ANALYTICS (0%)
> Wait for Black Market volume before building.

## 🔮 FASE 19: SCANNER & SMART IMPORT (0%)
Camera OCR + batch import to collection.

---

## 📊 PROGRESS SUMMARY

| Phase | Description | Progress |
|:------|:------------|:---------|
| 1-7 | Core → Cloud Sharing | ✅ 100% |
| 8 | UI/UX | ✅ 97% 🆕 |
| 9 | Game Simulator | ⏳ 56% |
| 10-12 | Community, Filters, Wishlist | ✅ 100% |
| 13 | Scraper | ⏳ 33% |
| 14 | Draft Simulator | ✅ 100% 🆕 |
| 15-17.5 | Aesthetics → Security | ✅ 100% |
| 18-19 | Meta Analytics, Scanner | 🔮 0% |

**TOTAL: ~112/121 features (~93% complete) — v1.1.0 🚀**

---

## 🎯 NEXT PRIORITIES

### 🔶 v1.2.0
1. **Fase 9 #53** — Drag to Zone in Simulator (ref: DragnCards, dnd-kit)
2. **Fase 18** — Meta Analytics (needs Black Market volume first)
3. **Fase 8 #45** — Drag & Drop deck building (ref: dnd-kit examples)

### 🔷 v2.0.0
4. Fase 9 #55 — AI Opponent
5. Fase 19 — Card Scanner OCR (ref: tesseract.js, mtgscan)
6. Fase 7 #40 — Full multi-language

---

## 📝 CHANGELOG

**2026-04-17 — v1.1.0 🚀**
- ✅ UI/UX Roast Pass: favicon, email, tabs, emojis, empty states, action cards
- ✅ Fase 14 #79: Draft History — auto-save + recent drafts panel
- ✅ Fase 11: Multiple factions support (arrays)
- ✅ Tabs: LEGAL removed, PRECON removed, PRACTICE→SIMULATOR, PACKS→PACKS & DRAFT
- ✅ Home: game context line, smart empty state for new users, ASCII action cards

**2026-04-17 — v1.0.0**
- ✅ T1 Playability hypergeometric stat
- ✅ Clean UUID share links `/deck/:uuid`
- ✅ Content moderation service
- ✅ v1.0.0 tag

**2026-04-15 — Fases 14-17 complete**
- ✅ Fase 16: 4 custom hooks, App.jsx -32%
- ✅ Fase 17: email auth, profile hub, avatar upload, Street Cred
- ✅ Fase 14 (75%): Draft Simulator
- ✅ Gacha Polish: sequential reveal, rarity glow

**2026-04-14 — Enhanced Filters + PWA + Cyberspace v2**

**2026-04-13 — Cyberspace Aesthetics (Fase 15)**

**2026-04-12 — PWA + Deck Image Export**

**2026-04-10 — Black Market + Wishlist (Fases 10 + 12)**