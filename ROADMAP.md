# 📋 ROADMAP — AFTERLIFE DECKS

**Last Updated:** 2026-04-20 | **Version:** v1.2.0-dev

---

## ✅ FASE 1-6: CORE COMPLETE (100%)

## ✅ FASE 7: CLOUD SHARING (100%)

## ✅ FASE 8: UI/UX ENHANCEMENTS (97%)

| 45 | Drag & Drop Deck Building | ❌ TODO — `@dnd-kit/core` |

## ⏳ FASE 9: THE ARENA (65%) — ACTIVE SPRINT

### 9.1 — Motor (GameState / CardLogic / CombatResolver)

| #    | Feature                                          | Status |
| :--- | :----------------------------------------------- | :----- |
| 9A   | Eddie payment fix — sold cards spendable         | ✅      |
| 9B   | Eddie counter badge                              | ✅      |
| 9C   | Game log terminal                                | ✅      |
| 9D   | Mulligan phase — modal UI                        | ✅      |
| 9E   | Unit dimming (summoning sickness)                | ✅      |
| 9F   | Hand AnimatePresence                             | ✅      |
| 9G   | Stat buff display (base + modifier)              | ✅      |
| 9H   | Cyberpsychosis fix                               | ✅      |
| 9I   | activeEffects system                             | ✅      |
| 9J   | Precon deck IDs fixed to match cards.json        | ✅      |
| 9K   | advancePhase prototype preserved (Object.assign) | ✅      |
| 9L   | Deck-out only triggers on END phase              | ✅      |
| 9M   | endTurn calls energize() + Reboot Optics cleanup | ✅      |

### 9.2 — UI / Playmat

| #      | Feature                                         | Status |
| :----- | :---------------------------------------------- | :----- |
| —      | Rival zone visible + rotated 180°               | ✅      |
| —      | Hand card selection + PLAY/SELL/CANCEL buttons  | ✅      |
| —      | Field units clickable (declare attacker)        | ✅      |
| —      | Legend click → callLegend                       | ✅      |
| —      | Horizontal scroll (min-width 1250px)            | ✅      |
| TODO-A | Responsive layout (eliminate horizontal scroll) | ❌ TODO |

### 9.3 — Pendientes críticos para que sea jugable

| #    | Feature                                                     | Status      |
| :--- | :---------------------------------------------------------- | :---------- |
| —    | actionMode (IDLE/TARGETING/PAYING) para Gear/Program        | ❌ TODO      |
| —    | Phase locks — solo PLAY en fase PLAY, solo ATTACK en COMBAT | ❌ TODO      |
| —    | Mulligan modal aparece correctamente al iniciar             | ❌ TODO      |
| —    | Hotseat mode — turno P2 muestra su mano/field               | ❌ TODO      |
| —    | Blocker declaration UI                                      | ❌ TODO      |
| —    | Card hover preview en el simulator                          | ❌ TODO      |
| —    | Viktor Vektor FLIP effect (search top 5 for gear)           | ❌ TODO      |
| —    | Alt Cunningham GO SOLO effect                               | ❌ TODO      |
| —    | Kiroshi Optics ATTACK effect                                | ❌ TODO      |
| —    | Gorilla Arms ATTACK effect                                  | ❌ TODO      |
| —    | Placide PLAY/ATTACK effect                                  | ❌ TODO      |
| 53   | Drag to Zone (dnd-kit)                                      | ❌ TODO      |
| 55   | AI Opponent (State Machine)                                 | ❌ Phase 9.5 |
| 56   | P2P Multiplayer (WebSockets)                                | ❌ Phase 10  |

### 9.4 — UX improvements (post-jugabilidad)

| #    | Feature                                                   | Status |
| :--- | :-------------------------------------------------------- | :----- |
| —    | Inspector flotante (card hover en field → preview grande) | ❌ TODO |
| —    | Cursor crosshair en targeting mode                        | ❌ TODO |
| —    | Undo button (snapshot del GameState)                      | ❌ TODO |
| —    | S/M/L card size toggle                                    | ❌ TODO |

## ✅ FASE 10-12: COMMUNITY & VAULT (100%)

## ⏳ FASE 11: ENHANCED FILTERS (87%)

## ⏳ FASE 13: SCRAPER (33%)

Subtitle + multiple factions ❌

## ✅ FASE 14: DRAFT SIMULATOR (100%)

## ✅ FASE 15-17.5: AESTHETICS → SECURITY (100%)

## 🔮 FASE 18: META ANALYTICS (0%) — esperar volumen Black Market

## 🔮 FASE 19: SCANNER & SMART IMPORT (0%)

---

## 📊 PROGRESS SUMMARY

| Phase   | Description                  | Progress |
| :------ | :--------------------------- | :------- |
| 1-7     | Core → Cloud Sharing         | ✅ 100%   |
| 8       | UI/UX                        | ✅ 97%    |
| 9       | Game Simulator               | ⏳ 65%    |
| 10-12   | Community, Filters, Wishlist | ✅ 100%   |
| 13      | Scraper                      | ⏳ 33%    |
| 14      | Draft Simulator              | ✅ 100%   |
| 15-17.5 | Aesthetics → Security        | ✅ 100%   |
| 18-19   | Meta Analytics, Scanner      | 🔮 0%     |

