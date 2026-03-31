export default function MyDecksView({
  savedDecks,
  onLoadDeck,
  onDeleteDeck,
  onDuplicateDeck,
  onRenameDeck,
  onExportAll,
  onImportAll,
}) {
  // Helper: Get unique cards with count
  const getUniqueCards = (cards) => {
    const cardMap = new Map();

    cards.forEach((card) => {
      if (cardMap.has(card.id)) {
        cardMap.get(card.id).count++;
      } else {
        cardMap.set(card.id, { card, count: 1 });
      }
    });

    return Array.from(cardMap.values());
  };

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
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-term-amber font-bold text-xl font-mono">
          MY_DECKS.DAT [{savedDecks.length}]
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onImportAll}
            className="bg-term-blue text-term-black px-3 py-1.5 rounded font-mono font-bold text-xs hover:bg-blue-400 transition-colors"
          >
            [📥 IMPORT]
          </button>
          <button
            onClick={onExportAll}
            className="bg-term-green text-term-black px-3 py-1.5 rounded font-mono font-bold text-xs hover:bg-green-400 transition-colors"
          >
            [📤 EXPORT]
          </button>
        </div>
      </div>

      {/* Decks Grid - COMPACT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {savedDecks.map((savedDeck) => {
          const uniqueMainDeck = getUniqueCards(savedDeck.deck.mainDeck);

          return (
            <div
              key={savedDeck.id}
              className="bg-term-gray border-2 border-term-amber/40 rounded p-3 hover:border-term-green transition-all"
            >
              {/* Deck Name - COMPACT */}
              <h3 className="text-term-amber font-bold text-base font-mono mb-2 border-b border-term-amber/20 pb-1 truncate">
                {savedDeck.name}
              </h3>

              {/* Stats - COMPACT */}
              <div className="mb-2 text-xs font-mono space-y-0.5">
                <p className="text-term-green">
                  ⚡ {savedDeck.deck.legends.length}/3 Legends | 📇{" "}
                  {savedDeck.deck.mainDeck.length} cards
                </p>
                <p className="text-term-amber/60 text-[10px]">
                  💾 {new Date(savedDeck.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Legend Cards - COMPACT (horizontal) */}
              {savedDeck.deck.legends.length > 0 && (
                <div className="mb-2">
                  <div className="flex gap-1">
                    {savedDeck.deck.legends.map((card, idx) => (
                      <div key={idx} className="flex-1 relative">
                        <img
                          src={card.image_url}
                          alt={card.name}
                          className="w-full h-auto rounded border border-term-amber/60"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/300x420/1a1a1a/ffb300?text=ERR";
                          }}
                        />
                        {card.ram_color && (
                          <div
                            className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${
                              card.ram_color === "Red"
                                ? "bg-term-red"
                                : card.ram_color === "Yellow"
                                  ? "bg-term-amber"
                                  : card.ram_color === "Green"
                                    ? "bg-term-green"
                                    : card.ram_color === "Blue"
                                      ? "bg-term-blue"
                                      : "bg-gray-500"
                            }`}
                          ></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Deck Preview - COMPACT */}
              {uniqueMainDeck.length > 0 && (
                <div className="mb-2">
                  <p className="text-term-green/60 text-[10px] mb-1 font-mono">
                    DECK ({uniqueMainDeck.length} unique)
                  </p>
                  <div className="grid grid-cols-6 gap-0.5">
                    {uniqueMainDeck.slice(0, 6).map(({ card, count }, idx) => (
                      <div
                        key={idx}
                        className="relative bg-term-gray-light rounded overflow-hidden"
                      >
                        <img
                          src={card.image_url}
                          alt={card.name}
                          className="w-full h-auto"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/300x420/1a1a1a/ffb300?text=ERR";
                          }}
                        />
                        {count > 1 && (
                          <div className="absolute bottom-0 right-0 bg-term-amber text-term-black font-mono font-bold text-[8px] px-0.5 rounded-tl">
                            x{count}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deck Notes - COMPACT */}
              {savedDeck.notes && savedDeck.notes.trim() !== "" && (
                <div className="mb-2 pb-2 border-b border-term-amber/20">
                  <p className="text-term-amber/80 text-[10px] font-mono line-clamp-2">
                    {savedDeck.notes}
                  </p>
                </div>
              )}

              {/* Actions - COMPACT */}
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => onLoadDeck(savedDeck)}
                  className="bg-term-green text-term-black px-2 py-1 rounded font-mono font-bold text-[10px] hover:bg-green-400 transition-colors"
                >
                  [LOAD]
                </button>
                <button
                  onClick={() => onDuplicateDeck(savedDeck.id)}
                  className="bg-term-blue text-term-black px-2 py-1 rounded font-mono font-bold text-[10px] hover:bg-blue-400 transition-colors"
                >
                  [COPY]
                </button>
                <button
                  onClick={() => onRenameDeck(savedDeck.id)}
                  className="bg-term-amber text-term-black px-2 py-1 rounded font-mono font-bold text-[10px] hover:bg-yellow-400 transition-colors"
                >
                  [RENAME]
                </button>
                <button
                  onClick={() => onDeleteDeck(savedDeck.id)}
                  className="bg-term-red text-term-black px-2 py-1 rounded font-mono font-bold text-[10px] hover:bg-red-400 transition-colors"
                >
                  [DEL]
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
