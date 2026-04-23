# 📋 ROADMAP — AFTERLIFE DECKS

**Last Updated:** 2026-04-23 | **Version:** v1.2.0-dev

---

## ✅ FASE 1-6: CORE COMPLETE (100%)

## ✅ FASE 7: CLOUD SHARING (100%)

## ✅ FASE 8: UI/UX ENHANCEMENTS (100%)

| 45 | Drag & Drop Deck Building | ✅ DONE — `@dnd-kit/core` |

## ⏳ FASE 9: THE ARENA (85%) — ACTIVE SPRINT

### 9.1 — Motor (GameState / CardLogic / CombatResolver)

| #    | Feature                                           | Status |
| :--- | :------------------------------------------------ | :----- |
| 9A   | Eddie payment fix — sold cards spendable          | ✅     |
| 9B   | Eddie counter badge                               | ✅     |
| 9C   | Game log terminal                                 | ✅     |
| 9D   | Mulligan phase — modal UI                         | ✅     |
| 9E   | Unit dimming (summoning sickness)                 | ✅     |
| 9F   | Hand AnimatePresence                              | ✅     |
| 9G   | Stat buff display (base + modifier)               | ✅     |
| 9H   | Cyberpsychosis fix                                | ✅     |
| 9I   | activeEffects system                              | ✅     |
| 9J   | Precon deck IDs fixed to match cards.json         | ✅     |
| 9K   | advancePhase prototype preserved (Object.assign)  | ✅     |
| 9L   | Deck-out only triggers on END phase               | ✅     |
| 9M   | endTurn calls energize() + Reboot Optics cleanup  | ✅     |

### 9.2 — UI / Playmat

| #       | Feature                                          | Status   |
| :------ | :----------------------------------------------- | :------- |
| —       | Rival zone visible + rotated 180°                | ✅       |
| —       | Hand card selection + PLAY/SELL/CANCEL buttons   | ✅       |
| —       | Field units clickable (declare attacker)         | ✅       |
| —       | Legend click → callLegend                        | ✅       |
| —       | Horizontal scroll (min-width 1250px)             | ✅       |
| TODO-A  | Responsive layout (eliminate horizontal scroll)  | ❌ TODO  |

### 9.3 — Pendientes críticos para que sea jugable

| #    | Feature                                                      | Status        |
| :--- | :----------------------------------------------------------- | :------------ |
| —    | actionMode (IDLE/TARGETING/PAYING) para Gear/Program         | ❌ TODO       |
| —    | Phase locks — solo PLAY en fase PLAY, solo ATTACK en COMBAT  | ✅ DONE       |
| —    | Mulligan modal aparece correctamente al iniciar              | ✅ DONE       |
| —    | Hotseat mode — turno P2 muestra su mano/field                | ✅ DONE       |
| —    | Blocker declaration UI                                       | ✅ DONE       |
| —    | Card hover preview en el simulator                           | ✅ DONE       |
| —    | Viktor Vektor FLIP effect (search top 5 for gear)            | ❌ TODO       |
| —    | Alt Cunningham GO SOLO effect                                | ❌ TODO       |
| —    | Kiroshi Optics ATTACK effect                                 | ❌ TODO       |
| —    | Gorilla Arms ATTACK effect                                   | ❌ TODO       |
| —    | Placide PLAY/ATTACK effect                                   | ❌ TODO       |
| 53   | Drag to Zone (dnd-kit)                                       | ✅ DONE       |
| 55   | AI Opponent (State Machine)                                  | ✅ DONE       |
| 56   | P2P Multiplayer (WebSockets)                                 | ❌ Phase 10   |

### 9.4 — UX improvements (post-jugabilidad)

| #   | Feature                                                    | Status   |
| :-- | :--------------------------------------------------------- | :------- |
| —   | Inspector flotante (card hover en field → preview grande)  | ❌ TODO  |
| —   | Cursor crosshair en targeting mode                         | ❌ TODO  |
| —   | Undo button (snapshot del GameState)                       | ❌ TODO  |
| —   | S/M/L card size toggle                                     | ❌ TODO  |

## ✅ FASE 10-12: COMMUNITY & VAULT (100%)

## ⏳ FASE 11: ENHANCED FILTERS (87%)

## ⏳ FASE 13: SCRAPER (33%)

Subtitle + multiple factions ❌

## ✅ FASE 14: DRAFT SIMULATOR (100%)

## ✅ FASE 15-17.5: AESTHETICS → SECURITY (100%)

## 🔮 FASE 18: META ANALYTICS (0%) — esperar volumen Black Market

(ya hay dos decks publicados)

## 🔮 FASE 19: SCANNER & SMART IMPORT (0%)

---

## 📊 PROGRESS SUMMARY

| Phase    | Description                   | Progress  |
| :------- | :---------------------------- | :-------- |
| 1-7      | Core → Cloud Sharing          | ✅ 100%   |
| 8        | UI/UX                         | ✅ 100%   |
| 9        | Game Simulator                | ⏳ 85%    |
| 10-12    | Community, Filters, Wishlist  | ✅ 100%   |
| 13       | Scraper                       | ⏳ 33%    |
| 14       | Draft Simulator               | ✅ 100%   |
| 15-17.5  | Aesthetics → Security         | ✅ 100%   |
| 18-19    | Meta Analytics, Scanner       | 🔮 0%     |

**TOTAL: ~125/140 features (~89%) — v1.2.0-dev**

---

