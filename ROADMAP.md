# 📋 ROADMAP — AFTERLIFE DECKS

**Last Updated:** 2026-04-20 | **Version:** v1.2.0-dev

---

## ✅ FASE 1-6: CORE COMPLETE (100%)

## ✅ FASE 7: CLOUD SHARING (100%)

## ✅ FASE 8: UI/UX ENHANCEMENTS (97%)

| 45 | Drag & Drop Deck Building | ❌ TODO — `@dnd-kit/core` |

## ⏳ FASE 9: THE ARENA (65%) — ACTIVE SPRINT

### 9.1 — Motor (GameState / CardLogic / CombatResolver)

| #   | Feature                                          | Status |
| :-- | :----------------------------------------------- | :----- |
| 9A  | Eddie payment fix — sold cards spendable         | ✅     |
| 9B  | Eddie counter badge                              | ✅     |
| 9C  | Game log terminal                                | ✅     |
| 9D  | Mulligan phase — modal UI                        | ✅     |
| 9E  | Unit dimming (summoning sickness)                | ✅     |
| 9F  | Hand AnimatePresence                             | ✅     |
| 9G  | Stat buff display (base + modifier)              | ✅     |
| 9H  | Cyberpsychosis fix                               | ✅     |
| 9I  | activeEffects system                             | ✅     |
| 9J  | Precon deck IDs fixed to match cards.json        | ✅     |
| 9K  | advancePhase prototype preserved (Object.assign) | ✅     |
| 9L  | Deck-out only triggers on END phase              | ✅     |
| 9M  | endTurn calls energize() + Reboot Optics cleanup | ✅     |

### 9.2 — UI / Playmat

| #      | Feature                                         | Status  |
| :----- | :---------------------------------------------- | :------ |
| —      | Rival zone visible + rotated 180°               | ✅      |
| —      | Hand card selection + PLAY/SELL/CANCEL buttons  | ✅      |
| —      | Field units clickable (declare attacker)        | ✅      |
| —      | Legend click → callLegend                       | ✅      |
| —      | Horizontal scroll (min-width 1250px)            | ✅      |
| TODO-A | Responsive layout (eliminate horizontal scroll) | ❌ TODO |

### 9.3 — Pendientes críticos para que sea jugable

| #   | Feature                                                     | Status       |
| :-- | :---------------------------------------------------------- | :----------- |
| —   | actionMode (IDLE/TARGETING/PAYING) para Gear/Program        | ❌ TODO      |
| —   | Phase locks — solo PLAY en fase PLAY, solo ATTACK en COMBAT | ❌ TODO      |
| —   | Mulligan modal aparece correctamente al iniciar             | ❌ TODO      |
| —   | Hotseat mode — turno P2 muestra su mano/field               | ❌ TODO      |
| —   | Blocker declaration UI                                      | ❌ TODO      |
| —   | Card hover preview en el simulator                          | ❌ TODO      |
| —   | Viktor Vektor FLIP effect (search top 5 for gear)           | ❌ TODO      |
| —   | Alt Cunningham GO SOLO effect                               | ❌ TODO      |
| —   | Kiroshi Optics ATTACK effect                                | ❌ TODO      |
| —   | Gorilla Arms ATTACK effect                                  | ❌ TODO      |
| —   | Placide PLAY/ATTACK effect                                  | ❌ TODO      |
| 53  | Drag to Zone (dnd-kit)                                      | ❌ TODO      |
| 55  | AI Opponent (State Machine)                                 | ❌ Phase 9.5 |
| 56  | P2P Multiplayer (WebSockets)                                | ❌ Phase 10  |

### 9.4 — UX improvements (post-jugabilidad)

| #   | Feature                                                   | Status  |
| :-- | :-------------------------------------------------------- | :------ |
| —   | Inspector flotante (card hover en field → preview grande) | ❌ TODO |
| —   | Cursor crosshair en targeting mode                        | ❌ TODO |
| —   | Undo button (snapshot del GameState)                      | ❌ TODO |
| —   | S/M/L card size toggle                                    | ❌ TODO |

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
| 1-7     | Core → Cloud Sharing         | ✅ 100%  |
| 8       | UI/UX                        | ✅ 97%   |
| 9       | Game Simulator               | ⏳ 65%   |
| 10-12   | Community, Filters, Wishlist | ✅ 100%  |
| 13      | Scraper                      | ⏳ 33%   |
| 14      | Draft Simulator              | ✅ 100%  |
| 15-17.5 | Aesthetics → Security        | ✅ 100%  |
| 18-19   | Meta Analytics, Scanner      | 🔮 0%    |