**TOTAL: ~118/140 features (~84%) — v1.2.0-dev**

---
lista pendiente:

🟢 INICIALIZACIÓN DE PARTIDA (FASE: SETUP)
Acción: Se llama a game.startMatch().

Motor: Los mazos se barajan. Se roban 6 cartas para el Jugador 1 (Local) y 6 para el Jugador 2 (Rival). Se reparten 6 dados al arreglo fixerDice de cada uno. Las 3 Leyendas bajan a la legends-box.

Visión UI: Ambos tableros muestran HAND: 6 y DECK: 34. Las Leyendas del rival se ven como dorsos (isFlipped = true).

🚨 BUG DETECTADO EN EL ICE: El motor asignó las 3 Leyendas del Jugador 1 en estado isTapped: false (Enderezadas). El manual oficial dicta que el jugador que va primero sufre una penalización económica. Tu código debe forzar legends[0].isTapped = true y legends[1].isTapped = true al inicio para el Jugador 1.

🟡 TURNO 1: JUGADOR LOCAL
Acción: Se llama a game.nextPhase() -> Transición a CORE.

C - Check: El motor lee playerGigs.length === 6. Es falso (0). El juego sigue.

O - Obtain: drawCard() saca la carta superior del mazo. Pasa a la mano.

R - Roll: La UI hace brillar la dice-box. El jugador hace clic en el D6.

Motor: rollGig(6) genera un número al azar. El D6 se elimina de fixerDice y empuja un objeto { type: 6, value: 4 } a playerGigs.

UI: Framer Motion dibuja el dado saltando hacia el centro compartido (Friendly Gigs). El "Street Cred" se actualiza a 4.

🚨 BUG DE REGLA: Tu UI desactiva los dados usados, pero si el jugador hace clic en el D20 en el turno 1, tu código actualmente lo permite. Debes añadir un candado: if (dieSides === 20 && fixerDice.length > 1) return false;

E - Energize: untapAll() busca cartas giradas. No hay nada que enderezar.

Acción: game.nextPhase() -> Transición a PLAY.

Vender Carta: El jugador arrastra una carta inútil al drop-eddies.

Motor: onSellCard(idx) remueve la carta de la mano, le quita sus propiedades públicas (seguridad anti-trampas) y la empuja a playerEddies.

UI: La carta se encoge y se apila en la zona inferior de Eddies.

Jugar Unidad: El jugador quiere bajar un Mercenario que cuesta 1 Eddie.

Motor: El jugador hace clic en la carta del área de Eddies (isTapped = true). Luego arrastra el Mercenario al drop-field.

UI: La carta entra a la dashed-units-area.

🚨 ALERTA DE SUMMONING SICKNESS: Cuando la carta entra al field en tu GameState, debes asegurarte de que nazca con la propiedad hasAttackedThisTurn: true o un equivalente. Si entra limpia, el jugador podría intentar atacar con ella de inmediato, rompiendo la regla de mareo de invocación.

Acción: game.nextPhase() -> Transición a ATTACK.

El jugador intenta atacar con el Mercenario recién bajado.

Motor: Valida si está girado. Como recién entró (y si parcheaste lo anterior), el click es rechazado. La flecha de ataque no sale.

Pasa el turno.

🔴 TURNO 2: EL CHOQUE (FASE DE ATAQUE)
Avancemos rápido. Es el Turno 2, ambos jugadores tienen 1 unidad en el campo y están listos. Jugador Local declara Fase de Ataque.

Paso 1: Punto de No Retorno

El jugador local arrastra su Unidad hacia el Rival.

Motor: onDeclareAttacker(unitIdx, 'enemy_player'). Se bloquea la mano local (UI isAttackPhase oscurece la mano).

Paso 2: Paso Defensivo (Rival)

El servidor avisa al Jugador 2. Su pantalla dice: "Enemigo atacando. ¿Bloquear?"

El Jugador 2 tiene un "BLOCKER" enderezado. Hace clic en él para interceptar.

Motor: onDeclareBlocker(blockerIdx) redirige el targetId del ataque, quitándolo del jugador y poniéndolo en el Blocker enemigo. El Blocker pasa a isTapped: true.

Paso 3: CombatResolver (Crash)

El atacante tiene Poder 5. El blocker tiene Poder 5.

Motor: resolveCombat() compara stats. 5 === 5. Es un empate crítico (Crash).

Lógica: El motor marca ambas cartas para destrucción y las mueve a trash.

🚨 VULNERABILIDAD DEL GEAR: Si el Atacante tenía una carta de equipo (GEAR) anidada (unit.attachedGear), tu motor actual solo está moviendo a la unidad principal a la basura. Debes asegurarte de que resolveCombat itere sobre cualquier GEAR adherido y lo mande al Trash también, o quedarán flotando como variables fantasma en el campo.

Paso 4: Resolución de UI

UI: La variable combatFlash se dispara a true. La pantalla hace un destello rojo en la zona de combate, y con AnimatePresence, ambas cartas se encogen y desaparecen del campo, materializándose instantáneamente en el bote de Basura de cada lado.

