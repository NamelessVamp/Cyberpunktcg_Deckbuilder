// EX MACHINA — Playmat V2 with dnd-kit drag & drop
import { useState, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import CyberCard from "./simulator/CyberCard";

function DraggableCard({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });
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
      className={isDragging ? "cursor-grabbing" : "cursor-grab"}
    >
      {children}
    </div>
  );
}

function DroppableZone({ id, children, className }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`${className} transition-all ${isOver ? "ring-2 ring-term-green shadow-[0_0_16px_rgba(74,222,128,0.5)]" : ""}`}
    >
      {children}
    </div>
  );
}

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
}) {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [activeDragIdx, setActiveDragIdx] = useState(null);
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

  const rollDie = (sides, dieId) => {
    const el = document.getElementById(dieId);
    if (!el || el.classList.contains("rolling")) return;
    el.classList.add("rolling");
    setTimeout(() => {
      el.querySelector("span").textContent =
        Math.floor(Math.random() * sides) + 1;
      el.classList.remove("rolling");
    }, 300);
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

  function handleDragStart(event) {
    const idx = parseInt(event.active.id.replace("hand-", ""));
    setActiveDragIdx(idx);
    setActiveCard(playerHand[idx]);
  }

  function handleDragEnd(event) {
    const { over } = event;
    setActiveCard(null);
    setActiveDragIdx(null);
    if (!over || activeDragIdx === null) return;

    const card = playerHand[activeDragIdx];
    if (!card) return;

    if (over.id === "drop-field") {
      if (card.type === "UNIT") onPlayCard?.(activeDragIdx);
      else alert("Drop Gear/Program on a specific unit");
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

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="game-wrapper flex flex-col gap-4 items-center min-w-[1250px]">
        {/* Controls */}
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
            className="border border-term-amber px-4 py-1.5 cursor-pointer bg-term-amber/10 font-bold font-mono text-term-amber hover:bg-term-amber hover:text-black transition-all"
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
                <div
                  key={`rf-${idx}`}
                  className={`cursor-pointer ${card.isAttacking ? "ring-2 ring-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" : ""}`}
                  onClick={() => {
                    if (game?.phase === "ATTACK") {
                      if (card.isTapped) {
                        alert(
                          "Unidad agotada — ya atacó o tiene Summoning Sickness",
                        );
                        return;
                      }
                      onDeclareAttacker?.(idx);
                    }
                  }}
                >
                  <CyberCard card={card} />
                </div>
              ))
            )}
          </div>
          <span className="text-term-red/50 font-mono text-xs whitespace-nowrap">
            HAND: {rivalHand.length}
          </span>
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
          {/* LEFT — Dice / Fixer */}
          <div className="col-left w-[90px] flex flex-col justify-end gap-4">
            <div className="dice-box border border-term-amber rounded-lg flex flex-col items-center justify-evenly h-[520px] bg-transparent">
              {[
                { sides: 20, id: "die20" },
                { sides: 12, id: "die12" },
                { sides: 10, id: "die10" },
                { sides: 8, id: "die8" },
                { sides: 6, id: "die6" },
                { sides: 4, id: "die4" },
              ].map((die) => (
                <div
                  key={die.id}
                  id={die.id}
                  title="Click to roll — then drag to GIGS"
                  onClick={() => {
                    if (
                      game?.phase === "CORE" &&
                      playerFixerDice.includes(die.sides)
                    ) {
                      rollDie(die.sides, die.id); // visual animation
                      setTimeout(() => onRollGig?.(die.sides), 300); // call engine after animation
                    }
                  }}
                  className={`die-slot w-[50px] h-[50px] border border-term-amber flex justify-center items-center text-[13px] font-bold rotate-45 relative z-[100] transition-colors
  ${
    game?.phase === "CORE" && playerFixerDice.includes(die.sides)
      ? "cursor-pointer hover:bg-term-amber/40"
      : "opacity-30 cursor-not-allowed"
  }`}
                  style={{
                    textShadow:
                      "1px 1px 2px #000, -1px -1px 2px #000, 0 0 5px #000",
                  }}
                >
                  <span className="-rotate-45 pointer-events-none block">
                    D{die.sides}
                  </span>
                </div>
              ))}
            </div>
            <div className="fixer-box h-[30px] flex justify-center items-center relative">
              <div className="label absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
                {game?.phase === "CORE" && playerFixerDice.length > 0 ? (
                  <span className="text-term-green animate-pulse font-bold">
                    ▶ ROLL GIG
                  </span>
                ) : (
                  "FIXER"
                )}
              </div>
            </div>
          </div>

          {/* CENTER */}
          <div className="col-center flex-grow flex flex-col gap-4">
            {/* Gigs */}
            <div className="gigs-row flex gap-5 h-[100px] items-start -mt-5">
              <div className="gig-box flex-1 h-full border border-term-amber border-t-0 rounded-b-lg relative bg-transparent flex justify-center items-center flex-wrap gap-2.5 p-2.5 pb-6">
                <div className="label absolute top-auto bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
                  RIVAL GIGS
                </div>
                {rivalGigs.map((gig, idx) => (
                  <div
                    key={`gig-${idx}`}
                    className="w-10 h-10 border-2 border-term-amber rounded flex flex-col items-center justify-center bg-term-black cursor-default animate-bounce"
                    style={{
                      animationDuration: "0.4s",
                      animationIterationCount: 3,
                    }}
                    title={`d${gig.type}`}
                  >
                    <div className="text-term-amber font-mono font-bold text-sm">
                      {gig.value}
                    </div>
                    <div className="text-term-amber/40 font-mono text-[8px]">
                      d{gig.type}
                    </div>
                  </div>
                ))}
              </div>
              <div className="gig-box flex-1 h-full border border-term-amber border-t-0 rounded-b-lg relative bg-transparent flex justify-center items-center flex-wrap gap-2.5 p-2.5 pb-6">
                <div className="label absolute top-auto bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
                  FRIENDLY GIGS
                </div>
                {playerGigs.map((gig, idx) => (
                  <div
                    key={`gig-${idx}`}
                    className="w-10 h-10 border-2 border-term-amber rounded flex flex-col items-center justify-center bg-term-black cursor-default animate-bounce"
                    style={{
                      animationDuration: "0.4s",
                      animationIterationCount: 3,
                    }}
                    title={`d${gig.type}`}
                  >
                    <div className="text-term-amber font-mono font-bold text-sm">
                      {gig.value}
                    </div>
                    <div className="text-term-amber/40 font-mono text-[8px]">
                      d{gig.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Field — droppable */}
            <DroppableZone
              id="drop-field"
              className="field-box flex-grow border border-term-amber rounded-lg relative bg-transparent p-5 flex items-center mt-5"
            >
              <div className="label absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
                FIELD — drag unit here
              </div>
              <div className="dashed-units-area border border-dashed border-term-amber w-full h-full rounded-lg flex flex-row flex-wrap gap-2 p-2 relative z-[5] items-center justify-start">
                {playerField.length === 0 && (
                  <span className="text-term-amber/30 text-xs font-mono w-full text-center">
                    EMPTY FIELD
                  </span>
                )}
                {playerField.map((card, idx) => (
                  <DroppableZone
                    key={`unit-${idx}`}
                    id={`drop-unit-${idx}`}
                    className=""
                  >
                    <div
                      onMouseEnter={() => setHoveredCard(card)}
                      onMouseLeave={() => setHoveredCard(null)}
                      onClick={() => {
                        if (game?.phase === "ATTACK") {
                          if (card.isTapped) {
                            alert(
                              "Unidad agotada — ya atacó o tiene Summoning Sickness",
                            );
                            return;
                          }
                          onDeclareAttacker?.(idx);
                        }
                      }}
                      className={`cursor-pointer ${card.isTapped ? "opacity-50 saturate-50" : ""} ${card.isAttacking ? "ring-2 ring-term-green" : ""}`}
                    >
                      <CyberCard card={card} />
                    </div>
                  </DroppableZone>
                ))}
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

            {/* Bottom — Legends + Eddies */}
            <div className="bottom-row h-[180px] flex gap-5">
              <div className="legends-container flex-1 flex flex-col gap-4">
                <div className="legends-box h-[110px] border border-term-amber rounded-lg relative bg-transparent flex p-2 gap-2">
                  <div className="label absolute top-auto bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
                    LEGENDS
                  </div>
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={`legend-${idx}`}
                      className="legend-card flex-1 border border-dashed border-term-amber/50 rounded relative"
                    >
                      {playerLegends[idx] && (
                        <div
                          className={`cursor-pointer ${playerLegends[idx].isTapped ? "opacity-50 saturate-50" : ""}`}
                          onMouseEnter={() =>
                            setHoveredCard(playerLegends[idx])
                          }
                          onMouseLeave={() => setHoveredCard(null)}
                          onClick={() => {
                            if (game?.phase === "PLAY") onCallLegend?.(idx);
                          }}
                        >
                          <CyberCard card={playerLegends[idx]} />
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
                  className="eddies-box h-[110px] border border-term-amber rounded-lg relative bg-transparent flex p-2.5 flex-wrap gap-1.5"
                >
                  <div className="label absolute top-auto bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
                    EDDIES — drag €$ card here
                  </div>
                  {playerEddies.map((card, idx) => (
                    <div
                      key={`eddie-${idx}`}
                      title={
                        card.isTapped ? "Spent" : "Click to spend as Eddie"
                      }
                      className={`transition-all ${card.isTapped ? "opacity-40 rotate-90 cursor-not-allowed" : "cursor-pointer hover:ring-1 hover:ring-term-amber"}`}
                      onClick={() => {
                        if (!card.isTapped) {
                          card.isTapped = true;
                          onGameUpdate?.(game);
                        }
                      }}
                    >
                      <CyberCard card={card} />
                    </div>
                  ))}
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
            <div className="deck-trash-box w-[100px] h-[140px] border border-term-amber rounded-lg relative bg-transparent flex justify-center items-center">
              <div className="label absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
                DECK ({playerDeck.length})
              </div>
              {playerDeck.length > 0 && (
                <CyberCard card={playerDeck[0]} isFlipped={true} />
              )}
            </div>
            <div className="deck-trash-box w-[100px] h-[140px] border border-term-amber rounded-lg relative bg-transparent flex justify-center items-center">
              <div className="label absolute top-auto bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
                TRASH
              </div>
              {playerTrash.length > 0 && (
                <CyberCard card={playerTrash[playerTrash.length - 1]} />
              )}
            </div>
          </div>
        </div>

        {/* Player Hand */}
        <div className="hand-zone w-[1200px] min-h-[140px] border-2 border-dashed border-term-amber rounded-xl bg-transparent flex justify-center items-center gap-3 p-4 relative box-border">
          <div className="label absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
            PLAYER HAND —{" "}
            {game?.phase === "PLAY"
              ? "drag to FIELD (unit) or EDDIES (sell)"
              : game?.phase}
          </div>
          {playerHand.map((card, idx) => (
            <div
              key={`hand-wrapper-${idx}`}
              onMouseEnter={() => setHoveredCard(card)}
              onMouseLeave={() => setHoveredCard(null)}
              className="transition-transform hover:-translate-y-1"
            >
              <DraggableCard id={`hand-${idx}`}>
                <CyberCard card={card} />
              </DraggableCard>
            </div>
          ))}
        </div>

        {/* HOVER PREVIEW */}
        {hoveredCard && (
          <div className="fixed top-4 right-4 z-50 w-52 bg-term-black border-2 border-term-amber rounded-lg p-2 shadow-[0_0_20px_rgba(255,191,0,0.3)] pointer-events-none">
            {hoveredCard.image_url ? (
              <img
                src={hoveredCard.image_url}
                alt={hoveredCard.name}
                className="w-full rounded mb-2"
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
              {hoveredCard.type} · {hoveredCard.faction} · {hoveredCard.cost}€
              {hoveredCard.cost > 0 && hoveredCard.type !== "PROGRAM" && (
                <span className="text-term-amber ml-1">€$</span>
              )}
            </div>
            {hoveredCard.text && (
              <div className="font-mono text-term-amber/60 text-[10px] mt-1 leading-tight">
                {hoveredCard.text}
              </div>
            )}
          </div>
        )}

        {/* Drag Overlay */}
        <DragOverlay>
          {activeCard && (
            <div className="opacity-90 scale-110 rotate-3 shadow-2xl pointer-events-none">
              <CyberCard card={activeCard} />
            </div>
          )}
        </DragOverlay>
      </div>

      <style>{`
        .rolling { animation: shake 0.3s ease-in-out; }
        @keyframes shake {
          0%   { transform: rotate(45deg) scale(1); }
          50%  { transform: rotate(45deg) scale(1.2); background-color: #f7e018; color: #000; }
          100% { transform: rotate(45deg) scale(1); }
        }
      `}</style>
    </DndContext>
  );
}