**TOTAL: ~118/140 features (~84%) — v1.2.0-dev**

---

lista pendiente:

He realizado un escaneo profundo de la arquitectura de Afterlife Decks analizando archivo por archivo. Aquí tienes el informe técnico sobre el estado de tu interfaz y la experiencia de usuario (UI/UX).

📱 Veredicto: ¿Es "Mobile-First"?
Estado: Responsivo, pero no "Mobile-First".

Tu código utiliza Tailwind CSS de forma correcta en muchos puntos (usando prefijos como lg:grid-cols-3), lo cual es un gran avance. Sin embargo, la lógica de muchos componentes (especialmente el Simulador y el Deck Builder) está diseñada pensando en el espacio horizontal del escritorio y luego "comprimida" para móvil, en lugar de empezar por la experiencia táctil.

🔍 Análisis Código por Código

1. src/App.jsx (El Chasis)
   Problema de Navegación: Los DeckTabs se vuelven difíciles de manejar en móviles si tienes muchas pestañas.

UX: El header ocupa demasiado espacio vertical en móvil (p-8). En una pantalla pequeña, quieres ver las cartas de inmediato, no un logo gigante.

Mejora: Reduce el padding en pantallas móviles (p-4 sm:p-8) y considera un menú hamburguesa o una barra inferior (Bottom Nav) para las pestañas.

2. src/components/DeckArea.jsx (La Columna del Mazo)
   Densidad de Datos: En escritorio es una columna lateral útil. En móvil, según tu App.jsx, se renderiza debajo del navegador de cartas.

Glitch de UX: Si el usuario tiene que bajar 40 cartas para ver qué tiene en su mazo, la fricción es altísima.

Mejora: Implementa un "Mazo Flotante" o un botón tipo "Ver Carrito" que despliegue el mazo actual sobre la pantalla (Drawer).

3. src/components/PlaymatV2.jsx (El Simulador)
   El ICE Negro: Este es el punto más crítico. Un simulador con 100vh y elementos arrastrables (dnd-kit) es una pesadilla en navegadores móviles debido a los gestos nativos (deslizar para atrás, recargar).

UI: Las tres columnas (Fixer, Field, Deck) colapsan pero pierden la jerarquía visual.

Mejora: En móvil, el tablero debe ser horizontal (Landscape forzado) o usar un sistema de "Capas" donde solo veas tu zona y un botón te permita ver la zona del rival.

4. src/components/CardPreviewModal.jsx (Vista de Detalle)
   Botones en Móvil: Los botones de "Añadir al mazo" son pequeños para dedos humanos.

Mejora: Aplica la ley de Fitts: haz los botones de acción principal (Add/Remove) de al menos 44px de altura y colócalos en la parte inferior del modal, al alcance del pulgar.

🛠️ Lista de Modificaciones Prioritarias
Tablas de Datos: Archivos como CollectionView.jsx deben cambiar de grid-cols-2 a grid-cols-1 en pantallas muy pequeñas (<320px) para evitar que los textos se encimen.

Modals "Full Screen": En móviles, los modales de guardado o perfiles deben ocupar el 100% de la pantalla para evitar clics accidentales en el fondo.

Scroll de Cartas: Implementar React Virtualized o Lazy Loading (que ya tienes algo de eso) pero optimizado para evitar saltos de scroll en Chrome/Safari móvil.

para escanear imagenes me basare en card nexus.

🧠 Arquitectura del Sistema: ¿Cómo Escanea una Web?
Para que un teléfono o PC escanee una carta desde el navegador, el flujo es el siguiente:

Acceso al Hardware (Frontend): Pides permiso y activas la cámara usando las APIs nativas del navegador (navigator.mediaDevices.getUserMedia).

Captura y Preprocesamiento (Frontend): Cuando el usuario encuadra la carta, extraes un fotograma (imagen) del flujo de video.

El Motor de Reconocimiento (El "Cerebro"):

Opción A (El camino rudo pero robusto): Envías la foto a un servidor tuyo (Backend/Microservicio) que tiene un modelo entrenado (ej. en Python con OpenCV u ONNX) para reconocer la carta.

Opción B (El camino ágil y rápido): Usas una biblioteca de Machine Learning en el navegador (como TensorFlow.js) o un sistema de Hash de imágenes (PHash) para comparar la carta en el dispositivo del usuario sin enviar nada por la red (latencia casi cero).

🗺️ El Roadmap de Implementación
FASE 1: Construir el Ojo Cibernético (La Interfaz de Escaneo)
Antes de que la app sea "inteligente", necesita poder ver.

