// NON OMNIS MORIAR — DraftSimulator.jsx
// EX MACHINA — Fase 14: Draft Simulator
// Abre 4 sobres virtuales, elige 1 carta por ronda, construye un mazo de 40
import { useState, useMemo } from "react";
import SmartCardImage from "./SmartCardImage";

const DRAFT_PACKS = 4;
const DRAFT_PACK_SIZE = 12;
const DRAFT_PICKS_NEEDED = 40;

// Rarity weights para draft (mismos que PackOpener)
function injectRarity(card) {
  const set = card.set || "";
  const type = card.type || "";
  if (set.includes("PROMO")) return "Nova Rare";
  if (type === "LEGEND") return "Rare";
  if (type === "GEAR" || type === "PROGRAM") {
    const r = Math.random();
    if (r < 0.3) return "Common";
    if (r < 0.6) return "Uncommon";
    if (r < 0.8) return "Rare";
    if (r < 0.9) return "Epic Rare";
    if (r < 0.955) return "Iconic Rare";
    return "Secret Rare";
  }
  const r = Math.random();
  if (r < 0.45) return "Common";
  if (r < 0.75) return "Uncommon";
  if (r < 0.9) return "Rare";
  if (r < 0.965) return "Epic Rare";
  if (r < 0.99) return "Iconic Rare";
  return "Secret Rare";
}

const RARITY_COLOR = {
  Common: "text-gray-400",
  Uncommon: "text-emerald-400",
  Rare: "text-blue-400",
  "Epic Rare": "text-violet-400",
  "Iconic Rare": "text-yellow-400",
  "Secret Rare": "text-red-400",
  "Nova Rare": "text-rose-400",
};

const RARITY_BORDER = {
  Common: "border-gray-600",
  Uncommon: "border-emerald-500 shadow-[0_0_6px_#34d399]",
  Rare: "border-blue-500 shadow-[0_0_8px_#60a5fa]",
  "Epic Rare": "border-violet-500 shadow-[0_0_10px_#a78bfa]",
  "Iconic Rare": "border-yellow-500 shadow-[0_0_14px_#fbbf24]",
  "Secret Rare": "border-red-500 shadow-[0_0_14px_#f87171]",
  "Nova Rare": "border-rose-500 shadow-[0_0_18px_#ff1e50]",
};

function generateDraftPack(allCards, size = DRAFT_PACK_SIZE) {
  const pool = allCards
    .filter((c) => c.type !== "LEGEND")
    .map((c) => ({ ...c, rarity: injectRarity(c) }));

  // Garantizar al menos 1 Rare+ por sobre
  const commons = pool.filter((c) => c.rarity === "Common");
  const uncommons = pool.filter((c) => c.rarity === "Uncommon");
  const rares = pool.filter((c) => !["Common", "Uncommon"].includes(c.rarity));

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const pack = [];

  // 7 commons
  for (let i = 0; i < 7 && commons.length; i++) pack.push(pick(commons));
  // 3 uncommons
  for (let i = 0; i < 3 && uncommons.length; i++) pack.push(pick(uncommons));
  // 1 rare+
  if (rares.length) pack.push(pick(rares));
  // 1 wildcard
  pack.push(pick(pool));

  return pack.slice(0, size);
}

// ── ESTADOS DEL DRAFT ──────────────────────────────────────────────────────
const PHASE = {
  INTRO: "intro",
  PICKING: "picking",
  BUILDING: "building",
  DONE: "done",
};

