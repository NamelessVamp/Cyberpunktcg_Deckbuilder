# 📋 ROADMAP — AFTERLIFE DECKS

**Last Updated:** 2026-04-24 | **Version:** v1.3.0-dev
**URL:** https://afterlife-decks.vercel.app
**Repo:** https://github.com/NamelessVamp/Cyberpunktcg_Deckbuilder
**Supabase:** laxyrcvcovmwpywwfntz
**Vercel Project:** prj_ZF0RltwH1inPGq3UYGiEICg9Ynrb
**Vercel Team:** team_4LDlxzUKbdArrvYtsxZhF2I4

---

## 📊 PROGRESS SUMMARY

| Phase   | Description                  | Progress |
| :------ | :--------------------------- | :------- |
| 1-7     | Core → Cloud Sharing         | ✅ 100%  |
| 8       | UI/UX                        | ✅ 97%   |
| 9       | Game Simulator               | ⏳ 75%   |
| 10-12   | Community, Filters, Wishlist | ✅ 100%  |
| 13      | Scraper                      | ⏳ 33%   |
| 14      | Draft Simulator              | ✅ 100%  |
| 15-17.5 | Aesthetics → Security        | ✅ 100%  |
| 18-19   | Meta Analytics, Scanner      | 🔮 0%    |

**TOTAL: ~125/140 features (~89%) — v1.3.0-dev**

---

## 🟢 [SECTOR 1: CROMO INSTALADO] (Core Completado)

Esto ya está operando en la rama principal. La interfaz ya no es un prototipo barato, es cromo de grado militar.

- ✅ **[COMPLETADO] Arquitectura de Espejo (Mirror Board):** Log: Ya implementamos el contenedor doble con rotación de 180° usando un solo componente modular.
- ✅ **[COMPLETADO] Secuestro de Viewport (100dvh):** Log: El simulador ya bloquea el scroll. La mano del jugador flota como un Overlay dinámico (z-50) anclado abajo.
- ✅ **[COMPLETADO] Diseño Visual de Cartas (1:1.4 Ratio):** Log: Limpiamos el texto de la carta. Ya no hay asfixia tipográfica, eliminamos los Puntos de Vida (HP) falsos, y aplicamos el degradado negro para proteger las estadísticas.
- ✅ **[COMPLETADO] Centrifugado de Gigs (Zona Compartida):** Log: Los dados ahora se lanzan a una zona central compartida, replicando la experiencia táctil de la mesa física.
- ✅ **[COMPLETADO] Niebla de Guerra Visual (Fog of War):** Log: El componente CyberCard ya soporta isFlipped, asegurando que la mano y el mazo del rival se vean como dorsos.

---

## 🟢 [SECTOR 2: VULNERABILIDADES DEL NÚCLEO] (Parchadas)

El cerebro de JavaScript (GameState.js y CombatResolver.js) ha sido parchado y la lógica está sellada.

- ✅ **[COMPLETADO] Penalización de Setup (Jugador 1):**
  > **Explicación para IA:** Hermano, el motor estaba creando las Leyendas en estado isTapped: false para ambos. Ya inyectamos un bucle en el startMatch() que verifica quién tiene la prioridad (Turno 1) y fuerza legends[0] y legends[1] a isTapped = true. La economía del Jugador 1 ya está balanceada.
- ✅ **[COMPLETADO] El Candado del D20:**
  > **Explicación para IA:** Nuestro método rollGig(sides) ya tiene un if-statement absoluto: si el parámetro es 20, y el length del array fixerDice es mayor a 1, hace un return false. Nadie tira el jefe final de los dados sin haber quemado los demás.
- ✅ **[COMPLETADO] Sellar la Mano (Punto de No Retorno):**
  > **Explicación para IA:** Cuando el jugador local declara un ataque, se dispara la bandera (handLocked = true) en el estado. La fase de ataque ya es un túnel de un solo sentido.
- ✅ **[COMPLETADO] Recolector de Basura (Combat Gear Leak):**
  > **Explicación para IA:** En el CombatResolver, cuando mandamos la carta de Unidad al Trash, ya iteramos sobre las propiedades anidadas (attachedGear) y las destruimos en cascada para evitar memory leaks de equipo huérfano.
- ✅ **[COMPLETADO] Summoning Sickness (Mareo de Invocación):**
  > **Explicación para IA:** Las unidades ya reciben la flag `summonedThisTurn: true` al hacer drop en el campo, y el método de Fase de Ataque bloquea cualquier unidad con esa etiqueta.

---

## 🟢 [SECTOR 3: IA CALIBRADA] (Bot v2 Operativo)

El Bot ya es inteligente en combate y respeta las reglas de invocación.

- ✅ **[COMPLETADO] IA - Apuntar el Arma (Ataque Ciego):**
  > **Explicación para IA:** El algoritmo calcula `shouldAttackDirect`, y usa un método intermedio (`setTarget`) para pasar la ID de la víctima a la unidad más débil o a la cara antes de ejecutar `resolveCombat()`.
- ✅ **[COMPLETADO] IA - Pánico Prematuro (Call a Legend):**
  > **Explicación para IA:** La IA ya no revela Leyendas en la Fase de "PLAY" solo porque tiene Eddies de sobra. Esa subrutina fue movida a su defensa para que solo pague cuando le apunten en Fase de Ataque.

---