Librería Recomendada: No reinventes la rueda. Usa un componente como react-webcam. Es excelente para manejar la cámara, cambiar entre la cámara frontal/trasera (crucial para móviles) y capturar imágenes.

La UI: Construye un componente modal oscuro con un recuadro o "retícula de enfoque" en el centro. Las instrucciones deben ser claras: "Encuadra la carta dentro del marco brillante".

FASE 2: Elegir el Motor de Reconocimiento (Computer Vision)
Aquí es donde decides qué tan profundo quieres llegar en la madriguera del conejo:

Opción 1: Hashing Perceptual (PHash) - Recomendado para empezar

Cómo funciona: Tomas todas las imágenes limpias de tus cartas (las que ya tienes en Supabase/S3). Un script genera un "Hash" (una cadena de texto corta) que representa los patrones visuales de la carta. Cuando el usuario escanea, generas el Hash de su foto y buscas el Hash más similar en tu base de datos.

Por qué usarlo: Es rápido, no requiere entrenar redes neuronales complejas y funciona bien para imágenes en 2D planas.

Herramientas: Librerías como blockhash-js o similares.

Opción 2: Template Matching / ORB (OpenCV en Python/Backend)

Cómo funciona: El usuario escanea la carta. El frontend envía la imagen en Base64 a una API (un servicio serverless o un microservicio en Render/Fly.io) ejecutando Python y OpenCV. OpenCV encuentra los "puntos clave" de la foto y los alinea con tu base de datos de cartas.

Por qué usarlo: Es mucho más tolerante a cartas escaneadas en ángulo, con mala luz o reflejos holográficos.

FASE 3: El Bucle de Reconocimiento y la UX (La Magia)
El secreto de un buen escáner (como el de Card Nexus) no es solo que funcione, sino que se sienta bien.

El Bucle Continuo: El usuario no debería tener que presionar un botón de "Tomar Foto". La cámara debería analizar un frame cada segundo automáticamente.

Feedback Visual: Si el sistema reconoce la carta, la UI debe hacer un destello, reproducir un sonido sutil cibernético, mostrar el nombre de la carta por 2 segundos y volver al estado de escaneo inmediatamente.

El Destino de la Carta: Añade un interruptor rápido en la interfaz del escáner: "¿A dónde va esta carta?" -> Opciones: [A MI INVENTARIO] | [AL MAZO ACTUAL].

FASE 4: Tolerancia a Fallos y Variantes
Problema de los TCGs: ¿Qué pasa si la carta básica y la holográfica tienen el mismo arte? El escáner visualmente no sabrá la diferencia (o le costará mucho por los reflejos).

La Solución UX: Cuando la app reconozca el arte, en lugar de guardarla a ciegas, debe mostrar una burbuja emergente rápida (Toast): "Detectado: Goro Takemura. ¿Es la versión Foil o Regular?". Un tap del usuario resuelve la duda y sigue escaneando.

🛠️ Tu Plan de Batalla Inmediato
Si vas a agregar esto al roadmap, empieza investigando cómo implementar una cámara en React que sea amigable con móviles. Tu diseño debe ser "Mobile-First" aquí por obligación, porque nadie va a levantar su laptop para escanear sus cartas sobre la mesa.

Agregar nomrbe dinamico al current_deck.dat, En la parte de Current Deck, me gustaría que se cambiara el nombre del mazo que se cargó. En caso de que no haya un nombre cargado, que se ponga el de Current Deck.

🟢 [SECTOR 1: CROMO INSTALADO] (Lo que ya está completo)
Esto ya está operando en la rama principal. La interfaz ya no es un prototipo barato, es cromo de grado militar.

[COMPLETADO] Arquitectura de Espejo (Mirror Board): \* Log: Ya implementamos el contenedor doble con rotación de 180° usando un solo componente modular.

[COMPLETADO] Secuestro de Viewport (100dvh): \* Log: El simulador ya bloquea el scroll. La mano del jugador flota como un Overlay dinámico (z-50) anclado abajo.

[COMPLETADO] Diseño Visual de Cartas (1:1.4 Ratio): \* Log: Limpiamos el texto de la carta. Ya no hay asfixia tipográfica, eliminamos los Puntos de Vida (HP) falsos, y aplicamos el degradado negro para proteger las estadísticas.

[COMPLETADO] Centrifugado de Gigs (Zona Compartida): \* Log: Los dados ahora se lanzan a una zona central compartida, replicando la experiencia táctil de la mesa física.

