import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SmartCardImage from "./SmartCardImage";

export default function MulliganModal({ deck, allCards, goingFirst, onClose }) {
  const [hand, setHand] = useState([]);
  const [revealedCards, setRevealedCards] = useState([]); // <-- Estado para voltear
  const [mulliganUsed, setMulliganUsed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [randomLegends, setRandomLegends] = useState([]);

  const shuffle = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateRandomLegends = () => {
    const legendCards = allCards.filter((c) => c.type === "LEGEND");
    return shuffle(legendCards).slice(0, 3);
  };

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

  const generateTestPool = () => {
    const legends = deck.legends.length > 0 ? deck.legends : randomLegends;
    if (!legends || legends.length === 0) {
      return allCards.filter((c) => c.type !== "LEGEND");
    }

    const allowedColors = getAllowedColors(legends);
    let eligibleCards = allCards.filter((c) => {
      if (c.type === "LEGEND") return false;
      if (!c.tags || c.tags.length === 0) return true;
      return c.tags.some((tag) => allowedColors.includes(tag.toUpperCase()));
    });

    if (eligibleCards.length === 0) {
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

  const drawHand = () => {
    const source =
      deck.mainDeck.length > 0 ? deck.mainDeck : generateTestPool();
    const shuffled = shuffle(source);
    const drawn = shuffled.slice(0, 6);

    setHand(drawn);
    analyzeHand(drawn);
    setRevealedCards([]); // Ocultamos las cartas nuevas
  };

  const analyzeHand = (cards) => {
    const cheapCards = cards.filter((c) => c.cost <= 3).length;
    const curveScore =
      cheapCards >= 3
        ? { status: "SOLID", emoji: "✅", color: "text-term-green" }
        : cheapCards === 2
          ? { status: "OKAY", emoji: "⚠️", color: "text-term-amber" }
          : { status: "BRICKED", emoji: "❌", color: "text-term-red" };

    const units = cards.filter((c) => c.type === "UNIT").length;
    const defenseScore =
      units >= 2
        ? { status: "GOOD", emoji: "✅", color: "text-term-green" }
        : units === 1
          ? { status: "RISKY", emoji: "⚠️", color: "text-term-amber" }
          : { status: "NO BLOCKERS", emoji: "❌", color: "text-term-red" };

    let advice = "";
    if (curveScore.status === "BRICKED")
      advice =
        "⚠️ BRICKED HAND: All cards are high-cost. You will have no early plays. HIGHLY RECOMMEND MULLIGAN.";
    else if (defenseScore.status === "NO BLOCKERS")
      advice =
        "⚠️ NO DEFENSE: You have no Units to block attacks. Consider Mulligan unless you plan hyper-aggressive.";
    else if (curveScore.status === "SOLID" && defenseScore.status === "GOOD")
      advice =
        "✅ KEEP THIS HAND. Solid curve and defense. Don't waste your Mulligan on a playable opening.";
    else
      advice =
        "⚠️ PLAYABLE BUT RISKY: This hand can work but has weaknesses. Mulligan if uncomfortable.";

    setAnalysis({ curveScore, defenseScore, advice });
  };

  const handleMulligan = () => {
    if (mulliganUsed || isAnimating) return;
    setIsAnimating(true);
    setMulliganUsed(true);

    setTimeout(() => {
      drawHand();
      setIsAnimating(false);
    }, 800);
  };

  const handleRevealCard = (index) => {
    if (!revealedCards.includes(index)) {
      setRevealedCards([...revealedCards, index]);
    }
  };

  useEffect(() => {
    if (deck.legends.length === 0 && randomLegends.length === 0) {
      setRandomLegends(generateRandomLegends());
    }
  }, []);

  useEffect(() => {
    if (deck.legends.length > 0 || randomLegends.length > 0) {
      drawHand();
    }
  }, [randomLegends]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="bg-term-gray border-2 border-term-blue rounded-lg max-w-6xl w-full my-8"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ position: "relative" }}
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
                      className={`relative transition-all duration-500 ${isTapped ? "w-40" : "w-32"}`}
                    >
                      <SmartCardImage
                        card={legend}
                        eagerLoad={true}
                        className={`w-full rounded border-2 border-term-amber transition-all duration-500 ${isTapped ? "brightness-[0.3] saturate-50 rotate-90" : ""}`}
                      />
                    </div>
                  );
                },
              )}
            </div>
          </div>

          {/* Hand Display (UNBOXING STYLE) */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-term-green font-bold font-mono">HAND (6)</h3>
              {revealedCards.length < hand.length && !isAnimating && (
                <button
                  onClick={() => setRevealedCards(hand.map((_, i) => i))}
                  className="text-term-amber text-xs font-mono border border-term-amber/30 px-2 py-1 rounded hover:bg-term-amber/20"
                >
                  [ REVEAL ALL ]
                </button>
              )}
            </div>

            <div
              className={`grid grid-cols-3 md:grid-cols-6 gap-2 transition-opacity duration-300 ${isAnimating ? "opacity-0" : "opacity-100"}`}
            >
              {hand.map((card, idx) => {
                const isRevealed = revealedCards.includes(idx);
                return (
                  <div
                    key={`${card.id}-${idx}`}
                    className="pack-card-container cursor-pointer"
                    onClick={() => handleRevealCard(idx)}
                  >
                    <div
                      className={`card-flipper ${isRevealed ? "flipped" : ""}`}
                    >
                      {/* Back Face */}
                      <div
                        className="card-face back"
                        style={{
                          backgroundImage: "url(/BackCardTCGCybeprunk.png)",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        <div className="absolute inset-0 bg-black/20 rounded flex items-center justify-center hover:bg-black/40 transition-colors">
                          <span className="text-white font-mono text-[10px] opacity-0 hover:opacity-100 transition-opacity bg-black/60 px-2 py-1 rounded">
                            CLICK
                          </span>
                        </div>
                      </div>

                      {/* Front Face */}
                      <div
                        className={`card-face front rounded border-2 ${card.foil ? "foil-card border-transparent" : "border-term-green/40"}`}
                      >
                        <SmartCardImage
                          card={card}
                          eagerLoad={true}
                          className="w-full h-full object-cover rounded"
                        />
                        {card.foil && (
                          <div className="absolute top-1 right-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-black rounded-full px-2 py-0.5 text-[10px] font-bold shadow-lg animate-pulse z-10">
                            ✨ FOIL
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/90 text-term-green text-[10px] font-mono p-1 text-center truncate z-10">
                          {card.name}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Analysis Panel (Solo aparece cuando revelas todo) */}
          {analysis && revealedCards.length === 6 && (
            <div className="mb-6 p-4 bg-black/40 rounded border border-term-amber/30">
              <h3 className="text-term-green font-bold font-mono mb-3 flex items-center gap-2">
                🧠 NETRUNNER ANALYSIS
              </h3>
              <div className="space-y-3 text-sm font-mono">
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

          {goingFirst && (
            <div className="text-center text-term-amber/80 text-xs font-mono">
              ⚠️ Going First: 2 Legends start tapped (shown above)
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
