import { useState } from "react";
import DeckAnalytics from "./DeckAnalytics";

export default function DeckArea({ deck, onRemoveCard, onClearDeck }) {
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Calcular RAM budget dinámico
  const ramBudget = deck.legends.reduce(
    (acc, legend) => {
      if (legend.ram_color && legend.ram) {
        acc[legend.ram_color] = (acc[legend.ram_color] || 0) + legend.ram;
      }
      return acc;
    },
    { Red: 0, Yellow: 0, Green: 0, Blue: 0 },
  );

  // Contar copias de cada carta
  const cardCounts = deck.mainDeck.reduce((acc, card) => {
    acc[card.id] = (acc[card.id] || 0) + 1;
    return acc;
  }, {});

  // Validaciones
  const validations = {
    legends: {
      valid: deck.legends.length === 3,
      message:
        deck.legends.length === 3
          ? "✅ 3 Leyendas únicas"
          : `⚠️ Necesitas ${3 - deck.legends.length} Leyendas más`,
    },
    deckSize: {
      valid: deck.mainDeck.length >= 40 && deck.mainDeck.length <= 50,
      message:
        deck.mainDeck.length < 40
          ? `⚠️ Necesitas ${40 - deck.mainDeck.length} cartas más (mínimo 40)`
          : deck.mainDeck.length > 50
            ? `❌ Excedes por ${deck.mainDeck.length - 50} cartas (máximo 50)`
            : `✅ ${deck.mainDeck.length} cartas (válido)`,
    },
    copies: {
      valid: Object.values(cardCounts).every((count) => count <= 3),
      message: Object.entries(cardCounts).some(([id, count]) => count > 3)
        ? `❌ Tienes más de 3 copias de alguna carta`
        : "✅ Límite de copias respetado",
    },
  };

  const isValid =
    validations.legends.valid &&
    validations.deckSize.valid &&
    validations.copies.valid;

  return (
    <div className="card-container max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* DELETE ALL BUTTON */}
      {(deck.legends.length > 0 || deck.mainDeck.length > 0) && (
        <button
          onClick={onClearDeck}
          className="w-full mb-4 bg-term-red/20 border border-term-red/40 text-term-red px-3 py-2 rounded font-mono text-sm font-bold hover:bg-term-red/30 transition-colors"
        >
          [🗑️ DELETE ALL]
        </button>
      )}

      {/* LEGENDS AREA - VISUAL GALLERY */}
      <div className="mb-6 card-container">
        <h2 className="text-term-amber font-bold mb-3 font-mono">
          LEGENDS [{deck.legends.length}/3]
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {deck.legends.map((legend) => (
            <div
              key={legend.id}
              className="relative group cursor-pointer"
              onClick={() => onRemoveCard(legend, "legends")}
            >
              <div className="relative overflow-hidden rounded border-2 border-term-green/50 hover:border-term-red transition-all">
                <img
                  src={legend.image_url}
                  alt={legend.name}
                  className="w-full h-auto"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/150x210/1a1a1a/00ff00?text=LEGEND";
                  }}
                />
                {/* Remove Indicator */}
                <div className="absolute inset-0 bg-term-red/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-mono text-sm font-bold">
                    [REMOVE]
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RAM BUDGET */}
      <div className="mb-6 card-container">
        <h2 className="text-term-amber font-bold mb-3 font-mono">RAM BUDGET</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-term-red"></span>
            <span className="text-term-green font-mono text-sm">
              RED: {ramBudget.Red}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-term-amber"></span>
            <span className="text-term-green font-mono text-sm">
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
            <span className="text-term-green font-mono text-sm">
              BLUE: {ramBudget.Blue}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN DECK - VISUAL GALLERY */}
      <div className="flex-1 card-container overflow-hidden flex flex-col mb-6">
        <h2 className="text-term-amber font-bold mb-3 font-mono">
          MAIN DECK [{deck.mainDeck.length}/40-50]
        </h2>
        <div className="flex-1 overflow-y-auto">
          {deck.mainDeck.length === 0 ? (
            <p className="text-term-amber/40 text-sm font-mono text-center py-8">
              EMPTY // ADD CARDS FROM LEFT PANEL
            </p>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {Object.entries(
                deck.mainDeck.reduce((acc, card) => {
                  acc[card.id] = acc[card.id] || { card, count: 0 };
                  acc[card.id].count++;
                  return acc;
                }, {}),
              ).map(([cardId, { card, count }]) => (
                <div
                  key={cardId}
                  className="relative group cursor-pointer"
                  onClick={() => onRemoveCard(card, "main")}
                >
                  {/* Card Image */}
                  <div className="relative overflow-hidden rounded border border-term-amber/30 hover:border-term-red transition-all">
                    <img
                      src={card.image_url}
                      alt={card.name}
                      className="w-full h-auto"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/150x210/1a1a1a/ffb300?text=ERROR";
                      }}
                    />
                    {/* Count Badge */}
                    {count > 1 && (
                      <div className="absolute top-1 right-1 bg-term-amber text-term-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold font-mono shadow-lg">
                        {count}
                      </div>
                    )}
                    {/* Warning Badge for 4+ copies */}
                    {count > 3 && (
                      <div className="absolute top-1 left-1 bg-term-red text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        !
                      </div>
                    )}
                    {/* Remove Indicator */}
                    <div className="absolute inset-0 bg-term-red/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-mono text-sm font-bold">
                        [REMOVE]
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* VALIDATIONS */}
      <div className="card-container mb-6">
        <h2 className="text-term-amber font-bold mb-3 font-mono">
          VALIDATOR.SYS
        </h2>
        <div className="space-y-1">
          <p
            className={`text-xs font-mono ${
              validations.legends.valid ? "text-term-green" : "text-term-amber"
            }`}
          >
            {validations.legends.message}
          </p>
          <p
            className={`text-xs font-mono ${
              validations.deckSize.valid ? "text-term-green" : "text-term-amber"
            }`}
          >
            {validations.deckSize.message}
          </p>
          <p
            className={`text-xs font-mono ${
              validations.copies.valid ? "text-term-green" : "text-term-red"
            }`}
          >
            {validations.copies.message}
          </p>
        </div>
        {isValid && (
          <div className="mt-3 p-2 bg-term-green/10 border border-term-green rounded">
            <p className="text-term-green text-sm font-bold font-mono text-center">
              ✅ DECK IS VALID
            </p>
          </div>
        )}
      </div>

      {/* ANALYTICS TOGGLE */}
      {deck.mainDeck.length > 0 && (
        <div>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="w-full mb-3 bg-term-gray border border-term-amber/40 text-term-amber px-3 py-2 rounded font-mono text-sm font-bold hover:bg-term-amber/10 transition-colors"
          >
            [{showAnalytics ? "▼ HIDE" : "▶ SHOW"} ANALYTICS]
          </button>

          {showAnalytics && <DeckAnalytics deck={deck} />}
        </div>
      )}
    </div>
  );
}
