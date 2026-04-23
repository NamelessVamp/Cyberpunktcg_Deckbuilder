# AFTERLIFE DECKS — Claude Code Context
# NON OMNIS MORIAR

## IDENTIDAD DEL PROYECTO
Deck Builder web para Cyberpunk 2077 TCG (WeirdCo, Alpha Kit 2026).
**Stack:** React 19 + Vite + Supabase + Tailwind + Framer Motion + @dnd-kit
**Repo:** https://github.com/NamelessVamp/Cyberpunktcg_Deckbuilder
**Deploy:** https://afterlife-decks.vercel.app
**Supabase Project ID:** laxyrcvcovmwpywwfntz
**Vercel Project ID:** prj_ZF0RltwH1inPGq3UYGiEICg9Ynrb
**Vercel Team:** team_4LDlxzUKbdArrvYtsxZhF2I4

## USUARIO
Vamp (Inti). Ingeniero JR + máster en IA. Emerson FTEC.
Comunica casual en español. Quiere respuestas directas y código copy-paste ready.
**Caveman mode siempre activo** — corto, directo, sin filler.

## METODOLOGÍA
Valve — fail fast, un módulo funcional antes del siguiente.
Clean Code / SOLID. No spaghetti.

## ARQUITECTURA CLAVE

### Motor del Juego (Vanilla JS — separado de UI)
- `src/lib/game/GameState.js` — motor principal, C.O.R.E. protocol
- `src/lib/game/AIPlayer.js` — AI básica (CORE+PLAY+ATTACK)
- `src/lib/CardLogic.js` — play/sell/callLegend/spendEddies/goSolo
- `src/lib/CombatResolver.js` — combat, stealGigs, _destroyUnit

### UI React
- `src/components/SimulatorBeta.jsx` — UI principal del simulador, Online Play menu
- `src/components/PlaymatV2.jsx` — tapete con dnd-kit, mirror board architecture
- `src/components/simulator/CyberCard.jsx` — card component con Framer Motion
- `src/components/DeckArea.jsx` — deck builder panel
- `src/hooks/useDeckBuilder.js` — lógica del deck builder
- `src/hooks/useSavedDecks.js` — load/save decks
- `src/data/cards.json` — 48 cartas reales Alpha Kit

## REGLAS DEL JUEGO (CRÍTICO)

### Turno C.O.R.E.
1. [C] Check Victory — 6+ dados en Gigs = win
2. [O] Obtain Card — robar 1 carta (turno 1 skip — ya tiene mano)
3. [R] Roll a Gig — jugador elige dado del Fixer, d20 DEBE ser el último
4. [E] Energize — enderezar todo (legends, field, eddies)

### Economía
- Eddies = cartas vendidas (boca abajo en Eddies Area) + Legends giradas
- Vender: 1 carta con tag €$ → boca abajo en Eddies → 1 Eddie disponible
- Pagar: girar Eddies + Legends hasta cubrir el costo
- Limit: 1 venta por turno (hasSoldThisTurn)
- RAM = solo regla de deckbuilding, NO gameplay

### Win Conditions
- Normal: iniciar turno con 6+ dados en Gigs
- Deck Out: mazo vacío al intentar robar
- Overtime: ambos sin fixerDice → turno extra → 7 gigs o mayoría de streetCred

### Estado del jugador
```js
{
  legends, deck, hand, field, eddies, gigs,
  fixerDice: [4,6,8,10,12,20],
  trash, streetCred,
  hasSoldThisTurn: false,
  hasRolledThisTurn: false,
  handLocked: false,
}
```

## NOTAS CRÍTICAS (evitar bugs conocidos)
- `setGame({ ...game })` destruye métodos de clase — SIEMPRE usar `gameRef.current`
- `refresh()` hace deep spread de `players.gigs` para forzar re-render
- `hasRolledThisTurn` bloquea NEXT PHASE en CORE hasta roll
- RAM es solo deckbuilding — NO validar durante gameplay
- `_destroyUnit()` en CombatResolver maneja gear cleanup recursivo
- CyberCard: guard `if (!card) return null` DESPUÉS de todos los hooks
- P1 penalty: legends[0] y legends[1] empiezan tapped en turno 1
- Turno 1: NO draw carta en _executeCore (hand ya fue dealt)

## ESTADO ACTUAL (v1.2.0 — Abril 2026)

### COMPLETADO ✅
- Fases 1-17: Deck Builder, Auth, Cloud Sharing, Analytics, Draft, Security
- Simulador: mirror board, CORE protocol, dnd-kit drag & drop
- AI opponent con delays, Go Solo UI, combat flash
- Online Play menu (VS AI / Hotseat)
- Win screen dramático con REMATCH
- Framer Motion game feel completo
- RAM display correcto en DeckArea
- Dynamic deck name

### PENDIENTE SECTOR 2 (GameState bugs)
- [ ] handLocked conectado a UI (ya existe el flag, falta usarlo en drag)

### PENDIENTE SECTOR 4 (UX)
- [ ] Toast system — reemplazar alert() nativos (Toast.jsx ya existe)
- [ ] Sistema de pagos inteligente (pre-cargar Eddies antes del drop)
- [ ] Mobile-First improvements

### FUTURO v2.0.0
- [ ] Online Multiplayer (Supabase Realtime)
- [ ] Fase 19 Scanner OCR (react-webcam + PHash)

## REGLAS DE CÓDIGO
- Encoding: SIEMPRE UTF-8 limpio, NUNCA `ÔÇö` ni `Ôé¼`
- Commits en inglés, descriptivos
- Un fix por commit cuando sea posible
- Tailwind para estilos, no CSS custom a menos que sea necesario
- `term-amber` = amarillo principal, `term-green` = verde, `term-red` = rojo
