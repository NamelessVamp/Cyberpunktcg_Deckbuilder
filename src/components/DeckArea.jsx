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

      {/* LEGENDS AREA */}
      <div className="mb-6 card-container">
        <h2 className="text-term-amber font-bold mb-3 font-mono">
          LEGENDS [{deck.legends.length}/3]
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`border-2 border-dashed rounded p-2 h-32 flex items-center justify-center ${
                deck.legends[index]
                  ? "border-term-green bg-term-green/5"
                  : "border-term-amber/30"
              }`}
            >
              {deck.legends[index] ? (
                <div className="text-center">
                  <p className="text-term-green text-xs font-bold font-mono">
                    {deck.legends[index].name}
                  </p>
                  <p className="text-term-amber/60 text-xs font-mono">
                    {deck.legends[index].subtitle}
                  </p>
                  <button
                    onClick={() => onRemoveCard(deck.legends[index], "legends")}
                    className="text-term-red text-xs mt-2 hover:text-red-400 font-mono"
                  >
                    [REMOVE]
                  </button>
                </div>
              ) : (
                <span className="text-term-amber/40 text-xs font-mono">
                  EMPTY
                </span>
              )}
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

      {/* MAIN DECK */}
      <div className="flex-1 card-container overflow-hidden flex flex-col">
        <h2 className="text-term-amber font-bold mb-3 font-mono">
          MAIN DECK [{deck.mainDeck.length}/40-50]
        </h2>
        <div className="flex-1 overflow-y-auto">
          {deck.mainDeck.length === 0 ? (
            <p className="text-term-amber/40 text-sm font-mono text-center py-8">
              EMPTY // ADD CARDS FROM LEFT PANEL
            </p>
          ) : (
            <div className="space-y-2">
              {Object.entries(
                deck.mainDeck.reduce((acc, card) => {
                  if (!acc[card.id]) {
                    acc[card.id] = { card, count: 0 };
                  }
                  acc[card.id].count++;
                  return acc;
                }, {}),
              ).map(([id, { card, count }]) => (
                <div
                  key={id}
                  className="flex items-center justify-between p-2 bg-term-gray-light rounded hover:bg-term-amber/5"
                >
                  <div className="flex-1">
                    <p
                      className={`text-sm font-mono ${
                        count > 3 ? "text-term-red" : "text-term-green"
                      }`}
                    >
                      {count}x {card.name}
                    </p>
                    <p className="text-xs text-term-amber/60 font-mono">
                      {card.type} // {card.faction || "NO FACTION"}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveCard(card, "mainDeck")}
                    className="text-term-red text-xs hover:text-red-400 font-mono"
                  >
                    [-]
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* VALIDATIONS */}
      <div className="mt-6 card-container">
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
        <div className="mt-6">
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
