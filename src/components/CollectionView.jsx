import SmartCardImage from "./SmartCardImage";

export default function CollectionView({
  collection,
  allCards,
  onAddToCollection,
  onRemoveFromCollection,
  onViewCard,
}) {
  if (collection.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-term-amber/60 text-lg font-mono mb-4">
          NO CARDS IN COLLECTION
        </p>
        <p className="text-term-green/60 text-sm font-mono">
          Click on cards in [BUILD] and add them to your collection
        </p>
      </div>
    );
  }

  // Get full card objects with quantities
  const ownedCards = collection
    .map((item) => {
      const card = allCards.find((c) => c.id === item.card_id);
      return card ? { ...card, quantity: item.quantity } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

  const stats = {
    totalCards: collection.reduce((sum, item) => sum + item.quantity, 0),
    uniqueCards: collection.length,
    totalPossible: allCards.length,
    completionPercent: Math.round((collection.length / allCards.length) * 100),
  };

  return (
    <div>
      {/* Stats Header */}
      <div className="mb-6 p-4 bg-term-gray border-2 border-term-amber/40 rounded">
        <h2 className="text-term-amber font-bold text-xl font-mono mb-3">
          MY_COLLECTION.DAT
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-term-green/60 text-xs font-mono mb-1">
              TOTAL CARDS
            </p>
            <p className="text-term-green font-bold text-2xl font-mono">
              {stats.totalCards}
            </p>
          </div>

          <div>
            <p className="text-term-amber/60 text-xs font-mono mb-1">
              UNIQUE CARDS
            </p>
            <p className="text-term-amber font-bold text-2xl font-mono">
              {stats.uniqueCards}
            </p>
          </div>

          <div>
            <p className="text-term-blue/60 text-xs font-mono mb-1">
              COMPLETION
            </p>
            <p className="text-term-blue font-bold text-2xl font-mono">
              {stats.completionPercent}%
            </p>
          </div>

          <div>
            <p className="text-term-red/60 text-xs font-mono mb-1">MISSING</p>
            <p className="text-term-red font-bold text-2xl font-mono">
              {stats.totalPossible - stats.uniqueCards}
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {ownedCards.map((card) => (
          <div
            key={card.id}
            className="bg-term-gray border-2 border-term-green/40 rounded p-3 hover:border-term-green transition-all"
          >
            {/* Card Image */}
            <div
              className="relative overflow-hidden rounded mb-2 bg-term-gray-light cursor-pointer"
              onClick={() => onViewCard(card)}
            >
              <SmartCardImage
                card={card}
                className="w-full h-auto"
                showLoadingState={true}
              />

              {/* Quantity Badge */}
              <div className="absolute top-2 right-2 bg-term-green text-term-black font-mono font-bold text-sm px-2 py-1 rounded">
                x{card.quantity}
              </div>
            </div>

            {/* Card Name */}
            <h3 className="text-term-green font-bold font-mono text-sm mb-2 truncate">
              {card.name}
            </h3>

            {/* Quantity Controls */}
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => onAddToCollection(card.id, 1)}
                className="bg-term-green/20 border border-term-green text-term-green px-2 py-1 rounded font-mono font-bold text-xs hover:bg-term-green/30 transition-colors"
              >
                [+]
              </button>

              <button
                onClick={() => onRemoveFromCollection(card.id, 1)}
                className="bg-term-red/20 border border-term-red text-term-red px-2 py-1 rounded font-mono font-bold text-xs hover:bg-term-red/30 transition-colors"
              >
                [-]
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