📋 REPORTE DEL AUDITOR (Tus Tareas Críticas)
La simulación revela que el "esqueleto" (C.O.R.E. y Drag & Drop) funciona hermoso. La sincronización de estados con React reacciona rápido y los Gigs al centro se ven inmersivos. Pero el motor permite trampas mecánicas porque confía demasiado en que el jugador respete las reglas de mesa.

Tienes que inyectar estos 4 parches en GameState.js antes del lanzamiento Alpha:

Parche de Setup: legends[0] y legends[1] del activePlayer inicial deben nacer giradas (isTapped = true).

Parche D20: Bloquear rollGig(20) si availableDice.length > 1.

Parche Summoning Sickness: Toda unidad que haga push al arreglo field debe recibir una bandera temporal summonedThisTurn = true. En la fase de Energize del siguiente turno, borras esa bandera. Esto impedirá ataques ilegales en el primer turno que se juegan.

Parche Limpieza de Memoria: En CombatResolver.js, haz un destructor recursivo. Si unit muere, manda al trash tanto a unit como a ...unit.gear.

He analizado el código fuente (conceptualmente), los videos de gameplay y cómo estructuraban la UX de Lorcana para sus cientos de miles de usuarios.

El secreto del "Nivel Pixelborn" no era que el juego tomara decisiones por ti (no es una IA jugando sola), sino que usaba un sistema de "Fases Rígidas Guiadas por Botón".

A diferencia de tu prototipo actual donde todo el peso recae en las acciones de "arrastrar y soltar" y el motor "adivina" qué estás haciendo, Pixelborn tenía un botón central enorme (El Paso de Turno o Next Phase).

Voy a correr una simulación mental de cómo se jugaría Afterlife Decks si aplicamos exactamente la filosofía UI/UX de Pixelborn a tus reglas de Cyberpunk TCG.

💻 SIMULACIÓN: AFTERLIFE DECKS (PIXELBORN EDITION)
El HUD (La Interfaz):
A la derecha del "Combat Zone" compartido, hay un botón con luces de neón brillante. Actualmente dice: "▶ START ROLL PHASE". Tu mano de cartas está parcialmente atenuada (grisácea).

1. Fase C.O.R.E: El Modo "Railroad" (Semiautomático)
En Pixelborn, las fases rutinarias se resuelven solas o con un solo clic.

[C] Check & [O] Obtain: Ni siquiera te das cuenta. Al inicio del turno, la pantalla hace un flash verde, roba la carta automáticamente y suena un efecto de sonido (Swoosh).

[R] Roll (Semi-automático): Las cartas en tu mano están oscurecidas. El juego no te deja jugar nada. El botón derecho palpita en amarillo pidiendo tirar los dados. Haces clic en un dado (D6). El motor lo tira, el dado vuela al centro y el botón cambia automáticamente a...

[E] Energize (Automático): Todas tus cartas y Eddies girados se enderezan solos con un efecto de giro visual de 0.2 segundos.

El botón central ahora dice: "▶ END PLAY PHASE". Tu mano de cartas se ilumina con colores completos.

2. La Play Phase (Validación de Restricciones)
Aquí es donde brilla el diseño Pixelborn.

Tomas un mercenario que cuesta 3 Eddies de tu mano.

A diferencia de un simulador tonto, al empezar el drag, tu área de Eddies y Leyendas se ilumina. El juego está esperando que pagues.

En lugar de arrastrar la carta al campo (donde rebotaría por falta de fondos), haces clic en 3 de tus Eddies/Leyendas. Se giran (Spent) y se crea un número flotante brillante: [3/3 €$ Paid].

Ahora arrastras la carta al Campo y aterriza exitosamente (entrando en modo Spent por Summoning Sickness).

Si quieres vender por un Eddie (una vez por turno), arrastras la carta a la zona de Eddies. Se voltea boca abajo. El motor deshabilita esa Dropzone para el resto del turno para que no puedas cometer un error.

3. Transition a Fase de Ataque (El "Hard Lock")
Ya no quieres construir más. Haces clic en el botón de la derecha: "▶ ENTER ATTACK PHASE".

UX/UI: Toda tu mano de cartas se desliza hacia abajo y desaparece de la pantalla o se vuelve 100% in-interactuable y gris oscuro. Ha comenzado el Point of No Return.

Tomas un mercenario de tu campo y lo arrastras hacia el rival. Aparece una flecha láser roja gruesa.

Al soltar el mouse sobre el rival, no ocurre el "Crash" de inmediato. Aparece un reloj en la pantalla del rival (y tú ves una barra de carga): "WAITING FOR OPPONENT... 15s".

4. Respuestas del Rival (El "Priority Pass")
En la pantalla del rival, el juego se ha pausado y la flecha roja le apunta. Sus botones de "▶ DECLARE BLOCKER" o "▶ CALL LEGEND" se iluminan.

El oponente decide no hacer nada y presiona "▶ TAKE HIT".

El servidor resuelve. Robas un dado de su lado de la mesa, vuela hacia tu caja de Gigs y tu "Street Cred" aumenta mágicamente de 4 a 14.

5. Fin de Turno
Haces clic en "▶ PASS TURN". El tablero gira ligeramente (o simplemente cambia el color del HUD de tu lado a "Turno del oponente").

🔧 ¿CÓMO HACEMOS TU JUEGO "SEMI-AUTOMÁTICO"?
Para lograr esta experiencia en tu código (React + Dnd-kit + Vanilla JS), necesitas implementar Bloqueos de Estado.

