import {
  getBannedCards,
  getRestrictedCards,
  getLegalityInfo,
} from "../lib/legalityService";

function LegalityInfoModal({ onClose, allCards }) {
  const bannedIds = getBannedCards();
  const restrictedIds = getRestrictedCards();
  const info = getLegalityInfo();

  const bannedCards = allCards.filter((card) => bannedIds.includes(card.id));
  const restrictedCards = allCards.filter((card) =>
    restrictedIds.includes(card.id),
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className="bg-term-gray border-2 border-term-red max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-term-red font-mono mb-2">
              [CARD LEGALITY BANLIST]
            </h2>
            <p className="text-term-green/60 text-sm font-mono">
              Format: {info.format} • Last Updated: {info.lastUpdated}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-term-red hover:text-red-400 text-3xl font-bold ml-4"
          >
            ✕
          </button>
        </div>

        {/* Explanation */}
        <div className="bg-term-amber/10 border-l-4 border-term-amber p-4 rounded mb-6">
          <h3 className="text-term-amber font-mono font-bold text-sm mb-2">
            💡 WHAT IS THIS?
          </h3>
          <p className="text-term-green/80 text-xs font-mono leading-relaxed">
            WeirdCo maintains an official banlist for competitive play.{" "}
            <span className="text-term-red font-bold">BANNED</span> cards cannot
            be used at all.{" "}
            <span className="text-term-amber font-bold">RESTRICTED</span> cards
            are limited to 1 copy maximum (instead of the normal 3).
          </p>
        </div>

        {/* Banned Cards */}
        <section className="mb-6">
          <h3 className="text-term-red font-mono font-bold text-xl mb-3 flex items-center gap-2">
            <span>🚫</span>
            <span>BANNED CARDS ({bannedCards.length})</span>
          </h3>

          {bannedCards.length === 0 ? (
            <div className="bg-term-black/40 border border-term-green/30 rounded p-4 text-center">
              <p className="text-term-green/60 text-sm font-mono">
                No cards are currently banned. All cards are legal for play!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bannedCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-term-red/10 border border-term-red/30 rounded p-3 flex items-center gap-3"
                >
                  <span className="text-2xl">🚫</span>
                  <div>
                    <div className="text-term-red font-mono font-bold text-sm">
                      {card.name}
                    </div>
                    <div className="text-term-green/60 text-xs font-mono">
                      {card.type} • {card.faction}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Restricted Cards */}
        <section className="mb-6">
          <h3 className="text-term-amber font-mono font-bold text-xl mb-3 flex items-center gap-2">
            <span>⚠️</span>
            <span>RESTRICTED CARDS ({restrictedCards.length})</span>
          </h3>

          {restrictedCards.length === 0 ? (
            <div className="bg-term-black/40 border border-term-green/30 rounded p-4 text-center">
              <p className="text-term-green/60 text-sm font-mono">
                No cards are currently restricted. You can play up to 3 copies
                of any card!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {restrictedCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-term-amber/10 border border-term-amber/30 rounded p-3 flex items-center gap-3"
                >
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <div className="text-term-amber font-mono font-bold text-sm">
                      {card.name}
                    </div>
                    <div className="text-term-green/60 text-xs font-mono">
                      {card.type} • Max 1 copy
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-term-green/20 border border-term-green text-term-green px-6 py-3 rounded font-mono font-bold hover:bg-term-green/30 transition-colors"
          >
            [GOT IT]
          </button>
        </div>
      </div>
    </div>
  );
}

export default LegalityInfoModal;
