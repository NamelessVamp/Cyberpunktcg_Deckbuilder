import SmartCardImage from "./SmartCardImage";
import Tooltip from "./Tooltip";

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
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-term-green font-bold font-mono">
            LEGENDS [
            <span
              className={
                deck.legends.length === 3
                  ? "text-term-green"
                  : "text-term-amber"
              }
            >
              {deck.legends.length}
            </span>
            /3]
          </h3>

          <Tooltip
            title="Legends Section"
            content={
              <ul className="list-disc pl-4 text-xs">
                <li>Exactly 3 Legends required</li>
                <li>All 3 must be UNIQUE (no duplicates)</li>
                <li>Legends provide RAM for your deck</li>
                <li>Start face-down, flip for 2 Eddies</li>
              </ul>
            }
            position="bottom"
          >
            <span className="text-term-amber cursor-help">ⓘ</span>
          </Tooltip>
        </div>

        {deck.legends.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {deck.legends.map((legend, idx) => (
              <div
                key={idx}
                className="relative group cursor-pointer"
                onClick={() => onRemoveCard(legend, "legends")}
              >
                <SmartCardImage
                  card={legend}
                  className="w-full h-auto rounded"
                />

                {/* Remove Overlay */}
                <div className="absolute inset-0 bg-term-red/60 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-bold text-lg font-mono">
                    [REMOVE]
                  </span>
                </div>
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
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-term-green/80 font-bold font-mono text-sm">
            RAM BUDGET
          </h3>

          <Tooltip
            title="Legends Section"
            position="bottom"
            content={
              <div className="space-y-2">
                <p className="font-bold">Deck Requirements:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Exactly 3 Legends required</li>
                  <li>All 3 must be UNIQUE (no duplicates)</li>
                  <li>Legends provide RAM for your deck</li>
                  <li>Start face-down, flip for 2 Eddies</li>
                </ul>
                <p className="mt-2 font-bold text-xs opacity-80 italic">
                  *Check RAM colors below
                </p>
              </div>
            }
          >
            <span className="text-term-amber text-xs cursor-help hover:text-amber-300 transition-colors">
              ⓘ
            </span>
          </Tooltip>
        </div>
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
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-term-green font-bold font-mono">
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

          <Tooltip
            title="Legends Section"
            position="left"
            content={
              <div className="space-y-2">
                <p className="font-bold">Deck Requirements:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Exactly 3 Legends required</li>
                  <li>All 3 must be UNIQUE (no duplicates)</li>
                  <li>Legends provide RAM for your deck</li>
                  <li>Start face-down, flip for 2 Eddies</li>
                </ul>
                <p className="mt-2 font-bold text-xs opacity-80 italic">
                  *Check RAM colors below
                </p>
              </div>
            }
          >
            <span className="text-term-amber text-xs cursor-help hover:text-amber-300 transition-colors">
              ⓘ
            </span>
          </Tooltip>
        </div>

        {deck.mainDeck.length > 0 ? (
          <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
            {(() => {
              // Group cards by ID and count
              const cardCounts = deck.mainDeck.reduce((acc, card) => {
                if (!acc[card.id]) {
                  acc[card.id] = { card, count: 0 };
                }
                acc[card.id].count++;
                return acc;
              }, {});

              // Get unique cards
              const uniqueCards = Object.values(cardCounts);

              return uniqueCards.map(({ card, count }) => (
                <div
                  key={card.id}
                  className="relative group cursor-pointer"
                  onClick={() => onRemoveCard(card, "mainDeck")}
                >
                  <SmartCardImage
                    card={card}
                    className="w-full h-auto rounded"
                  />

                  {/* Count Badge */}
                  {count > 1 && (
                    <div className="absolute bottom-1 right-1 bg-term-amber text-term-black font-mono font-bold text-xs px-1.5 py-0.5 rounded">
                      x{count}
                    </div>
                  )}
                  {/* Remove Overlay */}
                  <div className="absolute inset-0 bg-term-red/60 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-bold text-lg font-mono">
                      [REMOVE]
                    </span>
                  </div>
                </div>
              ));
            })()}
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
