import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PreconExplainer({ guide, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "OVERVIEW" },
    { id: "gameplan", label: "GAMEPLAN" },
    { id: "mulligan", label: "MULLIGAN" },
    { id: "synergies", label: "SYNERGIES" },
    { id: "matchups", label: "MATCHUPS" },
    { id: "upgrades", label: "UPGRADES" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="bg-term-gray border-2 border-term-amber rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ position: "relative" }}
        >
          {/* Header */}
          <div className="bg-term-gray border-b border-term-amber p-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-term-amber font-mono">
                {guide.name}
              </h2>
              <div className="flex gap-4 mt-2 text-sm font-mono">
                <span className="text-term-green">
                  Archetype:{" "}
                  <span className="text-term-amber">{guide.archetype}</span>
                </span>
                <span className="text-term-green">
                  Difficulty:{" "}
                  <span className="text-term-amber">{guide.difficulty}</span>
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-term-red hover:text-red-400 font-mono text-xl"
            >
              [X]
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-term-green/30 bg-black/20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 font-mono text-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-term-amber/20 text-term-amber border-b-2 border-term-amber"
                    : "text-term-green hover:bg-term-green/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-term-amber font-mono mb-3">
                    DECK OVERVIEW
                  </h3>
                  <p className="text-term-green font-sans leading-relaxed">
                    {guide.overview}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-term-amber font-mono mb-3">
                    WIN CONDITIONS
                  </h3>
                  <ul className="space-y-2">
                    {guide.winConditions.map((condition, index) => (
                      <li
                        key={index}
                        className="text-term-green font-sans flex gap-2"
                      >
                        <span className="text-term-amber">→</span>
                        {condition}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-term-amber font-mono mb-3">
                    COMMON MISTAKES TO AVOID
                  </h3>
                  <ul className="space-y-2">
                    {guide.commonMistakes.map((mistake, index) => (
                      <li
                        key={index}
                        className="text-term-red font-sans flex gap-2"
                      >
                        <span className="text-term-red">✗</span>
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "gameplan" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-term-amber font-mono mb-3">
                    EARLY GAME (Turns 1-3)
                  </h3>
                  <p className="text-term-green font-mono leading-relaxed">
                    {guide.gameplan.early}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-term-amber font-mono mb-3">
                    MID GAME (Turns 4-6)
                  </h3>
                  <p className="text-term-green font-mono leading-relaxed">
                    {guide.gameplan.mid}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-term-amber font-mono mb-3">
                    LATE GAME (Turn 7+)
                  </h3>
                  <p className="text-term-green font-mono leading-relaxed">
                    {guide.gameplan.late}
                  </p>
                </div>

                <div className="border-t border-term-green/30 pt-6">
                  <h3 className="text-xl font-bold text-term-amber font-mono mb-3">
                    EDDIES CURVE STRATEGY
                  </h3>
                  <p className="text-term-green font-mono leading-relaxed mb-4">
                    {guide.eddiesCurve.description}
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-term-red/10 border border-term-red/30 rounded p-4">
                      <h4 className="text-term-red font-mono font-bold mb-2">
                        SELL THESE (Fodder):
                      </h4>
                      <ul className="space-y-1">
                        {guide.eddiesCurve.sellTargets.map((card, index) => (
                          <li
                            key={index}
                            className="text-term-red/80 font-mono text-sm flex gap-2"
                          >
                            <span>→</span>
                            {card}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-term-green/10 border border-term-green/30 rounded p-4">
                      <h4 className="text-term-green font-mono font-bold mb-2">
                        KEEP THESE (Bombs):
                      </h4>
                      <ul className="space-y-1">
                        {guide.eddiesCurve.keepTargets.map((card, index) => (
                          <li
                            key={index}
                            className="text-term-green/80 font-mono text-sm flex gap-2"
                          >
                            <span>→</span>
                            {card}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "mulligan" && (
              <div className="space-y-6">
                <div className="bg-term-green/10 border border-term-green/30 rounded p-4">
                  <h3 className="text-term-green font-mono font-bold mb-3">
                    ✓ ALWAYS KEEP:
                  </h3>
                  <ul className="space-y-1">
                    {guide.mulliganGuide.alwaysKeep.map((card, index) => (
                      <li
                        key={index}
                        className="text-term-green font-mono text-sm flex gap-2"
                      >
                        <span>→</span>
                        {card}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-term-amber/10 border border-term-amber/30 rounded p-4">
                  <h3 className="text-term-amber font-mono font-bold mb-3">
                    ON THE PLAY (Going First):
                  </h3>
                  <ul className="space-y-1">
                    {guide.mulliganGuide.onThePlay.map((tip, index) => (
                      <li
                        key={index}
                        className="text-term-amber/80 font-mono text-sm flex gap-2"
                      >
                        <span>→</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-term-blue/10 border border-term-blue/30 rounded p-4">
                  <h3 className="text-term-blue font-mono font-bold mb-3">
                    ON THE DRAW (Going Second):
                  </h3>
                  <ul className="space-y-1">
                    {guide.mulliganGuide.onTheDraw.map((tip, index) => (
                      <li
                        key={index}
                        className="text-term-blue/80 font-mono text-sm flex gap-2"
                      >
                        <span>→</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-term-red/10 border border-term-red/30 rounded p-4">
                  <h3 className="text-term-red font-mono font-bold mb-3">
                    ✗ NEVER KEEP:
                  </h3>
                  <ul className="space-y-1">
                    {guide.mulliganGuide.neverKeep.map((card, index) => (
                      <li
                        key={index}
                        className="text-term-red/80 font-mono text-sm flex gap-2"
                      >
                        <span>→</span>
                        {card}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "synergies" && (
              <div className="space-y-4">
                {guide.keySynergies.map((synergy, index) => (
                  <div
                    key={index}
                    className="bg-term-gray/50 border border-term-green/30 rounded p-4"
                  >
                    <h3 className="text-term-amber font-mono font-bold mb-2">
                      {synergy.cards.join(" + ")}
                    </h3>
                    <p className="text-term-green font-mono text-sm leading-relaxed">
                      {synergy.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "matchups" && (
              <div className="space-y-6">
                {Object.entries(guide.matchupGuide).map(
                  ([matchupId, matchup]) => (
                    <div
                      key={matchupId}
                      className="border border-term-amber/30 rounded p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-term-amber font-mono">
                          {matchupId === "vs-merc-aggro"
                            ? "VS MERC AGGRO"
                            : "VS ARASAKA CONTROL"}
                        </h3>
                        <span
                          className={`font-mono text-sm px-3 py-1 rounded ${
                            matchup.difficulty.includes("Favorable")
                              ? "bg-term-green/20 text-term-green"
                              : "bg-term-red/20 text-term-red"
                          }`}
                        >
                          {matchup.difficulty}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-term-amber font-mono font-bold mb-2">
                            Gameplan:
                          </h4>
                          <p className="text-term-green font-mono text-sm leading-relaxed">
                            {matchup.gameplan}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-term-amber font-mono font-bold mb-2">
                            Key Cards:
                          </h4>
                          <ul className="space-y-1">
                            {matchup.keyCards.map((card, index) => (
                              <li
                                key={index}
                                className="text-term-green font-mono text-sm flex gap-2"
                              >
                                <span className="text-term-amber">→</span>
                                {card}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-term-amber font-mono font-bold mb-2">
                            Tips:
                          </h4>
                          <ul className="space-y-1">
                            {matchup.tips.map((tip, index) => (
                              <li
                                key={index}
                                className="text-term-green font-mono text-sm flex gap-2"
                              >
                                <span className="text-term-amber">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            {activeTab === "upgrades" && (
              <div className="space-y-6">
                <div className="bg-term-green/10 border border-term-green/30 rounded p-4">
                  <h3 className="text-term-green font-mono font-bold mb-3">
                    CORE CARDS TO KEEP:
                  </h3>
                  <ul className="space-y-1">
                    {guide.upgradePath.coreToKeep.map((card, index) => (
                      <li
                        key={index}
                        className="text-term-green/80 font-mono text-sm flex gap-2"
                      >
                        <span>✓</span>
                        {card}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-term-red/10 border border-term-red/30 rounded p-4">
                  <h3 className="text-term-red font-mono font-bold mb-3">
                    FIRST CARDS TO CUT:
                  </h3>
                  <ul className="space-y-1">
                    {guide.upgradePath.firstCuts.map((card, index) => (
                      <li
                        key={index}
                        className="text-term-red/80 font-mono text-sm flex gap-2"
                      >
                        <span>✗</span>
                        {card}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-term-amber font-mono font-bold mb-4">
                    SUGGESTED UPGRADES:
                  </h3>
                  <div className="space-y-3">
                    {guide.upgradePath.suggestedUpgrades.map(
                      (upgrade, index) => (
                        <div
                          key={index}
                          className="bg-term-gray/50 border border-term-amber/30 rounded p-3"
                        >
                          <h4 className="text-term-amber font-mono font-bold text-sm mb-1">
                            {upgrade.card}
                          </h4>
                          <p className="text-term-green font-mono text-xs">
                            {upgrade.reason}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-term-amber p-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-term-amber/20 text-term-amber border border-term-amber rounded font-mono hover:bg-term-amber/30 transition-colors"
            >
              [CLOSE]
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
