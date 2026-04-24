# AFTERLIFE DECKS — Claude Context File

# NON OMNIS MORIAR — Este archivo lo lee Claude Code automaticamente

---

## PROYECTO

Deck Builder web para Cyberpunk 2077 TCG (WeirdCo, Alpha Kit 2026).
Referencia visual: choom.gg y duelfrontier.com. Objetivo: superarlos.

## STACK

React 19.2.4 + Vite + Supabase + Tailwind + Framer Motion + @dnd-kit

## INFRA

- Repo: https://github.com/NamelessVamp/Cyberpunktcg_Deckbuilder
- Deploy: https://afterlife-decks.vercel.app
- Supabase Project ID: laxyrcvcovmwpywwfntz
- Vercel Project: prj_ZF0RltwH1inPGq3UYGiEICg9Ynrb
- Vercel Team: team_4LDlxzUKbdArrvYtsxZhF2I4

## USUARIO

- Nombre: Vamp (Inti)
- Rol: Ingeniero JR + master en IA — Emerson FTEC
- Comunicacion: casual en espanol, directo
- Caveman mode activo — respuestas cortas, sin filler
- Text emojis/kaomojis: :) :D ^\_^ T_T (¬-¬) NO emojis Unicode

## METODOLOGIA

Valve — fail fast, un modulo funcional antes del siguiente.
Clean Code / SOLID. No spaghetti. Leer archivos reales antes de modificar.

---

## REGLAS DEL JUEGO (CRITICO — leer antes de tocar GameState)

### C.O.R.E. Protocol (orden de turno)

1. [C] Check Victory — 6+ dados en Gigs = win (al inicio de CORE)
2. [O] Obtain Card — robar 1 carta (turno 1 SKIP — mano ya dealt)
3. [R] Roll a Gig — jugador elige dado del Fixer (d20 DEBE ser ultimo)
4. [E] Energize — enderezar todo (legends, field, eddies), limpiar summonedThisTurn

### Economia

- Eddies = cartas vendidas boca abajo + Legends giradas
- 1 venta por turno (hasSoldThisTurn)
- Pagar unidad costo 2: girar 2 Eddies/Legends
- RAM = SOLO regla de deckbuilding, NO existe en gameplay

### Win Conditions

- Normal: iniciar CORE con 6+ dados en Gigs
- Deck Out: mazo vacio al intentar robar (fase END)
- Overtime: ambos sin fixerDice → necesitan 7 gigs o mayoria streetCred

### Estado jugador

```js
{
  legends, deck, hand, field, eddies, gigs,
  fixerDice: [4, 6, 8, 10, 12, 20],
  trash, streetCred,
  hasSoldThisTurn: false,
  hasRolledThisTurn: false,
  handLocked: false,
}
```

---

## BUGS CONOCIDOS — NUNCA REPETIR

- `setGame({...game})` destruye metodos de clase — SIEMPRE `gameRef.current`
- `refresh()` hace deep spread de `players.gigs` para forzar re-render
- CyberCard: `if (!card) return null` DESPUES de todos los hooks
- Encoding: SIEMPRE UTF-8, NUNCA `ÔÇö` ni `Ôé¼` ni similares
- Turno 1: NO draw en `_executeCore` (hand ya fue dealt en `initializePlayer`)
- `hasRolledThisTurn` bloquea NEXT PHASE en CORE hasta que se ruede

---

## ARCHIVOS CLAVE

### Motor (Vanilla JS — separado de UI)

```
src/lib/game/GameState.js        Motor principal, C.O.R.E. protocol
src/lib/game/AIPlayer.js         AI v2 (CORE+PLAY+ATTACK+respondToAttack)
src/lib/CardLogic.js             play/sell/callLegend/spendEddies/goSolo
src/lib/CombatResolver.js        combat, stealGigs, _destroyUnit recursivo
```

### UI React

```
src/components/SimulatorBeta.jsx     UI simulador, Online Play menu, Toast
src/components/PlaymatV2.jsx         Mirror board, dnd-kit, Framer Motion
src/components/simulator/CyberCard.jsx  Card V3 (1:1.4 ratio, sin HP)
src/components/DeckArea.jsx          Deck builder panel, RAM display
src/components/Toast.jsx             Toast system (showToast prop)
src/hooks/useDeckBuilder.js          Logica deck builder, RAM validation
src/hooks/useSavedDecks.js           handleLoadDeck preserva deck._name
src/hooks/useToast.js               (si existe — alternativa al Toast.jsx de App)
src/data/cards.json                  48 cartas Alpha Kit
```

### Config

```
src/contexts/AuthContext.jsx
src/lib/supabase.js
src/lib/legalityService.js
src/lib/deckService.js
tailwind.config.js               term-amber, term-green, term-red, term-black
```

---

## ESTADO ACTUAL (v1.3.0-dev — Abril 2026)

### COMPLETADO (Fase 9)

- Mirror board PlaymatV2 (PlayerBoard reutilizable, rival rotado 180)
- Zona central compartida de GIGS con dados animados
- Online Play menu (VS AI / Hotseat) con AnimatePresence
- Win screen dramatico + REMATCH + MAIN MENU
- Go Solo UI button en legends face-up
- Combat flash animation cuando muere unidad
- Framer Motion game feel completo
- CyberCard V3 (1:1.4, sin HP falso, gradiente protector)
- AI v2 con respondToAttack() y summonedThisTurn
- Toast system — 10 alert() reemplazados
- Dynamic deck name via deck.\_name
- RAM display correcto (max por color + illegal count)
- DeckAnalytics barras animadas + warnings
- CLAUDE.md para Claude Code

### PENDIENTE (proximos sprints)

**SECTOR 2 — Motor (ya implementados, verificar)**

- handLocked en UI (flag existe, verificar que PlaymatV2 lo usa)

**SECTOR 4 — UX critico**

- Sistema de pagos inteligente (pre-cargar Eddies antes del drop)
- Responsive playmat (eliminar horizontal scroll — TODO-A)
- Hotseat mode P2 visible
- actionMode (IDLE/TARGETING/PAYING) para Gear/Program

**Efectos de carta pendientes**

- Viktor Vektor: FLIP, busca top 5 por GEAR
- Alt Cunningham: GO SOLO effect
- Kiroshi Optics: ATTACK buff
- Gorilla Arms: ATTACK bonus
- Placide: PLAY/ATTACK effect

**Futuro v2.0.0**

- P2P Multiplayer (Supabase Realtime)
- Fase 19 Scanner OCR (react-webcam + PHash/blockhash-js)
- Mobile-First completo

---

## ADMIN

- Discord: bloodnghosts
- user_id: 18a99179-77e0-4129-9db4-d9ff030085f8
- Feature flag: phase9_simulator (admin-only)
- RLS pattern: `auth.uid() = user_id` en todas las tablas

---

## PRIORIDADES INMEDIATAS (v1.3.0)

1. Sistema de pagos inteligente — PlaymatV2
2. Responsive playmat (TODO-A)
3. Hotseat P2 visible
4. actionMode para Gear/Program
