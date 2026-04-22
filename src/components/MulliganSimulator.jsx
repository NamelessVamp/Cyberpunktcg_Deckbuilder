import { useState, useEffect } from "react";
import MulliganModal from "./MulliganModal";
import SmartCardImage from "./SmartCardImage";
import Tooltip from "./Tooltip";

export default function MulliganSimulator({ deck, allCards }) {
  const [showModal, setShowModal] = useState(false);
  const [goingFirst, setGoingFirst] = useState(null);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Terminal Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-term-black via-term-gray to-term-black border-2 border-term-amber rounded-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-term-amber/5 animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">⚀⚁⚂⚃⚄⚅</span>
            <h2 className="text-term-amber font-bold text-3xl font-mono tracking-wider">
              OPENING HAND SIMULATOR
            </h2>

            <Tooltip
              id="tooltip_mulligan"
              title="MULLIGAN RULES"
              position="right"
              content={
                <div className="space-y-2">
                  <p className="font-bold">Official Mulligan Rule:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Return 6 cards to your deck</li>
                    <li>Draw 6 new cards</li>
                    <li>Only allowed ONCE per game</li>
                  </ul>
                  <p className="mt-2 text-term-black/70">
                    Use this simulator to practice opening hands and decide if
                    you should mulligan.
                  </p>
                </div>
              }
            >
              <span className="text-term-amber text-lg cursor-help hover:text-amber-300 transition-colors">
                ⓘ
              </span>
            </Tooltip>
          </div>
          <p className="text-term-green/80 font-mono text-sm pl-12">
            Practice your mulligan decisions • Learn optimal opening hands
          </p>
        </div>
      </div>

      {/* Deck Status Card */}
      <div className="mb-8 p-6 bg-term-gray border-2 border-term-green/40 rounded-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">
                {deck.mainDeck.length > 0 ? "✓" : "｡°⚠︎°｡"}
              </span>
              <h3 className="text-term-amber font-bold font-mono text-xl">
                {deck.mainDeck.length > 0 ? "DECK LOADED" : "NO DECK LOADED"}
              </h3>
            </div>

            {deck.mainDeck.length > 0 ? (
              <div className="space-y-2 font-mono text-sm">
                <div className="text-term-green">
                  <span className="text-term-amber">└─</span> Main Deck:{" "}
                  {deck.mainDeck.length} cards
                </div>
                <div className="text-term-green">
                  <span className="text-term-amber">└─</span> Legends:{" "}
                  {deck.legends.map((l) => l.name).join(", ")}
                </div>
              </div>
            ) : (
              <div className="space-y-2 font-mono text-sm">
                <div className="text-term-green/80">
                  <span className="text-term-amber">└─</span> Random test pool
                  will be generated
                </div>
                <div className="text-term-green/80">
                  <span className="text-term-amber">└─</span> Max 3 copies per
                  card enforced
                </div>
                <div className="text-term-green/80">
                  <span className="text-term-amber">└─</span> 3 Random Legends
                  will be selected
                </div>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="bg-term-black/50 border border-term-amber/30 rounded p-3 text-xs font-mono">
            <div className="text-term-amber mb-2">MULLIGAN RULES</div>
            <div className="text-term-green/70 space-y-1">
              <div>• Initial hand: 6 cards</div>
              <div>• Mulligan: All or nothing</div>
              <div>• Limit: 1 per game</div>
              <div>• First: 2 Legends tapped</div>
            </div>
          </div>
        </div>
      </div>

      {/* Draw Buttons */}
      <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Going First */}
        <button
          onClick={() => {
            setGoingFirst(true);
            setShowModal(true);
          }}
          className="group relative overflow-hidden bg-gradient-to-br from-cyan-600 to-cyan-800 border-2 border-cyan-400 text-white py-6 px-8 rounded-lg font-mono font-bold text-lg hover:border-cyan-300 hover:scale-105 transition-all shadow-lg hover:shadow-cyan-500/50"
        >
          <div className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="text-2xl mb-2">GOING FIRST</div>
            <div className="text-xs opacity-80 font-normal">
              Ready 1 Legend • Draw 6 Cards
            </div>
          </div>
        </button>

        {/* Going Second */}
        <button
          onClick={() => {
            setGoingFirst(false);
            setShowModal(true);
          }}
          className="group relative overflow-hidden bg-gradient-to-br from-pink-600 to-pink-800 border-2 border-pink-400 text-white py-6 px-8 rounded-lg font-mono font-bold text-lg hover:border-pink-300 hover:scale-105 transition-all shadow-lg hover:shadow-pink-500/50"
        >
          <div className="absolute inset-0 bg-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="text-2xl mb-2">GOING SECOND</div>
            <div className="text-xs opacity-80 font-normal">
              Ready All Legends • Draw 6 Cards
            </div>
          </div>
        </button>
      </div>

      {/* Mulligan Modal */}
      {showModal && (
        <MulliganModal
          deck={deck}
          allCards={allCards}
          goingFirst={goingFirst}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
