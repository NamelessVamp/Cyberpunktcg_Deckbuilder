import { useState } from "react";

function PreconCard({ deck, onLoad }) {
  const [showDetails, setShowDetails] = useState(false);

  const difficultyColors = {
    Beginner: "text-term-green border-term-green",
    Intermediate: "text-term-amber border-term-amber",
    Advanced: "text-term-red border-term-red",
  };

  const difficultyIcons = {
    Beginner: "⭐",
    Intermediate: "⭐⭐",
    Advanced: "⭐⭐⭐",
  };

  return (
    <div className="bg-term-gray border-2 border-term-green/30 rounded-lg p-4 hover:border-term-amber transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-term-amber font-mono font-bold text-lg mb-1">
            {deck.name}
          </h3>
          <div
            className={`inline-flex items-center gap-2 px-2 py-1 rounded border ${difficultyColors[deck.difficulty]} text-xs font-mono font-bold`}
          >
            <span>{difficultyIcons[deck.difficulty]}</span>
            <span>{deck.difficulty.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-term-green/80 text-sm font-mono mb-3 leading-relaxed">
        {deck.description}
      </p>

      {/* Legends Preview */}
      <div className="mb-3">
        <h4 className="text-term-blue text-xs font-mono font-bold mb-1">
          LEGENDS:
        </h4>
        <div className="flex flex-wrap gap-1">
          {deck.legends.map((legend, idx) => (
            <span
              key={idx}
              className="bg-term-blue/10 border border-term-blue/30 px-2 py-1 rounded text-xs font-mono text-term-blue"
            >
              {legend.name}
            </span>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onLoad(deck)}
          className="flex-1 bg-term-green text-term-black px-4 py-2 rounded font-mono font-bold hover:bg-green-400 transition-colors text-sm"
        >
          [LOAD DECK]
        </button>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="bg-term-amber/20 border border-term-amber text-term-amber px-4 py-2 rounded font-mono font-bold hover:bg-term-amber/30 transition-colors text-sm"
        >
          {showDetails ? "[HIDE]" : "[INFO]"}
        </button>
      </div>

      {/* Expandable Strategy Section */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-term-green/20 space-y-3">
          {/* Strategy */}
          <div>
            <h4 className="text-term-amber text-xs font-mono font-bold mb-2 flex items-center gap-2">
              <span>🎯</span>
              <span>STRATEGY</span>
            </h4>
            <p className="text-term-green/70 text-xs font-mono leading-relaxed">
              {deck.strategy}
            </p>
          </div>

          {/* Key Cards */}
          <div>
            <h4 className="text-term-amber text-xs font-mono font-bold mb-2 flex items-center gap-2">
              <span>🃏</span>
              <span>KEY CARDS</span>
            </h4>
            <ul className="space-y-1">
              {deck.keyCards.map((card, idx) => (
                <li
                  key={idx}
                  className="text-term-green/70 text-xs font-mono flex items-start gap-2"
                >
                  <span className="text-term-amber flex-shrink-0">►</span>
                  <span>{card}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Deck Stats */}
          <div className="bg-term-black/40 border border-term-blue/30 rounded p-3">
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-term-blue/60">Legends:</span>
                <span className="text-term-green ml-2 font-bold">
                  {deck.legends.length}
                </span>
              </div>
              <div>
                <span className="text-term-blue/60">Main Deck:</span>
                <span className="text-term-green ml-2 font-bold">
                  {deck.mainDeck.reduce((sum, card) => sum + card.count, 0)}{" "}
                  cards
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PreconCard;
