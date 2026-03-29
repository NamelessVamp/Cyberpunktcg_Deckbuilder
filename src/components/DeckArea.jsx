export default function DeckArea({
  deck,
  onRemoveCard,
  onClearDeck,
  onShareDeck,
}) {
  // Calculate RAM Budget
  const ramBudget = deck.legends.reduce(
    (acc, legend) => {
      if (legend.ram_color && legend.ram) {
        acc[legend.ram_color] = (acc[legend.ram_color] || 0) + legend.ram;
      }
      return acc;
    },
    { Red: 0, Yellow: 0, Green: 0, Blue: 0 },
  );

  return (
    <div className="card-container">
      {/* Header with DELETE ALL button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-term-amber font-bold text-xl font-mono">
          CURRENT_DECK.DAT
        </h2>
        <button
          onClick={onClearDeck}
          disabled={deck.legends.length === 0 && deck.mainDeck.length === 0}
          className="text-term-red/80 hover:text-term-red text-sm font-mono font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <span className="text-lg">🗑</span> DELETE ALL
        </button>
      </div>

      {/* LEGENDS SECTION */}
      <div className="mb-6">
        <h3 className="text-term-green font-bold font-mono mb-3">
          LEGENDS [
          <span
            className={
              deck.legends.length === 3 ? "text-term-green" : "text-term-amber"
            }
          >
            {deck.legends.length}
          </span>
          /3]
        </h3>

        {deck.legends.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {deck.legends.map((legend, idx) => (
              <div
                key={idx}
                className="relative group cursor-pointer hover:scale-105 transition-transform"
              >
                <img
                  src={legend.image_url}
                  alt={legend.name}
                  className="w-full rounded border-2 border-term-amber/40 group-hover:border-term-amber transition-colors"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x420/1a1a1a/ffb300?text=NO+IMAGE";
                  }}
                />
                <button
                  onClick={() => onRemoveCard(legend, "legends")}
                  className="absolute top-1 right-1 bg-term-red text-white rounded-full w-6 h-6 flex items-center justify-center font-bold hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-term-green/40 text-sm font-mono italic">
            No Legends selected
          </p>
        )}
      </div>

      {/* RAM BUDGET */}
      <div className="mb-6 p-3 bg-black/30 rounded border border-term-amber/20">
        <h3 className="text-term-green/80 font-bold font-mono text-sm mb-2">
          RAM BUDGET
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-term-red"></span>
            <span className="text-term-red font-mono text-sm">
              RED: {ramBudget.Red}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-term-amber"></span>
            <span className="text-term-amber font-mono text-sm">
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
            <span className="text-term-blue font-mono text-sm">
              BLUE: {ramBudget.Blue}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN DECK SECTION */}
      <div className="mb-6">
        <h3 className="text-term-green font-bold font-mono mb-3">
          MAIN DECK [
          <span
            className={
              deck.mainDeck.length >= 40 && deck.mainDeck.length <= 50
                ? "text-term-green"
                : "text-term-red"
            }
          >
            {deck.mainDeck.length}
          </span>
          /40-50]
        </h3>

        {deck.mainDeck.length > 0 ? (
          <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
            {deck.mainDeck.map((card, idx) => (
              <div
                key={idx}
                className="relative group cursor-pointer hover:scale-105 transition-transform"
              >
                <img
                  src={card.image_url}
                  alt={card.name}
                  className="w-full rounded border-2 border-term-green/40 group-hover:border-term-green transition-colors"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x420/1a1a1a/ffb300?text=NO+IMAGE";
                  }}
                />
                <button
                  onClick={() => onRemoveCard(card, "mainDeck")}
                  className="absolute top-1 right-1 bg-term-red text-white rounded-full w-6 h-6 flex items-center justify-center font-bold hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-term-green/40 text-sm font-mono italic">
            No cards in deck
          </p>
        )}
      </div>

      {/* SHARE BUTTON */}
      <button
        onClick={onShareDeck}
        disabled={deck.mainDeck.length === 0}
        className="w-full bg-term-blue/20 border-2 border-term-blue/40 text-term-blue py-2 px-4 rounded font-mono font-bold text-sm hover:bg-term-blue/30 hover:border-term-blue transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        [🔗 SHARE DECK]
      </button>
    </div>
  );
}
