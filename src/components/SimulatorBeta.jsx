// NON OMNIS MORIAR — Simulator Beta with Online Play menu
import { useState, useEffect, useRef } from "react";
import { useFeatureFlag } from "../hooks/useFeatureFlag";
import { useAuth } from "../contexts/AuthContext";
import { loadDecks } from "../lib/deckService";
import { motion, AnimatePresence } from "framer-motion";
import cards from "../data/cards.json";
import { GameState } from "../lib/game/GameState";
import { CardLogic } from "../lib/CardLogic";
import { CombatResolver } from "../lib/CombatResolver";
import PlaymatV2 from "./PlaymatV2";
import CyberspaceParticles from "./CyberspaceParticles";
import { AIPlayer } from "../lib/game/AIPlayer";

const PRECON_DECKS = {
  merc: {
    id: "precon-merc",
    name: "Alpha Kit — Merc Deck",
    legend_ids: [
      "v-streetkid",
      "jackie-welles-pour-one-out-for-me",
      "panam-palmer-nomad-cavalry",
    ],
    main_deck_ids: [
      "dying-night-v-s-pistol",
      "dying-night-v-s-pistol",
      "dying-night-v-s-pistol",
      "skippy",
      "skippy",
      "skippy",
      "mantis-blades",
      "mantis-blades",
      "guts",
      "guts",
      "guts",
      "nom-nom",
      "nom-nom",
      "dr-chrome",
      "dr-chrome",
      "militech-agent",
      "militech-agent",
      "militech-agent",
      "maxtac-officer",
      "maxtac-officer",
      "edgerunner",
      "edgerunner",
      "edgerunner",
      "street-merc",
      "street-merc",
      "street-merc",
      "combat-stims",
      "combat-stims",
      "ambush",
      "ambush",
      "betrayal",
      "betrayal",
      "rally",
      "rally",
      "second-wind",
      "second-wind",
      "tactical-retreat",
      "tactical-retreat",
      "hired-gun",
      "hired-gun",
      "hired-gun",
      "trauma-team",
      "trauma-team",
    ],
    notes: "Official Alpha Kit preconstructed Merc deck",
  },
  arasaka: {
    id: "precon-arasaka",
    name: "Alpha Kit — Arasaka Deck",
    legend_ids: [
      "saburo-arasaka-stubborn-patriach",
      "yorinobu-arasaka-embracing-destruction",
      "goro-takemura-hands-unclean",
    ],
    main_deck_ids: [
      "satori-sword-of-saburo",
      "satori-sword-of-saburo",
      "satori-sword-of-saburo",
      "smart-rifle",
      "smart-rifle",
      "smart-rifle",
      "arasaka-armor",
      "arasaka-armor",
      "boardroom-exec",
      "boardroom-exec",
      "boardroom-exec",
      "corpo-security",
      "corpo-security",
      "corpo-security",
      "adam-smasher-metal-over-meat",
      "adam-smasher-metal-over-meat",
      "netwatch-agent",
      "netwatch-agent",
      "corporate-espionage",
      "corporate-espionage",
      "hostile-takeover",
      "hostile-takeover",
      "calculated-risk",
      "calculated-risk",
      "superior-firepower",
      "superior-firepower",
      "mt0d12-flathead",
      "mt0d12-flathead",
      "mt0d12-flathead",
      "arasaka-enforcer",
      "arasaka-enforcer",
      "arasaka-enforcer",
      "counter-intelligence",
      "counter-intelligence",
      "secured-perimeter",
      "secured-perimeter",
      "executive-order",
      "executive-order",
      "corpo-rat",
      "corpo-rat",
      "corpo-rat",
      "bodyguard",
      "bodyguard",
    ],
    notes: "Official Alpha Kit preconstructed Arasaka deck",
  },
};

