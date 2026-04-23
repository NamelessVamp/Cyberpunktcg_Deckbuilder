// EX MACHINA — Playmat V4 — Shared Gig Center & Viewport Locked
import { useState, useRef, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import CyberCard from "./simulator/CyberCard";

// ── Draggable card ─────────────────────────────────────────────────
function DraggableCard({ id, children, disabled }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id, disabled });
  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        zIndex: 999,
        opacity: 0.85,
      }
    : {};
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={
        isDragging
          ? "cursor-grabbing"
          : disabled
            ? "cursor-not-allowed"
            : "cursor-grab"
      }
    >
      {children}
    </div>
  );
}

// ── Droppable zone ─────────────────────────────────────────────────
function DroppableZone({ id, children, className, activeId, legalZones = [] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const isLegal = activeId && legalZones.includes(id);
  const highlight = isOver && isLegal;
  return (
    <div
      ref={setNodeRef}
      className={`${className} transition-all duration-200
        ${isLegal ? "ring-2 ring-term-green/60 shadow-[0_0_12px_rgba(74,222,128,0.3)]" : ""}
        ${highlight ? "ring-term-green shadow-[0_0_24px_rgba(74,222,128,0.7)] scale-[1.01]" : ""}`}
    >
      {children}
    </div>
  );
}

// ── Animated Gig Die ──────────────────────────────────────────────
function GigDie({ gig, idx, isNew, color = "amber" }) {
  const colors = {
    amber:
      "border-term-amber text-term-amber shadow-[0_0_8px_rgba(247,224,24,0.4)]",
    red: "border-term-red   text-term-red   shadow-[0_0_8px_rgba(239,68,68,0.4)]",
  };
  return (
    <motion.div
      initial={isNew ? { scale: 0, rotate: -180, opacity: 0 } : false}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 25,
        delay: idx * 0.05,
      }}
      className={`w-8 h-8 md:w-9 md:h-9 border-2 rounded flex flex-col items-center justify-center bg-term-black cursor-default ${colors[color]}`}
      title={`d${gig.type}`}
      whileHover={{ scale: 1.15 }}
    >
      <div className="font-mono font-bold text-[10px] md:text-sm leading-none">
        {gig.value}
      </div>
      <div className="font-mono text-[6px] md:text-[7px] opacity-50">
        d{gig.type}
      </div>
    </motion.div>
  );
}