🟢 [SECTOR 1: CROMO INSTALADO] (Lo que ya está completo)
Esto ya está operando en la rama principal. La interfaz ya no es un prototipo barato, es cromo de grado militar.

✅ [COMPLETADO] Arquitectura de Espejo (Mirror Board): \* Log: Ya implementamos el contenedor doble con rotación de 180° usando un solo componente modular.
✅ [COMPLETADO] Secuestro de Viewport (100dvh): \* Log: El simulador ya bloquea el scroll. La mano del jugador flota como un Overlay dinámico (z-50) anclado abajo.
✅ [COMPLETADO] Diseño Visual de Cartas (1:1.4 Ratio): \* Log: Limpiamos el texto de la carta. Ya no hay asfixia tipográfica, eliminamos los Puntos de Vida (HP) falsos, y aplicamos el degradado negro para proteger las estadísticas.
✅ [COMPLETADO] Centrifugado de Gigs (Zona Compartida): \* Log: Los dados ahora se lanzan a una zona central compartida, replicando la experiencia táctil de la mesa física.
✅ [COMPLETADO] Niebla de Guerra Visual (Fog of War): \* Log: El componente CyberCard ya soporta isFlipped, asegurando que la mano y el mazo del rival se vean como dorsos.

🟢 [SECTOR 2: VULNERABILIDADES DEL NÚCLEO] (Resueltas)
El cerebro de JavaScript (GameState.js y CombatResolver.js) ha sido parchado y la lógica está sellada.

✅ [COMPLETADO] Penalización de Setup (Jugador 1):
Explicación para IA: El bucle en startMatch() verifica quién tiene la prioridad y fuerza legends[0] y legends[1] a isTapped = true.

✅ [COMPLETADO] El Candado del D20:
Explicación para IA: rollGig(sides) ya tiene el candado absoluto que prohíbe tirar el D20 si quedan otros dados de fixer.

✅ [COMPLETADO] Sellar la Mano (Punto de No Retorno):
Explicación para IA: Declarar un ataque dispara la bandera (handLocked = true) bloqueando el flujo correctamente.

✅ [COMPLETADO] Recolector de Basura (Combat Gear Leak):
Explicación para IA: CombatResolver limpia en cascada el attachedGear enviándolo al Trash al destruir unidades.

✅ [COMPLETADO] Summoning Sickness (Mareo de Invocación):
Explicación para IA: Las unidades reciben summonedThisTurn: true al caer al campo, bloqueando ataques prematuros. La flag se limpia en la fase de Energize.

🟢 [SECTOR 3: IA CALIBRADA] (Resuelto)
La IA ya no dispara a ciegas ni entra en pánico.

✅ [COMPLETADO] IA - Apuntar el Arma (Ataque Ciego):
Explicación para IA: El algoritmo setTarget pasa la ID de la víctima y ataca a la unidad correcta o directo al jugador según la lógica.

✅ [COMPLETADO] IA - Pánico Prematuro (Call a Legend):
Explicación para IA: La IA ya no revela Leyendas en fase PLAY solo por tener Eddies de sobra. Ahora lo hace defensivamente.

🟡 [SECTOR 4: UX & REGLAS ABSOLUTAS] (Pendientes / En Progreso)
Para alcanzar el estado perfecto (Nivel Pixelborn), tenemos que arrancar el libre albedrío del jugador y guiarlo por rieles de código.

[PENDIENTE] Botones Rígidos de Fase (Semi-automático):
Explicación para IA: El jugador no debería poder arrastrar nada si no es su fase. Necesitamos crear un gran botón de neón que controle el flujo: "Tirar Dado" -> "Terminar Play Phase" -> "Pasar a Ataque". Si el motor no da luz verde, la UI está congelada.

[PENDIENTE] Sistema de Pagos Inteligente:
Explicación para IA: Actualmente el jugador arrastra una carta al campo y el motor "intenta" cobrarle. Hay que invertirlo. Que el jugador haga clic en sus Eddies para pre-cargarlos (mostrando un contador visual) y solo entonces la zona del Campo se ilumine para aceptar el drop.

✅ [COMPLETADO] Muro de RAM y Deck Builder:
Explicación para IA: El Muro de RAM ya refleja el estado matemático real mediante las barras dinámicas en DeckArea, mostrando cartas ilegales y limitando la validación del budget.

## 🎯 NEXT PRIORITIES

### 🔴 v1.2.0 — Simulator jugable

1. actionMode TARGETING para Gear/Program
2. Toast Notifications implementadas globalmente (Reemplazando `alert()`)

### 🔶 v1.3.0 — Simulator pulido

3. Inspector flotante
4. Undo button
5. Efectos de carta pendientes (Viktor, Alt, Kiroshi, Gorilla, Placide)

### 🔷 v2.0.0

6. Responsive playmat (Mobile-first fixes)
7. P2P Multiplayer
8. Fase 19 Scanner OCR

---

## 📝 CHANGELOG

**2026-04-23 — v1.2.0-dev (Sincronización de Roadmap)**

- ✅ Sincronización del Roadmap con el código en Producción.
- ✅ GameState bugs críticos parchados (Double draw, typos, dead code).
- ✅ IA ataque ciego, Summoning Sickness, y Pánico Prematuro resueltos.
- ✅ Muro de RAM con display interactivo completado y Nombre Dinámico en Current Deck implementado.
- ✅ HandLocked flag, Mulligan Mode, Blocker UI, y Hotseat Mode confirmados como operativos.
- ✅ Sistema Toast integrado para suprimir `alert()`.

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
