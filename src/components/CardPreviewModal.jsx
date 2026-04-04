import { useEffect, useState } from "react";
import SmartCardImage from "./SmartCardImage";

export default function CardPreviewModal({
  card,
  onClose,
  onAddToDeck,
  onAddToSideboard,
  onAddToCollection,
  onRemoveFromCollection,
  ownedQuantity = 0,
  isLoggedIn = false,
}) {
  const [quantity, setQuantity] = useState(1);
  // Close with ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleIncrement = () => {
    if (quantity < 3) setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddAndClose = () => {
    onAddToDeck(card, quantity);
    setQuantity(1);
    onClose();
  };

  const handleAddClick = () => {
    onAddToDeck(card);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-term-gray border-2 border-term-amber rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* X Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#00ff41] transition-colors text-3xl font-bold z-10"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* LEFT: Card Image */}
          <div className="flex items-center justify-center">
            <SmartCardImage
              card={card}
              className="w-full h-auto rounded"
              showLoadingState={true}
            />
          </div>

          {/* RIGHT: Card Details */}
          <div className="flex flex-col justify-between">
            {/* Header */}
            <div>
              <h2 className="text-term-green text-3xl font-bold font-mono mb-2">
                {card.name}
              </h2>
              {card.subtitle && (
                <p className="text-term-amber/80 text-lg font-mono mb-4">
                  {card.subtitle}
                </p>
              )}

              {/* Stats */}
              <div className="flex gap-4 mb-4">
                {card.cost !== undefined && (
                  <div className="text-term-blue font-mono">
                    <span className="text-sm opacity-80">COST:</span>
                    <span className="text-2xl ml-2 font-bold">{card.cost}</span>
                  </div>
                )}
                {card.power !== undefined && (
                  <div className="text-term-red font-mono">
                    <span className="text-sm opacity-80">POWER:</span>
                    <span className="text-2xl ml-2 font-bold">
                      {card.power}
                    </span>
                  </div>
                )}
                <div className="text-term-green font-mono">
                  <span className="text-sm opacity-80">RAM:</span>
                  <span className="text-2xl ml-2 font-bold">{card.ram}</span>
                </div>
              </div>

              {/* Type & Faction */}
              <div className="mb-4">
                <span className="text-term-amber font-mono text-lg">
                  {card.type}
                </span>
                {card.faction && (
                  <>
                    <span className="text-term-amber/40 mx-2">//</span>
                    <span className="text-term-green font-mono text-lg">
                      {card.faction}
                    </span>
                  </>
                )}
              </div>

              {/* Keywords */}
              {card.keywords && card.keywords.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {card.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-term-amber/20 text-term-amber rounded font-mono text-sm border border-term-amber/40"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}

              {/* Card Text */}
              {card.text && (
                <div className="mb-6 p-4 bg-black/40 rounded border border-term-amber/20">
                  <p className="text-term-green/90 font-sans text-sm leading-relaxed whitespace-pre-wrap">
                    {card.text}
                  </p>
                </div>
              )}

              {/* Set Info */}
              {card.set && (
                <div className="text-term-amber/60 font-mono text-xs">
                  {card.set}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6">
              {/* Counter System - ONLY for non-Legend cards */}
              {card.type !== "LEGEND" && (
                <div className="mb-4 p-4 border border-gray-700 rounded bg-black/30">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-mono">COPIES:</span>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleDecrement}
                        disabled={quantity === 1}
                        className={`w-10 h-10 border-2 rounded font-bold text-xl transition-colors ${
                          quantity === 1
                            ? "border-gray-700 text-gray-700 cursor-not-allowed"
                            : "border-gray-600 text-gray-400 hover:border-[#00ff41] hover:text-[#00ff41]"
                        }`}
                      >
                        −
                      </button>

                      <span className="text-3xl font-bold text-[#00ff41] w-12 text-center font-mono">
                        {quantity}
                      </span>

                      <button
                        onClick={handleIncrement}
                        disabled={quantity === 3}
                        className={`w-10 h-10 border-2 rounded font-bold text-xl transition-colors ${
                          quantity === 3
                            ? "border-gray-700 text-gray-700 cursor-not-allowed"
                            : "border-gray-600 text-gray-400 hover:border-[#00ff41] hover:text-[#00ff41]"
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    Max 3 copies per deck (except Legends)
                  </p>
                </div>
              )}

              {/* Add to Deck Button */}
              <button
                onClick={handleAddAndClose}
                className="w-full bg-term-green text-term-black py-3 px-6 rounded font-bold hover:bg-green-400 transition-colors mb-2"
              >
                {card.type === "LEGEND"
                  ? "[+ ADD TO DECK]"
                  : `[+ ADD ${quantity} ${quantity === 1 ? "COPY" : "COPIES"} TO DECK]`}
              </button>

              {/* Add to Sideboard Button - NUEVO */}
              <button
                onClick={() => {
                  if (onAddToSideboard) {
                    onAddToSideboard(
                      card,
                      card.type === "LEGEND" ? 1 : quantity,
                    );
                  }
                  setQuantity(1);
                  onClose();
                }}
                className="w-full bg-term-blue/20 border-2 border-term-blue text-term-blue py-2 px-4 rounded font-mono font-bold hover:bg-term-blue/30 transition-colors mb-4"
              >
                {card.type === "LEGEND"
                  ? "[+ ADD TO SIDEBOARD]"
                  : `[+ ADD ${quantity} ${quantity === 1 ? "COPY" : "COPIES"} TO SIDEBOARD]`}
              </button>

              {/* COLLECTION BUTTONS */}
              {isLoggedIn && (
                <div className="mt-4 pt-4 border-t border-term-amber/20">
                  <p className="text-term-green/60 text-xs font-mono mb-2">
                    COLLECTION:{" "}
                    {ownedQuantity > 0 ? (
                      <span className="text-term-amber">
                        Own {ownedQuantity}{" "}
                        {ownedQuantity === 1 ? "copy" : "copies"}
                      </span>
                    ) : (
                      <span className="text-term-red/60">Not owned</span>
                    )}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onAddToCollection(card.id, 1)}
                      className="bg-term-green/20 border border-term-green text-term-green px-3 py-2 rounded font-mono font-bold text-sm hover:bg-term-green/30 transition-colors"
                    >
                      [+ ADD]
                    </button>

                    <button
                      onClick={() => onRemoveFromCollection(card.id, 1)}
                      disabled={ownedQuantity === 0}
                      className="bg-term-red/20 border border-term-red text-term-red px-3 py-2 rounded font-mono font-bold text-sm hover:bg-term-red/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      [- REMOVE]
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