export default function DraftSimulator({ allCards, onLoadDraft }) {
  const [phase, setPhase] = useState(PHASE.INTRO);
  const [packs, setPacks] = useState([]); // 4 sobres generados
  const [currentPackIdx, setCurrentPackIdx] = useState(0);
  const [currentPack, setCurrentPack] = useState([]); // cartas disponibles en el sobre actual
  const [pickedCards, setPickedCards] = useState([]); // cartas elegidas
  const [pickCount, setPickCount] = useState(0); // cuántas picks se han hecho del sobre actual
  const [hoveredCard, setHoveredCard] = useState(null);

  // Cartas seleccionadas agrupadas para preview del mazo
  const deckCounts = useMemo(() => {
    return pickedCards.reduce((acc, c) => {
      acc[c.name] = (acc[c.name] || 0) + 1;
      return acc;
    }, {});
  }, [pickedCards]);

  const uniquePicked = useMemo(() => {
    const seen = new Set();
    return pickedCards.filter((c) => {
      if (seen.has(c.name)) return false;
      seen.add(c.name);
      return true;
    });
  }, [pickedCards]);

  // Cuántas cartas elegir de cada sobre
  // Sobre 1: 10 picks, Sobre 2: 10, Sobre 3: 10, Sobre 4: 10 = 40 total
  const PICKS_PER_PACK = Math.floor(DRAFT_PICKS_NEEDED / DRAFT_PACKS);

  function handleStart() {
    const generated = Array.from({ length: DRAFT_PACKS }, () =>
      generateDraftPack(allCards),
    );
    setPacks(generated);
    setCurrentPackIdx(0);
    setCurrentPack(generated[0]);
    setPickedCards([]);
    setPickCount(0);
    setPhase(PHASE.PICKING);
  }

  function handlePick(card) {
    const newPicked = [...pickedCards, card];
    const newPickCount = pickCount + 1;
    const remaining = currentPack.filter(
      (_, i) => currentPack.indexOf(card) !== i,
    );

    setPickedCards(newPicked);

    if (newPickCount >= PICKS_PER_PACK) {
      // Avanzar al siguiente sobre
      const nextIdx = currentPackIdx + 1;
      if (nextIdx < DRAFT_PACKS) {
        setCurrentPackIdx(nextIdx);
        setCurrentPack(packs[nextIdx]);
        setPickCount(0);
      } else {
        // Draft completo
        setPhase(PHASE.BUILDING);
      }
    } else {
      setCurrentPack(remaining.length > 0 ? remaining : packs[currentPackIdx]);
      setPickCount(newPickCount);
    }
  }

  function handleReset() {
    setPhase(PHASE.INTRO);
    setPacks([]);
    setPickedCards([]);
    setPickCount(0);
  }

  function handleLoadToDeckBuilder() {
    if (!onLoadDraft) return;
    // Convierte las cartas pickeadas al formato de mazo
    const mainDeck = pickedCards.filter((c) => c.type !== "LEGEND");
    onLoadDraft({ legends: [], mainDeck, sideboard: [] });
  }

  // ── PHASE: INTRO ──────────────────────────────────────────────────────────
  if (phase === PHASE.INTRO) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 p-6 bg-gradient-to-r from-term-black via-term-gray to-term-black border-2 border-cyan-500/60 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500/5"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-cyan-400 font-bold text-3xl font-mono tracking-wider">
                DRAFT SIMULATOR
              </h2>
            </div>
            <p className="text-term-green/80 font-mono text-sm pl-14">
              4 virtual booster packs • Choose 1 card per turn • Build a 40-card
              deck
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-term-gray border border-cyan-500/30 rounded-lg p-5">
            <h3 className="text-cyan-400 font-mono font-bold mb-3">
              HOW IT WORKS
            </h3>
            <div className="space-y-2 text-term-green/80 font-mono text-sm">
              <div>
                <span className="text-cyan-400">1.</span> 4 virtual booster
                packs are generated
              </div>
              <div>
                <span className="text-cyan-400">2.</span> You see all the cards
                in the pack
              </div>
              <div>
                <span className="text-cyan-400">3.</span> You choose 1 card per
                turn
              </div>
              <div>
                <span className="text-cyan-400">4.</span> 10 picks per pack = 40
                cartas
              </div>
              <div>
                <span className="text-cyan-400">5.</span> Export the deck to the
                Deck Builder
              </div>
            </div>
          </div>
          <div className="bg-term-gray border border-cyan-500/30 rounded-lg p-5">
            <h3 className="text-cyan-400 font-mono font-bold mb-3">
              DRAFT RULES
            </h3>
            <div className="space-y-2 text-term-green/80 font-mono text-sm">
              <div>• No limit on copies per card</div>
              <div>• Legends do NOT appear in booster packs</div>
              <div>• Objective: 40 playable cards</div>
              <div>• Simulated Rarities (Alpha Kit)</div>
              <div>
                • <span className="text-term-amber">1 Guaranteed Rare+</span>{" "}
                per pack
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-6 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-mono font-bold text-2xl rounded-lg hover:from-cyan-500 hover:to-cyan-400 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          [ START DRAFT ]
        </button>
      </div>
    );
  }

  // ── PHASE: PICKING ────────────────────────────────────────────────────────
  if (phase === PHASE.PICKING) {
    const totalPicked = pickedCards.length;
    const progress = (totalPicked / DRAFT_PICKS_NEEDED) * 100;

    return (
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-cyan-400 font-mono font-bold text-xl">
              SOBRE {currentPackIdx + 1}/{DRAFT_PACKS}
              <span className="text-term-green/60 text-sm ml-3">
                Pick {pickCount + 1}/{PICKS_PER_PACK} de este sobre
              </span>
            </h2>
            <div className="text-term-amber/70 font-mono text-xs mt-1">
              {totalPicked}/{DRAFT_PICKS_NEEDED} cartas elegidas
            </div>
          </div>
          <button
            onClick={handleReset}
            className="text-term-red/60 hover:text-term-red font-mono text-xs border border-term-red/30 hover:border-term-red rounded px-3 py-1 transition-colors"
          >
            [CANCELAR]
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-term-black/50 rounded-full h-2 mb-6 border border-cyan-500/20">
          <div
            className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex gap-4">
          {/* Card grid — cartas del sobre actual */}
          <div className="flex-1">
            <p className="text-term-green/60 font-mono text-xs mb-3">
              ▶ ELIGE UNA CARTA
            </p>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {currentPack.map((card, idx) => (
                <div
                  key={`${card.id}-${idx}`}
                  className={`relative cursor-pointer rounded border-2 overflow-hidden transition-all duration-200 hover:scale-105 ${RARITY_BORDER[card.rarity] || "border-gray-600"}`}
                  onClick={() => handlePick(card)}
                  onMouseEnter={() => setHoveredCard(card)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <SmartCardImage
                    card={card}
                    className="w-full aspect-[5/7] object-cover"
                    showLoadingState={true}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/90 p-1">
                    <div className="text-white text-[10px] font-mono truncate">
                      {card.name}
                    </div>
                    <div
                      className={`text-[9px] font-mono ${RARITY_COLOR[card.rarity] || "text-gray-400"}`}
                    >
                      {card.rarity}
                    </div>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-cyan-400/0 hover:bg-cyan-400/10 transition-colors pointer-events-none" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar — cartas elegidas */}
          <div className="w-52 flex-shrink-0">
            <p className="text-term-amber/70 font-mono text-xs mb-3">
              🃏 TU POOL ({totalPicked})
            </p>
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {uniquePicked.map((card, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs font-mono"
                >
                  <span className="text-term-amber/60 w-5 text-right">
                    {deckCounts[card.name]}x
                  </span>
                  <span
                    className={`truncate ${RARITY_COLOR[card.rarity] || "text-gray-400"}`}
                  >
                    {card.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Hovered card preview */}
            {hoveredCard && (
              <div className="mt-4 border border-cyan-500/30 rounded overflow-hidden">
                <SmartCardImage
                  card={hoveredCard}
                  className="w-full aspect-[5/7] object-cover"
                />
                <div className="bg-term-black p-2">
                  <div className="text-white text-xs font-mono">
                    {hoveredCard.name}
                  </div>
                  <div
                    className={`text-[10px] font-mono ${RARITY_COLOR[hoveredCard.rarity]}`}
                  >
                    {hoveredCard.rarity}
                  </div>
                  {hoveredCard.cost !== undefined && (
                    <div className="text-term-amber text-[10px] font-mono">
                      Cost: {hoveredCard.cost} | Power: {hoveredCard.power}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── PHASE: BUILDING / DONE ────────────────────────────────────────────────
  if (phase === PHASE.BUILDING || phase === PHASE.DONE) {
    const byType = pickedCards.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {});

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 p-5 bg-term-gray border-2 border-cyan-500/60 rounded-lg">
          <h2 className="text-cyan-400 font-mono font-bold text-2xl mb-1">
            ✅ DRAFT COMPLETADO
          </h2>
          <p className="text-term-green/70 font-mono text-sm">
            {pickedCards.length} cartas en tu pool de draft
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {Object.entries(byType).map(([type, count]) => (
            <div
              key={type}
              className="bg-term-gray border border-cyan-500/20 rounded p-3 text-center"
            >
              <div className="text-cyan-400 font-mono font-bold text-xl">
                {count}
              </div>
              <div className="text-term-green/60 font-mono text-xs">{type}</div>
            </div>
          ))}
        </div>

        {/* Card list */}
        <div className="bg-term-gray border border-cyan-500/20 rounded-lg p-4 mb-6 max-h-80 overflow-y-auto">
          <p className="text-term-amber font-mono text-xs mb-3">DECK LIST</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            {uniquePicked.map((card, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs font-mono"
              >
                <span className="text-term-amber/60 w-4">
                  {deckCounts[card.name]}x
                </span>
                <span className="text-white truncate">{card.name}</span>
                <span
                  className={`ml-auto text-[10px] ${RARITY_COLOR[card.rarity] || ""}`}
                >
                  {card.cost !== undefined ? `${card.cost}💰` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          {onLoadDraft && (
            <button
              onClick={handleLoadToDeckBuilder}
              className="py-4 bg-term-amber text-term-black font-mono font-bold rounded-lg hover:bg-yellow-400 transition-colors"
            >
              [LOAD IN DECK BUILDER]
            </button>
          )}
          <button
            onClick={handleReset}
            className="py-4 border-2 border-cyan-500 text-cyan-400 font-mono font-bold rounded-lg hover:bg-cyan-500/10 transition-colors"
          >
            [🔄 NUEVO DRAFT]
          </button>
        </div>
      </div>
    );
  }

  return null;
}
