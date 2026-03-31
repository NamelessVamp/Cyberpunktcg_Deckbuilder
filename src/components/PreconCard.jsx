import { useState } from "react";

function PreconCard({ deck, onLoad }) {
  const [showModal, setShowModal] = useState(false);

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
    <>
      {/* CARD */}
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

        {/* Short Description */}
        <p className="text-term-green/80 text-sm font-mono mb-3 leading-relaxed line-clamp-3">
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
            onClick={() => setShowModal(true)}
            className="bg-term-amber/20 border border-term-amber text-term-amber px-4 py-2 rounded font-mono font-bold hover:bg-term-amber/30 transition-colors text-sm"
          >
            [INFO]
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-term-gray border-2 border-term-amber max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-term-amber font-mono mb-2">
                  {deck.name}
                </h2>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded border ${difficultyColors[deck.difficulty]} text-sm font-mono font-bold`}
                >
                  <span>{difficultyIcons[deck.difficulty]}</span>
                  <span>{deck.difficulty.toUpperCase()}</span>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-term-red hover:text-red-400 text-3xl font-bold ml-4"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <section className="mb-6">
              <h3 className="text-term-green font-mono font-bold text-lg mb-2">
                DESCRIPTION
              </h3>
              <p className="text-term-green/80 text-sm font-mono leading-relaxed">
                {deck.description}
              </p>
            </section>

            {/* Strategy */}
            <section className="mb-6">
              <h3 className="text-term-amber font-mono font-bold text-lg mb-2 flex items-center gap-2">
                <span>🎯</span>
                <span>STRATEGY</span>
              </h3>
              <div className="bg-term-black/40 border border-term-amber/30 rounded p-4">
                <p className="text-term-green/80 text-sm font-mono leading-relaxed">
                  {deck.strategy}
                </p>
              </div>
            </section>

            {/* Key Cards */}
            <section className="mb-6">
              <h3 className="text-term-blue font-mono font-bold text-lg mb-2 flex items-center gap-2">
                <span>🃏</span>
                <span>KEY CARDS</span>
              </h3>
              <ul className="space-y-2">
                {deck.keyCards.map((card, idx) => (
                  <li
                    key={idx}
                    className="bg-term-black/40 border border-term-blue/30 rounded p-3 text-term-green/80 text-sm font-mono flex items-start gap-3"
                  >
                    <span className="text-term-amber flex-shrink-0 text-lg">
                      ►
                    </span>
                    <span>{card}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Deck Composition */}
            <section className="mb-6">
              <h3 className="text-term-green font-mono font-bold text-lg mb-2 flex items-center gap-2">
                <span>📊</span>
                <span>DECK COMPOSITION</span>
              </h3>
              <div className="bg-term-black/40 border border-term-green/30 rounded p-4">
                <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                  <div>
                    <span className="text-term-blue/60">Legends:</span>
                    <span className="text-term-green ml-2 font-bold">
                      {deck.legends.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-term-blue/60">Main Deck:</span>
                    <span className="text-term-green ml-2 font-bold">
                      {deck.mainDeck.length > 0
                        ? `${deck.mainDeck.reduce((sum, card) => sum + card.count, 0)} cards`
                        : "40-50 cards (placeholder)"}
                    </span>
                  </div>
                </div>

                {/* Legends List */}
                <div className="mt-4 pt-4 border-t border-term-green/20">
                  <h4 className="text-term-blue text-xs font-mono font-bold mb-2">
                    LEGENDS:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {deck.legends.map((legend, idx) => (
                      <span
                        key={idx}
                        className="bg-term-blue/10 border border-term-blue/30 px-3 py-1 rounded text-sm font-mono text-term-blue"
                      >
                        {legend.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Load Button */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  onLoad(deck);
                }}
                className="flex-1 bg-term-green text-term-black px-6 py-3 rounded font-mono font-bold hover:bg-green-400 transition-colors text-lg"
              >
                [LOAD THIS DECK]
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-term-red/20 border border-term-red text-term-red px-6 py-3 rounded font-mono font-bold hover:bg-term-red/30 transition-colors"
              >
                [CLOSE]
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PreconCard;
