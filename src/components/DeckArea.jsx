import { useState } from "react";
import SmartCardImage from "./SmartCardImage";
import Tooltip from "./Tooltip";
import { validateDeckLegality } from "../lib/legalityService";
import LegalityInfoModal from "./LegalityInfoModal";

export default function DeckArea({
  deck,
  onRemoveCard,
  onClearDeck,
  onShareDeck,
  allCards, // Nuevo prop necesario
}) {
  const [showLegalityModal, setShowLegalityModal] = useState(false);

  // Calculate RAM Budget
  const ramBudget = deck.legends.reduce(
    (acc, legend) => {
      if (legend.ram_color && legend.ram) {
        acc[legend.ram_color] = (acc[legend.ram_color] || 0) + legend.ram;
      }
      return acc;
    },
    { Red: 0, Yellow: 0, Green: 0, Blue: 0 },
  );

  // Legality validation
  const legalityValidation = validateDeckLegality(deck);

  return (
    <div className="card-container">
      {/* Header with DELETE ALL button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-term-amber font-bold text-xl font-mono">
          CURRENT_DECK.DAT
        </h2>
        <button
          onClick={onClearDeck}
          disabled={deck.legends.length === 0 && deck.mainDeck.length === 0}
          className="text-term-red/80 hover:text-term-red text-sm font-mono font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <span className="text-lg">🗑</span> DELETE ALL
        </button>
      </div>

      {/* LEGALITY WARNING */}
      {!legalityValidation.isLegal && (
        <div className="mb-6 bg-term-red/10 border-2 border-term-red rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-term-red font-mono font-bold text-lg mb-2 flex items-center gap-2">
                <span>🚫</span>
                <span>DECK LEGALITY ISSUES</span>
              </h3>
              <div className="space-y-1 mb-3">
                {legalityValidation.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="text-term-green/80 text-sm font-mono flex items-start gap-2"
                  >
                    <span className="text-term-red flex-shrink-0">•</span>
                    <span>{issue.message}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowLegalityModal(true)}
                className="text-term-amber hover:text-amber-400 text-xs font-mono font-bold underline"
              >
                [VIEW FULL BANLIST]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEGENDS SECTION */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-term-green font-bold font-mono">
            LEGENDS [
            <span
              className={
                deck.legends.length === 3
                  ? "text-term-green"
                  : "text-term-amber"
              }
            >
              {deck.legends.length}
            </span>
            /3]
          </h3>

          <Tooltip
            title="LEGENDS SECTION"
            content="You must include exactly 3 Legends. All 3 must be unique (no duplicates). Legends start face-down and flip for 2 Eddies to activate their abilities."
            position="bottom"
          >
            <span className="text-term-amber cursor-help">ⓘ</span>
          </Tooltip>
        </div>

        {deck.legends.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {deck.legends.map((legend, idx) => (
              <div
                key={idx}
                className="relative group cursor-pointer"
                onClick={() => onRemoveCard(legend, "legends")}
              >
                <SmartCardImage
                  card={legend}
                  className="w-full h-auto rounded"
                />

                {/* Remove Overlay */}
                <div className="absolute inset-0 bg-term-red/60 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-bold text-lg font-mono">
                    [REMOVE]
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-term-green/40 text-sm font-mono italic">
            No Legends selected
          </p>
        )}
      </div>

      {/* RAM BUDGET */}
      <div className="mb-6 p-3 bg-black/30 rounded border border-term-amber/20">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-term-green/80 font-bold font-mono text-sm">
            RAM BUDGET
          </h3>

          <Tooltip
            title="RAM BUDGET"
            content="Your 3 Legends determine which card colors you can play. Each Legend provides RAM of a specific color. Only cards matching your Legend colors are allowed in the Main Deck."
            position="bottom"
          >
            <span className="text-term-amber text-xs cursor-help hover:text-amber-300 transition-colors">
              ⓘ
            </span>
          </Tooltip>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-term-red"></span>
            <span className="text-term-red font-mono text-sm">
              RED: {ramBudget.Red}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-term-amber"></span>
            <span className="text-term-amber font-mono text-sm">
              YELLOW: {ramBudget.Yellow}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-term-green"></span>
            <span className="text-term-green font-mono text-sm">
              GREEN: {ramBudget.Green}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-term-blue"></span>
            <span className="text-term-blue font-mono text-sm">
              BLUE: {ramBudget.Blue}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN DECK SECTION */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-term-green font-bold font-mono">
            MAIN DECK [
            <span
              className={
                deck.mainDeck.length >= 40 && deck.mainDeck.length <= 50
                  ? "text-term-green"
                  : "text-term-red"
              }
            >
              {deck.mainDeck.length}
            </span>
            /40-50]
          </h3>

          <Tooltip
            title="MAIN DECK"
            content="Your Main Deck must contain 40-50 cards. Maximum 3 copies of any card (by name). Cards must match the RAM colors provided by your Legends."
            position="bottom"
          >
            <span className="text-term-amber text-xs cursor-help hover:text-amber-300 transition-colors">
              ⓘ
            </span>
          </Tooltip>
        </div>

        {deck.mainDeck.length > 0 ? (
          <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
            {(() => {
              // Group cards by ID and count
              const cardCounts = deck.mainDeck.reduce((acc, card) => {
                if (!acc[card.id]) {
                  acc[card.id] = { card, count: 0 };
                }
                acc[card.id].count++;
                return acc;
              }, {});

              // Get unique cards
              const uniqueCards = Object.values(cardCounts);

              return uniqueCards.map(({ card, count }) => (
                <div
                  key={card.id}
                  className="relative group cursor-pointer"
                  onClick={() => onRemoveCard(card, "mainDeck")}
                >
                  <SmartCardImage
                    card={card}
                    className="w-full h-auto rounded"
                  />

                  {/* Count Badge */}
                  {count > 1 && (
                    <div className="absolute bottom-1 right-1 bg-term-amber text-term-black font-mono font-bold text-xs px-1.5 py-0.5 rounded">
                      x{count}
                    </div>
                  )}
                  {/* Remove Overlay */}
                  <div className="absolute inset-0 bg-term-red/60 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-bold text-lg font-mono">
                      [REMOVE]
                    </span>
                  </div>
                </div>
              ));
            })()}
          </div>
        ) : (
          <p className="text-term-green/40 text-sm font-mono italic">
            No cards in deck
          </p>
        )}
      </div>

      {/* SHARE BUTTON */}
      <button
        onClick={onShareDeck}
        disabled={deck.mainDeck.length === 0}
        className="w-full bg-term-blue/20 border-2 border-term-blue/40 text-term-blue py-2 px-4 rounded font-mono font-bold text-sm hover:bg-term-blue/30 hover:border-term-blue transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        [🔗 SHARE DECK]
      </button>

      {/* LEGALITY MODAL */}
      {showLegalityModal && (
        <LegalityInfoModal
          onClose={() => setShowLegalityModal(false)}
          allCards={allCards}
        />
      )}
    </div>
  );
}
