// NON OMNIS MORIAR — Arena.jsx
// EX MACHINA — Fullscreen simulator route
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useFeatureFlag } from "../hooks/useFeatureFlag";
import { loadDecks } from "../lib/deckService";
import cards from "../data/cards.json";
import { GameState } from "../lib/game/GameState";
import { AIPlayer } from "../lib/game/AIPlayer";
import PlaymatV2 from "../components/PlaymatV2";
import CyberspaceParticles from "../components/CyberspaceParticles";
import { motion, AnimatePresence } from "framer-motion";
import { CardLogic } from "../lib/CardLogic";
import { CombatResolver } from "../lib/CombatResolver";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

export default function Arena() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEnabled, isLoading: featureLoading } =
    useFeatureFlag("phase9_simulator");

  const [savedDecks, setSavedDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [game, setGame] = useState(null);
  const gameRef = useRef(null);
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);
  const [cyberspaceMode, setCyberspaceMode] = useState(false);
  const [gameMode, setGameMode] = useState(null); // null | "ai" | "hotseat"
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
      });
    }
  };

  const showToast = (msg, type = "info") => {
    console.log(`[ARENA TOAST ${type.toUpperCase()}]:`, msg);
    // TODO: Integrate proper toast system
  };

  // ← HANDLER MOVIDO AQUÍ (FUERA DE startGame)
  const handleAdvancePhase = () => {
    if (gameRef.current) {
      gameRef.current.advancePhase();
      refresh();
    }
  };

  useEffect(() => {
    if (user?.id) {
      setIsLoadingDecks(true);
      loadDecks(user.id)
        .then((decks) => setSavedDecks(decks || []))
        .catch((err) => console.error("Error loading decks:", err))
        .finally(() => setIsLoadingDecks(false));
    }
  }, [user]);

  const startGame = (deck, mode = "ai") => {
    const playerCards = cards.filter((c) =>
      [...(deck.legend_ids || []), ...(deck.main_deck_ids || [])].includes(
        c.id,
      ),
    );
    const opponentCards = cards.filter((c) =>
      [...(deck.legend_ids || []), ...(deck.main_deck_ids || [])].includes(
        c.id,
      ),
    );

    // ← ELIMINADO handleAdvancePhase DE AQUÍ

    const newGame = new GameState(playerCards, opponentCards);
    gameRef.current = newGame;

    if (mode === "ai") {
      aiRef.current = new AIPlayer(2);
    }

    setGame(newGame);
    setGameMode(mode);
    setSelectedDeck(deck);
  };

  const resetToMenu = () => {
    setGame(null);
    setSelectedDeck(null);
    setGameMode(null);
    aiRef.current = null;
  };

  // ... resto del código igual (feature flag check, deck selection, etc.)

  // Feature flag check
  if (featureLoading) {
    return (
      <div className="min-h-screen bg-term-black flex items-center justify-center">
        <div className="text-term-amber font-mono">Loading...</div>
      </div>
    );
  }

  if (!isEnabled) {
    return (
      <div className="min-h-screen bg-term-black flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-term-red font-mono text-2xl font-bold mb-4">
            ⚠️ THE ARENA - ACCESS DENIED
          </h1>
          <p className="text-term-amber/60 font-mono mb-6">
            This feature is currently in closed beta for admins only.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-term-amber text-term-black font-bold rounded font-mono hover:bg-term-green transition-colors"
          >
            BACK TO DECK BUILDER
          </button>
        </div>
      </div>
    );
  }

  // Deck selection screen
  if (!game) {
    // Precon decks (Alpha Kit)
    const preconDecks = [
      {
        id: "precon-arasaka",
        name: "Alpha Kit — Arasaka",
        legend_ids: ["smasher", "yorinobu-arasaka", "hanako-arasaka"],
        main_deck_ids: Array(40).fill("corpo-rat"),
      },
      {
        id: "precon-merc",
        name: "Alpha Kit — Mercs",
        legend_ids: ["jackie-welles", "panam-palmer", "rogue-amendiares"],
        main_deck_ids: Array(40).fill("street-kid"),
      },
    ];

    const allDecks = [...savedDecks, ...preconDecks];

    return (
      <div className="min-h-screen bg-term-black p-8 relative">
        {/* Cyberspace particles background */}
        <CyberspaceParticles className="opacity-60" />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-term-amber font-mono text-3xl font-bold">
              ▓ THE ARENA
            </h1>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-term-gray border border-term-amber text-term-amber font-mono hover:bg-term-amber/10 transition-colors"
            >
              ← BACK
            </button>
          </div>

          {/* Game mode selection */}
          {!gameMode && (
            <div className="mb-8 grid grid-cols-3 gap-4">
              <button
                onClick={() => setGameMode("ai")}
                className="p-6 bg-term-gray border-2 border-term-green text-term-green font-mono hover:bg-term-green/10 transition-all"
              >
                <div className="text-2xl mb-2">🤖</div>
                <div className="font-bold">VS AI</div>
                <div className="text-sm opacity-60">Practice against AI</div>
              </button>
              <button
                onClick={() => setGameMode("hotseat")}
                className="p-6 bg-term-gray border-2 border-term-amber text-term-amber font-mono hover:bg-term-amber/10 transition-all"
              >
                <div className="text-2xl mb-2">👥</div>
                <div className="font-bold">HOTSEAT</div>
                <div className="text-sm opacity-60">Pass & play locally</div>
              </button>
              <button
                onClick={() => alert("Online multiplayer coming soon!")}
                className="p-6 bg-term-gray border-2 border-cyan-500/40 text-cyan-500/60 font-mono hover:bg-cyan-500/10 transition-all"
              >
                <div className="text-2xl mb-2">🌐</div>
                <div className="font-bold">ONLINE</div>
                <div className="text-sm opacity-60">Coming soon</div>
              </button>
            </div>
          )}

          {/* Deck selection */}
          {gameMode && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-term-green font-mono text-xl">
                  SELECT YOUR DECK
                </h2>
                <button
                  onClick={() => setGameMode(null)}
                  className="px-3 py-1 text-term-amber/60 font-mono text-sm hover:text-term-amber transition-colors"
                >
                  ← Change Mode
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User saved decks */}
                {savedDecks.length > 0 && (
                  <div className="col-span-2 mb-2">
                    <h3 className="text-term-amber font-mono text-sm mb-2 opacity-60">
                      YOUR DECKS
                    </h3>
                  </div>
                )}
                {savedDecks.map((deck) => (
                  <button
                    key={deck.id}
                    onClick={() => startGame(deck, gameMode)}
                    className="p-4 bg-term-gray border border-term-amber rounded font-mono text-left hover:bg-term-amber/20 transition-all"
                  >
                    <div className="text-term-amber font-bold">{deck.name}</div>
                    <div className="text-term-green text-sm mt-1">
                      {deck.legend_ids?.length || 0} Legends •{" "}
                      {deck.main_deck_ids?.length || 0} Cards
                    </div>
                  </button>
                ))}

                {/* Precon decks */}
                <div className="col-span-2 mb-2 mt-4">
                  <h3 className="text-term-amber font-mono text-sm mb-2 opacity-60">
                    PRE-CONSTRUCTED DECKS
                  </h3>
                </div>
                {preconDecks.map((deck) => (
                  <button
                    key={deck.id}
                    onClick={() => startGame(deck, gameMode)}
                    className="p-4 bg-term-gray border border-term-green/40 rounded font-mono text-left hover:bg-term-green/10 transition-all"
                  >
                    <div className="text-term-green font-bold">{deck.name}</div>
                    <div className="text-term-amber/60 text-sm mt-1">
                      Official Alpha Kit deck
                    </div>
                  </button>
                ))}

                {savedDecks.length === 0 && (
                  <div className="col-span-2 text-term-amber/40 font-mono text-sm text-center p-4 bg-term-gray/30 rounded">
                    💡 No saved decks found. Use pre-constructed decks above or
                    create one in the Deck Builder.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Drag-and-drop sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px threshold before drag starts (prevents accidental drags)
      },
    }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return; // Dropped outside any zone

    console.log("[DRAG END]", {
      cardId: active.id,
      sourceZone: active.data.current?.zone,
      targetZone: over.id,
    });

    // TODO: Implement card movement logic in next step
    showToast(`Moved card ${active.id} to ${over.id}`, "info");
  };

  // Game screen (FULLSCREEN)
  return (
    <div className="w-screen h-screen overflow-hidden bg-term-black relative">
      {/* Cyberspace particles - always visible, intensity changes with mode */}
      <CyberspaceParticles
        className={`transition-opacity duration-500 ${
          cyberspaceMode ? "opacity-100" : "opacity-40"
        }`}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-term-black/80 backdrop-blur border-b border-term-amber/20 p-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-term-amber font-mono font-bold">
            {selectedDeck?.name || "The Arena"}
          </div>
          <button
            onClick={() => setCyberspaceMode(!cyberspaceMode)}
            className={`px-3 py-1 font-mono text-xs border transition-all ${
              cyberspaceMode
                ? "bg-cyan-500/20 border-cyan-500 text-cyan-500"
                : "bg-term-black border-term-amber/30 text-term-amber/60"
            }`}
          >
            {cyberspaceMode ? "◈ CYBERSPACE: ON" : "◈ CYBERSPACE: OFF"}
          </button>
        </div>
        <button
          onClick={resetToMenu}
          className="px-4 py-2 bg-term-black text-term-amber font-bold font-mono hover:bg-term-gray transition-colors border border-term-amber"
        >
          EXIT ARENA
        </button>
      </div>

      {/* Playmat fullscreen */}
      <div className="w-full h-full pt-[60px]">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <PlaymatV2
            game={game}
            gameRef={gameRef}
            onRefresh={refresh}
            onAdvancePhase={handleAdvancePhase}
            onGameUpdate={(g) => {
              gameRef.current = g;
              setGame(g);
            }}
            onPlayCard={(cardIndex, targetIndex) => {
              const player =
                gameRef.current.players[gameRef.current.activePlayer];
              const card = player.hand[cardIndex];

              if (card && card.cost > player.floatingEddies) {
                showToast(
                  `⚡ Pre-load ${card.cost} Eddies first (you have ${player.floatingEddies} floating)`,
                  "warning",
                );
                return;
              }

              const cl = new CardLogic(gameRef.current);
              const result = cl.playCard(
                gameRef.current.activePlayer,
                cardIndex,
                targetIndex,
              );
              if (!result.success) showToast(result.error, "error");
              else refresh();
            }}
            onSellCard={(cardIndex) => {
              const cl = new CardLogic(gameRef.current);
              const result = cl.sellCard(
                gameRef.current.activePlayer,
                cardIndex,
              );
              if (!result.success) showToast(result.error, "error");
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
              if (!result.success) showToast(result.error, "error");
              else refresh();
              setTimeout(() => setCallingLegend(false), 500);
            }}
            onDeclareAttacker={(unitIndex) => {
              const player =
                gameRef.current.players[gameRef.current.activePlayer];
              const unit = player.field[unitIndex];
              if (!unit) return;

              unit.isAttacking = true;
              refresh();

              setTimeout(() => {
                setWaitingDefense(true);
                setBlockingMode(true);
              }, 300);
            }}
            onDeclareBlocker={(blockerIndex) => {
              const resolver = new CombatResolver(gameRef.current);
              const result = resolver.resolveCombat(
                gameRef.current.activePlayer,
                blockerIndex,
              );
              if (!result.success) showToast(result.error, "error");
              else refresh();

              setWaitingDefense(false);
              setBlockingMode(false);
            }}
            onRollGig={(dieSides) => {
              const result = gameRef.current.rollGig(
                gameRef.current.activePlayer,
                dieSides,
              );
              if (result.success) refresh();
              else showToast(result.error, "error");
            }}
            onGoSolo={(cardIndex) => {
              const cl = new CardLogic(gameRef.current);
              const result = cl.goSolo(gameRef.current.activePlayer, cardIndex);
              if (!result.success) showToast(result.error, "error");
              else refresh();
            }}
            isBlockingMode={blockingMode}
            onBlockerSelected={(idx) => {}}
            onAdvancePhase={handleAdvancePhase}
          />
        </DndContext>
      </div>

      {/* Win screen overlay */}
      <AnimatePresence>
        {game?.winner && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <motion.div
                className="text-9xl mb-4"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
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
                  onClick={() => startGame(selectedDeck, gameMode)}
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
    </div>
  );
}