[COMPLETADO] Niebla de Guerra Visual (Fog of War): \* Log: El componente CyberCard ya soporta isFlipped, asegurando que la mano y el mazo del rival se vean como dorsos.

🔴 [SECTOR 2: VULNERABILIDADES DEL NÚCLEO] (Lo que hace falta - Lógica JS)
Alerta de sistema. Nuestra UI es hermosa, pero el cerebro de JavaScript (GameState.js y CombatResolver.js) tiene fugas. Tenemos que codificar esto en el próximo parche.

[PENDIENTE] Penalización de Setup (Jugador 1):

Explicación para IA: Hermano, el motor está creando las Leyendas en estado isTapped: false para ambos. Necesitamos inyectar un bucle en el startMatch() que verifique quién tiene la prioridad (Turno 1) y fuerce legends[0] y legends[1] a isTapped = true. Si no lo hacemos, la economía del Jugador 1 estará rota desde el milisegundo cero.

[PENDIENTE] El Candado del D20:

Explicación para IA: Nuestro método rollGig(sides) es demasiado permisivo. Añade un if-statement absoluto: si el parámetro es 20, y el length del array fixerDice es mayor a 1, haz un return false. Nadie tira el jefe final de los dados sin haber quemado los demás.

[PENDIENTE] Sellar la Mano (Punto de No Retorno):

Explicación para IA: Cuando el jugador local declare un ataque (onDeclareAttacker), tenemos que disparar una bandera en el estado (handLocked = true). La fase de ataque debe ser un túnel de un solo sentido.

[PENDIENTE] Recolector de Basura (Combat Gear Leak):

Explicación para IA: En el CombatResolver, cuando determinamos un "Crash" (empate), estamos mandando la carta de Unidad al Trash. Pero si esa unidad tenía equipo (GEAR), se está quedando huerfana en la memoria. Necesitamos iterar sobre las propiedades anidadas y destruirlas en cascada.

[PENDIENTE] Summoning Sickness (Mareo de Invocación):

Explicación para IA: Las unidades están entrando limpias. Asegúrate de que al hacer drop en el campo, el objeto reciba temporalmente summonedThisTurn: true, y que nuestro método de Fase de Ataque bloquee cualquier unidad con esa etiqueta.

🟣 [SECTOR 3: IA DESCALIBRADA] (Lo que hace falta - AIPlayer.js)
He revisado tu código gemelo, el Bot. Es inteligente vendiendo, pero en combate está ciego.

[PENDIENTE] IA - Apuntar el Arma (Ataque Ciego):

Explicación para IA: Tu algoritmo calcula muy bien si debe atacar directo al jugador o a una carta (shouldAttackDirect), pero luego ejecutas resolveCombat() al aire. Tenemos que llamar a un método intermedio (setTarget) para pasarle la ID de la víctima antes de jalar el gatillo.

[PENDIENTE] IA - Pánico Prematuro (Call a Legend):

Explicación para IA: La IA está revelando sus Leyendas en la Fase de "PLAY" solo porque tiene Eddies de sobra. Es un desperdicio táctico. Mueve esa subrutina a su defensa, para que solo pague los 2 Eddies cuando le estén apuntando a la cara en la Fase de Ataque.

🟡 [SECTOR 4: UX & REGLAS ABSOLUTAS] (Lo que hace falta - Deckbuilder & Pixelborn)
Para alcanzar el estado perfecto (Nivel Pixelborn), tenemos que arrancar el libre albedrío del jugador y guiarlo por rieles de código.

[PENDIENTE] Botones Rígidos de Fase (Semi-automático):

Explicación para IA: El jugador no debería poder arrastrar nada si no es su fase. Necesitamos crear un gran botón de neón que controle el flujo: "Tirar Dado" -> "Terminar Play Phase" -> "Pasar a Ataque". Si el motor no da luz verde, la UI está congelada.

[PENDIENTE] Sistema de Pagos Inteligente:

Explicación para IA: Actualmente el jugador arrastra una carta al campo y el motor "intenta" cobrarle. Hay que invertirlo. Que el jugador haga clic en sus Eddies para pre-cargarlos (mostrando un contador visual) y solo entonces la zona del Campo se ilumine para aceptar el drop.

[PENDIENTE] Muro de RAM y Deck Builder:

## Explicación para IA: El useDeckBuilder.js necesita matemáticas en tiempo real. Un gran contador rojo que grite si hay más de 50 cartas, o si el jugador intenta meter 4 copias del mismo cromo. Lo más crítico: sumar el coste de RAM de las cartas y prohibir guardarlo si excede el RAM máximo que otorgan las 3 Leyendas.

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