export default function SimulatorBeta({ currentDeck }) {
  const { isEnabled, isLoading: featureLoading } =
    useFeatureFlag("phase9_simulator");
  const { user } = useAuth();
  const [savedDecks, setSavedDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [game, setGame] = useState(null);
  const gameRef = useRef(null);
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);
  const [cyberspaceMode, setCyberspaceMode] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [gameMode, setGameMode] = useState(null); // null | "ai" | "hotseat"
  const [showPassDevice, setShowPassDevice] = useState(false);
  const [callingLegend, setCallingLegend] = useState(false);
  const [waitingDefense, setWaitingDefense] = useState(false);
  const [blockingMode, setBlockingMode] = useState(false);
  const aiRef = useRef(null);

  const refresh = () => {
    if (gameRef.current) {
      setGame({
        ...gameRef.current,
        players: {
          1: {
            ...gameRef.current.players[1],
            gigs: [...gameRef.current.players[1].gigs],
          },
          2: {
            ...gameRef.current.players[2],
            gigs: [...gameRef.current.players[2].gigs],
          },
        },
        _t: Date.now(),
      });
    }
  };

  useEffect(() => {
    async function loadAllDecks() {
      setIsLoadingDecks(true);
      let decks = [PRECON_DECKS.merc, PRECON_DECKS.arasaka];
      if (currentDeck && currentDeck.legends.length === 3) {
        decks.push({
          id: "current-build",
          name: "Current Build",
          legend_ids: currentDeck.legends.map((c) => c.id),
          main_deck_ids: currentDeck.mainDeck.map((c) => c.id),
          sideboard_ids: currentDeck.sideboard?.map((c) => c.id) || [],
          notes: "Your current deck from the builder",
        });
      }
      if (user) {
        try {
          const userDecks = await loadDecks(user.id);
          decks = [...decks, ...userDecks];
        } catch (e) {
          console.error(e);
        }
      }
      setSavedDecks(decks);
      setIsLoadingDecks(false);
    }
    loadAllDecks();
  }, [user, currentDeck]);

  function prepareDeckForGame(deck) {
    const deckCards = [];
    deck.legend_ids.forEach((id) => {
      const card = cards.find((c) => c.id === id);
      if (card) deckCards.push({ ...card });
    });
    deck.main_deck_ids.forEach((id) => {
      const card = cards.find((c) => c.id === id);
      if (card) deckCards.push({ ...card });
    });
    return deckCards;
  }

  function startGame(deck) {
    const playerDeck = prepareDeckForGame(deck);
    const opponentDeck = prepareDeckForGame(
      deck.id === PRECON_DECKS.merc.id
        ? PRECON_DECKS.arasaka
        : PRECON_DECKS.merc,
    );
    const newGame = new GameState(playerDeck, opponentDeck);
    newGame.startGame();
    gameRef.current = newGame;
    setGame(newGame);
    if (aiMode) {
      aiRef.current = new AIPlayer(newGame, 2, refresh, 700);
    }
    setSelectedDeck(deck);
  }

  function resetToMenu() {
    gameRef.current = null;
    setGame(null);
    setSelectedDeck(null);
    setGameMode(null);
    setAiMode(false);
    setWaitingDefense(false);
    setBlockingMode(false);
    setCallingLegend(false);
  }

  if (featureLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-term-black">
        <div className="text-term-amber font-mono animate-pulse">
          LOADING SIMULATOR...
        </div>
      </div>
    );
  }

  if (!isEnabled) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-term-black">
        <div className="max-w-md p-8 bg-term-gray border-2 border-term-red rounded">
          <h1 className="text-2xl font-bold text-term-red mb-4 font-mono">
            ACCESS DENIED
          </h1>
          <p className="text-term-amber/80 mb-4">
            The Phase 9 Simulator is currently in{" "}
            <span className="text-term-amber font-bold">ADMIN BETA</span>.
          </p>
          <p className="text-term-amber/60 text-sm">
            This feature will be available to all users soon. Stay tuned, choom.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-4 relative transition-all duration-500 ${cyberspaceMode ? "bg-[#02050a]" : "bg-term-black"}`}
    >
      {cyberspaceMode && (
        <CyberspaceParticles count={250} className="opacity-60" />
      )}

      <div className="w-full mx-auto overflow-x-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3 max-w-[1200px] mx-auto">
          <span className="px-3 py-1 bg-term-amber text-term-black font-bold text-xs rounded font-mono">
            ADMIN BETA
          </span>
          <span className="text-term-amber/60 text-sm font-mono">
            Phase 9 Simulator v0.2.0 — Playmat V2
          </span>
          <button
            onClick={() => setCyberspaceMode((m) => !m)}
            className={`ml-auto px-4 py-1.5 font-mono font-bold text-xs rounded border transition-all ${
              cyberspaceMode
                ? "bg-cyan-400/20 border-cyan-400 text-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                : "bg-term-amber/10 border-term-amber/40 text-term-amber/60 hover:border-term-amber hover:text-term-amber"
            }`}
          >
            {cyberspaceMode ? "[◈ CYBERSPACE: ON]" : "[◈ CYBERSPACE: OFF]"}
          </button>
        </div>

        <h1 className="text-4xl font-bold text-term-amber mb-8 font-mono max-w-[1200px] mx-auto">
          THE ARENA
        </h1>

        {/* ── PRE-GAME SCREENS ── */}
        {!game ? (
          <div className="max-w-[1200px] mx-auto">
            <AnimatePresence mode="wait">
              {/* SCREEN 1 — Mode Selection */}
              {!gameMode && (
                <motion.div
                  key="mode-select"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-term-gray border-2 border-term-amber/30 rounded p-8 max-w-2xl mx-auto"
                >
                  <h2 className="text-3xl text-term-amber mb-2 font-mono font-bold text-center">
                    ONLINE PLAY
                  </h2>
                  <p className="text-term-amber/50 font-mono text-sm text-center mb-8">
                    Choose your battle mode, choom
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.button
                      whileHover={{
                        scale: 1.02,
                        borderColor: "rgba(239,68,68,0.8)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setGameMode("ai");
                        setAiMode(true);
                      }}
                      className="p-6 bg-term-gray-light border-2 border-term-red/40 rounded text-left group"
                    >
                      <div className="text-4xl mb-3">🤖</div>
                      <div className="text-term-amber font-bold text-xl mb-2 font-mono">
                        VS ARTIFICIAL INTEL
                      </div>
                      <div className="text-term-amber/50 text-sm font-mono mb-4">
                        Play against the machine. AI handles its turns
                        automatically with realistic delays.
                      </div>
                      <div className="text-term-red/60 text-xs font-mono">
                        [ SOLO MODE — AI ALWAYS ON ]
                      </div>
                    </motion.button>
                    <motion.button
                      whileHover={{
                        scale: 1.02,
                        borderColor: "rgba(247,224,24,0.6)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setGameMode("hotseat");
                        setAiMode(false);
                      }}
                      className="p-6 bg-term-gray-light border-2 border-term-amber/30 rounded text-left group relative"
                    >
                      <div className="text-4xl mb-3">🌐</div>
                      <div className="text-term-amber font-bold text-xl mb-2 font-mono">
                        HOTSEAT — 2 PLAYERS
                      </div>
                      <div className="text-term-amber/50 text-sm font-mono mb-4">
                        Two players, one device. Full hotseat mode with
                        pass-device screen between turns.
                      </div>
                      <div className="text-term-amber/40 text-xs font-mono">
                        [ REAL ONLINE MULTIPLAYER — v2.0.0 ]
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 2 — Deck Selection */}
              {gameMode && !selectedDeck && (
                <motion.div
                  key="deck-select"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-term-gray border-2 border-term-amber/30 rounded p-8"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={() => setGameMode(null)}
                      className="text-term-amber/50 hover:text-term-amber font-mono text-sm transition-colors"
                    >
                      ← BACK
                    </button>
                    <h2 className="text-2xl text-term-amber font-mono">
                      Select a Deck
                      <span
                        className={`ml-3 text-xs px-2 py-1 rounded font-bold ${aiMode ? "bg-term-red/20 text-term-red border border-term-red/40" : "bg-term-amber/20 text-term-amber border border-term-amber/40"}`}
                      >
                        {aiMode ? "🤖 VS AI" : "🌐 HOTSEAT"}
                      </span>
                    </h2>
                  </div>
                  {isLoadingDecks ? (
                    <div className="text-term-amber/60 font-mono animate-pulse">
                      Loading decks...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {savedDecks.map((deck) => (
                        <motion.button
                          key={deck.id}
                          onClick={() => setSelectedDeck(deck)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="p-4 bg-term-gray-light border border-term-amber/40 rounded hover:bg-term-amber/10 transition-colors text-left"
                        >
                          <div className="text-term-amber font-bold mb-2 font-mono">
                            {deck.name}
                          </div>
                          <div className="text-term-green/60 text-sm font-mono">
                            {deck.main_deck_ids?.length || 0} cards +{" "}
                            {deck.legend_ids?.length || 0} Legends
                          </div>
                          {deck.notes && (
                            <div className="text-term-amber/40 text-xs mt-2 font-mono line-clamp-2">
                              {deck.notes}
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* SCREEN 3 — Ready to Play */}
              {gameMode && selectedDeck && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-term-gray border-2 border-term-amber/30 rounded p-8 max-w-lg mx-auto"
                >
                  <h2 className="text-2xl text-term-amber mb-6 font-mono text-center">
                    Ready to Play?
                  </h2>
                  <div className="bg-term-black/40 rounded-lg p-4 mb-6 text-center">
                    <div className="text-term-green font-bold text-xl mb-1 font-mono">
                      {selectedDeck.name}
                    </div>
                    <div className="text-term-amber/60 text-sm font-mono">
                      {selectedDeck.main_deck_ids?.length || 0} cards +{" "}
                      {selectedDeck.legend_ids?.length || 0} Legends
                    </div>
                    <div
                      className={`mt-3 text-xs font-mono font-bold ${aiMode ? "text-term-red" : "text-term-amber"}`}
                    >
                      {aiMode ? "🤖 Playing vs AI" : "🌐 Hotseat — 2 players"}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <motion.button
                      onClick={() => startGame(selectedDeck)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 px-6 py-4 bg-term-green text-term-black font-bold rounded font-mono hover:bg-green-400 transition-colors text-lg"
                    >
                      START GAME
                    </motion.button>
                    <button
                      onClick={() => setSelectedDeck(null)}
                      className="px-6 py-4 bg-term-gray-light text-term-amber font-bold rounded font-mono border border-term-amber/40 hover:bg-term-amber/10 transition-colors"
                    >
                      BACK
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          // ── IN-GAME ──
          <div className="space-y-4">
            {/* PASS DEVICE SCREEN */}
            {showPassDevice && !aiMode && (
              <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center z-[100]">
                <div className="text-center p-8">
                  <div className="text-term-amber/30 font-mono text-sm mb-4 uppercase tracking-widest">
                    — Turn Complete —
                  </div>
                  <h2 className="text-5xl font-bold text-term-amber font-mono mb-2">
                    PLAYER {game.activePlayer}
                  </h2>
                  <p className="text-term-green font-mono text-xl mb-8">
                    YOUR TURN
                  </p>
                  <div className="text-term-amber/50 font-mono text-sm mb-8">
                    Pass the device to Player {game.activePlayer}
                  </div>
                  <button
                    onClick={() => setShowPassDevice(false)}
                    className="px-8 py-4 bg-term-amber text-term-black font-mono font-bold text-lg rounded hover:bg-yellow-400 transition-colors"
                  >
                    [ I'M READY — START TURN ]
                  </button>
                </div>
              </div>
            )}

            {/* MULLIGAN MODAL */}
            {game.phase === "MULLIGAN" && !game.mulliganDone?.[1] && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-term-gray border-2 border-term-amber rounded-lg p-8 w-full mx-4"
                  style={{ maxWidth: "720px" }}
                >
                  <h2 className="text-term-amber font-mono font-bold text-2xl mb-2">
                    MULLIGAN?
                  </h2>
                  <p className="text-term-green/70 font-mono text-sm mb-4">
                    Shuffle your hand and draw 6 new cards. You can only do this
                    once.
                  </p>
                  <div className="flex gap-2 mb-6 flex-wrap justify-center">
                    {gameRef.current?.players[1].hand.map((card, i) => (
                      <div
                        key={i}
                        className="bg-term-black border border-term-amber/30 rounded overflow-hidden w-[80px] flex-shrink-0"
                      >
                        {card.image_url ? (
                          <img
                            src={card.image_url}
                            alt={card.name}
                            className="w-full h-[100px] object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-[100px] bg-term-gray/40 flex items-center justify-center">
                            <span className="text-term-amber/20 text-[8px] font-mono text-center px-1">
                              {card.name}
                            </span>
                          </div>
                        )}
                        <div className="p-1">
                          <div className="font-bold truncate text-[9px] font-mono text-term-amber">
                            {card.name}
                          </div>
                          <div className="text-term-green/60 text-[8px] font-mono">
                            {card.cost}€ · {card.type}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        gameRef.current.doMulligan(1);
                        gameRef.current.keepHand(2);
                        refresh();
                      }}
                      className="flex-1 py-3 bg-term-amber text-term-black font-mono font-bold rounded hover:bg-yellow-400"
                    >
                      MULLIGAN
                    </button>
                    <button
                      onClick={() => {
                        gameRef.current.keepHand(1);
                        gameRef.current.keepHand(2);
                        refresh();
                      }}
                      className="flex-1 py-3 border-2 border-term-green text-term-green font-mono font-bold rounded hover:bg-term-green/10"
                    >
                      KEEP HAND
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* DEFENSIVE STEP OVERLAY */}
            {waitingDefense && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-term-gray border-2 border-term-red rounded-lg p-6 text-center pointer-events-auto max-w-sm"
                >
                  <div className="text-term-red font-mono font-bold text-lg mb-2 animate-pulse">
                    ⚔ ATTACK DECLARED
                  </div>
                  <p className="text-term-amber/70 font-mono text-sm mb-4">
                    Defender: block with a unit or take the hit
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const cr = new CombatResolver(gameRef.current);
                        cr.resolveCombat(gameRef.current.activePlayer);
                        gameRef.current.clearExpiredEffects?.();
                        setWaitingDefense(false);
                        refresh();
                      }}
                      className="flex-1 py-2 bg-term-red text-white font-mono font-bold rounded hover:bg-red-600 text-sm"
                    >
                      TAKE THE HIT
                    </button>
                    <button
                      onClick={() => {
                        setWaitingDefense(false);
                        setBlockingMode(true);
                      }}
                      className="flex-1 py-2 border border-term-green text-term-green font-mono font-bold rounded hover:bg-term-green/10 text-sm"
                    >
                      USE BLOCKER
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* BLOCKING MODE BANNER */}
            {blockingMode && (
              <div className="bg-term-green/20 border border-term-green text-term-green font-mono text-sm font-bold px-4 py-2 rounded text-center animate-pulse max-w-[1200px] mx-auto">
                &gt;&gt;&gt; CLICK A UNIT IN YOUR FIELD TO BLOCK &lt;&lt;&lt;
                <button
                  onClick={() => setBlockingMode(false)}
                  className="ml-4 text-xs underline opacity-70 hover:opacity-100"
                >
                  CANCEL
                </button>
              </div>
            )}

            {/* WIN SCREEN */}
            <AnimatePresence>
              {game.winner && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
                >
                  <div className="text-center p-12">
                    <motion.div
                      initial={{ y: -40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="text-8xl mb-6"
                    >
                      {game.winner.player === 1 ? "🏆" : "💀"}
                    </motion.div>
                    <motion.h2
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-6xl font-bold font-mono mb-4"
                      style={{
                        color: game.winner.player === 1 ? "#f7e018" : "#ff2a2a",
                      }}
                    >
                      PLAYER {game.winner.player} WINS
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-term-amber/70 font-mono text-xl mb-8"
                    >
                      {game.winner.condition}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="flex gap-4 justify-center"
                    >
                      <button
                        onClick={() => startGame(selectedDeck)}
                        className="px-8 py-3 bg-term-green text-term-black font-bold rounded font-mono hover:bg-green-400 transition-colors text-lg"
                      >
                        REMATCH
                      </button>
                      <button
                        onClick={resetToMenu}
                        className="px-8 py-3 bg-term-gray border border-term-amber text-term-amber font-bold rounded font-mono hover:bg-term-amber/10 transition-colors text-lg"
                      >
                        MAIN MENU
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PLAYMAT */}
            <div
              className={`relative transition-all duration-500 flex justify-center ${cyberspaceMode ? "brightness-110 contrast-110 saturate-150" : ""}`}
            >
              {cyberspaceMode && (
                <div
                  className="absolute inset-0 pointer-events-none z-10 rounded"
                  style={{
                    background:
                      "linear-gradient(rgba(0,229,255,0.04) 50%, rgba(0,0,0,0.06) 50%)",
                    backgroundSize: "100% 3px",
                    mixBlendMode: "screen",
                  }}
                />
              )}
              <PlaymatV2
                game={game}
                onGameUpdate={(g) => {
                  gameRef.current = g;
                  setGame(g);
                }}
                onPlayCard={(cardIndex, targetIndex) => {
                  const cl = new CardLogic(gameRef.current);
                  const result = cl.playCard(
                    gameRef.current.activePlayer,
                    cardIndex,
                    targetIndex,
                  );
                  if (!result.success) alert(result.error);
                  else refresh();
                }}
                onSellCard={(cardIndex) => {
                  const cl = new CardLogic(gameRef.current);
                  const result = cl.sellCard(
                    gameRef.current.activePlayer,
                    cardIndex,
                  );
                  if (!result.success) alert(result.error);
                  else refresh();
                }}
                onCallLegend={(legendIndex) => {
                  if (callingLegend) return;
                  setCallingLegend(true);
                  const cl = new CardLogic(gameRef.current);
                  const result = cl.callLegend(
                    gameRef.current.activePlayer,
                    legendIndex,
                  );
                  if (!result.success) alert(result.error);
                  else refresh();
                  setTimeout(() => setCallingLegend(false), 500);
                }}
                onDeclareAttacker={(unitIndex) => {
                  const cr = new CombatResolver(gameRef.current);
                  const result = cr.declareAttacker(
                    gameRef.current.activePlayer,
                    unitIndex,
                  );
                  if (!result.success) alert(result.error);
                  else {
                    refresh();
                    // In AI mode, AI auto-responds as defender
                    if (aiMode && aiRef.current) {
                      setTimeout(async () => {
                        const blocked = await aiRef.current.respondToAttack();
                        if (!blocked) {
                          // AI takes the hit — resolve combat
                          cr.resolveCombat(gameRef.current.activePlayer);
                          gameRef.current.clearExpiredEffects?.();
                        }
                        refresh();
                      }, 600);
                    } else {
                      setWaitingDefense(true);
                    }
                  }
                }}
                onDeclareBlocker={(blockerIndex) => {
                  if (!blockingMode) {
                    alert("Click 'USE BLOCKER' when an attack is declared.");
                    return;
                  }
                  const cr = new CombatResolver(gameRef.current);
                  const rivalId = gameRef.current.activePlayer === 1 ? 2 : 1;
                  const attackerIndex = gameRef.current.players[
                    gameRef.current.activePlayer
                  ].field.findIndex((u) => u.isAttacking);
                  if (attackerIndex === -1) {
                    alert("No attacking unit found!");
                    return;
                  }
                  const result = cr.declareBlocker(
                    rivalId,
                    blockerIndex,
                    attackerIndex,
                  );
                  if (!result.success) alert(result.error);
                  else {
                    setBlockingMode(false);
                    refresh();
                  }
                }}
                onResolveCombat={() => {
                  const cr = new CombatResolver(gameRef.current);
                  cr.resolveCombat(gameRef.current.activePlayer);
                  gameRef.current.clearExpiredEffects?.();
                  refresh();
                }}
                onRollGig={(dieType) => {
                  const result = gameRef.current.rollGig(
                    gameRef.current.activePlayer,
                    dieType,
                  );
                  if (!result.success) alert(result.error);
                  else refresh();
                }}
                onGoSolo={(legendIndex) => {
                  const cl = new CardLogic(gameRef.current);
                  const result = cl.goSolo(
                    gameRef.current.activePlayer,
                    legendIndex,
                  );
                  if (!result.success) alert(result.error);
                  else refresh();
                }}
                isBlockingMode={blockingMode}
                onBlockerSelected={(blockerIndex) => {
                  const cr = new CombatResolver(gameRef.current);
                  const rivalId = gameRef.current.activePlayer === 1 ? 2 : 1;
                  const attackerIndex = gameRef.current.players[
                    gameRef.current.activePlayer
                  ].field.findIndex((u) => u.isAttacking);
                  if (attackerIndex === -1) {
                    setBlockingMode(false);
                    return;
                  }
                  const result = cr.declareBlocker(
                    rivalId,
                    blockerIndex,
                    attackerIndex,
                  );
                  if (!result.success) alert(result.error);
                  else {
                    cr.resolveCombat(gameRef.current.activePlayer);
                    gameRef.current.clearExpiredEffects?.();
                    setBlockingMode(false);
                    setWaitingDefense(false);
                    refresh();
                  }
                }}
              />
            </div>

            {/* CONTROLS BAR */}
            <div className="bg-term-gray border border-term-amber/30 rounded p-4 flex flex-wrap items-center gap-4 max-w-[1200px] mx-auto">
              <div className="flex items-center gap-2">
                <span className="text-term-green/60 font-mono text-xs">
                  EDDIES
                </span>
                <span className="bg-term-amber text-term-black font-mono font-bold px-3 py-1 rounded text-sm">
                  {(game.players?.[game.activePlayer]?.eddies?.filter(
                    (e) => !e.isTapped,
                  ).length || 0) +
                    (game.players?.[game.activePlayer]?.legends?.filter(
                      (l) => !l.isTapped,
                    ).length || 0)}{" "}
                  €$
                </span>
              </div>
              <div className="w-px h-6 bg-term-amber/20" />
              <div className="flex items-center gap-2">
                <span className="text-term-green/60 font-mono text-xs">
                  STREET CRED
                </span>
                <span className="bg-term-green/20 text-term-green font-mono font-bold px-3 py-1 rounded text-sm border border-term-green/40">
                  {game.players?.[game.activePlayer]?.streetCred || 0} ☆
                </span>
              </div>
              <div className="w-px h-6 bg-term-amber/20" />
              <div className="flex items-center gap-2">
                <span className="text-term-amber/60 font-mono text-xs">
                  GIGS
                </span>
                <span className="bg-term-amber/20 text-term-amber font-mono font-bold px-3 py-1 rounded text-sm border border-term-amber/40">
                  {game.players?.[game.activePlayer]?.gigs?.length || 0} / 6
                </span>
              </div>
              <div className="w-px h-6 bg-term-amber/20" />
              <div className="font-mono text-term-amber text-sm font-bold">
                TURN {game.turn} —{" "}
                <span className="text-term-green">{game.phase}</span>
              </div>
              {aiMode && (
                <span className="px-2 py-1 bg-term-red/20 text-term-red border border-term-red/40 font-bold rounded text-xs font-mono">
                  🤖 AI
                </span>
              )}
              {game.isOvertime && (
                <span className="px-2 py-1 bg-term-red text-white font-bold rounded text-xs animate-pulse font-mono">
                  OVERTIME
                </span>
              )}
              <div className="ml-auto flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    const wasPlayer = gameRef.current.activePlayer;
                    if (gameRef.current.phase === "ATTACK") {
                      const cr = new CombatResolver(gameRef.current);
                      cr.resolveCombat(gameRef.current.activePlayer);
                      gameRef.current.clearExpiredEffects?.();
                    }
                    gameRef.current.advancePhase();
                    refresh();
                    if (!aiMode && gameRef.current.activePlayer !== wasPlayer)
                      setShowPassDevice(true);
                    setTimeout(() => {
                      if (
                        aiMode &&
                        aiRef.current &&
                        gameRef.current?.activePlayer === 2
                      ) {
                        aiRef.current.game = gameRef.current;
                        aiRef.current.onUpdate = refresh;
                        aiRef.current.takeTurn();
                      }
                    }, 100);
                  }}
                  disabled={
                    !!game.winner ||
                    game.phase === "MULLIGAN" ||
                    (game.phase === "CORE" &&
                      game.players?.[game.activePlayer]?.fixerDice?.length >
                        0 &&
                      !game.players?.[game.activePlayer]?.hasRolledThisTurn)
                  }
                  className="px-5 py-2 bg-term-green text-term-black font-bold rounded font-mono hover:bg-green-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  {game.phase === "ATTACK"
                    ? "RESOLVE COMBAT ⚔"
                    : game.phase === "END"
                      ? "END TURN ▶"
                      : "NEXT PHASE ▶"}
                </motion.button>
                <button
                  onClick={resetToMenu}
                  className="px-5 py-2 bg-term-red/20 text-term-red border border-term-red font-bold rounded font-mono hover:bg-term-red/30 transition-colors text-sm"
                >
                  FORFEIT
                </button>
              </div>
            </div>

            {/* GAME LOG */}
            {game.combatLog?.length > 0 && (
              <div className="bg-term-black border border-term-amber/20 rounded p-4 max-h-40 overflow-y-auto max-w-[1200px] mx-auto">
                <p className="text-term-amber/50 font-mono text-xs mb-2">
                  ▓ COMBAT LOG
                </p>
                <div className="space-y-1">
                  {[...game.combatLog].reverse().map((entry, i) => (
                    <div
                      key={i}
                      className="font-mono text-xs text-term-green/70"
                    >
                      <span className="text-term-amber/40">
                        T{entry.turn} [{entry.phase}]
                      </span>{" "}
                      {entry.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
