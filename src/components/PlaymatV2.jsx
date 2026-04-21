import { useState, useRef } from "react";
import CyberCard from "./simulator/CyberCard";

export default function PlaymatV2({
  game,
  onGameUpdate,
  onPlayCard,
  onSellCard,
  onCallLegend,
  onDeclareAttacker,
  onDeclareBlocker,
  onResolveCombat,
}) {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [highestZ, setHighestZ] = useState(1000);
  const [selectedHandIdx, setSelectedHandIdx] = useState(null);
  const [actionMode, setActionMode] = useState("IDLE"); // IDLE | PAYING | TARGETING
  const [pendingCardIndex, setPendingCardIndex] = useState(null);
  const [costRemaining, setCostRemaining] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const fileInputRef = useRef(null);

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setBackgroundImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const rollDie = (sides, dieId) => {
    const dieElement = document.getElementById(dieId);
    if (!dieElement || dieElement.classList.contains("rolling")) return;
    dieElement.classList.add("rolling");
    setTimeout(() => {
      const result = Math.floor(Math.random() * sides) + 1;
      dieElement.querySelector("span").textContent = result;
      dieElement.classList.remove("rolling");
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

  const rivalField = game?.players[rivalId]?.field || [];
  const rivalLegends = game?.players[rivalId]?.legends || [];
  const rivalHand = game?.players[rivalId]?.hand || [];
  const rivalGigs = game?.players[rivalId]?.gigs || [];

  return (
    <div className="game-wrapper flex flex-col gap-4 items-center">
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

      {/* RIVAL ZONE — above playmat, rotated 180deg */}
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
                  if (game?.phase === "COMBAT") onDeclareBlocker?.(idx);
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
        className="playmat w-[1200px] h-[700px] bg-transparent border-2 border-term-amber relative font-mono text-term-amber flex p-5 box-border gap-4 select-none overflow-hidden"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* LEFT COLUMN - Dice */}
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
                onClick={() => rollDie(die.sides, die.id)}
                className="die-slot w-[50px] h-[50px] border border-term-amber flex justify-center items-center text-[13px] font-bold rotate-45 cursor-grab transition-colors hover:bg-term-amber/40 relative z-[100]"
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
              FIXER
            </div>
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="col-center flex-grow flex flex-col gap-4">
          {/* Gigs Row */}
          <div className="gigs-row flex gap-5 h-[100px] items-start -mt-5">
            <div className="gig-box flex-1 h-full border border-term-amber border-t-0 rounded-b-lg relative bg-transparent flex justify-center items-center flex-wrap gap-2.5 p-2.5 pb-6">
              <div className="label absolute top-auto bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
                RIVAL GIGS
              </div>
              {rivalGigs.map((card, idx) => (
                <CyberCard key={`rival-gig-${idx}`} card={card} />
              ))}
            </div>
            <div className="gig-box flex-1 h-full border border-term-amber border-t-0 rounded-b-lg relative bg-transparent flex justify-center items-center flex-wrap gap-2.5 p-2.5 pb-6">
              <div className="label absolute top-auto bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
                FRIENDLY GIGS
              </div>
              {playerGigs.map((card, idx) => (
                <CyberCard key={`gig-${idx}`} card={card} />
              ))}
            </div>
          </div>

          {/* Field */}
          <div className="field-box flex-grow border border-term-amber rounded-lg relative bg-transparent p-5 flex items-center mt-5">
            <div className="label absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
              FIELD
            </div>
            <div className="dashed-units-area border border-dashed border-term-amber w-full h-full rounded-lg flex flex-row flex-wrap gap-2 p-2 relative z-[5] items-center justify-start">
              {playerField.length === 0 && (
                <span className="text-term-amber/30 text-xs font-mono w-full text-center">
                  EMPTY FIELD
                </span>
              )}
              {playerField.map((card, idx) => (
                <div
                  key={`field-${idx}`}
                  className={`cursor-pointer transition-all ${actionMode === "TARGETING" ? "ring-2 ring-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" : ""}`}
                  onMouseEnter={() => setHoveredCard(card)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => {
                    if (actionMode === "TARGETING") {
                      onPlayCard?.(pendingCardIndex, idx);
                      setActionMode("IDLE");
                      setPendingCardIndex(null);
                    } else if (game?.phase === "COMBAT") {
                      onDeclareAttacker?.(idx);
                    }
                  }}
                >
                  <CyberCard card={card} />
                </div>
              ))}
            </div>
            <p
              className="units-text absolute left-[140px] top-1/2 -translate-y-1/2 w-[400px] text-[10px] text-term-amber/70 m-0 leading-tight pointer-events-none"
              style={{
                textShadow:
                  "1px 1px 2px #000, -1px -1px 2px #000, 0 0 5px #000",
              }}
            >
              <strong>UNITS</strong> Are the members of your crew that attack
              your rival and their Units. Units can't attack on the turn they're
              played.
            </p>
          </div>

          {/* Bottom Row - Legends + Eddies */}
          <div className="bottom-row h-[180px] flex gap-5">
            {/* Legends */}
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
                        className={`cursor-pointer transition-all ${actionMode === "PAYING" && !playerLegends[idx]?.isTapped ? "ring-2 ring-term-amber animate-pulse" : ""}`}
                        onMouseEnter={() => setHoveredCard(playerLegends[idx])}
                        onMouseLeave={() => setHoveredCard(null)}
                        onClick={() => {
                          if (
                            actionMode === "PAYING" &&
                            !playerLegends[idx]?.isTapped
                          ) {
                            playerLegends[idx].isTapped = true;
                            const newCost = costRemaining - 1;
                            setCostRemaining(newCost);
                            if (newCost <= 0) {
                              onPlayCard?.(pendingCardIndex);
                              setActionMode("IDLE");
                              setPendingCardIndex(null);
                              setCostRemaining(0);
                            }
                          } else if (
                            actionMode === "IDLE" &&
                            game?.phase === "PLAY"
                          ) {
                            onCallLegend?.(idx);
                          }
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
                <strong>SPEND FOR EDDIES</strong> You can spend a Legend like an
                Eddie to pay a card's cost.
                <br />
                <strong>CALL A LEGEND</strong> Once per turn, you may spend 2
                Eddies to flip any Legend card.
              </p>
            </div>

            {/* Eddies */}
            <div className="eddies-container flex-1 flex flex-col gap-4">
              <div className="eddies-box h-[110px] border border-term-amber rounded-lg relative bg-transparent flex p-2.5 flex-wrap gap-1.5">
                <div className="label absolute top-auto bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
                  EDDIES
                </div>
                {playerEddies.map((card, idx) => (
                  <CyberCard key={`eddie-${idx}`} card={card} />
                ))}
              </div>
              <p
                className="rules-text text-[9px] text-term-amber/70 m-0 leading-tight pt-1 pointer-events-none"
                style={{
                  textShadow:
                    "1px 1px 2px #000, -1px -1px 2px #000, 0 0 5px #000",
                }}
              >
                <strong>SELL FOR EDDIES</strong> Once per turn, you can add
                another Eddie by selling a card with the [€$] symbol in the top
                left corner.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-right w-[120px] flex flex-col items-center gap-5">
          <div
            className="logo-box h-[60px] flex flex-col items-end justify-center w-full font-bold italic"
            style={{
              textShadow: "1px 1px 2px #000, -1px -1px 2px #000, 0 0 5px #000",
            }}
          >
            <span className="text-[20px]">CYBERPUNK</span>
            <span className="text-[8px] text-term-amber/70">
              TRADING CARD GAME
            </span>
          </div>
          <div className="spacer flex-grow"></div>

          {/* Deck */}
          <div className="deck-trash-box w-[100px] h-[140px] border border-term-amber rounded-lg relative bg-transparent flex justify-center items-center">
            <div className="label absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
              DECK
            </div>
            {playerDeck.length > 0 && (
              <CyberCard card={playerDeck[0]} isFlipped={true} />
            )}
          </div>

          {/* Trash */}
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
      <div className="hand-zone w-[1000px] min-h-[140px] border-2 border-dashed border-term-amber rounded-xl bg-transparent flex justify-center items-center gap-4 p-4 relative box-border">
        <div className="label absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-term-amber text-black px-3 py-0.5 text-[11px] font-bold rounded-xl whitespace-nowrap z-10">
          PLAYER HAND{" "}
          {game?.phase !== "PLAY" && (
            <span className="text-red-800 ml-1">({game?.phase})</span>
          )}
        </div>
        {/* HUD Banner */}
        {actionMode !== "IDLE" && (
          <div
            className={`absolute top-[-2rem] left-0 right-0 py-1 text-center text-xs font-bold font-mono uppercase tracking-widest z-30
            ${actionMode === "TARGETING" ? "bg-red-900/90 text-red-300" : "bg-term-amber/20 text-term-amber border border-term-amber"}`}
          >
            {actionMode === "TARGETING" &&
              ">>> SELECT TARGET UNIT IN FIELD <<<"}
            {actionMode === "PAYING" &&
              `>>> SELECT ${costRemaining} EDDIES OR LEGENDS TO PAY <<<`}
            <button
              onClick={() => {
                setActionMode("IDLE");
                setPendingCardIndex(null);
                setCostRemaining(0);
              }}
              className="ml-4 underline opacity-70 hover:opacity-100"
            >
              [ ABORT ]
            </button>
          </div>
        )}
        {playerHand.map((card, idx) => (
          <div
            key={`hand-${idx}`}
            className={`cursor-pointer transition-transform ${selectedHandIdx === idx ? "ring-2 ring-term-green scale-105" : "hover:scale-105"}`}
            onClick={() =>
              setSelectedHandIdx(selectedHandIdx === idx ? null : idx)
            }
            onMouseEnter={() => setHoveredCard(card)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <CyberCard card={card} />
          </div>
        ))}
        {selectedHandIdx !== null && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            <button
              disabled={game?.phase !== "PLAY"}
              onClick={() => {
                const card = playerHand[selectedHandIdx];
                if (!card) return;
                if (card.type === "GEAR" || card.type === "PROGRAM") {
                  setActionMode("TARGETING");
                  setPendingCardIndex(selectedHandIdx);
                } else {
                  if (card.cost === 0) {
                    onPlayCard?.(selectedHandIdx);
                  } else {
                    setActionMode("PAYING");
                    setPendingCardIndex(selectedHandIdx);
                    setCostRemaining(card.cost);
                  }
                }
                setSelectedHandIdx(null);
              }}
              className="px-3 py-1 bg-term-green text-term-black font-mono font-bold text-xs rounded hover:bg-green-400"
            >
              [PLAY]
            </button>
            <button
              disabled={game?.phase !== "PLAY"}
              onClick={() => {
                onSellCard?.(selectedHandIdx);
                setSelectedHandIdx(null);
              }}
              className="px-3 py-1 bg-term-amber text-term-black font-mono font-bold text-xs rounded hover:bg-yellow-400"
            >
              [SELL €$]
            </button>
            <button
              onClick={() => setSelectedHandIdx(null)}
              className="px-3 py-1 border border-term-red text-term-red font-mono font-bold text-xs rounded"
            >
              [CANCEL]
            </button>
          </div>
        )}
      </div>

      {/* CARD HOVER PREVIEW */}
      {hoveredCard && (
        <div className="fixed top-4 right-4 z-50 w-48 bg-term-black border-2 border-term-amber rounded-lg p-2 shadow-[0_0_20px_rgba(255,191,0,0.3)] pointer-events-none">
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
            {hoveredCard.type} · {hoveredCard.faction}
          </div>
          <div className="font-mono text-term-amber/60 text-[10px] mt-1 leading-tight">
            {hoveredCard.text}
          </div>
        </div>
      )}

      <style>{`
        .rolling { animation: shake 0.3s ease-in-out; }
        @keyframes shake {
          0%   { transform: rotate(45deg) scale(1); }
          50%  { transform: rotate(45deg) scale(1.2); background-color: #f7e018; color: #000; }
          100% { transform: rotate(45deg) scale(1); }
        }
      `}</style>
    </div>
  );
}