// ── Fixer Dice panel ───────────────────────────────
function FixerPanel({ fixerDice, isCorePhase, onRollGig, isRival = false }) {
  const dice = [
    { sides: 20, id: "die20" },
    { sides: 12, id: "die12" },
    { sides: 10, id: "die10" },
    { sides: 8, id: "die8" },
    { sides: 6, id: "die6" },
    { sides: 4, id: "die4" },
  ];

  const borderColor = isRival ? "border-term-red/60" : "border-term-amber";
  const textColor = isRival ? "text-term-red/70" : "text-term-amber";
  const glowColor = isRival ? "rgba(239,68,68,0.3)" : "rgba(247,224,24,0.3)";
  const labelBg = isRival
    ? "bg-term-red text-white"
    : "bg-term-amber text-black";
  const glowShadow = isRival
    ? "0 0 12px rgba(239,68,68,0.8)"
    : "0 0 12px rgba(74,222,128,0.8)";

  return (
    <div className="col-left w-[60px] md:w-[80px] flex flex-col justify-end gap-2 h-full">
      <div
        className={`dice-box border ${borderColor} rounded-lg flex flex-col items-center justify-evenly flex-1 bg-transparent relative py-2 min-h-0`}
      >
        {dice.map((die) => {
          const available = fixerDice.includes(die.sides);
          const clickable = isCorePhase && available && !isRival;
          return (
            <motion.div
              key={die.id}
              id={die.id}
              className={`die-slot w-[30px] h-[30px] md:w-[40px] md:h-[40px] border ${borderColor} flex justify-center items-center text-[10px] md:text-[12px] font-bold rotate-45 relative z-20 transition-colors ${textColor}
                ${clickable ? "cursor-pointer" : available ? "cursor-not-allowed opacity-50" : "opacity-20 cursor-not-allowed"}`}
              style={{
                textShadow:
                  "1px 1px 2px #000, -1px -1px 2px #000, 0 0 5px #000",
              }}
              whileHover={
                clickable ? { scale: 1.2, backgroundColor: glowColor } : {}
              }
              whileTap={clickable ? { scale: 0.9 } : {}}
              onClick={() => clickable && onRollGig?.(die.sides)}
            >
              <span className="-rotate-45 pointer-events-none block">
                D{die.sides}
              </span>
            </motion.div>
          );
        })}
      </div>
      <div className="fixer-box h-[20px] flex justify-center items-center relative shrink-0">
        <motion.div
          className={`label absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 text-[8px] md:text-[10px] font-bold rounded-xl whitespace-nowrap z-10 ${isRival ? labelBg : "text-black"}`}
          animate={{
            backgroundColor:
              !isRival && isCorePhase && fixerDice.length > 0
                ? "#4ade80"
                : isRival
                  ? "#ef4444"
                  : "#f7e018",
            boxShadow:
              !isRival && isCorePhase && fixerDice.length > 0
                ? glowShadow
                : "none",
          }}
        >
          {!isRival && isCorePhase && fixerDice.length > 0
            ? "▶ ROLL GIG"
            : "FIXER"}
        </motion.div>
      </div>
    </div>
  );
}

