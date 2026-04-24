// EX MACHINA — Cyberpunk TCG Playmat (Official Layout)

import { useState } from "react";

export default function PlaymatView({ game, onCardClick }) {
  const player = game.players[game.activePlayer];
  const opponent = game.players[game.activePlayer === 1 ? 2 : 1];
  const [hoveredCard, setHoveredCard] = useState(null);

  // Fixer dice pool (6 dice)
  const fixerDice = [
    { type: "D20", taken: false },
    { type: "D12", taken: false },
    { type: "D10", taken: false },
    { type: "D8", taken: false },
    { type: "D6", taken: false },
    { type: "D4", taken: false },
  ];

  return (
    <div className="relative w-full aspect-[16/9] bg-term-black rounded-lg border-2 border-term-amber/40 overflow-hidden">
      {/* ========== BACKGROUND IMAGE ========== */}
      <img
        src="https://images.ctfassets.net/udihssg1zwbu/52SDFHvxiI1Bw2KX5zniz6/73aafe7019ee3e2fa91047eb5c509250/playmat.webp"
        alt="Cyberpunk TCG Playmat"
        className="absolute inset-0 w-full h-full object-cover opacity-25"
      />

      {/* ========== OPPONENT AREA (TOP - ROTATED 180°) ========== */}
      <div className="absolute top-0 left-0 right-0 h-[15%] transform rotate-180 p-2">
        <div className="flex gap-2 justify-between">
          {/* Opponent Legends (rotated) */}
          <div className="flex gap-1">
            {opponent.legends.map((legend, idx) => (
              <div
                key={idx}
                className={`w-12 h-16 border rounded text-[8px] font-mono flex items-center justify-center ${
                  legend.isFaceUp
                    ? "border-term-red bg-term-red/30 text-term-red"
                    : "border-term-red/40 bg-term-gray-light text-term-red/40"
                } ${legend.isTapped ? "opacity-50" : ""}`}
              >
                {legend.isFaceUp ? legend.name.substring(0, 3) : "XXX"}
              </div>
            ))}
          </div>

          {/* Opponent Eddies */}
          <div className="w-16 h-16 border border-term-red/40 rounded bg-term-gray/80 flex items-center justify-center">
            <div className="text-term-red font-bold font-mono text-sm">
              {opponent.eddies.length}
            </div>
          </div>
        </div>
      </div>

      {/* ========== LEFT COLUMN: FIXER (DICE POOL) ========== */}
      <div className="absolute left-2 top-[18%] bottom-[18%] w-[12%] flex flex-col justify-center gap-2">
        {fixerDice.map((dice, idx) => (
          <button
            key={dice.type}
            onClick={() => {}}
            className="aspect-square border-2 border-term-amber/60 rounded-lg bg-term-gray/80 backdrop-blur-sm flex items-center justify-center text-term-amber font-mono font-bold text-xs hover:bg-term-amber/20 transition-colors"
          >
            {dice.type}
          </button>
        ))}
      </div>

      {/* ========== RIGHT COLUMN: DECK + TRASH ========== */}
      <div className="absolute right-2 top-[18%] bottom-[18%] w-[12%] flex flex-col gap-2">
        {/* Deck */}
        <div className="flex-1 border border-term-green/60 rounded bg-term-gray/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="text-term-green text-[10px] font-mono mb-1">DECK</div>
          <div className="text-term-green text-3xl font-bold font-mono">
            {player.deck.length}
          </div>
        </div>

        {/* Trash */}
        <div className="flex-1 border border-term-amber/60 rounded bg-term-gray/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="text-term-amber text-[10px] font-mono mb-1">
            TRASH
          </div>
          <div className="text-term-amber text-2xl font-bold font-mono">
            {player.trash.length}
          </div>
        </div>
      </div>

      {/* ========== TOP: GIGS AREAS ========== */}
      <div className="absolute top-2 left-[15%] right-[15%] flex justify-between">
        {/* Rival Gigs */}
        <div className="bg-term-gray/80 border border-term-red/60 rounded px-3 py-2 backdrop-blur-sm">
          <div className="text-term-red text-[10px] font-mono mb-1">
            RIVAL GIGS
          </div>
          <div className="flex gap-1">
            {opponent.gigs.map((gig, idx) => (
              <div
                key={idx}
                className="w-8 h-8 border border-term-red rounded bg-term-red/20 flex items-center justify-center text-term-red font-bold text-sm"
              >
                {gig.value || 0}
              </div>
            ))}
          </div>
          <div className="text-term-red/60 text-xs font-mono mt-1">
            ☆ {opponent.streetCred}
          </div>
        </div>

        {/* Friendly Gigs */}
        <div className="bg-term-gray/80 border border-term-green/60 rounded px-3 py-2 backdrop-blur-sm">
          <div className="text-term-green text-[10px] font-mono mb-1">
            FRIENDLY GIGS
          </div>
          <div className="flex gap-1">
            {player.gigs.map((gig, idx) => (
              <div
                key={idx}
                className="w-8 h-8 border border-term-green rounded bg-term-green/20 flex items-center justify-center text-term-green font-bold text-sm"
              >
                {gig.value || 0}
              </div>
            ))}
          </div>
          <div className="text-term-green/60 text-xs font-mono mt-1">
            ☆ {player.streetCred}
          </div>
        </div>
      </div>

      {/* ========== CENTER: FIELD (BATTLEFIELD) ========== */}
      <div className="absolute left-[15%] right-[15%] top-[20%] bottom-[35%] border-2 border-term-amber/40 rounded bg-term-black/50 backdrop-blur-sm p-3">
        {/* Phase Indicator */}
        <div className="text-center mb-2">
          <span className="text-term-amber text-xs font-mono">
            TURN {game.turn} • {game.phase}
          </span>
          {game.isOvertime && (
            <span className="ml-2 text-term-red text-xs font-mono animate-pulse">
              ⚠️ OVERTIME
            </span>
          )}
        </div>

        <div className="h-full flex flex-col">
          {/* Opponent Field (top half) */}
          <div className="flex-1 border-b border-term-red/30 pb-2 mb-2">
            <div className="text-term-red text-[10px] font-mono mb-1">
              OPPONENT ({opponent.field.length})
            </div>
            <div className="flex gap-2 flex-wrap">
              {opponent.field.map((unit, idx) => (
                <div
                  key={idx}
                  className={`w-14 h-20 border border-term-red bg-term-red/20 rounded text-[10px] font-mono flex flex-col items-center justify-center ${
                    unit.isTapped ? "opacity-50 rotate-90" : ""
                  }`}
                >
                  <div className="text-term-red font-bold">
                    {unit.name.substring(0, 4)}
                  </div>
                  <div className="text-term-red/60 text-xs">
                    ⚔️{unit.power || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Player Field (bottom half) */}
          <div className="flex-1">
            <div className="text-term-green text-[10px] font-mono mb-1">
              YOU ({player.field.length})
            </div>
            <div className="flex gap-2 flex-wrap">
              {player.field.map((unit, idx) => (
                <div
                  key={idx}
                  onClick={() => onCardClick?.(unit, "field", idx)}
                  onMouseEnter={() => setHoveredCard(unit)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`w-14 h-20 border border-term-green bg-term-green/20 rounded text-[10px] font-mono flex flex-col items-center justify-center cursor-pointer hover:bg-term-green/40 transition-all ${
                    unit.isTapped ? "opacity-50 rotate-90" : ""
                  }`}
                >
                  <div className="text-term-green font-bold">
                    {unit.name.substring(0, 4)}
                  </div>
                  <div className="text-term-green/60 text-xs">
                    ⚔️{unit.power || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========== BOTTOM: LEGENDS + EDDIES ========== */}
      <div className="absolute left-[15%] right-[15%] bottom-[15%] flex gap-4">
        {/* Legends (3 slots) */}
        <div className="flex gap-2">
          {player.legends.map((legend, idx) => (
            <div
              key={idx}
              onClick={() => onCardClick?.(legend, "legends", idx)}
              onMouseEnter={() => setHoveredCard(legend)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`w-16 h-24 border-2 rounded flex flex-col items-center justify-center text-xs font-mono cursor-pointer hover:scale-105 transition-all ${
                legend.isFaceUp
                  ? "border-term-green bg-term-green/30 text-term-green"
                  : "border-term-green/40 bg-term-gray-light text-term-green/40"
              } ${legend.isTapped ? "opacity-50" : ""}`}
            >
              {legend.isFaceUp ? (
                <>
                  <div className="font-bold text-center px-1">
                    {legend.name.substring(0, 5)}
                  </div>
                  <div className="text-[10px] text-term-green/60 mt-1">
                    {legend.ram_color?.substring(0, 1)}
                    {legend.ram}
                  </div>
                </>
              ) : (
                <div className="text-2xl">🂠</div>
              )}
            </div>
          ))}
        </div>

        {/* Eddies */}
        <div className="flex-1 border border-term-amber/60 rounded bg-term-gray/80 backdrop-blur-sm flex items-center justify-center relative">
          {/* Stack of sold cards */}
          {player.eddies.length > 0 && (
            <div className="absolute left-2 top-2 flex">
              {player.eddies.slice(0, 3).map((_, idx) => (
                <div
                  key={idx}
                  className="w-8 h-12 border border-term-amber/40 rounded bg-term-gray"
                  style={{ marginLeft: idx > 0 ? "-20px" : 0, zIndex: idx }}
                />
              ))}
            </div>
          )}

          {/* Available Eddies count */}
          <div className="text-center z-10">
            <div className="text-term-amber text-4xl font-bold font-mono">
              {player.eddies.filter((e) => !e.isTapped).length}
            </div>
            <div className="text-term-amber/60 text-xs font-mono">
              / {player.eddies.length} EDDIES
            </div>
          </div>
        </div>
      </div>

      {/* ========== FLOATING HAND (BOTTOM) ========== */}
      <div className="absolute bottom-0 left-0 right-0 bg-term-black/95 border-t-2 border-term-green/60 p-2 backdrop-blur-md transition-transform hover:-translate-y-2">
        <div className="text-term-green text-xs font-mono mb-1">
          YOUR HAND ({player.hand.length} cards)
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {player.hand.map((card, idx) => (
            <div
              key={idx}
              onClick={() => onCardClick?.(card, "hand", idx)}
              onMouseEnter={() => setHoveredCard(card)}
              onMouseLeave={() => setHoveredCard(null)}
              className="w-16 h-24 border-2 border-term-green bg-term-green/20 rounded flex-shrink-0 flex flex-col items-center justify-between p-2 text-[10px] font-mono cursor-pointer hover:bg-term-green/30 hover:-translate-y-3 transition-all"
            >
              <div className="text-term-green font-bold text-center leading-tight">
                {card.name.substring(0, 8)}
              </div>
              <div className="text-term-green/60 text-[9px]">{card.type}</div>
              <div className="text-term-amber font-bold text-sm">
                ${card.cost || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========== CARD ZOOM ON HOVER ========== */}
      {hoveredCard && (
        <div className="absolute top-4 right-[15%] w-48 border-2 border-term-amber rounded bg-term-gray p-3 backdrop-blur-lg z-50">
          <div className="text-term-amber font-bold mb-2">
            {hoveredCard.name}
          </div>
          <div className="text-term-green/80 text-xs mb-1">
            {hoveredCard.type}
          </div>
          {hoveredCard.power !== undefined && (
            <div className="text-term-green text-sm">
              Power: {hoveredCard.power}
            </div>
          )}
          {hoveredCard.cost !== undefined && (
            <div className="text-term-amber text-sm">
              Cost: ${hoveredCard.cost}
            </div>
          )}
          {hoveredCard.text && (
            <div className="text-term-green/60 text-xs mt-2">
              {hoveredCard.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
