import { useState } from "react";
import SmartCardImage from "./SmartCardImage";
import Tooltip from "./Tooltip";
import { validateDeckLegality } from "../lib/legalityService";
import LegalityInfoModal from "./LegalityInfoModal";
import DeckAnalytics from "./DeckAnalytics";
import SuggestedCards from "./SuggestedCards";
import DeckCardActions from "./DeckCardActions"; // ← NUEVO
import CardPreviewModal from "./CardPreviewModal"; // ← NUEVO

export default function DeckArea({
  deck,
  onRemoveCard,
  onClearDeck,
  onShareDeck,
  allCards,
  showAnalytics,
  onToggleAnalytics,
  onGenerateProxies,
  onAddToDeck,
  onAddToSideboard,
  freeBuildMode,
  onToggleFreeBuild,
}) {
  const [showLegalityModal, setShowLegalityModal] = useState(false);
  const [previewCard, setPreviewCard] = useState(null);
  const [previewDeckInfo, setPreviewDeckInfo] = useState({
    count: 0,
    location: null,
  });

  // Handlers for card actions
  const handlePreview = (card, count = 1, location = null) => {
    setPreviewCard(card);
    setPreviewDeckInfo({ count, location });
  };

  const handleMoveToSideboard = (card) => {
    // Remove ONE copy from mainDeck
    onRemoveCard(card, "mainDeck");

    // Add to sideboard
    onAddToSideboard(card, 1);
  };

  const handleMoveToMainDeck = (card) => {
    // Remove ONE copy from sideboard
    onRemoveCard(card, "sideboard");

    // Add to main deck
    onAddToDeck(card, 1);
  };

  const handleEditQuantity = (card, newQuantity, location) => {
    // Count current quantity
    const currentCount = deck[location].filter((c) => c.id === card.id).length;
    const diff = newQuantity - currentCount;

    if (diff > 0) {
      // Add more copies
      for (let i = 0; i < diff; i++) {
        onAddToDeck(card, 1, location);
      }
    } else if (diff < 0) {
      // Remove copies
      for (let i = 0; i < Math.abs(diff); i++) {
        onRemoveCard(card, location);
      }
    }
  };

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

  // Calculate RAM Used by main deck
  const ramUsed = deck.mainDeck.reduce(
    (acc, card) => {
      if (card.ram_color && card.ram) {
        acc[card.ram_color] = (acc[card.ram_color] || 0) + card.ram;
      }
      return acc;
    },
    { Red: 0, Yellow: 0, Green: 0, Blue: 0 },
  );

  // Legality validation
  const legalityValidation = validateDeckLegality(deck);

  return (
    <div className="bg-term-gray border border-term-amber/40 rounded p-4">
      {/* HEADER WITH DELETE ALL */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-term-amber font-bold text-xl font-mono">
          CURRENT_DECK.DAT
        </h2>
        <button
          onClick={onClearDeck}
          disabled={
            deck.legends.length === 0 &&
            deck.mainDeck.length === 0 &&
            deck.sideboard.length === 0
          }
          className="text-term-red/80 hover:text-term-red text-sm font-mono font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <span className="text-lg">🗑</span> DELETE ALL
        </button>
      </div>

      {/* SCROLLABLE CONTENT WRAPPER */}
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2 space-y-6">
        {/* LEGALITY WARNING */}
        {!legalityValidation.isLegal && (
          <div className="bg-term-red/10 border-2 border-term-red rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-term-red font-mono font-bold text-lg mb-2 flex items-center gap-2">
                  <span>⊘</span>
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
        <div>
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
                <div key={idx} className="relative group">
                  <SmartCardImage
                    card={legend}
                    className="w-full h-auto rounded"
                  />

                  <DeckCardActions
                    card={legend}
                    count={1}
                    location="legends"
                    onPreview={() => handlePreview(legend, 1, "legends")} // Asegúrate que esté así
                    onRemove={onRemoveCard}
                  />
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
        <div className="p-3 bg-black/30 rounded border border-term-amber/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
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

            {/* FREE BUILD MODE TOGGLE */}
            <button
              onClick={onToggleFreeBuild}
              className={`text-xs font-mono font-bold px-2 py-1 rounded transition-colors ${
                freeBuildMode
                  ? "bg-term-amber text-term-black"
                  : "bg-term-gray border border-term-amber/40 text-term-amber hover:bg-term-amber/20"
              }`}
              title="Toggle RAM validation - build decks without Legend restrictions"
            >
              {freeBuildMode ? "✓ FREE BUILD" : "FREE BUILD"}
            </button>
          </div>

          {!freeBuildMode && (
            <div className="space-y-2">
              {[
                {
                  color: "Red",
                  bg: "bg-red-500",
                  text: "text-red-400",
                  border: "border-red-500/40",
                },
                {
                  color: "Yellow",
                  bg: "bg-yellow-400",
                  text: "text-yellow-400",
                  border: "border-yellow-400/40",
                },
                {
                  color: "Green",
                  bg: "bg-green-500",
                  text: "text-green-400",
                  border: "border-green-500/40",
                },
                {
                  color: "Blue",
                  bg: "bg-blue-500",
                  text: "text-blue-400",
                  border: "border-blue-500/40",
                },
              ].map(({ color, bg, text, border }) => {
                const budget = ramBudget[color] || 0;
                const used = ramUsed[color] || 0;
                const pct =
                  budget > 0 ? Math.min((used / budget) * 100, 100) : 0;
                const over = used > budget;
                if (budget === 0 && used === 0) return null;
                return (
                  <div key={color}>
                    <div className="flex justify-between items-center mb-0.5">
                      <span className={`font-mono text-xs font-bold ${text}`}>
                        {color.toUpperCase()}
                      </span>
                      <span
                        className={`font-mono text-xs font-bold ${over ? "text-red-400 animate-pulse" : text}`}
                      >
                        {used} / {budget} RAM {over ? "⚠ OVER LIMIT!" : ""}
                      </span>
                    </div>
                    <div
                      className={`w-full h-2 bg-black/50 rounded-full border ${border}`}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${over ? "bg-red-500" : bg}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {deck.legends.length === 0 && (
                <p className="text-term-amber/40 text-xs font-mono italic">
                  Add Legends to see RAM budget
                </p>
              )}
            </div>
          )}

          {freeBuildMode && (
            <p className="text-term-amber/60 text-xs font-mono italic mt-2">
              RAM validation disabled. You can add any cards regardless of
              Legend colors.
            </p>
          )}
        </div>

        {/* MAIN DECK SECTION */}
        <div>
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
            <div className="grid grid-cols-4 gap-2">
              {(() => {
                const cardCounts = deck.mainDeck.reduce((acc, card) => {
                  if (!acc[card.id]) {
                    acc[card.id] = { card, count: 0 };
                  }
                  acc[card.id].count++;
                  return acc;
                }, {});

                const uniqueCards = Object.values(cardCounts);

                return uniqueCards.map(({ card, count }) => (
                  <div
                    key={card.id}
                    className="relative group cursor-pointer"
                    onClick={() => handlePreview(card, count, "mainDeck")}
                  >
                    <SmartCardImage
                      card={card}
                      className="w-full h-auto rounded"
                    />
                    <div className="absolute bottom-1 right-1 bg-term-amber text-term-black font-mono font-bold text-xs px-1.5 py-0.5 rounded z-10">
                      x{count}
                    </div>
                    <div className="absolute inset-0 bg-black/20 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-mono text-[10px] font-bold bg-black/60 px-2 py-1 rounded">
                        CLICK TO EDIT
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

        {/* SIDEBOARD SECTION */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-term-blue font-bold font-mono">
              SIDEBOARD [
              <span
                className={
                  deck.sideboard.length <= 15
                    ? "text-term-green"
                    : "text-term-red"
                }
              >
                {deck.sideboard.length}
              </span>
              /15]
            </h3>

            <Tooltip
              title="SIDEBOARD"
              content="Optional 0-15 card pool for post-game 1 adjustments. Same deck building rules apply (max 3 copies by name). Sideboard cards do NOT count toward Main Deck total."
              position="bottom"
            >
              <span className="text-term-blue text-xs cursor-help">ⓘ</span>
            </Tooltip>
          </div>

          {deck.sideboard.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {(() => {
                const cardCounts = deck.sideboard.reduce((acc, card) => {
                  if (!acc[card.id]) {
                    acc[card.id] = { card, count: 0 };
                  }
                  acc[card.id].count++;
                  return acc;
                }, {});

                const uniqueCards = Object.values(cardCounts);

                return uniqueCards.map(({ card, count }) => (
                  <div key={card.id} className="relative group">
                    <SmartCardImage
                      card={card}
                      className="w-full h-auto rounded"
                    />

                    {count > 1 && (
                      <div className="absolute bottom-1 right-1 bg-term-blue text-white font-mono font-bold text-xs px-1.5 py-0.5 rounded z-10">
                        x{count}
                      </div>
                    )}

                    <DeckCardActions
                      card={card}
                      count={count}
                      location="sideboard" // Esto ya lo tienes bien
                      onPreview={() => handlePreview(card, count, "sideboard")} // CAMBIA ESTA LÍNEA
                      onRemove={onRemoveCard}
                      onMoveToMainDeck={handleMoveToMainDeck}
                      onEditQuantity={handleEditQuantity}
                    />
                  </div>
                ));
              })()}
            </div>
          ) : (
            <div className="bg-term-blue/5 border border-term-blue/20 rounded p-4 text-center">
              <p className="text-term-blue/60 text-sm font-mono italic mb-2">
                No sideboard cards
              </p>
              <p className="text-term-blue/40 text-xs font-mono">
                Add cards here for post-game 1 adjustments
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={onShareDeck}
          disabled={deck.legends.length === 0 && deck.mainDeck.length === 0}
          className="w-full bg-term-green/20 hover:bg-term-green/40 text-term-green border border-term-green/40 rounded py-2 font-mono font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          [SHARE DECK]
        </button>

        <button
          onClick={onToggleAnalytics}
          disabled={deck.mainDeck.length === 0}
          className="w-full bg-term-amber/20 hover:bg-term-amber/40 text-term-amber border border-term-amber/40 rounded py-2 font-mono font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {showAnalytics ? "[HIDE ANALYTICS]" : "[SHOW ANALYTICS]"}
        </button>
      </div>

      {/* GENERATE PROXIES BUTTON */}
      {deck.mainDeck.length > 0 && (
        <button
          onClick={onGenerateProxies}
          className="w-full mt-2 bg-term-blue/20 hover:bg-term-blue/40 text-term-blue border border-term-blue/40 rounded py-2 font-mono font-bold transition-colors"
        >
          [GENERATE PROXIES]
        </button>
      )}

      {/* SUGGESTED CARDS */}
      <SuggestedCards
        deck={deck}
        allCards={allCards}
        onAddCard={(card) => onAddToDeck(card, 1)}
      />

      {/* DECK ANALYTICS */}
      {showAnalytics && deck.mainDeck.length > 0 && (
        <div className="mt-4">
          <DeckAnalytics deck={deck} />
        </div>
      )}

      {/* LEGALITY MODAL */}
      {showLegalityModal && (
        <LegalityInfoModal
          onClose={() => setShowLegalityModal(false)}
          allCards={allCards}
        />
      )}

      {/* CARD PREVIEW MODAL */}
      {previewCard && (
        <CardPreviewModal
          card={previewCard}
          onClose={() => setPreviewCard(null)}
          onAddToDeck={onAddToDeck}
          onAddToSideboard={onAddToSideboard}
          isLoggedIn={false}
          // Props de deck context
          deckCount={previewDeckInfo.count}
          deckLocation={previewDeckInfo.location}
          onRemoveFromDeck={(card) =>
            onRemoveCard(card, previewDeckInfo.location)
          }
          onMoveToSideboard={
            previewDeckInfo.location === "mainDeck"
              ? handleMoveToSideboard
              : null
          }
          onMoveToMainDeck={
            previewDeckInfo.location === "sideboard"
              ? handleMoveToMainDeck
              : null
          }
        />
      )}

      {showLegalityModal && (
        <LegalityInfoModal onClose={() => setShowLegalityModal(false)} />
      )}
    </div>
  );
}
