import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnalyticsModal({ deck, onClose }) {
  const [activeTab, setActiveTab] = useState("curve");

  // Calculate analytics data
  const analytics = calculateDeckAnalytics(deck);

  const tabs = [
    { id: "validation", label: "SYSTEM CHECK" },
    { id: "curve", label: "EDDIES CURVE" },
    { id: "synergies", label: "SYNERGIES" },
    { id: "consistency", label: "CONSISTENCY" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="bg-term-gray border-0 sm:border-2 border-term-amber rounded-none sm:rounded-lg w-full h-full sm:max-w-5xl sm:w-full sm:max-h-[90vh] overflow-hidden flex flex-col"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="bg-term-gray border-b border-term-amber p-3 sm:p-4 flex justify-between items-center safe-area-top">
            <h2 className="text-lg sm:text-2xl font-bold text-term-amber font-mono">
              DECK ANALYTICS
            </h2>
            <button
              onClick={onClose}
              className="text-term-red hover:text-red-400 font-mono text-xl min-w-[44px] min-h-[44px] touch-optimized"
              aria-label="Close analytics"
            >
              [X]
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-term-green/30 bg-black/20 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 py-2 sm:py-3 px-3 sm:px-4 font-mono text-xs sm:text-sm transition-colors touch-optimized ${
                  activeTab === tab.id
                    ? "bg-term-amber/20 text-term-amber border-b-2 border-term-amber"
                    : "text-term-green hover:bg-term-green/10 active:bg-term-green/20"
                }`}
                aria-label={`${tab.label} tab`}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 safe-area-bottom">
            {activeTab === "validation" && (
              <ValidationTab deck={deck} analytics={analytics} />
            )}

            {activeTab === "curve" && <CurveTab analytics={analytics} />}

            {activeTab === "synergies" && (
              <SynergiesTab deck={deck} analytics={analytics} />
            )}

            {activeTab === "consistency" && (
              <ConsistencyTab analytics={analytics} />
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-term-amber p-4 flex justify-end"></div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// ANALYTICS CALCULATION
// ============================================================================

function calculateDeckAnalytics(deck) {
  const allCards = [...deck.legends, ...deck.mainDeck];

  // Eddies Curve
  const curveCounts = {};
  for (let i = 0; i <= 9; i++) {
    curveCounts[i] = 0;
  }

  allCards.forEach((card) => {
    const cost = card.cost !== undefined ? card.cost : 0;
    if (cost >= 0 && cost <= 9) {
      curveCounts[cost]++;
    }
  });

  const avgCost =
    allCards.length > 0
      ? (
          allCards.reduce(
            (sum, card) => sum + (card.cost !== undefined ? card.cost : 0),
            0,
          ) / allCards.length
        ).toFixed(1)
      : 0;

  // RAM Distribution
  const ramCounts = {};
  deck.legends.forEach((legend) => {
    if (legend.ram_color) {
      ramCounts[legend.ram_color] = (ramCounts[legend.ram_color] || 0) + 1;
    }
  });

  // Tag Synergies
  const tagCounts = {};
  allCards.forEach((card) => {
    if (card.keywords && card.keywords.length > 0) {
      card.keywords.forEach((keyword) => {
        tagCounts[keyword] = (tagCounts[keyword] || 0) + 1;
      });
    }
  });

  // Type Distribution
  const typeCounts = {};
  allCards.forEach((card) => {
    const type = card.type || "Unknown";
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  // Playable Hand Probability
  const cheapCards = allCards.filter((card) => card.cost <= 2).length;
  const deckSize = allCards.length;
  const handSize = 6;

  // P(≥1 carta barata en mano inicial)
  const playableHandProbability =
    cheapCards > 0 && deckSize >= handSize
      ? calculateHypergeometric(deckSize, cheapCards, handSize)
      : 0;

  return {
    curveCounts,
    avgCost,
    ramCounts,
    tagCounts,
    typeCounts,
    totalCards: allCards.length,
    playableHandProbability, // ← NUEVO
    cheapCards, // ← NUEVO
  };
}

// ============================================================================
// VALIDATION TAB (SYSTEM CHECK)
// ============================================================================

function ValidationTab({ deck, analytics }) {
  // Calculate RAM Budget
  const ramBudget = {};
  const ramUsed = {};

  deck.legends.forEach((legend) => {
    if (legend.ram_color && legend.ram !== undefined) {
      ramBudget[legend.ram_color] =
        (ramBudget[legend.ram_color] || 0) + legend.ram;
    }
  });

  [...deck.mainDeck, ...deck.sideboard].forEach((card) => {
    if (card.ram_color && card.ram !== undefined && card.ram > 0) {
      ramUsed[card.ram_color] = (ramUsed[card.ram_color] || 0) + card.ram;
    }
  });

  // Calculate errors
  const errors = [];
  const warnings = [];

  // RAM validation
  Object.keys(ramUsed).forEach((color) => {
    const budget = ramBudget[color] || 0;
    const used = ramUsed[color] || 0;
    if (used > budget) {
      errors.push({
        type: "RAM_OVERLOAD",
        color,
        message: `${color} RAM overload: ${used}/${budget} used`,
      });
    }
  });

  // Deck size validation
  const deckSize = deck.mainDeck.length;
  if (deckSize < 40) {
    errors.push({
      type: "DECK_SIZE",
      message: `Deck too small: ${deckSize}/40 minimum`,
    });
  } else if (deckSize > 50) {
    errors.push({
      type: "DECK_SIZE",
      message: `Deck too large: ${deckSize}/50 maximum`,
    });
  }

  // Legend validation
  if (deck.legends.length !== 3) {
    errors.push({
      type: "LEGENDS",
      message: `Invalid Legends: ${deck.legends.length}/3 required`,
    });
  }

  // Sideboard validation
  if (deck.sideboard.length > 15) {
    errors.push({
      type: "SIDEBOARD",
      message: `Sideboard too large: ${deck.sideboard.length}/15 maximum`,
    });
  }

  // Warnings (not errors)
  if (analytics.avgCost > 3.5) {
    warnings.push({
      type: "CURVE",
      message: `High average cost (${analytics.avgCost}) — deck may be too slow`,
    });
  }

  if (analytics.playableHandProbability < 0.65) {
    warnings.push({
      type: "CONSISTENCY",
      message: `Low T1 playability (${(analytics.playableHandProbability * 100).toFixed(1)}%) — add more cheap cards`,
    });
  }

  return (
    <div className="space-y-6">
      {/* System Status Header */}
      <div className="text-center">
        <h3 className="text-term-amber font-mono text-2xl font-bold mb-2">
          SYSTEM_CHECK.EXE
        </h3>
        <p className="text-term-green/60 font-mono text-sm">
          Real-time deck validation and diagnostics
        </p>
      </div>

      {/* RAM Budget Panel */}
      <div className="bg-term-gray/50 border border-term-amber/40 rounded p-4">
        <h4 className="text-term-amber font-mono font-bold mb-3">RAM BUDGET</h4>
        <div className="space-y-3">
          {Object.keys(ramBudget).map((color) => {
            const budget = ramBudget[color];
            const used = ramUsed[color] || 0;
            const percentage = (used / budget) * 100;
            const isOverload = used > budget;

            return (
              <div key={color}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-term-green font-mono text-sm">
                    {color}
                  </span>
                  <span
                    className={`font-mono text-sm font-bold ${
                      isOverload ? "text-term-red" : "text-term-green"
                    }`}
                  >
                    {used}/{budget}
                  </span>
                </div>
                <div className="bg-term-gray-light rounded overflow-hidden h-6">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isOverload
                        ? "bg-term-red animate-pulse"
                        : percentage > 80
                          ? "bg-term-amber"
                          : "bg-term-green"
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deck Size Panel */}
      <div className="bg-term-gray/50 border border-term-blue/40 rounded p-4">
        <h4 className="text-term-blue font-mono font-bold mb-3">DECK SIZE</h4>
        <div className="flex justify-between items-center mb-1">
          <span className="text-term-green font-mono text-sm">Main Deck</span>
          <span
            className={`font-mono text-sm font-bold ${
              deckSize < 40 || deckSize > 50
                ? "text-term-red"
                : "text-term-green"
            }`}
          >
            {deckSize}/50
          </span>
        </div>
        <div className="bg-term-gray-light rounded overflow-hidden h-6">
          <div
            className={`h-full transition-all duration-500 ${
              deckSize < 40
                ? "bg-term-red"
                : deckSize > 50
                  ? "bg-term-red"
                  : "bg-term-green"
            }`}
            style={{ width: `${(deckSize / 50) * 100}%` }}
          />
        </div>
        <p className="text-term-green/60 font-mono text-xs mt-2">
          Legal range: 40-50 cards
        </p>
      </div>

      {/* Errors Panel */}
      {errors.length > 0 && (
        <div className="bg-term-red/10 border-2 border-term-red/40 rounded p-4">
          <h4 className="text-term-red font-mono font-bold mb-3 flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            CRITICAL ERRORS ({errors.length})
          </h4>
          <div className="space-y-2">
            {errors.map((error, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-term-red font-mono text-sm"
              >
                <span className="text-term-red">•</span>
                <span className="flex-1">
                  [{error.type}] {error.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings Panel */}
      {warnings.length > 0 && (
        <div className="bg-term-amber/10 border border-term-amber/40 rounded p-4">
          <h4 className="text-term-amber font-mono font-bold mb-3">
            ⚡ WARNINGS ({warnings.length})
          </h4>
          <div className="space-y-2">
            {warnings.map((warning, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-term-amber font-mono text-sm"
              >
                <span>→</span>
                <span className="flex-1">
                  [{warning.type}] {warning.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Clear */}
      {errors.length === 0 && warnings.length === 0 && (
        <div className="bg-term-green/10 border-2 border-term-green/40 rounded p-6 text-center">
          <div className="text-term-green text-6xl mb-3">✓</div>
          <h4 className="text-term-green font-mono font-bold text-xl mb-2">
            ALL SYSTEMS NOMINAL
          </h4>
          <p className="text-term-green/60 font-mono text-sm">
            Deck is tournament-legal and ready for testing
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CURVE TAB
// ============================================================================

function CurveTab({ analytics }) {
  const maxCount = Math.max(...Object.values(analytics.curveCounts));

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-term-gray/50 border border-term-blue/30 rounded p-4 text-center">
          <p className="text-term-blue/60 font-mono text-xs mb-1">
            AVERAGE COST
          </p>
          <p className="text-term-blue font-mono text-3xl font-bold">
            {analytics.avgCost}
          </p>
        </div>

        <div className="bg-term-gray/50 border border-term-green/30 rounded p-4 text-center">
          <p className="text-term-green/60 font-mono text-xs mb-1">
            TOTAL CARDS
          </p>
          <p className="text-term-green font-mono text-3xl font-bold">
            {analytics.totalCards}
          </p>
        </div>

        <div className="bg-term-gray/50 border border-term-amber/30 rounded p-4 text-center">
          <p className="text-term-amber/60 font-mono text-xs mb-1">
            CURVE WARNING
          </p>
          <p className="text-term-amber font-mono text-lg font-bold">
            {analytics.avgCost > 3.5 ? "TOO SLOW" : "GOOD"}
          </p>
        </div>
      </div>

      {/* Eddies Curve Bar Chart */}
      <div>
        <h3 className="text-term-amber font-mono font-bold mb-4">
          EDDIES CURVE (Cost Distribution):
        </h3>
        <div className="space-y-2">
          {Object.entries(analytics.curveCounts).map(([cost, count]) => {
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return (
              <div key={cost} className="flex items-center gap-3">
                <span className="text-term-green font-mono text-sm w-8">
                  {cost}€
                </span>
                <div className="flex-1 bg-term-gray-light rounded overflow-hidden h-8">
                  <div
                    className="bg-term-blue h-full flex items-center justify-end pr-2 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  >
                    {count > 0 && (
                      <span className="text-white font-mono text-xs font-bold">
                        {count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Curve Analysis */}
      <div className="bg-term-amber/10 border border-term-amber/30 rounded p-4">
        <h4 className="text-term-amber font-mono font-bold mb-2">ANALYSIS:</h4>
        <ul className="space-y-1 text-term-green font-mono text-sm">
          {analytics.avgCost <= 2.5 && (
            <li>✓ Fast aggro curve — excellent for early pressure</li>
          )}
          {analytics.avgCost > 2.5 && analytics.avgCost <= 3.5 && (
            <li>✓ Balanced midrange curve — good tempo potential</li>
          )}
          {analytics.avgCost > 3.5 && (
            <li className="text-term-red">
              ⚠ Top-heavy curve — may struggle against aggro
            </li>
          )}
          {analytics.curveCounts[0] + analytics.curveCounts[1] >= 8 && (
            <li>✓ Strong early game presence</li>
          )}
          {analytics.curveCounts[0] + analytics.curveCounts[1] < 5 && (
            <li className="text-term-red">
              ⚠ Weak early game — consider adding cheap units
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// SYNERGIES TAB
// ============================================================================

function SynergiesTab({ deck, analytics }) {
  // Top tags by count
  const topTags = Object.entries(analytics.tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* RAM Distribution */}
      <div>
        <h3 className="text-term-amber font-mono font-bold mb-3">
          RAM COLORS (Legends):
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(analytics.ramCounts).map(([color, count]) => (
            <div
              key={color}
              className={`border-2 rounded p-3 text-center ${
                color === "Red"
                  ? "border-term-red bg-term-red/10"
                  : color === "Yellow"
                    ? "border-term-amber bg-term-amber/10"
                    : color === "Green"
                      ? "border-term-green bg-term-green/10"
                      : color === "Blue"
                        ? "border-term-blue bg-term-blue/10"
                        : "border-gray-500 bg-gray-500/10"
              }`}
            >
              <p
                className={`font-mono text-xs mb-1 ${
                  color === "Red"
                    ? "text-term-red"
                    : color === "Yellow"
                      ? "text-term-amber"
                      : color === "Green"
                        ? "text-term-green"
                        : color === "Blue"
                          ? "text-term-blue"
                          : "text-gray-400"
                }`}
              >
                {color}
              </p>
              <p
                className={`font-mono text-2xl font-bold ${
                  color === "Red"
                    ? "text-term-red"
                    : color === "Yellow"
                      ? "text-term-amber"
                      : color === "Green"
                        ? "text-term-green"
                        : color === "Blue"
                          ? "text-term-blue"
                          : "text-gray-400"
                }`}
              >
                {count}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tag Synergies */}
      <div>
        <h3 className="text-term-amber font-mono font-bold mb-3">
          TOP TAG SYNERGIES:
        </h3>
        {topTags.length > 0 ? (
          <div className="space-y-2">
            {topTags.map(([tag, count], index) => {
              const percentage = (count / analytics.totalCards) * 100;
              return (
                <div
                  key={tag}
                  className="bg-term-gray/50 border border-term-green/30 rounded p-3"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-term-green font-mono font-bold">
                      #{index + 1} {tag}
                    </span>
                    <span className="text-term-amber font-mono text-sm">
                      {count} cards ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="bg-term-gray-light rounded overflow-hidden h-2">
                    <div
                      className="bg-term-green h-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-term-green/60 font-mono text-sm">
            No tag synergies detected. Add cards with keywords to build tribal
            strategies.
          </p>
        )}
      </div>

      {/* Type Distribution */}
      <div>
        <h3 className="text-term-amber font-mono font-bold mb-3">
          TYPE DISTRIBUTION:
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(analytics.typeCounts).map(([type, count]) => (
            <div
              key={type}
              className="bg-term-gray/50 border border-term-blue/30 rounded p-3 text-center"
            >
              <p className="text-term-blue/60 font-mono text-xs mb-1">{type}</p>
              <p className="text-term-blue font-mono text-2xl font-bold">
                {count}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONSISTENCY TAB
// ============================================================================

function ConsistencyTab({ analytics }) {
  // Calculate consistency metrics
  const hasGoodCurve = analytics.avgCost >= 2.0 && analytics.avgCost <= 3.5;
  const hasEarlyGame =
    (analytics.curveCounts[0] || 0) + (analytics.curveCounts[1] || 0) >= 6;
  const hasLateGame =
    (analytics.curveCounts[5] || 0) +
      (analytics.curveCounts[6] || 0) +
      (analytics.curveCounts[7] || 0) >=
    4;

  const consistencyScore =
    (hasGoodCurve ? 33 : 0) + (hasEarlyGame ? 33 : 0) + (hasLateGame ? 34 : 0);

  return (
    <div className="space-y-6">
      {/* Consistency Score */}
      <div className="bg-term-gray/50 border-2 border-term-amber rounded p-6 text-center">
        <p className="text-term-amber/60 font-mono text-sm mb-2">
          CONSISTENCY SCORE
        </p>
        <p className="text-term-amber font-mono text-6xl font-bold mb-2">
          {consistencyScore}%
        </p>
        <p className="text-term-green font-mono text-sm">
          {consistencyScore >= 80
            ? "Excellent — Deck is well-balanced"
            : consistencyScore >= 60
              ? "Good — Minor adjustments recommended"
              : "Needs Work — Curve issues detected"}
        </p>
      </div>

      {/* Playable Hand Probability */}
      <div className="bg-term-gray/50 border-2 border-term-blue rounded p-6">
        <h3 className="text-term-blue font-mono font-bold mb-3 text-lg">
          OPENING HAND ANALYSIS
        </h3>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-term-green font-mono text-sm">
              Probability of playable hand:
            </span>
            <span className="text-term-amber font-mono text-2xl font-bold">
              {(analytics.playableHandProbability * 100).toFixed(1)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="bg-term-gray-light rounded overflow-hidden h-4">
            <div
              className={`h-full transition-all duration-500 ${
                analytics.playableHandProbability >= 0.8
                  ? "bg-term-green"
                  : analytics.playableHandProbability >= 0.6
                    ? "bg-term-amber"
                    : "bg-term-red"
              }`}
              style={{ width: `${analytics.playableHandProbability * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="text-term-green/80 font-sans text-sm space-y-2">
          <p>
            • Cheap cards (0-2 cost):{" "}
            <span className="text-term-amber font-bold">
              {analytics.cheapCards}
            </span>{" "}
            / {analytics.totalCards}
          </p>
          <p>
            • This deck has a{" "}
            <span className="text-term-amber font-bold">
              {(analytics.playableHandProbability * 100).toFixed(1)}%
            </span>{" "}
            chance of drawing at least one playable card (cost ≤2) in your
            opening hand of 6.
          </p>

          {analytics.playableHandProbability >= 0.85 && (
            <p className="text-term-green">
              ✓ Excellent consistency! You'll almost always have turn 1 plays.
            </p>
          )}

          {analytics.playableHandProbability >= 0.65 &&
            analytics.playableHandProbability < 0.85 && (
              <p className="text-term-amber">
                → Good consistency. Consider adding 2-3 more cheap cards for
                reliability.
              </p>
            )}

          {analytics.playableHandProbability < 0.65 && (
            <p className="text-term-red">
              ⚠ Low consistency! Add more 0-2 cost cards to avoid dead hands.
            </p>
          )}
        </div>
      </div>

      {/* Consistency Checks */}
      <div>
        <h3 className="text-term-amber font-mono font-bold mb-3">
          CONSISTENCY CHECKS:
        </h3>
        <div className="space-y-3">
          <div
            className={`border rounded p-4 ${
              hasGoodCurve
                ? "border-term-green bg-term-green/10"
                : "border-term-red bg-term-red/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`text-2xl ${hasGoodCurve ? "text-term-green" : "text-term-red"}`}
              >
                {hasGoodCurve ? "✓" : "✗"}
              </span>
              <div className="flex-1">
                <p
                  className={`font-mono font-bold ${hasGoodCurve ? "text-term-green" : "text-term-red"}`}
                >
                  Balanced Curve
                </p>
                <p className="font-mono text-xs text-term-green/60">
                  Average cost between 2.0 and 3.5 (Current: {analytics.avgCost}
                  )
                </p>
              </div>
            </div>
          </div>

          <div
            className={`border rounded p-4 ${
              hasEarlyGame
                ? "border-term-green bg-term-green/10"
                : "border-term-red bg-term-red/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`text-2xl ${hasEarlyGame ? "text-term-green" : "text-term-red"}`}
              >
                {hasEarlyGame ? "✓" : "✗"}
              </span>
              <div className="flex-1">
                <p
                  className={`font-mono font-bold ${hasEarlyGame ? "text-term-green" : "text-term-red"}`}
                >
                  Early Game Presence
                </p>
                <p className="font-mono text-xs text-term-green/60">
                  At least 6 cards at 0-1 cost (Current:{" "}
                  {(analytics.curveCounts[0] || 0) +
                    (analytics.curveCounts[1] || 0)}
                  )
                </p>
              </div>
            </div>
          </div>

          <div
            className={`border rounded p-4 ${
              hasLateGame
                ? "border-term-green bg-term-green/10"
                : "border-term-red bg-term-red/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`text-2xl ${hasLateGame ? "text-term-green" : "text-term-red"}`}
              >
                {hasLateGame ? "✓" : "✗"}
              </span>
              <div className="flex-1">
                <p
                  className={`font-mono font-bold ${hasLateGame ? "text-term-green" : "text-term-red"}`}
                >
                  Late Game Threats
                </p>
                <p className="font-mono text-xs text-term-green/60">
                  At least 4 cards at 5+ cost (Current:{" "}
                  {(analytics.curveCounts[5] || 0) +
                    (analytics.curveCounts[6] || 0) +
                    (analytics.curveCounts[7] || 0)}
                  )
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-term-blue/10 border border-term-blue/30 rounded p-4">
        <h4 className="text-term-blue font-mono font-bold mb-2">
          RECOMMENDATIONS:
        </h4>
        <ul className="space-y-1 text-term-green font-mono text-sm">
          {!hasGoodCurve && analytics.avgCost > 3.5 && (
            <li>→ Add more cheap cards (0-2 cost) to lower average cost</li>
          )}
          {!hasGoodCurve && analytics.avgCost < 2.0 && (
            <li>→ Add more late-game threats to avoid running out of steam</li>
          )}
          {!hasEarlyGame && (
            <li>→ Add at least 6 cards at 0-1 cost for early board presence</li>
          )}
          {!hasLateGame && <li>→ Add 4+ high-cost bombs to close out games</li>}
          {consistencyScore >= 80 && (
            <li className="text-term-green">
              ✓ Deck is well-balanced! Focus on playtesting and tuning.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// HYPERGEOMETRIC DISTRIBUTION
// ============================================================================

function calculateHypergeometric(N, K, n) {
  // P(X ≥ 1) = 1 - P(X = 0)
  // N = deck size
  // K = success cards (cost ≤ 2)
  // n = hand size (6)

  if (K === 0 || N < n) return 0;
  if (K >= n) return 1; // Si hay más cartas baratas que el tamaño de mano

  const pZero = binomial(N - K, n) / binomial(N, n);
  return Math.max(0, Math.min(1, 1 - pZero));
}

function binomial(n, k) {
  if (k > n || k < 0) return 0;
  if (k === 0 || k === n) return 1;

  // Optimización: C(n,k) = C(n, n-k)
  k = Math.min(k, n - k);

  let result = 1;
  for (let i = 1; i <= k; i++) {
    result *= (n - i + 1) / i;
  }
  return result;
}
