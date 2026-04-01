import { useState, useEffect } from "react";
import SmartCardImage from "./SmartCardImage";

export default function MulliganModal({ deck, allCards, goingFirst, onClose }) {
  const [hand, setHand] = useState([]);
  const [mulliganUsed, setMulliganUsed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [randomLegends, setRandomLegends] = useState([]);

  // Shuffle array
  const shuffle = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Generate random legends if no deck loaded
  const generateRandomLegends = () => {
    const legendCards = allCards.filter((c) => c.type === "LEGEND");
    const shuffled = shuffle(legendCards);
    return shuffled.slice(0, 3);
  };

  // Get allowed colors from legends
  const getAllowedColors = (legends) => {
    const colors = new Set();
    legends.forEach((legend) => {
      if (legend.tags && Array.isArray(legend.tags)) {
        legend.tags.forEach((tag) => {
          const upperTag = tag.toUpperCase();
          if (["ARASAKA", "MERC", "NETRUNNER", "CORPO"].includes(upperTag)) {
            colors.add(upperTag);
          }
        });
      }
    });
    return Array.from(colors);
  };

  // Generate random test pool if no deck loaded
  const generateTestPool = () => {
    const legends = deck.legends.length > 0 ? deck.legends : randomLegends;

    // Safety check
    if (!legends || legends.length === 0) {
      console.warn("No legends available for color filtering");
      const nonLegends = allCards.filter((c) => c.type !== "LEGEND");
      return nonLegends;
    }

    const allowedColors = getAllowedColors(legends);

    console.log(
      "Legends:",
      legends.map((l) => l.name),
    );
    console.log("Allowed Colors:", allowedColors);

    // Filter cards by allowed colors
    let eligibleCards = allCards.filter((c) => {
      if (c.type === "LEGEND") return false;

      // If card has no tags, it's colorless/neutral - allow it
      if (!c.tags || c.tags.length === 0) return true;

      // Check if card has at least one matching color
      const hasMatchingColor = c.tags.some((tag) => {
        const upperTag = tag.toUpperCase();
        return allowedColors.includes(upperTag);
      });

      return hasMatchingColor;
    });

    console.log("Eligible cards count:", eligibleCards.length);

    // If no eligible cards (shouldn't happen), use all non-legends
    if (eligibleCards.length === 0) {
      console.warn("No eligible cards found, using all non-legends");
      eligibleCards = allCards.filter((c) => c.type !== "LEGEND");
    }

    const pool = [];
    eligibleCards.forEach((card) => {
      const copies = Math.min(3, Math.floor(Math.random() * 3) + 1);
      for (let i = 0; i < copies; i++) {
        pool.push(card);
      }
    });

    return pool;
  };

  // Draw 6 cards
  const drawHand = () => {
    const source =
      deck.mainDeck.length > 0 ? deck.mainDeck : generateTestPool();

    const shuffled = shuffle(source);
    const drawn = shuffled.slice(0, 6);

    setHand(drawn);
    analyzeHand(drawn);
  };

  // Analyze hand
  const analyzeHand = (cards) => {
    // Curve analysis
    const cheapCards = cards.filter((c) => c.cost <= 3).length;
    const curveScore =
      cheapCards >= 3
        ? { status: "SOLID", emoji: "✅", color: "text-term-green" }
        : cheapCards === 2
          ? { status: "OKAY", emoji: "⚠️", color: "text-term-amber" }
          : { status: "BRICKED", emoji: "❌", color: "text-term-red" };

    // Defense analysis
    const units = cards.filter((c) => c.type === "UNIT").length;
    const defenseScore =
      units >= 2
        ? { status: "GOOD", emoji: "✅", color: "text-term-green" }
        : units === 1
          ? { status: "RISKY", emoji: "⚠️", color: "text-term-amber" }
          : { status: "NO BLOCKERS", emoji: "❌", color: "text-term-red" };

    // Generate advice
    let advice = "";
    if (curveScore.status === "BRICKED") {
      advice =
        "⚠️ BRICKED HAND: All cards are high-cost. You will have no early plays. HIGHLY RECOMMEND MULLIGAN.";
    } else if (defenseScore.status === "NO BLOCKERS") {
      advice =
        "⚠️ NO DEFENSE: You have no Units to block attacks. Consider Mulligan unless you plan hyper-aggressive.";
    } else if (
      curveScore.status === "SOLID" &&
      defenseScore.status === "GOOD"
    ) {
      advice =
        "✅ KEEP THIS HAND. Solid curve and defense. Don't waste your Mulligan on a playable opening.";
    } else {
      advice =
        "⚠️ PLAYABLE BUT RISKY: This hand can work but has weaknesses. Mulligan if uncomfortable.";
    }

    setAnalysis({ curveScore, defenseScore, advice });
  };

  // Handle mulligan
  const handleMulligan = () => {
    if (mulliganUsed || isAnimating) return;

    setIsAnimating(true);
    setMulliganUsed(true);

    // Fade out animation
    setTimeout(() => {
      drawHand();
      setIsAnimating(false);
    }, 800);
  };

  // Generate random legends on mount if needed
  useEffect(() => {
    if (deck.legends.length === 0 && randomLegends.length === 0) {
      const legends = generateRandomLegends();
      console.log(
        "Generated random legends:",
        legends.map((l) => l.name),
      );
      setRandomLegends(legends);
    }
  }, []);

  // Draw hand once legends are ready
  useEffect(() => {
    if (deck.legends.length > 0 || randomLegends.length > 0) {
      drawHand();
    }
  }, [randomLegends]);

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-term-gray border-2 border-term-amber rounded-lg p-6 max-w-6xl w-full max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-term-amber font-bold text-2xl font-mono">
            🎲 OPENING HAND SIMULATOR
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-term-amber transition-colors text-3xl"
          >
            ✕
          </button>
        </div>

        {/* Deck Info */}
        <div className="flex justify-between items-center mb-6 text-sm font-mono">
          <div className="text-term-green">
            Deck:{" "}
            {deck.mainDeck.length > 0
              ? `Current (${deck.mainDeck.length} cards)`
              : `Random Test Pool (${randomLegends.map((l) => l.name).join(", ")})`}
          </div>
          <div className="text-term-amber">
            Mulligan: {mulliganUsed ? "1/1 Used" : "0/1 Used"}
          </div>
        </div>

        {/* Legends Display */}
        <div className="mb-6">
          <h3 className="text-term-green font-bold font-mono mb-3">
            LEGENDS [{deck.legends.length || 3}/3]
          </h3>
          <div className="flex justify-center items-center gap-6 min-h-[200px]">
            {(deck.legends.length > 0 ? deck.legends : randomLegends).map(
              (legend, idx) => {
                const isTapped = goingFirst && idx > 0;
                return (
                  <div
                    key={idx}
                    className={`relative transition-all duration-500 ${
                      isTapped ? "w-40" : "w-32"
                    }`}
                  >
                    <SmartCardImage
                      card={legend}
                      className={`w-full rounded border-2 border-term-amber transition-all duration-500 ${
                        isTapped ? "brightness-[0.3] saturate-50 rotate-90" : ""
                      }`}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300x420/1a1a1a/ffb300?text=NO+IMAGE";
                      }}
                    />
                  </div>
                );
              },
            )}
          </div>
        </div>

        {/* Hand Display */}
        <div className="mb-6">
          <h3 className="text-term-green font-bold font-mono mb-3">HAND (6)</h3>
          <div
            className={`grid grid-cols-6 gap-2 transition-opacity duration-300 ${
              isAnimating ? "opacity-0" : "opacity-100"
            }`}
          >
            {hand.map((card, idx) => (
              <div
                key={`${card.id}-${idx}`}
                className="card-flip"
                style={{
                  animationDelay: `${idx * 0.1}s`,
                }}
              >
                <div className="relative group">
                  <SmartCardImage
                    card={card}
                    className="w-full h-auto rounded"
                  />
                  {/* Card Name on Hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-term-green text-xs font-mono p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {card.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Panel */}
        {analysis && (
          <div className="mb-6 p-4 bg-black/40 rounded border border-term-amber/30">
            <h3 className="text-term-green font-bold font-mono mb-3 flex items-center gap-2">
              🧠 NETRUNNER ANALYSIS
            </h3>

            <div className="space-y-3 text-sm font-mono">
              {/* Curve */}
              <div className="flex items-center gap-3">
                <span className={analysis.curveScore.color}>
                  {analysis.curveScore.emoji}
                </span>
                <span className="text-term-amber">📊 CURVE:</span>
                <span className={analysis.curveScore.color}>
                  {analysis.curveScore.status}
                </span>
                <span className="text-term-green/60 text-xs">
                  ({hand.filter((c) => c.cost <= 3).length} playable Turn 1-2)
                </span>
              </div>

              {/* Defense */}
              <div className="flex items-center gap-3">
                <span className={analysis.defenseScore.color}>
                  {analysis.defenseScore.emoji}
                </span>
                <span className="text-term-amber">🛡️ DEFENSE:</span>
                <span className={analysis.defenseScore.color}>
                  {analysis.defenseScore.status}
                </span>
                <span className="text-term-green/60 text-xs">
                  ({hand.filter((c) => c.type === "UNIT").length} Units)
                </span>
              </div>

              {/* Advice */}
              <div className="pt-3 border-t border-term-amber/20">
                <div className="text-term-amber mb-1">💡 FIXER'S ADVICE:</div>
                <div className="text-term-green/90 text-xs leading-relaxed">
                  {analysis.advice}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={onClose}
            className="bg-term-green text-term-black py-3 px-6 rounded font-mono font-bold hover:bg-green-400 transition-colors"
          >
            [✅ KEEP HAND]
          </button>

          <button
            onClick={handleMulligan}
            disabled={mulliganUsed || isAnimating}
            className={`py-3 px-6 rounded font-mono font-bold transition-colors ${
              mulliganUsed || isAnimating
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-term-amber text-term-black hover:bg-yellow-400"
            }`}
          >
            {mulliganUsed
              ? "[MULLIGAN USED]"
              : isAnimating
                ? "[SHUFFLING...]"
                : "[🔄 MULLIGAN (1 LEFT)]"}
          </button>
        </div>

        {/* Warning */}
        {goingFirst && (
          <div className="text-center text-term-amber/80 text-xs font-mono">
            ⚠️ Going First: 2 Legends start tapped (shown above)
          </div>
        )}
      </div>
    </div>
  );
}
