import SmartCardImage from "./SmartCardImage";
import DeckImageExport from "./DeckImageExport";

export default function MyDecksView({
  savedDecks,
  onLoadDeck,
  onDeleteDeck,
  onDuplicateDeck,
  onRenameDeck,
  onExportAll,
  onImportAll,
  onPublishDeck,
  onUnpublishDeck,
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
        {savedDecks.map((savedDeck) => {
          // Get unique cards from main deck with counts
          const mainDeckCounts = savedDeck.deck.mainDeck.reduce((acc, card) => {
            if (!acc[card.id]) {
              acc[card.id] = { card, count: 0 };
            }
            acc[card.id].count++;
            return acc;
          }, {});

          const uniqueMainCards = Object.values(mainDeckCounts);

          // Combine legends + first 3 unique main deck cards for preview
          const previewCards = [
            ...savedDeck.deck.legends,
            ...uniqueMainCards.slice(0, 3).map((item) => item.card),
          ];

          return (
            <div
              key={savedDeck.id}
              className="card-container hover:border-term-green transition-all"
            >
              {/* Deck Name */}
              <h3 className="text-term-amber font-bold text-lg mb-3 font-mono">
                {savedDeck.name}
              </h3>

              {/* Stats */}
              <div className="mb-3 text-sm font-mono flex items-center gap-4">
                <span className="text-term-green">
                  ⚡ {savedDeck.deck.legends.length}/3 Legends
                </span>
                <span className="text-term-green">
                  📇 {savedDeck.deck.mainDeck.length} cards
                </span>
              </div>

              {/* Saved Date */}
              <p className="text-term-amber/60 text-xs font-mono mb-3">
                💾 {new Date(savedDeck.createdAt).toLocaleDateString()}
              </p>

              {/* Card Preview Grid */}
              {previewCards.length > 0 && (
                <div className="mb-4">
                  <p className="text-term-green/60 text-xs mb-2 font-mono">
                    DECK ({uniqueMainCards.length} unique)
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {previewCards.map((card, idx) => {
                      // Find count for this card if it's from main deck
                      const isLegend = savedDeck.deck.legends.some(
                        (l) => l.id === card.id,
                      );
                      const cardCount = isLegend
                        ? 1
                        : mainDeckCounts[card.id]?.count || 1;

                      return (
                        <div key={`${card.id}-${idx}`} className="relative">
                          <SmartCardImage
                            card={card}
                            className="w-full h-auto rounded"
                          />

                          {/* Count Badge */}
                          {cardCount > 1 && (
                            <div className="absolute bottom-1 right-1 bg-term-amber text-term-black font-mono font-bold text-xs px-1.5 py-0.5 rounded">
                              x{cardCount}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Deck Notes */}
              {savedDeck.notes && savedDeck.notes.trim() !== "" && (
                <div className="mb-3 pb-3 border-b border-term-amber/20">
                  <p className="text-term-green/60 text-xs mb-1 font-mono">
                    NOTES:
                  </p>
                  <p className="text-term-amber/80 text-xs font-mono whitespace-pre-wrap line-clamp-2">
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

                <DeckImageExport
                  deck={savedDeck.deck}
                  deckName={savedDeck.name}
                  authorName="RUNNER"
                  shareUrl={`${window.location.origin}/?d=${btoa(JSON.stringify({ legends: savedDeck.deck.legends?.map((c) => c.id) || [], mainDeck: savedDeck.deck.mainDeck?.map((c) => c.id) || [], sideboard: [] }))}`}
                  className="w-full mt-1 py-2 border border-term-amber/40 text-term-amber/80 rounded hover:bg-term-amber/10"
                />

                {/* Third Row: PUBLISH */}
                {onPublishDeck && (
                  <button
                    onClick={() =>
                      savedDeck.deck.visibility === "public"
                        ? onUnpublishDeck(savedDeck.id)
                        : onPublishDeck(savedDeck.id)
                    }
                    className={`w-full py-2 font-mono font-bold text-xs rounded transition-colors ${
                      savedDeck.deck.visibility === "public"
                        ? "bg-term-amber/20 border border-term-amber text-term-amber hover:bg-term-amber/30"
                        : "bg-term-red/20 border border-term-red/40 text-term-red/70 hover:bg-term-red/10"
                    }`}
                  >
                    {savedDeck.deck.visibility === "public"
                      ? "[▓ PUBLIC — CLICK TO UNPUBLISH]"
                      : "[↑ PUBLISH TO BLACK MARKET]"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