## 🟡 [SECTOR 4: UX & REGLAS ABSOLUTAS] (ACTIVE SPRINT)

Para alcanzar el estado perfecto (Nivel Pixelborn), tenemos que arrancar el libre albedrío del jugador y guiarlo por rieles de código.

- ❌ **[PENDIENTE] Botones Rígidos de Fase (Semi-automático):**
  > **Explicación para IA:** El jugador no debería poder arrastrar nada si no es su fase. Necesitamos crear un gran botón de neón que controle el flujo: "Tirar Dado" -> "Terminar Play Phase" -> "Pasar a Ataque". Si el motor no da luz verde, la UI debe estar congelada.
- ❌ **[PENDIENTE] Sistema de Pagos Inteligente:**
  > **Explicación para IA:** Actualmente el jugador arrastra una carta al campo y el motor "intenta" cobrarle. Hay que invertirlo. Que el jugador haga clic en sus Eddies para pre-cargarlos (mostrando un contador visual) y solo entonces la zona del Campo se ilumine para aceptar el drop.
- ✅ **[COMPLETADO] Muro de RAM y Deck Builder:**
  > **Explicación para IA:** El Deck Builder ya tiene matemáticas en tiempo real. Un panel evalúa el budget según las Leyendas elegidas y muestra de forma reactiva barras de RAM, gritando en ROJO (`illegal cards`) si el jugador sobrepasa los límites de color.

---

## 🎯 NEXT PRIORITIES

### 🔴 v1.3.0 — Simulator jugable

1. Sistema de pagos inteligente (pre-cargar Eddies antes del drop)
2. actionMode `TARGETING` para Gear/Program
3. Hotseat mode (P2 ve su propia mano/field visible)
4. Responsive playmat (TODO-A — eliminar horizontal scroll)

### 🔶 v1.4.0 — Simulator pulido

5. Inspector flotante (card hover en field → preview grande)
6. Efectos de carta (Viktor, Alt, Kiroshi, Gorilla, Placide)
7. Undo button (snapshot del GameState)

### 🔷 v2.0.0

8. P2P Multiplayer (WebSockets)
9. Fase 19 Scanner OCR (react-webcam + PHash)
10. Mobile-First completo

---

## 📂 FASE 19: SCANNER OCR (0%)

**Stack:** `react-webcam` + PHash (`blockhash-js`)
**Referencia UX:** Card Nexus
**Arquitectura:**

- Frontend: `navigator.mediaDevices.getUserMedia`
- Motor: PHash — hash de imagenes limpias vs foto capturada
- Bucle continuo: 1 frame/seg automatico
- Toast feedback: "Detectado: Goro Takemura — Foil o Regular?"
- Destino toggle: `[A MI INVENTARIO]` | `[AL MAZO ACTUAL]`
  **Nota:** Mobile-First obligatorio para esta vista.

---

## ⚠️ NOTAS TECNICAS CRITICAS (PARA CLAUDE)

### Bugs conocidos evitados:

- `setGame({...game})` destruye metodos de clase — SIEMPRE usar `gameRef.current`.
- `refresh()` hace deep spread de `players.gigs` para forzar re-render.
- `hasRolledThisTurn` bloquea NEXT PHASE en CORE hasta que se tira el dado.
- **CyberCard:** El guard `if (!card) return null` va DESPUÉS de todos los hooks.
- **Encoding:** SIEMPRE UTF-8 limpio, NUNCA `ÔÇö` ni `Ôé¼`.
- **Turno 1:** NO draw carta en `_executeCore` (hand ya fue dealt en setup).

### Archivos clave:

- `src/lib/game/GameState.js` — motor principal CORE protocol
- `src/lib/game/AIPlayer.js` — AI v2
- `src/lib/CardLogic.js` — play/sell/callLegend/goSolo
- `src/lib/CombatResolver.js` — combat, stealGigs, \_destroyUnit
- `src/components/SimulatorBeta.jsx` — UI simulador, Online Play menu
- `src/components/PlaymatV2.jsx` — tapete mirror board
- `src/hooks/useSavedDecks.js` — handleLoadDeck preserva `deck._name`

---

## 📝 CHANGELOG

**2026-04-24 — v1.3.0-dev**

- ✅ Toast system — 10 alert() reemplazados en SimulatorBeta
- ✅ Dynamic deck name via `deck._name`
- ✅ RAM display correcto (max por color + illegal card count)
- ✅ DeckAnalytics barras animadas + warnings
- ✅ GameState: double draw fix, er.eddies typo, dead code after return
- ✅ AIPlayer: duplicate declarations, summonedThisTurn, attack target
- ✅ Mirror board PlaymatV2 (PlayerBoard component reutilizable)
- ✅ Win screen dramatico + REMATCH + MAIN MENU
- ✅ Go Solo UI button
- ✅ Combat flash animation

**2026-04-20 — v1.2.0**

- ✅ Rival zone visible + rotated 180
- ✅ Precon IDs fixed to match cards.json
- ✅ advancePhase prototype fix (Object.assign)
- ✅ Deck-out only on END phase
- ✅ Hand selection UI (PLAY/SELL/CANCEL)
- ✅ Field units clickable

**2026-04-17 — v1.1.0 / v1.0.0**

- ✅ UI/UX Roast Pass complete, Draft History, Multiple Factions
- ✅ T1 Playability, UUID share links, content moderation
