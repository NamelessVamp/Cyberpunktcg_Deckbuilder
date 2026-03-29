export default function MyDecksView({
  savedDecks,
  onLoadDeck,
  onDeleteDeck,
  onDuplicateDeck,
  onRenameDeck,
  onExportAll,
  onImportAll,
}) {
  if (savedDecks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-term-amber/60 text-lg font-mono mb-4">
          NO SAVED DECKS FOUND
        </p>
        <p className="text-term-green/60 text-sm font-mono">
          Build a deck and click [SAVE] to save it
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Export/Import buttons */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-term-amber font-bold text-2xl font-mono">
          MY_DECKS.DAT [{savedDecks.length}]
        </h2>
        <div className="flex gap-3">
          <button
            onClick={onImportAll}
            className="bg-term-blue text-term-black px-4 py-2 rounded font-mono font-bold text-sm hover:bg-blue-400 transition-colors"
          >
            [📥 IMPORT ALL]
          </button>
          <button
            onClick={onExportAll}
            className="bg-term-green text-term-black px-4 py-2 rounded font-mono font-bold text-sm hover:bg-green-400 transition-colors"
          >
            [📤 EXPORT ALL]
          </button>
        </div>
      </div>

      {/* Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedDecks.map((savedDeck) => (
          <div
            key={savedDeck.id}
            className="card-container hover:border-term-green transition-all"
          >
            {/* Deck Preview Image */}
            {(savedDeck.deck.legends.length > 0 ||
              savedDeck.deck.mainDeck.length > 0) && (
              <div className="mb-3 overflow-hidden rounded bg-term-gray-light">
                <img
                  src={
                    savedDeck.deck.legends.length > 0
                      ? savedDeck.deck.legends[0].image_url
                      : savedDeck.deck.mainDeck[0].image_url
                  }
                  alt={
                    savedDeck.deck.legends.length > 0
                      ? savedDeck.deck.legends[0].name
                      : savedDeck.deck.mainDeck[0].name
                  }
                  className="w-full h-auto"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x420/1a1a1a/ffb300?text=NO+IMAGE";
                  }}
                />
              </div>
            )}

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
              <p className="text-term-green/60 text-xs mb-1 font-mono">
                LEGENDS:
              </p>
              {savedDeck.deck.legends.length > 0 ? (
                <div className="space-y-1">
                  {savedDeck.deck.legends.map((legend, idx) => (
                    <p
                      key={idx}
                      className="text-term-amber text-xs font-mono truncate"
                    >
                      • {legend.name}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-term-amber/40 text-xs font-mono">None</p>
              )}
            </div>

            {/* Deck Notes */}
            {savedDeck.notes && savedDeck.notes.trim() !== "" && (
              <div className="mb-3 pb-3 border-b border-term-amber/20">
                <p className="text-term-green/60 text-xs mb-1 font-mono">
                  NOTES:
                </p>
                <p className="text-term-amber/80 text-xs font-mono whitespace-pre-wrap">
                  {savedDeck.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              {/* First Row: LOAD + COPY */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onLoadDeck(savedDeck)}
                  className="bg-term-green text-term-black px-3 py-2 rounded font-mono font-bold text-xs hover:bg-green-400 transition-colors"
                >
                  [LOAD]
                </button>
                <button
                  onClick={() => onDuplicateDeck(savedDeck.id)}
                  className="bg-term-blue text-term-black px-3 py-2 rounded font-mono font-bold text-xs hover:bg-blue-400 transition-colors"
                >
                  [COPY]
                </button>
              </div>

              {/* Second Row: RENAME + DELETE */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onRenameDeck(savedDeck.id)}
                  className="bg-term-amber text-term-black px-3 py-2 rounded font-mono font-bold text-xs hover:bg-yellow-400 transition-colors"
                >
                  [RENAME]
                </button>
                <button
                  onClick={() => onDeleteDeck(savedDeck.id)}
                  className="bg-term-red text-term-black px-3 py-2 rounded font-mono font-bold text-xs hover:bg-red-400 transition-colors"
                >
                  [DEL]
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