Fases Guiadas, no Asumidas: * No dejes que la fase cambie porque el jugador hizo una acción. Añade un botón literal de "Siguiente Fase" y que tu GameState.js valide: "¿Ya tiró los dados? Si no, el botón de 'Pasar a Play Phase' está desactivado".

Sistema de Pago Inteligente:

Un simulador físico te deja bajar la carta y luego te cobra. Un simulador Pixelborn-style exige el pago primero (o de forma simultánea). Cuando arrastras una unidad de Coste 2, tu motor debe escanear tus eddies. Si tienes < 2 enderezados, la zona del Campo (drop-field) debe retornar isLegal = false y rechazar el Drag & Drop nativamente.

Automatizar lo Aburrido:

Tu motor nunca debe pedirle al jugador que enderece sus cartas. La función Energize debe ejecutarse como un macro en cuanto se transiciona a la Play Phase.

Destrucción automática: Cuando el CombatResolver detecta un "Crash", no le preguntas al jugador. Las cartas se desintegran visualmente y se mueven al arreglo de Trash sin intervención humana.

Vamos a correr una simulación visual. Imagina que es el Turno 3, la mesa está llena de cromo y la presión aumenta.

Al mirar el tablero actual renderizado por tu CyberCard.jsx, el cromo se ve un poco opaco y hay ruido visual que podría confundir a los jugadores en medio de un tiroteo. Aquí tienes la auditoría de diseño de tu interfaz, analizando cómo el ojo humano y el motor chocan:

1. El Glitch del Camuflaje Óptico (Legibilidad y Contraste)
Al bajar una carta de Unidad (roja) al campo, el diseño falla en proteger la información crítica.

El Problema: La imagen de fondo (card.image_url) cubre el 100% de la carta usando backgroundSize: "cover". Aunque el encabezado superior tiene una barra oscura (bg-black/60) que ayuda a leer el costo y el tipo, el nombre de la carta (card-name) y las estadísticas inferiores (card-stats) están flotando desnudos directamente sobre el arte.

La Consecuencia: Si el arte de la carta es muy ruidoso o brillante, el texto de las estadísticas (coloreado en neón rojo, amarillo o cyan) se volverá invisible y quemará los ojos del jugador. Necesitas aplicar un degradado negro (linear-gradient) en la parte inferior del .card-front para que los números siempre resalten.

2. Estadísticas Fantasma (Contradicción de Reglas)
El diseño está mostrando datos que no existen en el universo de Cyberpunk TCG.

El Problema: Para el tipo "UNIT", el código está imprimiendo ATK: {card.power || 0} y HP: {card.hp || 0}.

La Consecuencia: En las reglas que establecimos (GDD v1.1), las unidades no tienen Puntos de Vida (HP); los combates se resuelven puramente comparando el Poder en un "Crash". Mostrar HP confunde visualmente al jugador, haciéndole creer que el daño es persistente. Hay que purgar esa línea.

3. Proporciones Cuadradas (El Síndrome del Ladrillo)
El Problema: La carta tiene dimensiones rígidas de 70px de ancho por 90px de alto.

La Consecuencia: Esa proporción (1:1.28) hace que las cartas se vean chatas y casi cuadradas. Una carta estándar de TCG tiene una proporción más elegante (1:1.4). Si la haces de 70px por 98px, se sentirá como una carta física real y dará más espacio vertical para el arte.

4. Asfixia Tipográfica
El Problema: El nombre de la carta (card-name) tiene font-size: 11px y está en negritas.

La Consecuencia: En un contenedor que mide solo 70px de ancho, un nombre largo (como "Gorot Takemura" o "Cyberpsycho") va a romperse en dos o tres líneas, apilándose directamente sobre el centro de la imagen y arruinando el encuadre. Se necesita CSS para truncar el texto con text-overflow: ellipsis o limitar estrictamente la altura (line-clamp).

El chasis de Framer Motion con los efectos de giro 3D y el hover lift es de primer nivel, choom. Solo necesitamos arreglar la pintura.

solución: Si tienes una mecánica de Hover potente (que ya tienes con ese Tooltip detallado que hicimos), no necesitas sobrecargar la carta física en la mesa. En la vida real, las cartas tienen texto porque es el único medio, pero en formato digital, la carta en el campo debe ser pura "señalización rápida" (Icono, Arte, Coste). El texto largo es un estorbo visual.

Aquí tienes el parche para tu CyberCard.jsx. He depurado el código para:

Eliminar el Bloque de Texto Inferior: Adiós al card-text y a las palabras clave apiladas.

Corregir la Proporción (1:1.4): Ahora las cartas no se ven como cuadrados aplastados.

Proteger el Título y Coste: Añadí truncamiento de texto (truncate) para nombres largos, garantizando que el cromo brille y se lea perfecto de un solo vistazo.

Purgar HP Inexistentes: Eliminé las estadísticas que contradicen tu GDD v1.1.

Sobreescribe tu archivo src/components/simulator/CyberCard.jsx con este código limpio:

JavaScript
// EX MACHINA — CyberCard.jsx V3 — Clean Visuals & TCG Proportions
import { motion } from "framer-motion";
import DefaultBack from "/BackCardTCGCybeprunk.png"; // Asegúrate de que esta ruta apunte a tu imagen de dorso

