// EX MACHINA — DeckAnalytics with animated bars
import { motion } from "framer-motion";

function AnimatedBar({
  value,
  max,
  color = "bg-term-green/60",
  label,
  count,
  delay = 0,
}) {
  const width = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-term-green font-mono text-xs w-8 text-right">
        {label}
      </span>
      <div className="flex-1 bg-term-gray-light rounded h-5 relative overflow-hidden">
        <motion.div
          className={`${color} h-full rounded`}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.6, delay, ease: "easeOut" }}
        ></motion.div>
        <span className="absolute inset-0 flex items-center justify-center text-white font-mono text-xs font-bold drop-shadow">
          {count}
        </span>
      </div>
    </div>
  );
}

export default function DeckAnalytics({ deck }) {
  const mainDeck = deck.mainDeck || [];
  const legends = deck.legends || [];

  if (mainDeck.length === 0) {
    return (
      <div className="card-container">
        <h2 className="text-term-amber font-bold mb-3 font-mono">
          ANALYTICS.SYS
        </h2>
        <p className="text-term-green/60 text-sm font-mono">
          Add cards to see analytics
        </p>
      </div>
    );
  }

  // ── Eddie Curve ──────────────────────────────────────────────
  const eddieCurve = mainDeck.reduce((acc, card) => {
    const cost = card.cost || 0;
    const bucket = cost >= 5 ? "5+" : String(cost);
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, {});
  const maxCurve = Math.max(...Object.values(eddieCurve), 1);
  const avgCost = (
    mainDeck.reduce((s, c) => s + (c.cost || 0), 0) / mainDeck.length
  ).toFixed(2);
  const deckTooSlow = parseFloat(avgCost) > 2.8;
  const deckTooFast = parseFloat(avgCost) < 1.5;

  // ── Type Distribution ────────────────────────────────────────
  const typeDist = mainDeck.reduce((acc, c) => {
    acc[c.type || "UNKNOWN"] = (acc[c.type || "UNKNOWN"] || 0) + 1;
    return acc;
  }, {});
  const maxType = Math.max(...Object.values(typeDist), 1);
  const typeColors = {
    UNIT: "bg-term-red/60",
    GEAR: "bg-cyan-500/60",
    PROGRAM: "bg-purple-500/60",
    LEGEND: "bg-term-amber/60",
  };

  // ── Faction Tribal ───────────────────────────────────────────
  const allCards = [...mainDeck, ...legends];
  const factionDist = allCards.reduce((acc, c) => {
    const f = c.faction || "Neutral";
    acc[f] = (acc[f] || 0) + 1;
    return acc;
  }, {});
  const topFaction = Object.entries(factionDist).sort((a, b) => b[1] - a[1])[0];
  const tribalPct = topFaction
    ? Math.round((topFaction[1] / allCards.length) * 100)
    : 0;
  const strongTribal = tribalPct > 60;

  // ── T1 Playability ───────────────────────────────────────────
  const t1Cards = mainDeck.filter((c) => (c.cost || 0) <= 1).length;
  const t1Pct = Math.round((t1Cards / mainDeck.length) * 100);
  const goodT1 = t1Pct >= 15;

  // ── Sellable (€$) cards ──────────────────────────────────────
  const sellableCount = mainDeck.filter(
    (c) => (c.cost || 0) > 0 && c.type !== "PROGRAM",
  ).length;
  const sellablePct = Math.round((sellableCount / mainDeck.length) * 100);

  // ── Draw sources ─────────────────────────────────────────────
  const drawCount = mainDeck.filter((c) => {
    const t = (c.text || "").toLowerCase();
    return t.includes("draw") || t.includes("roba");
  }).length;

  // ── Total cards ──────────────────────────────────────────────
  const total = mainDeck.length + legends.length;

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="card-container">
        <h3 className="text-term-amber font-bold mb-3 font-mono text-sm">
          DECK STATS
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "TOTAL",
              value: total,
              sub: "/ 50 max",
              color: total >= 40 ? "text-term-green" : "text-term-red",
            },
            {
              label: "AVG COST",
              value: `${avgCost}€`,
              sub: deckTooSlow ? "⚠ slow" : deckTooFast ? "⚡ fast" : "✓ good",
              color:
                deckTooSlow || deckTooFast
                  ? "text-term-red"
                  : "text-term-green",
            },
            {
              label: "T1 PLAYS",
              value: `${t1Pct}%`,
              sub: goodT1 ? "✓ solid" : "⚠ low",
              color: goodT1 ? "text-term-green" : "text-term-amber",
            },
          ].map(({ label, value, sub, color }) => (
            <div
              key={label}
              className="bg-term-black/40 rounded p-2 text-center border border-term-amber/20"
            >
              <div className="text-term-amber/60 font-mono text-[9px] mb-1">
                {label}
              </div>
              <div className={`font-mono font-bold text-lg ${color}`}>
                {value}
              </div>
              <div className="text-term-amber/40 font-mono text-[9px]">
                {sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Eddie Cost Curve */}
      <div className="card-container">
        <h3 className="text-term-amber font-bold mb-3 font-mono text-sm flex justify-between">
          <span>EDDIE CURVE</span>
          <span
            className={`text-xs font-normal ${deckTooSlow ? "text-term-red" : "text-term-green"}`}
          >
            {deckTooSlow
              ? "⚠ TOO SLOW"
              : deckTooFast
                ? "⚡ HYPER AGGRO"
                : "✓ BALANCED"}
          </span>
        </h3>
        <div className="space-y-2">
          {["0", "1", "2", "3", "4", "5+"].map((cost, i) => (
            <AnimatedBar
              key={cost}
              label={`${cost}€`}
              value={eddieCurve[cost] || 0}
              max={maxCurve}
              count={eddieCurve[cost] || 0}
              color={
                cost === "0"
                  ? "bg-term-green/40"
                  : cost === "5+"
                    ? "bg-term-red/60"
                    : "bg-term-green/60"
              }
              delay={i * 0.08}
            />
          ))}
        </div>
      </div>

      {/* Type Distribution */}
      <div className="card-container">
        <h3 className="text-term-amber font-bold mb-3 font-mono text-sm">
          TYPE DISTRIBUTION
        </h3>
        <div className="space-y-2">
          {Object.entries(typeDist)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count], i) => (
              <AnimatedBar
                key={type}
                label={type.slice(0, 4)}
                value={count}
                max={maxType}
                count={count}
                color={typeColors[type] || "bg-term-amber/50"}
                delay={i * 0.1}
              />
            ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card-container">
        <h3 className="text-term-amber font-bold mb-3 font-mono text-sm">
          QUICK STATS
        </h3>
        <div className="space-y-2">
          {[
            {
              label: "TRIBAL SYNERGY",
              value: `${tribalPct}%`,
              sub: topFaction?.[0],
              ok: strongTribal,
            },
            {
              label: "SELLABLE (€$)",
              value: `${sellablePct}%`,
              sub: `${sellableCount} cards`,
              ok: sellableCount >= 6,
            },
            {
              label: "DRAW SOURCES",
              value: drawCount,
              sub: "cards with draw",
              ok: drawCount >= 3,
            },
          ].map(({ label, value, sub, ok }) => (
            <div
              key={label}
              className="flex items-center justify-between py-1 border-b border-term-amber/10"
            >
              <span className="text-term-amber/70 font-mono text-xs">
                {label}
              </span>
              <div className="text-right">
                <span
                  className={`font-mono font-bold text-sm ${ok ? "text-term-green" : "text-term-amber"}`}
                >
                  {value}
                </span>
                <span className="text-term-amber/40 font-mono text-[9px] ml-2">
                  {sub}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {(deckTooSlow || !goodT1 || drawCount < 3) && (
        <div className="card-container border border-term-red/30">
          <h3 className="text-term-red font-bold mb-2 font-mono text-sm">
            ⚠ WARNINGS
          </h3>
          <div className="space-y-1">
            {deckTooSlow && (
              <p className="text-term-red/80 text-xs font-mono">
                • Avg cost &gt; 2.8€ — consider adding cheap units
              </p>
            )}
            {!goodT1 && (
              <p className="text-term-red/80 text-xs font-mono">
                • Less than 15% T1 plays — slow opening hand risk
              </p>
            )}
            {drawCount < 3 && (
              <p className="text-term-amber/80 text-xs font-mono">
                • Low draw sources — may run out of cards mid-game
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
