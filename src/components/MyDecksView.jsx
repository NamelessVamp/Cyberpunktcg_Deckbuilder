export default function MyDecksView({ savedDecks, onLoadDeck, onDeleteDeck }) {
  if (savedDecks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-term-amber/60 text-lg font-mono mb-4">
          NO SAVED DECKS FOUND
        </p>
        <p className="text-term-green/60 text-sm font-mono">
          Build a deck and click [SAVE DECK] to save it
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {savedDecks.map((savedDeck) => (
        <div
          key={savedDeck.id}
          className="card-container hover:border-term-green transition-all"
        >
          {/* Deck Name */}
          <h3 className="text-term-amber font-bold text-lg mb-2 font-mono">
            {savedDeck.name}
          </h3>

          {/* Stats */}
          <div className="mb-3 text-sm font-mono space-y-1">
            <p className="text-term-green">
              Legends: {savedDeck.deck.legends.length}/3
            </p>
            <p className="text-term-green">
              Main: {savedDeck.deck.mainDeck.length} cards
            </p>
            <p className="text-term-amber/60 text-xs">
              Saved: {new Date(savedDeck.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Legend Preview */}
          <div className="mb-3 pb-3 border-b border-term-amber/20">
            <p className="text-term-green/60 text-xs mb-1 font-mono">LEGENDS:</p>
            {savedDeck.deck.legends.length > 0 ? (
              <div className="space-y-1">
                {savedDeck.deck.legends.map((legend, idx) => (
                  <p key={idx} className="text-term-amber text-xs font-mono truncate">
                    • {legend.name}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-term-amber/40 text-xs font-mono">None</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onLoadDeck(savedDeck)}
              className="flex-1 bg-term-green text-term-black px-3 py-2 rounded text-sm font-mono font-bold hover:bg-green-400 transition-colors"
            >
              [LOAD]
            </button>
            <button
              onClick={() => onDeleteDeck(savedDeck.id)}
              className="flex-1 bg-term-red/80 text-white px-3 py-2 rounded text-sm font-mono font-bold hover:bg-term-red transition-colors"
            >
              [DELETE]
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}