export default function CyberCard({ card, isFlipped = false, isNew = false }) {
  if (!card && !isFlipped) return null;

  const showBack = isFlipped;

  return (
    <motion.div
      initial={isNew ? { scale: 0, rotateY: 180, opacity: 0 } : false}
      animate={{ scale: 1, rotateY: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      // Proporción estándar TCG (1:1.4 aprox). Altura responsiva.
      className={`card-wrapper relative w-[60px] h-[85px] md:w-[70px] md:h-[98px] rounded-md shadow-md border-2 
        ${showBack ? "border-term-gray/30" : "border-term-amber"} 
        overflow-hidden select-none bg-term-black`}
      style={{
        boxShadow: showBack ? "0 4px 6px rgba(0,0,0,0.5)" : "0 0 8px rgba(247,224,24,0.3)",
      }}
    >
      {showBack ? (
        <div
          className="card-back w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${DefaultBack})` }}
        />
      ) : (
        <div className="card-front w-full h-full relative flex flex-col text-left justify-between bg-term-black">
          {/* ARTE DE LA CARTA (Cubre todo el fondo) */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center opacity-90"
            style={{
              backgroundImage: card.image_url ? `url(${card.image_url})` : "none",
              backgroundColor: card.image_url ? "transparent" : "#2a2a2a",
            }}
          />

          {/* DEGRADADO PROTECTOR (Para que los textos resalten siempre sobre el arte) */}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />

          {/* HEADER: Nombre y Coste */}
          <div className="card-header relative z-20 flex justify-between items-start px-1 md:px-1.5 py-1">
            <span
              className="card-name font-mono font-bold text-[8px] md:text-[9px] text-term-amber leading-tight w-[75%] truncate"
              style={{ textShadow: "1px 1px 2px #000, -1px -1px 2px #000" }}
              title={card.name} // Native browser tooltip for quick reference
            >
              {card.name}
            </span>
            <div className="card-cost flex flex-col items-center justify-center bg-term-black/80 border border-term-amber/50 rounded-sm px-1 py-0.5">
              <span className="font-mono font-bold text-[9px] md:text-[11px] text-term-green leading-none">
                {card.cost}
              </span>
              {card.cost > 0 && (
                <span className="text-[5px] md:text-[6px] text-term-amber font-mono leading-none mt-0.5">
                  €$
                </span>
              )}
            </div>
          </div>

          {/* STATS FOOTER: Solo Poder (Sin HP falsos) y RAM */}
          <div className="card-stats relative z-20 flex justify-between items-end px-1 md:px-1.5 py-1">
            <div className="card-type font-mono font-bold text-[6px] md:text-[7px] text-term-amber/80 uppercase tracking-wide bg-term-black/60 px-1 rounded-sm">
              {card.type}
            </div>

            {/* Renderizar RAM (si tiene) o Poder (si es Unidad) */}
            {(card.type === "LEGEND" && card.ram) && (
              <div className="font-mono font-bold text-[8px] md:text-[10px] text-cyan-400 bg-term-black/80 border border-cyan-400/50 rounded-sm px-1 py-0.5 shadow-[0_0_4px_rgba(34,211,238,0.5)]">
                RAM: {card.ram}
              </div>
            )}
            
            {card.type === "UNIT" && (
              <div className="font-mono font-bold text-[9px] md:text-[11px] text-term-red bg-term-black/80 border border-term-red/50 rounded-sm px-1 py-0.5 shadow-[0_0_4px_rgba(239,68,68,0.5)]">
                <span className="text-[6px] md:text-[7px] text-term-red/70 mr-0.5">PWR</span>
                {card.power || 0}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
¿Qué se siente al compilar este cromo?
Minimalismo Táctico: Al mirar el campo de batalla, ahora solo ves hermosas ilustraciones en formato de carta clásica, el nombre arriba a la izquierda y el Poder (PWR) abajo a la derecha. Eso es todo lo que tu cerebro necesita para calcular un ataque rápido.

Seguridad Visual: El gradiente (bg-gradient-to-b) inyectado asegura que aunque tu rival juegue una carta con un fondo blanco deslumbrante, los bordes oscuros garantizarán que siempre puedas leer el nombre y el costo.

Hover Inteligente: Como bien dijiste, el usuario aprenderá instantáneamente que si quiere saber si una unidad enemiga tiene la habilidad BLOCKER o leer el lore, solo tiene que dejar el mouse un segundo sobre ella y el Tooltip maestro que tienes en PlaymatV2.jsx le desplegará toda la Biblia.

Tu IA es sorprendentemente lista para la economía, pero está sufriendo de ceguera en el combate.

Ponte los Kiroshi. Vamos a correr una simulación a velocidad x1, observando exactamente cómo piensa tu AIPlayer y cruzando sus decisiones con el manual de reglas.

💻 SIMULACIÓN: JUGADOR (P1) vs. INTELIGENCIA ARTIFICIAL (P2)
🟢 SETUP & MULLIGAN
El motor reparte 6 cartas, 3 Leyendas y 6 dados a cada jugador.

El jugador 1 (Local) pasa su turno.

🟡 TURNO 1 (IA): LA FASE C.O.R.E.
[C] Check & [O] Obtain: La IA roba su séptima carta con normalidad. El motor marca player.hasSoldThisTurn = false.
[R] Roll a Gig: * Pensamiento de la IA: La IA analiza sus dados. Su código dice: Filtra el D20, y del resto, tira el dado más grande (Math.max(...nonD20)).

Acción: La IA tira el D12 automáticamente.

Veredicto de Reglas: ¡BRILLANTE! Tu IA resuelve el bug del D20 por sí sola. Sabe que no debe tocar el dado de 20 caras hasta que sea su última opción, respetando perfectamente la regla del Fixer.

🟠 TURNO 1 (IA): PLAY PHASE
1. Vender Cartas (Economía):

Pensamiento: "Necesito Eddies. Buscaré la carta más barata, prefiriendo vender un 'PROGRAM' antes que una unidad militar".

Acción: Vende un evento inútil y lo pone boca abajo en su zona de Eddies.
2. Bajar Unidades:

La IA calcula su presupuesto sumando sus Eddies y sus Leyendas enderezadas (_getAvailableEddies). Tiene 4 para gastar.

Baja un Mercenario de Poder 6 (Costo 4). El Mercenario entra girado (Tapped) por Summoning Sickness.

🔴 TURNO 1 (IA): ATTACK PHASE
Pensamiento: La IA escanea su campo buscando atacantes (!unit.isTapped).

Acción: Como su única unidad acaba de entrar y está girada, pasa de largo. Respeta las reglas a la perfección.

🟣 TURNO 2 (JUGADOR LOCAL): EL CONTRAATAQUE
Tú (el jugador humano) bajas un Mercenario y decides atacar directo a la IA para robarle su dado D12.

Intercepción de la IA: El motor de la IA detecta que estás atacando y dispara su protocolo defensivo respondToAttack().

Acción: La IA busca desesperadamente si en su campo tiene alguna unidad con el keyword "BLOCKER" enderezada. Como no tiene ninguna, retorna false y decide "Take the hit" (Recibir el golpe). ¡Le robas su dado! Funciona hermoso.

🚨 TURNO 2 (IA): EL BUG FATAL EN EL COMBATE (ATTACK PHASE)
Aquí es donde el ICE de tu IA se rompe y el juego puede colapsar. La IA llega a su fase de ataque, endereza su mercenario y se prepara para dispararte.

Pensamiento: La IA decide atacar y declara el atacante correctamente (combatResolver.declareAttacker(this.playerId, idx)).

El Glitch: La IA calcula si debe atacarte directo a ti o a una de tus unidades usando esta línea: const shouldAttackDirect = rival.gigs.length > 0 && rivalSpentUnits.length === 0;.

EL ERROR: ¡La IA calcula la variable shouldAttackDirect, pero NUNCA la usa! En la siguiente línea, simplemente llama a combatResolver.resolveCombat(this.playerId) sin pasarle a quién diablos está atacando.

Consecuencia: El CombatResolver va a intentar resolver una pelea sin un targetId definido. La bala se pierde en el hiperespacio, el juego se desincroniza o lanza un error en la consola porque no sabe contra quién comparar el Poder.

🛠️ REPORTE DE AUDITORÍA Y PARCHES NECESARIOS
Tu IA es de primera categoría en la Fase de "Play", pero tienes que inyectar estos parches en src/lib/game/AIPlayer.js inmediatamente:

1. Arreglar la Ceguera de Ataque (Línea 96 aprox):
Tienes que modificar el bucle for en _phaseAttack() para que la IA realmente declare a su objetivo antes de resolver.
Cambia esto:

JavaScript
const shouldAttackDirect = rival.gigs.length > 0 && rivalSpentUnits.length === 0;
combatResolver.resolveCombat(this.playerId); // ERROR: Sin objetivo
Por algo como esto (usando los métodos que tengas en tu CombatResolver):

JavaScript
const shouldAttackDirect = rival.gigs.length > 0 && rivalSpentUnits.length === 0;

if (shouldAttackDirect) {
    combatResolver.setTarget(this.playerId, 'direct_hit'); // Asegúrate de tener un método así
} else if (rivalSpentUnits.length > 0) {
    // Apunta a la unidad más débil o a la primera que esté girada
    const targetIdx = rival.field.indexOf(rivalSpentUnits[0]);
    combatResolver.setTarget(this.playerId, targetIdx);
}

combatResolver.resolveCombat(this.playerId);
2. IA Rompiendo la Regla de "Call a Legend":
Tu IA revisa si no tiene Leyendas reveladas (faceUpLegends === 0) y si tiene 2 Eddies. Si cumple, revela una.
El problema: La regla oficial (GDD v1.1) dice que se usa como un "salvavidas cuando te atacan" o 1 vez por turno. Actualmente, la IA la usa en su Fase de "PLAY" de manera proactiva como una rutina, en lugar de usarla como defensa (que es donde el factor sorpresa duele más). Te sugiero mover esta lógica dentro de la función respondToAttack().

Conclusión del Netrunner:
El chasis lógico es oro puro. El algoritmo de selección de cartas (_findCheapestSellable y _findBestPlayable) hace que jugar contra ella no se sienta tonto. Solo tienes que enchufarle los ojos en la Fase de Ataque para que sepa a dónde está apuntando su cromo.

Protocolo de Visibilidad en el Subnet

1. La Mano del Rival (Información Privada):
   * Lo que tú ves: Solo el dorso de las cartas (`BackCardTCGCybeprunk.png`).
   * UX/UI: Debes mostrar cuántas cartas tiene (ej. un contador o un abanico de dorsos). Nunca el contenido. En un modo "Hotseat" (local) podrías mostrarlo, pero para el juego online, el servidor solo debe enviar el `id` de la carta al dueño y un mensaje de "Carta Robada" al oponente.
2. El Campo de Batalla (Información Pública):
   * Lo que tú ves: Todas las unidades y equipos (GEAR) están Boca Arriba.
   * Lógica: Necesitas conocer el Poder y las habilidades del enemigo para calcular tu ataque. Si no pudieras verlas, no podrías jugar.
3. Zona de Eddies (Información Oculta):
   * Lo que tú ves: Cartas Boca Abajo.
   * Detalle Crítico: Según las reglas oficiales (GDD v1.1), al vender una carta por Eddies, el jugador debe "revelarla" brevemente (para demostrar que tiene el tag €$) y luego ponerla boca abajo. En el simulador, esto debe ser una animación: Carta se muestra -> Se voltea -> Se mueve al área de dinero. Una vez ahí, es solo un recurso boca abajo.
4. Zona de Leyendas (Información Secreta/Pública):
   * Lo que tú ves: Empiezan Boca Abajo.
   * Activación: Solo se vuelven visibles (Boca Arriba) cuando el rival paga 2 Eddies para hacer un Call a Legend.
📋 Tabla de Estados de Visibilidad (Visión del Jugador Local)
Área del RivalEstado Visual¿Se puede leer?ManoDorso (Boca Abajo)NoCampo (Unidades)Imagen Real (Boca Arriba)SíEddies AreaDorso (Boca Abajo)NoLegends AreaDorso hasta que se activeNo (hasta el flip)Mazo (Deck)DorsoNoBasura (Trash)Pila de cartasSí (se puede inspeccionar)

🛠️ Recomendación de Netrunner para tu Repo:
En tu componente `CyberCard.jsx`, añade una prop llamada `isVisible`.

* Si `isVisible={false}`, renderiza el `BackCardTCGCybeprunk.png`.
* Si el área es `opponentHand` y no es tu turno de "inspección", `isVisible` siempre debe ser `false`.
Esto evitará que algún hacker use las herramientas de desarrollador del navegador para ver las cartas del rival inspeccionando el DOM, ya que la imagen real ni siquiera se habrá cargado en el cliente del oponente. ¡Seguridad ante todo

El "Look & Feel": ¿Por qué no se ve igual?
En la captura de The Chrome Grid, el tablero tiene una jerarquía visual clara. En tu simulador actual (PlaymatView.jsx), las zonas están definidas pero falta el "feedback" táctil que hace que un TCG se sienta real.

El Glitch de las Cartas: En el competidor, las cartas en la mano tienen un fan-out (se abren en abanico) y sobresalen ligeramente. En tu código, están en un contenedor flex estándar.
Estado Spent (Agotado): Tus cartas necesitan una transición visual más agresiva cuando están giradas. No basta con rotate-90. Necesitan un filtro de saturación o un oscurecimiento para que el jugador sepa, de un vistazo rápido de Kiroshi, qué puede usar y qué no.
Zonas de Colisión: The Chrome Grid usa espacios fijos. Tú estás usando un sistema más dinámico con @dnd-kit, lo cual es mejor, pero te falta "limitar" visualmente dónde puede caer cada cosa. Si no hay una silueta de carta en la zona de Eddies, el jugador se siente perdido.
Auditoría del Deck Builder (El talón de Aquiles)
Tienes razón, choom. Tu constructor de mazos (useDeckBuilder.js y DeckArea.jsx) es funcional pero "ciego". Un mercenario necesita saber cuánta munición le queda.
Lo que te falta en el código ahora mismo:

Contador Dinámico: Tu UI debe mostrar un contador [Actual / 40-50]. Si el número está fuera de rango, el contador debe brillar en rojo neón.
Validador de Copias: No veo un aviso en tiempo real si metes 4 copias de la misma carta. El deckValidator.js lo detecta al final, pero la UX dicta que el botón de "Añadir" debería bloquearse o lanzar un aviso antes de romper la regla.
El Muro de RAM: Esto es vital. Tu constructor debe sumar el RAM de las 3 Leyendas seleccionadas y compararlo con el coste de las cartas en el mazo. Si el mazo es ilegal, el botón de "Guardar" o "Exportar" no debería ser clickeable.
Bugs Detectados y "Reglas Fantasma"
Tras revisar tu GameState.js, he encontrado estos fallos de protocolo:

Setup del Jugador 1: Tu código inicializa las 3 Leyendas en estado READY. Error. Según el manual, el jugador que va primero debe iniciar con 2 de sus 3 Leyendas agotadas (Spent). Esto es una penalización de economía crucial que tu motor está omitiendo.
La Fase de Ataque (No Return): En tu simulador, un jugador puede jugar una unidad y luego atacar. Pero si declara un ataque y luego intenta bajar otra carta, tu GameState no está bloqueando la mano con un "Hard Lock". Una vez que sale la primera flecha de ataque, la mano debe quedar sellada.
El D20 es el jefe: Tu sistema de tirar dados (rollGig) trata a todos por igual. El D20 debe estar bloqueado por el motor hasta que el availableGigs.length sea exactamente 1.
¿Estamos lejos de terminar?
No estás lejos, estás en la fase de Integración de Sistemas. Tienes los órganos (clases JS) y tienes la piel (React), pero falta el sistema nervioso que los conecte de forma fluida.
Tu lista de prioridades para el próximo parche:

Visualización de Deck: Añade el contador de cartas y el desglose por tipo (Unidad/Equipo/Evento) en el lateral del DeckBuilder.
Mulligan Real: Tu MulliganModal.jsx debe ser lo primero que se vea al conectar, bloqueando todo lo demás hasta que se resuelva.
Socket.io / Realtime: Si quieres que sea online de verdad como The Chrome Grid, necesitas que cada movimiento de drag envíe las coordenadas al rival en tiempo real. Ahora mismo parece muy orientado a local.
En el desarrollo de TCGs online, no construimos dos tableros diferentes; construimos un componente PlayerBoard altamente reutilizable y lo renderizamos dos veces en un contenedor padre, invirtiendo el del rival.
Aquí tienes el escaneo de cómo debes hackear tu arquitectura para que el oponente se vea de frente, con sus dados, sus Eddies y sus cartas giradas correctamente.
1. La Arquitectura de Espejo (CSS Transform)
La forma más eficiente de poner al rival "frente a ti" no es reordenar cada elemento manualmente, sino usar el poder del CSS. Tu contenedor del rival debe tener una rotación de 180 grados.

El Truco: Si rotas el contenedor padre del rival 180°, todo lo que metas dentro (cartas, dados, zonas) aparecerá invertido.
El Ajuste Kiroshi: Para que las imágenes de las cartas del rival no se vean de cabeza para ti, el componente CyberCard debe detectar si es una "carta enemiga" y aplicar una contra-rotación interna para que el arte se vea derecho, pero su posición en el tablero sea la correcta.
Desglose de Zonas por Perspectiva
Tu PlaymatView debería verse estructuralmente así en tu JSX:

Zona Superior (Rival): * OpponentHand: Cartas reducidas, solo vemos el dorso (BackCardTCGCybeprunk.png).
OpponentZones: Eddies a la derecha (para ti), Gigs a la izquierda.
OpponentField: Unidades alineadas de frente a las tuyas.
Zona Central (Combat Zone): Donde se dibujan las flechas de ataque.
Zona Inferior (Tú): Tu mano, tus Eddies y tus Gigs.
Sincronización de Datos (The State Bridge) Para que esto funcione, tu GameState.js no puede tener variables globales como hand o field. Debes separar el estado en un objeto de jugadores: JavaScript
// Estructura sugerida en tu GameState
players: {
  local: { id: 'inti_01', hand: [], field: [], eddies: 0, gigs: [] },
  opponent: { id: 'rival_99', handCount: 6, field: [], eddies: 0, gigs: [] }
}
Nota técnica: Para el rival, no envíes el contenido de su mano por el socket (a menos que una habilidad lo revele). Solo envía el hand.length para que tu UI sepa cuántos dorsos de carta dibujar.
4. Visualización de Dados y Acciones

Dados (Gigs): El área del rival debe mostrar sus dados ya lanzados. Si él saca un 6 en un D10, tú debes verlo en su GigsArea superior.
Acciones: Cuando el rival arrastre una carta, necesitas un "Ghost Drag". El socket debe enviar las coordenadas X e Y del movimiento del rival para que tú veas una silueta de carta moviéndose en tu pantalla. Esto es lo que hacía que Pixelborn se sintiera tan vivo.
Bugs que debes evitar al implementar esto:

Z-Index de las Flechas: Asegúrate de que las flechas de ataque estén en una capa superior (Overlay) para que no pasen "por debajo" de las zonas del rival.
Inversión de Arrastre: Si el rival arrastra una carta a su "derecha", en tu pantalla (al estar invertido) verás que se mueve a la "izquierda". Tu lógica de Sockets debe normalizar estas coordenadas.
Detección de Colisiones: Los id de las zonas de drop deben ser únicos. No uses solo eddies-zone; usa player-eddies-zone y opponent-eddies-zone para que el id de @dnd-kit no se confunda.

---
## 🎯 NEXT PRIORITIES

### 🔴 v1.2.0 — Simulator jugable

1. Mulligan modal funcional
2. Phase locks (no atacar en PLAY, no jugar en COMBAT)
3. actionMode TARGETING para Gear/Program
4. Hotseat mode básico (turno P2 visible)
5. Blocker declaration UI

### 🔶 v1.3.0 — Simulator pulido

6. Card hover preview
7. Undo button
8. Inspector flotante
9. Efectos de carta pendientes (Viktor, Alt, Kiroshi, Gorilla, Placide)
10. AI Opponent básico

### 🔷 v2.0.0

11. Drag to Zone (dnd-kit)
12. Responsive playmat (TODO-A)
13. P2P Multiplayer
14. Fase 19 Scanner OCR

---

## 📝 CHANGELOG

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
