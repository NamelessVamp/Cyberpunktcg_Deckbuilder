import { useState } from "react";

export default function DeckArea({ deck, onRemoveCard, onClearDeck }) {
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Calculate RAM budget from legends
  const ramBudget = deck.legends.reduce(
    (acc, legend) => {
      if (legend.ram_color && legend.ram) {
        acc[legend.ram_color] = (acc[legend.ram_color] || 0) + legend.ram;
      }
      return acc;
    },
    { Red: 0, Yellow: 0, Green: 0, Blue: 0 },
  );

  // Group cards by id and count duplicates
  const groupedMainDeck = deck.mainDeck.reduce((acc, card) => {
    const existing = acc.find((item) => item.card.id === card.id);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ card, count: 1 });
    }
    return acc;
  }, []);

  // Calculate analytics
  const totalCards = deck.mainDeck.length;
  const avgCost =
    totalCards > 0
      ? (
          deck.mainDeck.reduce((sum, c) => sum + (c.cost || 0), 0) / totalCards
        ).toFixed(1)
      : 0;

  // Eddy curve (count cards by cost)
  const eddyCurve = deck.mainDeck.reduce((acc, card) => {
    const cost = card.cost !== undefined ? card.cost : "X";
    acc[cost] = (acc[cost] || 0) + 1;
    return acc;
  }, {});

  // Type distribution
  const typeDistribution = deck.mainDeck.reduce((acc, card) => {
    acc[card.type] = (acc[card.type] || 0) + 1;
    return acc;
  }, {});

  // Faction distribution
  const factionDistribution = deck.mainDeck.reduce((acc, card) => {
    if (card.faction) {
      acc[card.faction] = (acc[card.faction] || 0) + 1;
    }
    return acc;
  }, {});

  // Keyword count
  const keywordCount = deck.mainDeck.reduce((acc, card) => {
    if (card.keywords) {
      card.keywords.forEach((keyword) => {
        acc[keyword] = (acc[keyword] || 0) + 1;
      });
    }
    return acc;
  }, {});

  // RAM color distribution
  const ramColorDistribution = deck.mainDeck.reduce((acc, card) => {
    if (card.ram_color) {
      acc[card.ram_color] = (acc[card.ram_color] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="card-container p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-term-amber font-bold text-lg font-mono">
          CURRENT_DECK.DAT
        </h2>
        <button
          onClick={onClearDeck}
          disabled={deck.mainDeck.length === 0 && deck.legends.length === 0}
          className="text-term-red/80 text-sm hover:text-term-red transition-colors font-mono disabled:opacity-30 disabled:cursor-not-allowed"
        >
          [🗑️ DELETE ALL]
        </button>
      </div>

      {/* LEGENDS SECTION */}
      <div className="mb-4">
        <h3 className="text-term-green font-mono text-sm mb-2">
          LEGENDS [{deck.legends.length}/3]
        </h3>
        {deck.legends.length === 0 ? (
          <p className="text-term-amber/40 text-xs font-mono italic">
            No legends selected
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 animate-slideDown">
            {deck.legends.map((legend) => (
              <div
                key={legend.id}
                className="relative group cursor-pointer"
                onClick={() => onRemoveCard(legend, "legends")}
              >
                <img
                  src={legend.image_url}
                  alt={legend.name}
                  className="w-full h-auto rounded border border-term-green/30 group-hover:border-term-red transition-all"
                />
                <div className="absolute inset-0 bg-term-red/80 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                  <span className="text-term-black font-mono font-bold text-xs">
                    [REMOVE]
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RAM BUDGET */}
      <div className="mb-4 p-3 bg-term-gray-light rounded border border-term-amber/20 animate-slideDown">
        <h3 className="text-term-amber font-mono text-sm mb-2">RAM BUDGET</h3>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-term-red"></span>
            <span className="text-term-red">RED: {ramBudget.Red}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-term-amber"></span>
            <span className="text-term-amber">YELLOW: {ramBudget.Yellow}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-term-green"></span>
            <span className="text-term-green">GREEN: {ramBudget.Green}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-term-blue"></span>
            <span className="text-term-blue">BLUE: {ramBudget.Blue}</span>
          </div>
        </div>
      </div>

      {/* MAIN DECK SECTION */}
      <div className="mb-4">
        <h3 className="text-term-green font-mono text-sm mb-2">
          MAIN DECK [{totalCards}/40-50]
        </h3>
        {totalCards === 0 ? (
          <p className="text-term-amber/40 text-xs font-mono italic">
            No cards in deck
          </p>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 animate-slideDown">
            {groupedMainDeck.map(({ card, count }) => (
              <div
                key={card.id}
                className="relative group cursor-pointer"
                onClick={() => onRemoveCard(card, "mainDeck")}
              >
                <img
                  src={card.image_url}
                  alt={card.name}
                  className="w-full h-auto rounded border border-term-amber/30 group-hover:border-term-red transition-all"
                />
                {/* Count Badge */}
                {count > 1 && (
                  <div className="absolute top-1 right-1 bg-term-amber text-term-black rounded-full w-6 h-6 flex items-center justify-center font-mono font-bold text-xs">
                    {count}
                  </div>
                )}
                {/* Warning Badge for >3 copies */}
                {count > 3 && (
                  <div className="absolute top-1 left-1 bg-term-red text-term-black rounded-full w-6 h-6 flex items-center justify-center font-mono font-bold text-xs">
                    !
                  </div>
                )}
                {/* Remove Overlay */}
                <div className="absolute inset-0 bg-term-red/80 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                  <span className="text-term-black font-mono font-bold text-xs">
                    [REMOVE]
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ANALYTICS TOGGLE BUTTON */}
      <button
        onClick={() => setShowAnalytics(!showAnalytics)}
        className="w-full mb-3 px-4 py-2 bg-term-gray border border-term-amber/40 text-term-amber rounded font-mono font-bold text-sm hover:bg-term-amber/10 transition-all"
      >
        {showAnalytics ? "[HIDE ANALYTICS ▲]" : "[SHOW ANALYTICS ▼]"}
      </button>

      {/* COLLAPSIBLE ANALYTICS */}
      {showAnalytics && (
        <div className="p-4 bg-term-gray-light rounded border border-term-amber/20 animate-slideDown space-y-4">
          <h3 className="text-term-amber font-mono text-sm mb-3 border-b border-term-amber/20 pb-2">
            📊 DECK ANALYTICS
          </h3>

          {/* DECK SIZE WARNING */}
          {totalCards < 40 && totalCards > 0 && (
            <div className="p-2 bg-term-red/20 border border-term-red/40 rounded animate-slideDown">
              <p className="text-term-red text-xs font-mono">
                ⚠️ Deck too small ({totalCards}/40 minimum)
              </p>
            </div>
          )}
          {totalCards > 50 && (
            <div className="p-2 bg-term-red/20 border border-term-red/40 rounded animate-slideDown">
              <p className="text-term-red text-xs font-mono">
                ⚠️ Deck too large ({totalCards}/50 maximum)
              </p>
            </div>
          )}

          {/* BASIC STATS */}
          <div className="space-y-1 text-xs font-mono border-b border-term-amber/20 pb-3">
            <div className="flex justify-between">
              <span className="text-term-amber/80">Total Cards:</span>
              <span className="text-term-green font-bold">{totalCards}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-term-amber/80">Avg Eddy Cost:</span>
              <span className="text-term-green font-bold">{avgCost}€</span>
            </div>
          </div>

          {/* EDDY CURVE */}
          {totalCards > 0 && (
            <div className="border-b border-term-amber/20 pb-3">
              <h4 className="text-term-amber/80 text-xs font-mono mb-2 font-bold">
                EDDY CURVE
              </h4>
              <div className="space-y-1">
                {Object.entries(eddyCurve)
                  .sort(([a], [b]) => {
                    if (a === "X") return 1;
                    if (b === "X") return -1;
                    return Number(a) - Number(b);
                  })
                  .map(([cost, count]) => (
                    <div key={cost} className="flex items-center gap-2">
                      <span className="text-term-amber/80 text-xs font-mono w-8">
                        {cost}€:
                      </span>
                      <div className="flex-1 bg-term-gray rounded h-4 overflow-hidden">
                        <div
                          className="bg-term-green h-full transition-all duration-300"
                          style={{
                            width: `${(count / totalCards) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-term-green text-xs font-mono w-8 text-right font-bold">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
              {avgCost > 4 && (
                <div className="mt-2 p-2 bg-term-amber/20 border border-term-amber/40 rounded">
                  <p className="text-term-amber text-xs font-mono">
                    ⚠️ High avg cost ({avgCost}€) — Deck might be slow
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TYPE DISTRIBUTION */}
          {Object.keys(typeDistribution).length > 0 && (
            <div className="border-b border-term-amber/20 pb-3">
              <h4 className="text-term-amber/80 text-xs font-mono mb-2 font-bold">
                TYPE DISTRIBUTION
              </h4>
              <div className="space-y-1">
                {Object.entries(typeDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center gap-2">
                      <span className="text-term-amber/80 text-xs font-mono w-20">
                        {type}:
                      </span>
                      <div className="flex-1 bg-term-gray rounded h-4 overflow-hidden">
                        <div
                          className="bg-term-blue h-full transition-all duration-300"
                          style={{
                            width: `${(count / totalCards) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-term-blue text-xs font-mono w-8 text-right font-bold">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* FACTION BREAKDOWN */}
          {Object.keys(factionDistribution).length > 0 && (
            <div className="border-b border-term-amber/20 pb-3">
              <h4 className="text-term-amber/80 text-xs font-mono mb-2 font-bold">
                FACTION BREAKDOWN
              </h4>
              <div className="space-y-1">
                {Object.entries(factionDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([faction, count]) => (
                    <div key={faction} className="flex items-center gap-2">
                      <span className="text-term-amber/80 text-xs font-mono w-24 truncate">
                        {faction}:
                      </span>
                      <div className="flex-1 bg-term-gray rounded h-4 overflow-hidden">
                        <div
                          className="bg-term-amber h-full transition-all duration-300"
                          style={{
                            width: `${(count / totalCards) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-term-amber text-xs font-mono w-8 text-right font-bold">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* KEYWORD SUMMARY */}
          {Object.keys(keywordCount).length > 0 && (
            <div className="border-b border-term-amber/20 pb-3">
              <h4 className="text-term-amber/80 text-xs font-mono mb-2 font-bold">
                KEYWORD SUMMARY
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(keywordCount)
                  .sort(([, a], [, b]) => b - a)
                  .map(([keyword, count]) => (
                    <div
                      key={keyword}
                      className="px-2 py-1 bg-term-gray border border-term-green/40 rounded"
                    >
                      <span className="text-term-green text-xs font-mono font-bold">
                        {keyword}: {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* RAM COLOR DISTRIBUTION */}
          {Object.keys(ramColorDistribution).length > 0 && (
            <div>
              <h4 className="text-term-amber/80 text-xs font-mono mb-2 font-bold">
                RAM COLOR DISTRIBUTION
              </h4>
              <div className="space-y-1">
                {Object.entries(ramColorDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([color, count]) => (
                    <div key={color} className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          color === "Red"
                            ? "bg-term-red"
                            : color === "Yellow"
                              ? "bg-term-amber"
                              : color === "Green"
                                ? "bg-term-green"
                                : "bg-term-blue"
                        }`}
                      ></span>
                      <span className="text-term-amber/80 text-xs font-mono w-16">
                        {color}:
                      </span>
                      <div className="flex-1 bg-term-gray rounded h-4 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            color === "Red"
                              ? "bg-term-red"
                              : color === "Yellow"
                                ? "bg-term-amber"
                                : color === "Green"
                                  ? "bg-term-green"
                                  : "bg-term-blue"
                          }`}
                          style={{
                            width: `${(count / totalCards) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span
                        className={`text-xs font-mono w-8 text-right font-bold ${
                          color === "Red"
                            ? "text-term-red"
                            : color === "Yellow"
                              ? "text-term-amber"
                              : color === "Green"
                                ? "text-term-green"
                                : "text-term-blue"
                        }`}
                      >
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
