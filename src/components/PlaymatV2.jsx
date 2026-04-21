// EX MACHINA — Playmat V2 with dnd-kit + Framer Motion game feel
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

// ── Draggable card ────────────────────────────────────────────────
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

// ── Droppable zone ────────────────────────────────────────────────
function DroppableZone({ id, children, className, activeId, legalZones = [] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const isLegal = activeId && legalZones.includes(id);
  const highlight = isOver && isLegal;

  return (
    <div
      ref={setNodeRef}
      className={`${className} transition-all duration-200 ${
        isLegal
          ? "ring-2 ring-term-green/60 shadow-[0_0_12px_rgba(74,222,128,0.3)]"
          : ""
      } ${highlight ? "ring-term-green shadow-[0_0_24px_rgba(74,222,128,0.7)] scale-[1.01]" : ""}`}
    >
      {children}
    </div>
  );
}

// ── Animated Gig Die ──────────────────────────────────────────────
function GigDie({ gig, idx, isNew }) {
  return (
    <motion.div
      key={`gig-${idx}`}
      initial={isNew ? { scale: 0, rotate: -180, opacity: 0 } : false}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 25,
        delay: idx * 0.05,
      }}
      className="w-10 h-10 border-2 border-term-amber rounded flex flex-col items-center justify-center bg-term-black cursor-default shadow-[0_0_8px_rgba(247,224,24,0.4)]"
      title={`d${gig.type}`}
      whileHover={{ scale: 1.15, boxShadow: "0 0 16px rgba(247,224,24,0.8)" }}
    >
      <div className="text-term-amber font-mono font-bold text-sm leading-none">
        {gig.value}
      </div>
      <div className="text-term-amber/40 font-mono text-[7px]">d{gig.type}</div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────
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
  const prevFieldLen = useRef(null);

  // Trigger combat flash when a unit dies (field shrinks)
  useEffect(() => {
    const currentLen = playerField.length;
    if (prevFieldLen.current !== null && currentLen < prevFieldLen.current) {
      setCombatFlash(true);
      setTimeout(() => setCombatFlash(false), 500);
    }
    prevFieldLen.current = currentLen;
  }, [playerField.length]);
  const [activeDragIdx, setActiveDragIdx] = useState(null);
  const [activeDragId, setActiveDragId] = useState(null);
  const [newFieldIdx, setNewFieldIdx] = useState(null); // track newly played card for animation
  const [lastGigCount, setLastGigCount] = useState({ 1: 0, 2: 0 });
  const fileInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setBackgroundImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const activeId = game?.activePlayer || 1;
  const rivalId = activeId === 1 ? 2 : 1;

  const playerHand = game?.players[activeId]?.hand || [];
  const playerField = game?.players[activeId]?.field || [];
  const playerLegends = game?.players[activeId]?.legends || [];
  const playerEddies = game?.players[activeId]?.eddies || [];
  const playerDeck = game?.players[activeId]?.deck || [];
  const playerTrash = game?.players[activeId]?.trash || [];
  const playerGigs = game?.players[activeId]?.gigs || [];
  const playerFixerDice = game?.players[activeId]?.fixerDice || [];

  const rivalField = game?.players[rivalId]?.field || [];
  const rivalLegends = game?.players[rivalId]?.legends || [];
  const rivalHand = game?.players[rivalId]?.hand || [];
  const rivalGigs = game?.players[rivalId]?.gigs || [];

  // Legal drop zones based on card type being dragged
  const getLegalZones = (card) => {
    if (!card) return [];
    if (card.type === "UNIT") return ["drop-field"];
    if (card.type === "GEAR")
      return [...playerField.map((_, i) => `drop-unit-${i}`)];
    return ["drop-eddies"]; // PROGRAM or sellable
  };
  const legalZones = activeCard ? getLegalZones(activeCard) : [];
  // Always include eddies for any card with cost > 0
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
    setActiveCard(playerHand[idx]);
  }

  function handleDragEnd(event) {
    const { over } = event;
    setActiveCard(null);
    setActiveDragIdx(null);
    setActiveDragId(null);
    if (!over || activeDragIdx === null) return;

    const card = playerHand[activeDragIdx];
    if (!card) return;

    if (over.id === "drop-field" && card.type === "UNIT") {
      const prevLen = playerField.length;
      onPlayCard?.(activeDragIdx);
      setNewFieldIdx(prevLen); // animate the new card
      setTimeout(() => setNewFieldIdx(null), 600);
      return;
    }
    if (over.id === "drop-eddies") {
      onSellCard?.(activeDragIdx);
      return;
    }
    if (over.id?.startsWith("drop-unit-") && card.type === "GEAR") {
      const unitIdx = parseInt(over.id.replace("drop-unit-", ""));
      onPlayCard?.(activeDragIdx, unitIdx);
      return;
    }
  }

  const isAttackPhase = game?.phase === "ATTACK";
  const isPlayPhase = game?.phase === "PLAY";
  const isCorePhase = game?.phase === "CORE";

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="game-wrapper flex flex-col gap-4 items-center min-w-[1250px]">
        {/* Custom Playmat Upload */}
        <div className="controls flex justify-end w-[1200px]">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleBackgroundUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="border border-term-amber px-4 py-1.5 cursor-pointer bg-term-amber/10 font-bold font-mono text-term-amber hover:bg-term-amber hover:text-black transition-all text-xs"
          >
            [+] UPLOAD CUSTOM PLAYMAT
          </button>
        </div>

        {/* RIVAL ZONE */}
        <div className="w-[1200px] bg-term-black/60 border border-term-red/40 rounded-lg p-3 flex gap-4 items-center rotate-180">
          <span className="text-term-red/70 font-mono text-xs font-bold whitespace-nowrap">
            RIVAL
          </span>
          <div className="flex gap-1">
            {rivalLegends.map((leg, idx) => (
              <div key={`rl-${idx}`} className="opacity-80">
                <CyberCard card={leg} />
              </div>
            ))}
          </div>
          <div className="flex gap-1 flex-1 flex-wrap">
            {rivalField.length === 0 ? (
              <span className="text-term-red/30 font-mono text-xs">
                EMPTY FIELD
              </span>
            ) : (
              rivalField.map((card, idx) => (
                <motion.div
                  key={`rf-${idx}`}
                  className={`cursor-pointer ${card.isAttacking ? "ring-2 ring-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" : ""}`}
                  onClick={() => {
                    if (isAttackPhase) onDeclareBlocker?.(idx);
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <CyberCard card={card} />
                </motion.div>
              ))
            )}
          </div>
          <div className="flex flex-col items-end gap-1 -rotate-180">
            <span className="text-term-red/50 font-mono text-[9px]">
              HAND: {rivalHand.length} · DECK:{" "}
              {game?.players[rivalId]?.deck?.length || 0}
            </span>
            <span className="text-term-amber/60 font-mono text-[9px]">
              FIXER: {game?.players[rivalId]?.fixerDice?.length || 0} dice
            </span>
            <span className="text-term-green/60 font-mono text-[9px]">
              ☆ {game?.players[rivalId]?.streetCred || 0}
            </span>
          </div>
        </div>

        {/* Main Playmat */}
        <div
          className="playmat w-[1200px] min-h-[700px] bg-transparent border-2 border-term-amber relative font-mono text-term-amber flex p-5 box-border gap-4 select-none overflow-visible"
          style={{
            backgroundImage: backgroundImage
              ? `url(${backgroundImage})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* LEFT — Fixer Dice */}
          <div className="col-left w-[90px] flex flex-col justify-end gap-4">
            <div className="dice-box border border-term-amber rounded-lg flex flex-col items-center justify-evenly h-[520px] bg-transparent">
              {[
                { sides: 20, id: "die20" },
                { sides: 12, id: "die12" },
                { sides: 10, id: "die10" },
                { sides: 8, id: "die8" },
                { sides: 6, id: "die6" },
                { sides: 4, id: "die4" },
              ].map((die) => {
                const available = playerFixerDice.includes(die.sides);
                const clickable = isCorePhase && available;
                return (
                  <motion.div
                    key={die.id}
                    id={die.id}
                    title={
                      clickable
                        ? `Click to roll d${die.sides}`
                        : available
                          ? "Available in CORE phase"
                          : "Already used"
                    }
                    className={`die-slot w-[50px] h-[50px] border border-term-amber flex justify-center items-center text-[13px] font-bold rotate-45 relative z-[100] transition-colors ${
                      clickable
                        ? "cursor-pointer"
                        : available
                          ? "cursor-not-allowed opacity-50"
                          : "opacity-20 cursor-not-allowed"
                    }`}
                    style={{
                      textShadow:
                        "1px 1px 2px #000, -1px -1px 2px #000, 0 0 5px #000",
                    }}
                    whileHover={
                      clickable
                        ? {
                            scale: 1.2,
                            backgroundColor: "rgba(247,224,24,0.3)",
                          }
                        : {}
                    }
                    whileTap={clickable ? { scale: 0.9 } : {}}
                    onClick={() => {
                      if (clickable) onRollGig?.(die.sides);
                    }}
                  >
                    <span className="-rotate-45 pointer-events-none block">
                      D{die.sides}
                    </span>
                  </motion.div>
                );
              })}
            </div>
            <div className="fixer-box h-[30px] flex justify-center items-center relative">
              <motion.div
                className="label absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10"
                animate={{
                  backgroundColor:
                    isCorePhase && playerFixerDice.length > 0
                      ? "#4ade80"
                      : "#f7e018",
                  boxShadow:
                    isCorePhase && playerFixerDice.length > 0
                      ? "0 0 12px rgba(74,222,128,0.8)"
                      : "none",
                }}
              >
                {isCorePhase && playerFixerDice.length > 0
                  ? "▶ ROLL GIG"
                  : "FIXER"}
              </motion.div>
            </div>
          </div>

          {/* CENTER */}
          <div className="col-center flex-grow flex flex-col gap-4">
            {/* Gigs Row */}
            <div className="gigs-row flex gap-5 h-[100px] items-start -mt-5">
              <div className="gig-box flex-1 h-full border border-term-amber border-t-0 rounded-b-lg relative bg-transparent flex justify-center items-center flex-wrap gap-2 p-2 pb-6">
                <div className="label absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
                  RIVAL GIGS ({rivalGigs.length})
                </div>
                <AnimatePresence>
                  {rivalGigs.map((gig, idx) => (
                    <GigDie
                      key={`rival-gig-${idx}-${gig.value}`}
                      gig={gig}
                      idx={idx}
                      isNew={idx === rivalGigs.length - 1}
                    />
                  ))}
                </AnimatePresence>
              </div>
              <div className="gig-box flex-1 h-full border border-term-amber border-t-0 rounded-b-lg relative bg-transparent flex justify-center items-center flex-wrap gap-2 p-2 pb-6">
                <div className="label absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
                  FRIENDLY GIGS ({playerGigs.length})
                </div>
                <AnimatePresence>
                  {playerGigs.map((gig, idx) => (
                    <GigDie
                      key={`gig-${idx}-${gig.value}`}
                      gig={gig}
                      idx={idx}
                      isNew={idx === playerGigs.length - 1}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Field — droppable */}
            <DroppableZone
              id="drop-field"
              activeId={activeDragId}
              legalZones={legalZones}
              className="field-box flex-grow border border-term-amber rounded-lg relative bg-transparent p-5 flex items-center mt-5"
            >
              <div className="label absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
                FIELD {isPlayPhase ? "— drag unit here" : `— ${game?.phase}`}
              </div>
              <div className="dashed-units-area border border-dashed border-term-amber w-full h-full rounded-lg flex flex-row flex-wrap gap-2 p-2 relative z-[5] items-center justify-start">
                {/* Combat flash overlay */}
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
                {playerField.length === 0 && (
                  <span className="text-term-amber/30 text-xs font-mono w-full text-center">
                    EMPTY FIELD
                  </span>
                )}
                <AnimatePresence>
                  {playerField.map((card, idx) => (
                    <DroppableZone
                      key={`unit-${idx}`}
                      id={`drop-unit-${idx}`}
                      activeId={activeDragId}
                      legalZones={legalZones}
                      className=""
                    >
                      <div
                        onMouseEnter={() => setHoveredCard(card)}
                        onMouseLeave={() => setHoveredCard(null)}
                        onClick={() => {
                          if (isBlockingMode) {
                            onBlockerSelected?.(idx);
                            return;
                          }
                          if (isAttackPhase) {
                            if (card.isTapped) {
                              alert(
                                "Unit exhausted — Summoning Sickness or already attacked",
                              );
                              return;
                            }
                            onDeclareAttacker?.(idx);
                          }
                        }}
                        className={`cursor-pointer transition-all ${
                          card.isTapped ? "opacity-50 saturate-50" : ""
                        } ${
                          card.isAttacking
                            ? "ring-2 ring-term-green shadow-[0_0_12px_rgba(74,222,128,0.6)]"
                            : ""
                        } ${isBlockingMode ? "ring-2 ring-term-green/50 animate-pulse cursor-crosshair" : ""}`}
                      >
                        <CyberCard card={card} isNew={idx === newFieldIdx} />
                      </div>
                    </DroppableZone>
                  ))}
                </AnimatePresence>
              </div>
              <p
                className="units-text absolute left-[140px] top-1/2 -translate-y-1/2 w-[400px] text-[10px] text-term-amber/70 m-0 leading-tight pointer-events-none"
                style={{
                  textShadow:
                    "1px 1px 2px #000, -1px -1px 2px #000, 0 0 5px #000",
                }}
              >
                <strong>UNITS</strong> Drag from hand to play. Click to attack
                during ATTACK phase.
              </p>
            </DroppableZone>

            {/* Bottom Row — Legends + Eddies */}
            <div className="bottom-row h-[180px] flex gap-5">
              {/* Legends */}
              <div className="legends-container flex-1 flex flex-col gap-4">
                <div className="legends-box h-[110px] border border-term-amber rounded-lg relative bg-transparent flex p-2 gap-2">
                  <div className="label absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
                    LEGENDS
                  </div>
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={`legend-${idx}`}
                      className="legend-card flex-1 border border-dashed border-term-amber/50 rounded relative"
                    >
                      {playerLegends[idx] && (
                        <div className="relative h-full">
                          <motion.div
                            className={`cursor-pointer ${playerLegends[idx].isTapped ? "opacity-50 saturate-50" : ""}`}
                            onMouseEnter={() =>
                              setHoveredCard(playerLegends[idx])
                            }
                            onMouseLeave={() => setHoveredCard(null)}
                            onClick={() => {
                              if (isPlayPhase) onCallLegend?.(idx);
                            }}
                            whileHover={
                              isPlayPhase ? { scale: 1.05, y: -3 } : {}
                            }
                          >
                            <CyberCard card={playerLegends[idx]} />
                          </motion.div>
                          {/* GO SOLO button — only if legend is face up + has GO SOLO keyword */}
                          {playerLegends[idx].isFaceUp &&
                            playerLegends[idx].keywords?.includes("GO SOLO") &&
                            isPlayPhase && (
                              <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => onGoSolo?.(idx)}
                                className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1 py-0.5 bg-term-green text-term-black font-mono font-bold text-[7px] rounded whitespace-nowrap z-20 shadow-[0_0_8px_rgba(74,222,128,0.8)]"
                                title={`Go Solo — costs ${playerLegends[idx].cost}€`}
                              >
                                GO SOLO
                              </motion.button>
                            )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p
                  className="rules-text text-[9px] text-term-amber/70 m-0 leading-tight pt-1 pointer-events-none"
                  style={{
                    textShadow:
                      "1px 1px 2px #000, -1px -1px 2px #000, 0 0 5px #000",
                  }}
                >
                  <strong>LEGENDS</strong> Click during PLAY phase to Call
                  (costs 2 Eddies).
                </p>
              </div>

              {/* Eddies — droppable */}
              <div className="eddies-container flex-1 flex flex-col gap-4">
                <DroppableZone
                  id="drop-eddies"
                  activeId={activeDragId}
                  legalZones={legalZones}
                  className="eddies-box h-[110px] border border-term-amber rounded-lg relative bg-transparent flex p-2.5 flex-wrap gap-1.5"
                >
                  <div className="label absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
                    EDDIES {isPlayPhase ? "— drag €$ card here" : ""}
                  </div>
                  <AnimatePresence>
                    {playerEddies.map((card, idx) => (
                      <motion.div
                        key={`eddie-${idx}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: card.isTapped ? 0.4 : 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        title={
                          card.isTapped ? "Spent" : "Click to spend as Eddie"
                        }
                        className={`transition-all ${card.isTapped ? "rotate-90 cursor-not-allowed" : "cursor-pointer hover:ring-1 hover:ring-term-amber"}`}
                        onClick={() => {
                          if (!card.isTapped) {
                            card.isTapped = true;
                            onGameUpdate?.(game);
                          }
                        }}
                      >
                        <CyberCard card={card} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </DroppableZone>
                <p
                  className="rules-text text-[9px] text-term-amber/70 m-0 leading-tight pt-1 pointer-events-none"
                  style={{
                    textShadow:
                      "1px 1px 2px #000, -1px -1px 2px #000, 0 0 5px #000",
                  }}
                >
                  <strong>SELL FOR EDDIES</strong> Drag a €$ card here once per
                  turn. Click to spend.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — Deck + Trash */}
          <div className="col-right w-[120px] flex flex-col items-center gap-5">
            <div
              className="logo-box h-[60px] flex flex-col items-end justify-center w-full font-bold italic"
              style={{
                textShadow:
                  "1px 1px 2px #000, -1px -1px 2px #000, 0 0 5px #000",
              }}
            >
              <span className="text-[20px]">CYBERPUNK</span>
              <span className="text-[8px] text-term-amber/70">
                TRADING CARD GAME
              </span>
            </div>
            <div className="spacer flex-grow"></div>
            <motion.div
              className="deck-trash-box w-[100px] h-[140px] border border-term-amber rounded-lg relative bg-transparent flex justify-center items-center"
              whileHover={{
                borderColor: "rgba(247,224,24,0.8)",
                boxShadow: "0 0 12px rgba(247,224,24,0.3)",
              }}
            >
              <div className="label absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
                DECK ({playerDeck.length})
              </div>
              {playerDeck.length > 0 && (
                <CyberCard card={playerDeck[0]} isFlipped={true} />
              )}
            </motion.div>
            <div className="deck-trash-box w-[100px] h-[140px] border border-term-amber rounded-lg relative bg-transparent flex justify-center items-center">
              <div className="label absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
                TRASH
              </div>
              <AnimatePresence mode="wait">
                {playerTrash.length > 0 && (
                  <motion.div
                    key={playerTrash.length}
                    initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <CyberCard card={playerTrash[playerTrash.length - 1]} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Player Hand */}
        <div className="hand-zone w-[1200px] min-h-[140px] border-2 border-dashed border-term-amber rounded-xl bg-transparent flex justify-center items-center gap-3 p-4 relative box-border">
          <div className="label absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
            PLAYER HAND —{" "}
            {isAttackPhase
              ? "🔒 HAND LOCKED"
              : isPlayPhase
                ? "drag to FIELD (unit) or EDDIES (sell €$)"
                : game?.phase}
          </div>

          {playerHand.map((card, idx) => (
            <motion.div
              key={`hand-wrapper-${idx}`}
              onMouseEnter={() => setHoveredCard(card)}
              onMouseLeave={() => setHoveredCard(null)}
              className={isAttackPhase ? "opacity-40 pointer-events-none" : ""}
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
        </div>

        {/* Hover Preview */}
        <AnimatePresence>
          {hoveredCard && (
            <motion.div
              className="fixed top-4 right-4 z-50 w-56 bg-term-black border-2 border-term-amber rounded-lg p-3 shadow-[0_0_24px_rgba(255,191,0,0.4)] pointer-events-none"
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
                <div className="w-full h-32 bg-term-gray rounded mb-2 flex items-center justify-center text-term-amber/30 text-xs font-mono">
                  NO IMAGE
                </div>
              )}
              <div className="font-mono text-term-amber text-xs font-bold">
                {hoveredCard.name}
              </div>
              {hoveredCard.subtitle && (
                <div className="font-mono text-term-amber/50 text-[10px]">
                  {hoveredCard.subtitle}
                </div>
              )}
              <div className="font-mono text-term-green/70 text-[10px] mt-1">
                {hoveredCard.type} · {hoveredCard.faction} · Cost:{" "}
                {hoveredCard.cost}€
                {hoveredCard.cost > 0 && hoveredCard.type !== "PROGRAM" && (
                  <span className="text-term-amber ml-1">€$</span>
                )}
              </div>
              {hoveredCard.keywords?.length > 0 && (
                <div className="font-mono text-cyan-400/70 text-[9px] mt-1">
                  {hoveredCard.keywords.join(" · ")}
                </div>
              )}
              {hoveredCard.text && (
                <div className="font-mono text-term-amber/60 text-[9px] mt-1 leading-tight border-t border-term-amber/20 pt-1">
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
              className="pointer-events-none"
              animate={{ rotate: 5, scale: 1.15 }}
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
