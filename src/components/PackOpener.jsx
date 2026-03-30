import { useState } from "react";

export default function PackOpener({ allCards }) {
  const [totalPacks, setTotalPacks] = useState(0);
  const [collection, setCollection] = useState([]);
  const [showPackAnimation, setShowPackAnimation] = useState(false);
  const [currentPack, setCurrentPack] = useState([]);
  const [revealedCards, setRevealedCards] = useState([]);

  // BOX OPENER STATE
  const [isBoxMode, setIsBoxMode] = useState(false);
  const [boxPacks, setBoxPacks] = useState([]);
  const [currentBoxPackIndex, setCurrentBoxPackIndex] = useState(0);
  const [boxStats, setBoxStats] = useState({
    totalCards: 0,
    commons: 0,
    uncommons: 0,
    rares: 0,
    novaRares: 0,
    iconicRares: 0,
    foils: 0,
  });

  // TODO: Remove this rarity injection when WeirdCo publishes official rarity data
  const injectRarity = (card) => {
    const set = card.set || "";
    const cardNumber = card.number || "";
    const cost = card.cost || 0;
    const type = card.type || "";

    if (set.includes("PROMO") || cardNumber.startsWith("N")) {
      return "Nova Rare";
    }

    if (set.includes("ALPHA")) {
      return "Common";
    }

    if (set.includes("SPOILER")) {
      if (type === "LEGEND") {
        return "Iconic Rare";
      }
      if (cost >= 6) {
        return "Rare";
      }
      if (cost >= 4) {
        return "Uncommon";
      }
      return "Common";
    }

    return "Common";
  };

  const generatePack = () => {
    const pack = [];

    const cardsWithRarity = allCards.map((c) => ({
      ...c,
      rarity: injectRarity(c),
    }));

    const commons = cardsWithRarity.filter(
      (c) => c.rarity === "Common" && c.type !== "LEGEND",
    );
    const uncommons = cardsWithRarity.filter(
      (c) => c.rarity === "Uncommon" && c.type !== "LEGEND",
    );
    const rares = cardsWithRarity.filter(
      (c) => c.rarity === "Rare" && c.type !== "LEGEND",
    );
    const novaRares = cardsWithRarity.filter(
      (c) => c.rarity === "Nova Rare" && c.type !== "LEGEND",
    );
    const iconicRares = cardsWithRarity.filter(
      (c) => c.rarity === "Iconic Rare" && c.type !== "LEGEND",
    );

    const randomCard = (arr) => {
      if (!arr || arr.length === 0) return null;
      return arr[Math.floor(Math.random() * arr.length)];
    };

    // SLOTS 1-7: Commons
    for (let i = 0; i < 7; i++) {
      const card = randomCard(commons);
      if (card) {
        pack.push({ ...card, slot: i + 1 });
      }
    }

    // SLOTS 8-10: Uncommons
    for (let i = 0; i < 3; i++) {
      const card = randomCard(uncommons);
      if (card) {
        pack.push({ ...card, slot: i + 8 });
      }
    }

    // SLOT 11: Rare+
    const rareRoll = Math.random() * 100;
    let slot11Card = null;

    if (rareRoll < 85 && rares.length > 0) {
      slot11Card = randomCard(rares);
    } else if (rareRoll < 97 && novaRares.length > 0) {
      slot11Card = randomCard(novaRares);
    } else if (iconicRares.length > 0) {
      slot11Card = randomCard(iconicRares);
    } else if (rares.length > 0) {
      slot11Card = randomCard(rares);
    } else {
      slot11Card = randomCard(uncommons) || randomCard(commons);
    }

    if (slot11Card) {
      pack.push({ ...slot11Card, slot: 11 });
    }

    // SLOT 12: Foil wildcard
    const foilRoll = Math.random() * 100;
    let foilCard = null;

    if (foilRoll < 50 && commons.length > 0) {
      foilCard = { ...randomCard(commons), foil: true, slot: 12 };
    } else if (foilRoll < 80 && uncommons.length > 0) {
      foilCard = { ...randomCard(uncommons), foil: true, slot: 12 };
    } else if (foilRoll < 95 && rares.length > 0) {
      foilCard = { ...randomCard(rares), foil: true, slot: 12 };
    } else if (foilRoll < 99 && novaRares.length > 0) {
      foilCard = { ...randomCard(novaRares), foil: true, slot: 12 };
    } else if (iconicRares.length > 0) {
      foilCard = { ...randomCard(iconicRares), foil: true, slot: 12 };
    } else if (rares.length > 0) {
      foilCard = { ...randomCard(rares), foil: true, slot: 12 };
    } else {
      foilCard = { ...randomCard(uncommons), foil: true, slot: 12 } || {
        ...randomCard(commons),
        foil: true,
        slot: 12,
      };
    }

    if (foilCard) {
      pack.push(foilCard);
    }

    return pack;
  };

  const handleOpenPack = () => {
    const newPack = generatePack();

    if (newPack.length === 0) {
      console.error("Failed to generate pack - no cards available");
      return;
    }

    setCurrentPack(newPack);
    setRevealedCards([]);
    setTotalPacks(totalPacks + 1);
    setIsBoxMode(false);

    // Add to collection
    const newCollection = [...collection];
    newPack.forEach((card) => {
      if (!newCollection.find((c) => c.id === card.id)) {
        newCollection.push(card);
      }
    });
    setCollection(newCollection);

    setTimeout(() => {
      setShowPackAnimation(true);
    }, 100);
  };

  const handleRevealCard = (index) => {
    if (!revealedCards.includes(index)) {
      setRevealedCards([...revealedCards, index]);
    }
  };

  const handleOpenBox = () => {
    // Generate all 24 packs at once
    const allPacks = [];
    const newCollection = [...collection];
    let totalStats = {
      totalCards: 0,
      commons: 0,
      uncommons: 0,
      rares: 0,
      novaRares: 0,
      iconicRares: 0,
      foils: 0,
    };

    for (let i = 0; i < 24; i++) {
      const pack = generatePack();
      allPacks.push(pack);

      // Update collection
      pack.forEach((card) => {
        if (!newCollection.find((c) => c.id === card.id)) {
          newCollection.push(card);
        }

        // Update stats
        totalStats.totalCards++;
        if (card.rarity === "Common") totalStats.commons++;
        if (card.rarity === "Uncommon") totalStats.uncommons++;
        if (card.rarity === "Rare") totalStats.rares++;
        if (card.rarity === "Nova Rare") totalStats.novaRares++;
        if (card.rarity === "Iconic Rare") totalStats.iconicRares++;
        if (card.foil) totalStats.foils++;
      });
    }

    setCollection(newCollection);
    setTotalPacks(totalPacks + 24);
    setBoxPacks(allPacks);
    setCurrentBoxPackIndex(0);
    setCurrentPack(allPacks[0]);
    setRevealedCards([]);
    setBoxStats(totalStats);
    setIsBoxMode(true);

    setTimeout(() => {
      setShowPackAnimation(true);
    }, 100);
  };

  const handleNextPack = () => {
    const nextIndex = currentBoxPackIndex + 1;
    if (nextIndex < boxPacks.length) {
      setCurrentBoxPackIndex(nextIndex);
      setCurrentPack(boxPacks[nextIndex]);
      setRevealedCards([]);
    }
  };

  const handlePreviousPack = () => {
    const prevIndex = currentBoxPackIndex - 1;
    if (prevIndex >= 0) {
      setCurrentBoxPackIndex(prevIndex);
      setCurrentPack(boxPacks[prevIndex]);
      setRevealedCards([]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Terminal Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-term-black via-term-gray to-term-black border-2 border-term-amber rounded-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-term-amber/5 animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">📦</span>
            <h2 className="text-term-amber font-bold text-3xl font-mono tracking-wider">
              PACK OPENER SIMULATOR
            </h2>
          </div>
          <p className="text-term-green/80 font-mono text-sm pl-12">
            Open booster packs • Build your collection • Chase the rare pulls
          </p>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-term-gray border-2 border-term-green/40 rounded-lg p-4">
          <div className="text-term-amber font-mono text-sm mb-1">
            TOTAL PACKS OPENED
          </div>
          <div className="text-term-green font-bold text-3xl font-mono">
            {totalPacks}
          </div>
        </div>

        <div className="bg-term-gray border-2 border-term-green/40 rounded-lg p-4">
          <div className="text-term-amber font-mono text-sm mb-1">
            COLLECTION
          </div>
          <div className="text-term-green font-bold text-3xl font-mono">
            {collection.length}/
            {allCards.filter((c) => c.type !== "LEGEND").length}
          </div>
          <div className="text-term-green/60 text-xs font-mono mt-1">
            {(
              (collection.length /
                allCards.filter((c) => c.type !== "LEGEND").length) *
              100
            ).toFixed(1)}
            % Complete
          </div>
        </div>

        <div className="bg-term-gray border-2 border-term-green/40 rounded-lg p-4">
          <div className="text-term-amber font-mono text-sm mb-1">
            CURRENT SET
          </div>
          <div className="text-term-green font-bold text-lg font-mono">
            Welcome to Night City
          </div>
          <div className="text-term-green/60 text-xs font-mono mt-1">
            Alpha/Beta Kit 2026
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="mb-8 p-6 bg-term-gray border-2 border-term-amber/40 rounded-lg">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-term-amber font-bold font-mono text-xl mb-3">
              📋 PACK CONTENTS
            </h3>
            <div className="space-y-2 font-mono text-sm">
              <div className="text-term-green">
                <span className="text-term-amber">└─</span> 12 cards per pack
              </div>
              <div className="text-term-green">
                <span className="text-term-amber">└─</span> 7 Commons guaranteed
              </div>
              <div className="text-term-green">
                <span className="text-term-amber">└─</span> 3 Uncommons
                guaranteed
              </div>
              <div className="text-term-green">
                <span className="text-term-amber">└─</span> 1 Rare+ guaranteed
              </div>
              <div className="text-term-green">
                <span className="text-term-amber">└─</span> 1 Foil wildcard
              </div>
            </div>
          </div>

          <div className="bg-term-black/50 border border-term-amber/30 rounded p-3 text-xs font-mono">
            <div className="text-term-amber mb-2">⚠️ PULL RATES</div>
            <div className="text-term-green/70 space-y-1">
              <div>• Rare: ~85%</div>
              <div>• Nova Rare: ~12%</div>
              <div>• Iconic Rare: ~3%</div>
              <div className="pt-2 border-t border-term-amber/20">
                <div className="text-term-amber/80">Foil Slot:</div>
                <div>• Any rarity possible</div>
                <div>• ~1% Iconic Foil</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <button
          onClick={handleOpenPack}
          className="group relative overflow-hidden bg-gradient-to-br from-term-amber/80 to-term-amber border-2 border-term-amber text-term-black py-8 px-8 rounded-lg font-mono font-bold text-xl hover:border-yellow-300 hover:scale-105 transition-all shadow-lg hover:shadow-term-amber/50"
        >
          <div className="absolute inset-0 bg-term-amber/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="text-3xl mb-2">📦</div>
            <div className="text-2xl mb-2">OPEN 1 PACK</div>
            <div className="text-xs opacity-80 font-normal">
              12 cards • Click to reveal
            </div>
          </div>
        </button>

        <button
          onClick={handleOpenBox}
          className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-purple-800 border-2 border-purple-400 text-white py-8 px-8 rounded-lg font-mono font-bold text-xl hover:border-purple-300 hover:scale-105 transition-all shadow-lg hover:shadow-purple-500/50"
        >
          <div className="absolute inset-0 bg-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="text-3xl mb-2">📦📦📦</div>
            <div className="text-2xl mb-2">OPEN BOX</div>
            <div className="text-xs opacity-80 font-normal">
              24 packs • Pack-by-pack
            </div>
          </div>
        </button>
      </div>

      {/* Pack Animation Modal */}
      {showPackAnimation && currentPack.length > 0 && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPackAnimation(false)}
        >
          <div
            className="bg-term-gray border-2 border-term-amber rounded-lg p-6 max-w-6xl w-full max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-term-amber font-bold text-2xl font-mono">
                {isBoxMode
                  ? `📦 PACK ${currentBoxPackIndex + 1}/24`
                  : "📦 YOUR PULLS"}
              </h2>
              <button
                onClick={() => setShowPackAnimation(false)}
                className="text-gray-400 hover:text-term-amber transition-colors text-3xl"
              >
                ✕
              </button>
            </div>

            {/* Box Mode Progress Bar */}
            {isBoxMode && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-term-green font-mono text-sm">
                    BOX PROGRESS
                  </span>
                  <span className="text-term-amber font-mono text-sm">
                    {currentBoxPackIndex + 1}/24 packs
                  </span>
                </div>
                <div className="w-full bg-term-black/50 rounded-full h-3 border border-term-amber/30">
                  <div
                    className="bg-gradient-to-r from-term-amber to-yellow-400 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentBoxPackIndex + 1) / 24) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-6">
              {currentPack.map((card, idx) => {
                const isRevealed = revealedCards.includes(idx);
                return (
                  <div
                    key={`${card.id}-${idx}`}
                    className="pack-card-container"
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
                        className={`card-face front ${card.foil ? "foil-card" : ""}`}
                      >
                        <img
                          src={card.image_url}
                          alt={card.name}
                          className={`w-full h-full object-cover rounded border-2 ${
                            card.foil
                              ? "border-yellow-400 shadow-lg shadow-yellow-400/50"
                              : "border-term-green/40"
                          }`}
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/300x420/1a1a1a/ffb300?text=NO+IMAGE";
                          }}
                        />
                        {card.foil && (
                          <div className="absolute top-1 right-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-black rounded-full px-2 py-0.5 text-[10px] font-bold shadow-lg animate-pulse">
                            ✨ FOIL
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/90 text-term-green text-[10px] font-mono p-1 text-center truncate">
                          {card.name}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current Pack Summary */}
            <div className="bg-black/40 rounded border border-term-amber/30 p-4 mb-4">
              <div className="font-mono text-sm">
                <div className="text-term-amber font-bold mb-2">
                  📊 {isBoxMode ? "PACK" : "PULL"} STATISTICS
                </div>
                <div className="grid grid-cols-2 gap-2 text-term-green">
                  <div>
                    Total Cards:{" "}
                    <span className="text-term-amber">
                      {currentPack.length}
                    </span>
                  </div>
                  <div>
                    Commons:{" "}
                    <span className="text-gray-400">
                      {currentPack.filter((c) => c.rarity === "Common").length}
                    </span>
                  </div>
                  <div>
                    Uncommons:{" "}
                    <span className="text-green-400">
                      {
                        currentPack.filter((c) => c.rarity === "Uncommon")
                          .length
                      }
                    </span>
                  </div>
                  <div>
                    Rares:{" "}
                    <span className="text-blue-400">
                      {currentPack.filter((c) => c.rarity === "Rare").length}
                    </span>
                  </div>
                  <div>
                    Nova Rares:{" "}
                    <span className="text-purple-400">
                      {
                        currentPack.filter((c) => c.rarity === "Nova Rare")
                          .length
                      }{" "}
                      ⭐
                    </span>
                  </div>
                  <div>
                    Iconic Rares:{" "}
                    <span className="text-red-400">
                      {
                        currentPack.filter((c) => c.rarity === "Iconic Rare")
                          .length
                      }{" "}
                      🔥
                    </span>
                  </div>
                  <div className="col-span-2 border-t border-term-amber/20 pt-2 mt-2">
                    Foils:{" "}
                    <span className="text-yellow-400">
                      {currentPack.filter((c) => c.foil).length} ✨
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box Mode Total Stats */}
            {isBoxMode && (
              <div className="bg-purple-900/30 rounded border border-purple-400/30 p-4 mb-4">
                <div className="font-mono text-sm">
                  <div className="text-purple-400 font-bold mb-2">
                    📦 BOX TOTALS (ALL 24 PACKS)
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-purple-200 text-xs">
                    <div>
                      Total:{" "}
                      <span className="text-white">{boxStats.totalCards}</span>
                    </div>
                    <div>
                      Commons:{" "}
                      <span className="text-gray-300">{boxStats.commons}</span>
                    </div>
                    <div>
                      Uncommons:{" "}
                      <span className="text-green-300">
                        {boxStats.uncommons}
                      </span>
                    </div>
                    <div>
                      Rares:{" "}
                      <span className="text-blue-300">{boxStats.rares}</span>
                    </div>
                    <div>
                      Nova:{" "}
                      <span className="text-purple-300">
                        {boxStats.novaRares} ⭐
                      </span>
                    </div>
                    <div>
                      Iconic:{" "}
                      <span className="text-red-300">
                        {boxStats.iconicRares} 🔥
                      </span>
                    </div>
                    <div className="col-span-3">
                      Foils:{" "}
                      <span className="text-yellow-300">
                        {boxStats.foils} ✨
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reveal All Button */}
            {revealedCards.length < currentPack.length && (
              <div className="mb-4">
                <button
                  onClick={() => setRevealedCards(currentPack.map((_, i) => i))}
                  className="w-full bg-term-amber text-term-black py-2 px-4 rounded font-mono font-bold hover:bg-yellow-400 transition-colors"
                >
                  [👁️ REVEAL ALL ({currentPack.length - revealedCards.length}{" "}
                  LEFT)]
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              {isBoxMode ? (
                <>
                  <button
                    onClick={handlePreviousPack}
                    disabled={currentBoxPackIndex === 0}
                    className="bg-gray-600 text-white py-3 px-6 rounded font-mono font-bold hover:bg-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    [◀ PREVIOUS PACK]
                  </button>
                  <button
                    onClick={handleNextPack}
                    disabled={currentBoxPackIndex === boxPacks.length - 1}
                    className="bg-purple-600 text-white py-3 px-6 rounded font-mono font-bold hover:bg-purple-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {currentBoxPackIndex === boxPacks.length - 1
                      ? "[✅ FINISH BOX]"
                      : "[NEXT PACK ▶]"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowPackAnimation(false);
                      handleOpenPack();
                    }}
                    className="bg-term-amber text-term-black py-3 px-6 rounded font-mono font-bold hover:bg-yellow-400 transition-colors"
                  >
                    [📦 OPEN ANOTHER]
                  </button>
                  <button
                    onClick={() => setShowPackAnimation(false)}
                    className="bg-term-green text-term-black py-3 px-6 rounded font-mono font-bold hover:bg-green-400 transition-colors"
                  >
                    [✅ CLOSE]
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
