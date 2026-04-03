import { useState } from "react";
import preconDecksData from "../data/preconDecks.json";
import preconGuidesData from "../data/preconGuides.json";
import SmartCardImage from "./SmartCardImage";
import PreconExplainer from "./PreconExplainer";

export default function PreconDecksView({ onLoadPrecon, allCards }) {
  const [selectedGuide, setSelectedGuide] = useState(null);

  const handleLoadDeck = (precon) => {
    onLoadPrecon(precon);
  };

  const handleShowGuide = (preconId) => {
    const guide = preconGuidesData.guides[preconId];
    if (guide) {
      setSelectedGuide(guide);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-term-gray/50 border border-term-green/30 rounded p-4">
        <h2 className="text-2xl font-bold text-term-amber font-mono mb-2">
          [PRECONSTRUCTED DECKS]
        </h2>
        <p className="text-term-green font-mono text-sm">
          Alpha Kit starter decks. Load, learn, and customize.
        </p>
      </div>

      {/* Precon Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {preconDecksData.preconDecks.map((precon) => {
          // Get legend cards for preview
          const legendCards = precon.legends
            .map((leg) => allCards.find((c) => c.id === leg.id))
            .filter(Boolean);

          // Get main deck card names
          const mainDeckNames = Object.keys(precon.mainDeck);
          const mainDeckPreview = mainDeckNames
            .slice(0, 3)
            .map((name) => {
              // Find card by name
              const card = allCards.find(
                (c) => c.name === name || c.name.includes(name.split(" (")[0]),
              );
              return card;
            })
            .filter(Boolean);

          return (
            <div
              key={precon.id}
              className="bg-term-gray border-2 border-term-amber rounded-lg overflow-hidden hover:border-term-green transition-colors"
            >
              {/* Deck Header */}
              <div className="bg-black/40 p-4 border-b border-term-amber">
                <h3 className="text-xl font-bold text-term-amber font-mono">
                  {precon.name}
                </h3>
                <p className="text-term-green font-mono text-sm mt-1">
                  {legendCards.length} Legends •{" "}
                  {Object.keys(precon.mainDeck).length} Main Deck Cards
                </p>
              </div>

              {/* Legend Preview */}
              <div className="p-4 bg-black/20">
                <h4 className="text-term-green font-mono text-sm mb-2">
                  LEGENDS:
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {legendCards.map((card, index) => (
                    <div
                      key={`legend-${card.id}-${index}`}
                      className="relative aspect-[63/88]"
                    >
                      <SmartCardImage
                        card={card}
                        className="w-full h-full object-cover rounded border border-term-amber/30"
                        eagerLoad={true}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-term-amber text-xs font-mono p-1 text-center truncate">
                        {card.name.split(" (")[0]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Deck Preview */}
              <div className="p-4 bg-black/10">
                <h4 className="text-term-green font-mono text-sm mb-2">
                  SAMPLE CARDS:
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {mainDeckPreview.map((card, index) => (
                    <div
                      key={`main-${card.id}-${index}`}
                      className="relative aspect-[63/88]"
                    >
                      <SmartCardImage
                        card={card}
                        className="w-full h-full object-cover rounded border border-term-green/30"
                        eagerLoad={true}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-term-green text-xs font-mono p-1 text-center truncate">
                        {card.name.split(" (")[0]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 space-y-2">
                <button
                  onClick={() => handleLoadDeck(precon)}
                  className="w-full py-2 bg-term-amber/20 text-term-amber border border-term-amber rounded font-mono hover:bg-term-amber/30 transition-colors"
                >
                  [LOAD DECK]
                </button>

                <button
                  onClick={() => handleShowGuide(precon.id)}
                  className="w-full py-2 bg-term-green/20 text-term-green border border-term-green rounded font-mono hover:bg-term-green/30 transition-colors"
                >
                  [STRATEGY GUIDE]
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Strategy Guide Modal */}
      {selectedGuide && (
        <PreconExplainer
          guide={selectedGuide}
          onClose={() => setSelectedGuide(null)}
        />
      )}
    </div>
  );
}
