import preconDecks from "../data/preconDecks.json";

export default function PreconDecksView({ onLoadPrecon }) {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-term-amber text-2xl font-bold font-mono mb-6">
        [PRECONSTRUCTED DECKS]
      </h2>
      <p className="text-term-green/80 font-mono mb-6">
        Official Alpha Kit starter decks. Click to load.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {preconDecks.map((deck) => (
          <div
            key={deck.id}
            className="card-container hover:border-term-green transition-all cursor-pointer"
            onClick={() => onLoadPrecon(deck)}
          >
            <h3 className="text-term-green text-xl font-bold font-mono mb-2">
              {deck.name}
            </h3>
            <p className="text-term-amber/60 text-sm font-mono mb-4">
              {deck.description}
            </p>

            {/* Legends */}
            <div className="mb-4">
              <span className="text-term-amber/80 text-xs font-mono block mb-2">
                LEGENDS:
              </span>
              <div className="space-y-1">
                {deck.legends.map((legend, idx) => (
                  <div
                    key={idx}
                    className="text-term-green/90 text-sm font-mono"
                  >
                    • {legend}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Deck Count */}
            <div className="pt-3 border-t border-term-amber/20">
              <span className="text-term-blue text-sm font-mono">
                MAIN DECK:{" "}
                {Object.values(deck.mainDeck).reduce((a, b) => a + b, 0)} cards
              </span>
            </div>

            {/* Load Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLoadPrecon(deck);
              }}
              className="w-full mt-4 bg-term-green text-term-black px-4 py-2 rounded font-mono font-bold hover:bg-green-400 transition-colors"
            >
              [LOAD DECK]
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