// ── Player Board (Ahora SIN la zona de Gigs) ─────────────────────────
function PlayerBoard({
  playerData,
  isRival,
  game,
  onPlayCard,
  onSellCard,
  onCallLegend,
  onDeclareAttacker,
  onDeclareBlocker,
  onRollGig,
  onGoSolo,
  isBlockingMode,
  onBlockerSelected,
  activeDragId,
  legalZones,
  onHoverCard,
  combatFlash,
  newFieldIdx,
}) {
  const isAttackPhase = game?.phase === "ATTACK";
  const isPlayPhase = game?.phase === "PLAY";
  const isCorePhase = game?.phase === "CORE";

  const {
    field = [],
    legends = [],
    eddies = [],
    deck = [],
    trash = [],
    fixerDice = [],
  } = playerData;

  const borderColor = isRival ? "border-term-red/40" : "border-term-amber";
  const labelBg = isRival
    ? "bg-term-red/80 text-white"
    : "bg-term-amber text-black";
  const textColor = isRival ? "text-term-red/70" : "text-term-amber";

  return (
    <div
      className={`playmat w-full h-full bg-transparent border-2 ${borderColor} rounded-lg relative font-mono flex p-2 md:p-4 box-border gap-2 md:gap-4 select-none min-h-0`}
    >
      {/* LEFT — Fixer Dice */}
      <FixerPanel
        fixerDice={fixerDice}
        isCorePhase={isCorePhase}
        onRollGig={onRollGig}
        isRival={isRival}
      />

      {/* CENTER — Field, Legends, Eddies */}
      <div className="col-center flex-grow flex flex-col gap-2 md:gap-3 min-w-0">
        {/* Field — Droppable */}
        <DroppableZone
          id="drop-field"
          activeId={activeDragId}
          legalZones={legalZones}
          className={`field-box flex-1 border ${borderColor} rounded-lg relative bg-transparent p-2 flex items-center min-h-0`}
        >
          <div
            className={`label absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[8px] font-bold rounded-xl whitespace-nowrap z-10 ${labelBg}`}
          >
            FIELD {isPlayPhase && !isRival ? "— drag unit here" : ""}
          </div>
          <div
            className={`dashed-units-area border border-dashed ${borderColor} w-full h-full rounded-lg flex flex-row flex-wrap gap-2 p-2 relative z-[5] items-center justify-start overflow-y-auto`}
          >
            <AnimatePresence>
              {combatFlash && (
                <motion.div
                  className="absolute inset-0 rounded-lg z-20 pointer-events-none"
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,42,42,0.6) 0%, rgba(255,42,42,0) 70%)",
                  }}
                />
              )}
            </AnimatePresence>

            {field.length === 0 && (
              <span
                className={`${textColor} opacity-30 text-[10px] font-mono w-full text-center`}
              >
                EMPTY FIELD
              </span>
            )}

            <AnimatePresence>
              {field.map((card, idx) => (
                <DroppableZone
                  key={`unit-${idx}`}
                  id={`drop-unit-${idx}`}
                  activeId={activeDragId}
                  legalZones={legalZones}
                  className="h-full max-h-[140px]"
                >
                  <div
                    onMouseEnter={() => onHoverCard?.(card)}
                    onMouseLeave={() => onHoverCard?.(null)}
                    onClick={() => {
                      if (isBlockingMode) {
                        onBlockerSelected?.(idx);
                        return;
                      }
                      if (isAttackPhase && !isRival) {
                        if (card.isTapped) {
                          alert("Unit exhausted — already attacked this turn");
                          return;
                        }
                        if (card.summonedThisTurn) {
                          alert(
                            "Summoning Sickness — this unit just entered the field",
                          );
                          return;
                        }
                        onDeclareAttacker?.(idx);
                      }
                    }}
                    className={`h-full cursor-pointer transition-all ${card.isTapped ? "opacity-50 saturate-50" : ""} 
                      ${card.isAttacking ? "ring-2 ring-term-green shadow-[0_0_12px_rgba(74,222,128,0.6)]" : ""} 
                      ${isBlockingMode && !isRival ? "ring-2 ring-term-green/50 animate-pulse cursor-crosshair" : ""}`}
                  >
                    <CyberCard card={card} isNew={idx === newFieldIdx} />
                  </div>
                </DroppableZone>
              ))}
            </AnimatePresence>
          </div>
        </DroppableZone>

        {/* Bottom Row: Legends + Eddies */}
        <div className="bottom-row shrink-0 h-[35%] min-h-[70px] flex gap-2 md:gap-4">
          <div
            className={`legends-box flex-1 border ${borderColor} rounded-lg relative bg-transparent flex p-1 md:p-2 gap-1 md:gap-2`}
          >
            <div
              className={`label absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[8px] font-bold rounded-xl whitespace-nowrap z-10 ${labelBg}`}
            >
              LEGENDS
            </div>
            {[0, 1, 2].map((idx) => (
              <div
                key={`legend-${idx}`}
                className={`legend-card flex-1 border border-dashed ${borderColor} opacity-80 rounded relative flex items-center justify-center`}
              >
                {legends[idx] ? (
                  <div className="relative h-full w-full flex items-center justify-center">
                    <motion.div
                      className={`h-full cursor-pointer ${legends[idx].isTapped ? "opacity-50 saturate-50" : ""}`}
                      onMouseEnter={() => onHoverCard?.(legends[idx])}
                      onMouseLeave={() => onHoverCard?.(null)}
                      onClick={() => {
                        if (isPlayPhase && !isRival) onCallLegend?.(idx);
                      }}
                      whileHover={
                        isPlayPhase && !isRival ? { scale: 1.05, y: -3 } : {}
                      }
                    >
                      <CyberCard
                        card={legends[idx]}
                        isFlipped={isRival && !legends[idx].isFaceUp}
                      />
                    </motion.div>
                  </div>
                ) : (
                  <span className={`${textColor} opacity-20 text-[8px]`}>
                    L{idx + 1}
                  </span>
                )}
              </div>
            ))}
          </div>

          {isRival ? (
            <div
              className={`eddies-box flex-1 border ${borderColor} rounded-lg relative bg-transparent flex p-2 flex-wrap gap-1 overflow-hidden`}
            >
              <div
                className={`label absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[8px] font-bold rounded-xl whitespace-nowrap z-10 ${labelBg}`}
              >
                EDDIES ({eddies.length})
              </div>
              {eddies.map((_, idx) => (
                <div
                  key={`reddie-${idx}`}
                  className="w-6 h-8 md:w-8 md:h-12 border border-term-red/30 rounded bg-term-red/10 flex items-center justify-center"
                >
                  <span className="text-term-red/30 text-[8px]">€</span>
                </div>
              ))}
            </div>
          ) : (
            <DroppableZone
              id="drop-eddies"
              activeId={activeDragId}
              legalZones={legalZones}
              className={`eddies-box flex-1 border ${borderColor} rounded-lg relative bg-transparent flex p-2 flex-wrap gap-1`}
            >
              <div
                className={`label absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[8px] font-bold rounded-xl whitespace-nowrap z-10 ${labelBg}`}
              >
                EDDIES {isPlayPhase ? "— drag €$" : ""}
              </div>
              <AnimatePresence>
                {eddies.map((card, idx) => (
                  <motion.div
                    key={`eddie-${idx}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: card.isTapped ? 0.4 : 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={`h-full max-h-[70px] transition-all ${card.isTapped ? "rotate-90 cursor-not-allowed" : "cursor-pointer hover:ring-1 hover:ring-term-amber"}`}
                    onClick={() => {
                      if (!card.isTapped) {
                        card.isTapped = true;
                      }
                    }}
                  >
                    <CyberCard card={card} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </DroppableZone>
          )}
        </div>
      </div>

      {/* RIGHT — Deck + Trash */}
      <div className="col-right w-[60px] md:w-[90px] flex flex-col items-center gap-2 h-full">
        <div
          className={`logo-box h-[40px] flex flex-col items-end justify-center w-full font-bold italic ${textColor}`}
          style={{
            textShadow: "1px 1px 2px #000, -1px -1px 2px #000, 0 0 5px #000",
          }}
        >
          <span className="text-[12px] md:text-[16px]">CYBERPUNK</span>
          <span className="text-[5px] md:text-[6px] opacity-70">
            TCG SIMULATOR
          </span>
        </div>
        <div className="spacer flex-grow"></div>

        <motion.div
          className={`deck-trash-box w-full h-[35%] border ${borderColor} rounded-lg relative bg-transparent flex justify-center items-center`}
          whileHover={
            !isRival
              ? {
                  borderColor: "rgba(247,224,24,0.8)",
                  boxShadow: "0 0 12px rgba(247,224,24,0.3)",
                }
              : {}
          }
        >
          <div
            className={`label absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[8px] font-bold rounded-xl whitespace-nowrap z-10 ${labelBg}`}
          >
            DECK ({deck.length})
          </div>
          {deck.length > 0 && (
            <div className="h-full p-1">
              <CyberCard card={deck[0]} isFlipped={true} />
            </div>
          )}
        </motion.div>

        <div
          className={`deck-trash-box w-full h-[35%] border ${borderColor} rounded-lg relative bg-transparent flex justify-center items-center`}
        >
          <div
            className={`label absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[8px] font-bold rounded-xl whitespace-nowrap z-10 ${labelBg}`}
          >
            TRASH
          </div>
          <AnimatePresence mode="wait">
            {trash.length > 0 && (
              <motion.div
                key={trash.length}
                initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="h-full p-1"
              >
                <CyberCard card={trash[trash.length - 1]} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Main PlaymatV2 Orchestrator ─────────────────────────────────────────────────
export default function PlaymatV2({
  game,
  onGameUpdate,
  onPlayCard,
  onSellCard,
  onCallLegend,
  onDeclareAttacker,
  onDeclareBlocker,
  onResolveCombat,
  onRollGig,
  isBlockingMode,
  onBlockerSelected,
  onGoSolo,
}) {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [combatFlash, setCombatFlash] = useState(false);
  const [activeDragIdx, setActiveDragIdx] = useState(null);
  const [activeDragId, setActiveDragId] = useState(null);
  const [newFieldIdx, setNewFieldIdx] = useState(null);
  const prevFieldLen = useRef(null);
  const fileInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const activeId = game?.activePlayer || 1;
  const rivalId = activeId === 1 ? 2 : 1;

  const playerData = game?.players?.[activeId] || {};
  const rivalData = game?.players?.[rivalId] || {};
  const playerField = playerData.field || [];
  const playerGigs = playerData.gigs || [];
  const rivalGigs = rivalData.gigs || [];

  useEffect(() => {
    const currentLen = playerField.length;
    if (prevFieldLen.current !== null && currentLen < prevFieldLen.current) {
      setCombatFlash(true);
      setTimeout(() => setCombatFlash(false), 500);
    }
    prevFieldLen.current = currentLen;
  }, [playerField.length]);

  const getLegalZones = (card) => {
    if (!card) return [];
    if (card.type === "UNIT") return ["drop-field"];
    if (card.type === "GEAR")
      return playerField.map((_, i) => `drop-unit-${i}`);
    return ["drop-eddies"];
  };
  const legalZones = activeCard ? getLegalZones(activeCard) : [];
  if (
    activeCard &&
    activeCard.cost > 0 &&
    !legalZones.includes("drop-eddies")
  ) {
    legalZones.push("drop-eddies");
  }

  function handleDragStart(event) {
    const idx = parseInt(event.active.id.replace("hand-", ""));
    setActiveDragIdx(idx);
    setActiveDragId(event.active.id);
    setActiveCard((playerData.hand || [])[idx]);
  }

  function handleDragEnd(event) {
    const { over } = event;
    setActiveCard(null);
    setActiveDragIdx(null);
    setActiveDragId(null);
    if (!over || activeDragIdx === null) return;
    const card = (playerData.hand || [])[activeDragIdx];
    if (!card) return;

    if (over.id === "drop-field" && card.type === "UNIT") {
      const prevLen = playerField.length;
      onPlayCard?.(activeDragIdx);
      setNewFieldIdx(prevLen);
      setTimeout(() => setNewFieldIdx(null), 600);
    } else if (over.id === "drop-eddies") {
      onSellCard?.(activeDragIdx);
    } else if (over.id?.startsWith("drop-unit-") && card.type === "GEAR") {
      onPlayCard?.(activeDragIdx, parseInt(over.id.replace("drop-unit-", "")));
    }
  }

  const isAttackPhase = game?.phase === "ATTACK";
  const isPlayPhase = game?.phase === "PLAY";

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* VIEWPORT HIJACK: 100vh estricto, sin scroll */}
      <div
        className="w-screen h-[100dvh] overflow-hidden bg-term-black flex flex-col items-center relative"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Custom playmat upload btn (Absolute top-right) */}
        <div className="absolute top-2 right-2 z-50">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const r = new FileReader();
                r.onload = (ev) => setBackgroundImage(ev.target.result);
                r.readAsDataURL(file);
              }
            }}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-term-amber/50 bg-term-black/50 border border-term-amber/30 font-mono text-[8px] px-2 py-1 hover:bg-term-amber/30 transition-all rounded backdrop-blur"
          >
            [+ CUSTOM PLAYMAT]
          </button>
        </div>

        {/* CONTENEDOR PRINCIPAL: Flexbox dinámico */}
        <div className="flex flex-col w-full max-w-[1200px] h-full p-2 pb-[60px] md:pb-[80px] gap-1 md:gap-2 relative">
          {/* RIVAL BOARD (Upper half) */}
          <div className="flex-1 min-h-0 rotate-180">
            <PlayerBoard
              playerData={rivalData}
              isRival={true}
              game={game}
              onDeclareBlocker={onDeclareBlocker}
              onHoverCard={() => {}}
              activeDragId={null}
              legalZones={[]}
              combatFlash={false}
              newFieldIdx={null}
            />
          </div>

          {/* EL CENTRO COMPARTIDO (GIGS ZONE) */}
          <div className="shrink-0 h-[60px] md:h-[80px] flex items-center justify-center gap-3 w-full relative z-10 my-1">
            {/* Stats Rival */}
            <div
              className={`hidden md:flex stats-box w-[120px] h-full border border-term-red/40 rounded-lg flex-col items-center justify-center p-1 bg-term-black/80 backdrop-blur`}
            >
              <span className={`text-term-red/70 font-mono text-[10px]`}>
                HAND: {rivalData.hand?.length || 0} · DECK:{" "}
                {rivalData.deck?.length || 0}
              </span>
              <span
                className={`text-term-red font-mono font-bold text-xs mt-1`}
              >
                ☆ CRED: {rivalData.streetCred || 0}
              </span>
            </div>

            {/* Gigs Box (Rival) - Invertido visualmente */}
            <div className="flex-1 h-full border border-term-red/40 rounded-lg relative bg-term-black/60 backdrop-blur flex justify-center items-center flex-wrap gap-2 p-2">
              <div className="label absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[8px] font-bold rounded-xl whitespace-nowrap z-10 bg-term-red/80 text-white">
                RIVAL GIGS ({rivalGigs.length})
              </div>
              <AnimatePresence>
                {rivalGigs.map((gig, idx) => (
                  <GigDie
                    key={`r-gig-${idx}-${gig.value}`}
                    gig={gig}
                    idx={idx}
                    isNew={idx === rivalGigs.length - 1}
                    color="red"
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Indicador de Fase Central */}
            <div className="text-term-amber/60 bg-term-black/80 px-3 py-2 rounded backdrop-blur font-mono text-[9px] md:text-[11px] font-bold tracking-widest border border-term-amber/20 shadow-[0_0_10px_rgba(247,224,24,0.1)] flex flex-col items-center">
              <span>— COMBAT ZONE —</span>
              <span className="text-term-amber">
                T{game?.turn || 1} [{game?.phase || "SETUP"}]
              </span>
            </div>

            {/* Gigs Box (Local) */}
            <div className="flex-1 h-full border border-term-amber/40 rounded-lg relative bg-term-black/60 backdrop-blur flex justify-center items-center flex-wrap gap-2 p-2">
              <div className="label absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[8px] font-bold rounded-xl whitespace-nowrap z-10 bg-term-amber text-black">
                FRIENDLY GIGS ({playerGigs.length})
              </div>
              <AnimatePresence>
                {playerGigs.map((gig, idx) => (
                  <GigDie
                    key={`p-gig-${idx}-${gig.value}`}
                    gig={gig}
                    idx={idx}
                    isNew={idx === playerGigs.length - 1}
                    color="amber"
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Stats Local */}
            <div
              className={`hidden md:flex stats-box w-[120px] h-full border border-term-amber/40 rounded-lg flex-col items-center justify-center p-1 bg-term-black/80 backdrop-blur`}
            >
              <span className={`text-term-amber font-mono text-[10px]`}>
                HAND: {playerData.hand?.length || 0} · DECK:{" "}
                {playerData.deck?.length || 0}
              </span>
              <span
                className={`text-term-green font-mono font-bold text-xs mt-1`}
              >
                ☆ CRED: {playerData.streetCred || 0}
              </span>
            </div>
          </div>

          {/* PLAYER BOARD (Lower half) */}
          <div className="flex-1 min-h-0">
            <PlayerBoard
              playerData={playerData}
              isRival={false}
              game={game}
              onPlayCard={onPlayCard}
              onSellCard={onSellCard}
              onCallLegend={onCallLegend}
              onDeclareAttacker={onDeclareAttacker}
              onDeclareBlocker={onDeclareBlocker}
              onRollGig={onRollGig}
              onGoSolo={onGoSolo}
              isBlockingMode={isBlockingMode}
              onBlockerSelected={onBlockerSelected}
              onHoverCard={setHoveredCard}
              activeDragId={activeDragId}
              legalZones={legalZones}
              combatFlash={combatFlash}
              newFieldIdx={newFieldIdx}
            />
          </div>
        </div>

        {/* FLOATING PLAYER HAND (Overlay z-50) */}
        <div className="absolute bottom-[-60px] md:bottom-[-90px] hover:bottom-2 transition-all duration-300 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pt-10 pb-2 px-10 w-max">
          <div
            className={`font-mono text-[9px] md:text-[10px] font-bold px-4 py-1 rounded shadow-lg backdrop-blur-md border ${isAttackPhase ? "bg-term-red/90 text-white border-term-red" : "bg-term-amber/90 text-black border-term-amber"}`}
          >
            {isAttackPhase ? "🔒 HAND LOCKED" : "PLAYER HAND — Hover to reveal"}
          </div>
          <div className="flex justify-center items-end gap-1 md:gap-2 h-[120px] md:h-[160px]">
            {(playerData.hand || []).map((card, idx) => (
              <motion.div
                key={`hand-wrapper-${idx}`}
                onMouseEnter={() => setHoveredCard(card)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`h-full ${isAttackPhase ? "opacity-50 pointer-events-none" : ""}`}
                whileHover={
                  !isAttackPhase ? { y: -15, scale: 1.1, zIndex: 60 } : {}
                }
              >
                {isAttackPhase ? (
                  <CyberCard card={card} />
                ) : (
                  <DraggableCard
                    id={`hand-${idx}`}
                    disabled={!isPlayPhase && game?.phase !== "CORE"}
                  >
                    <CyberCard card={card} />
                  </DraggableCard>
                )}
              </motion.div>
            ))}
            {(playerData.hand || []).length === 0 && (
              <div className="text-term-amber/40 text-xs font-mono bg-term-black/60 px-4 py-2 rounded">
                NO CARDS IN HAND
              </div>
            )}
          </div>
        </div>

        {/* Hover Preview Tooltip */}
        <AnimatePresence>
          {hoveredCard && (
            <motion.div
              className="fixed top-4 right-4 z-[100] w-[200px] md:w-56 bg-term-black border-2 border-term-amber rounded-lg p-2 md:p-3 shadow-[0_0_24px_rgba(255,191,0,0.4)] pointer-events-none"
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              {hoveredCard.image_url ? (
                <img
                  src={hoveredCard.image_url}
                  alt={hoveredCard.name}
                  className="w-full rounded mb-2 shadow-lg"
                />
              ) : (
                <div className="w-full h-24 bg-term-gray/40 rounded mb-2 flex items-center justify-center text-term-amber/20 text-[10px] font-mono">
                  NO IMAGE
                </div>
              )}
              <div className="font-mono text-term-amber text-[10px] md:text-xs font-bold">
                {hoveredCard.name}
              </div>
              {hoveredCard.subtitle && (
                <div className="font-mono text-term-amber/50 text-[8px] md:text-[10px]">
                  {hoveredCard.subtitle}
                </div>
              )}
              <div className="font-mono text-term-green/70 text-[8px] md:text-[10px] mt-1">
                {hoveredCard.type} · {hoveredCard.faction} · {hoveredCard.cost}€
              </div>
              {hoveredCard.text && (
                <div className="font-mono text-term-amber/60 text-[7px] md:text-[9px] mt-1 leading-tight border-t border-term-amber/20 pt-1">
                  {hoveredCard.text}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeCard && (
            <motion.div
              className="pointer-events-none h-[120px] md:h-[160px]"
              animate={{ rotate: 5, scale: 1.1 }}
              transition={{ duration: 0.1 }}
            >
              <CyberCard card={activeCard} />
            </motion.div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
