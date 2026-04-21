import { useState, useEffect, useRef } from "react";
import { useFeatureFlag } from "../hooks/useFeatureFlag";
import { useAuth } from "../contexts/AuthContext";
import { loadDecks } from "../lib/deckService";
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
  const [showPassDevice, setShowPassDevice] = useState(false);
  const aiRef = useRef(null);
  const [callingLegend, setCallingLegend] = useState(false);

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
          name: "⚡ Current Build",
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
        <div className="mb-6 flex items-center gap-3">
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
          <button
            onClick={() => setAiMode((m) => !m)}
            className={`px-4 py-1.5 font-mono font-bold text-xs rounded border transition-all ${
              aiMode
                ? "bg-term-red/20 border-term-red text-term-red"
                : "bg-term-amber/10 border-term-amber/40 text-term-amber/60 hover:border-term-amber hover:text-term-amber"
            }`}
          >
            {aiMode ? "[◈ AI: ON]" : "[◈ AI: OFF]"}
          </button>
        </div>

        <h1 className="text-4xl font-bold text-term-amber mb-8 font-mono">
          THE ARENA
        </h1>

        {!game ? (
          <>
            {!selectedDeck ? (
              <div className="bg-term-gray border-2 border-term-amber/30 rounded p-8">
                <h2 className="text-2xl text-term-amber mb-4 font-mono">
                  Select a Deck
                </h2>
                {isLoadingDecks ? (
                  <div className="text-term-amber/60 font-mono animate-pulse">
                    Loading decks...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedDecks.map((deck) => (
                      <button
                        key={deck.id}
                        onClick={() => setSelectedDeck(deck)}
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
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-term-gray border-2 border-term-amber/30 rounded p-8">
                <h2 className="text-2xl text-term-amber mb-4 font-mono">
                  Ready to Play?
                </h2>
                <div className="mb-6">
                  <div className="text-term-green font-bold text-xl mb-2 font-mono">
                    {selectedDeck.name}
                  </div>
                  <div className="text-term-amber/60 text-sm font-mono">
                    {selectedDeck.main_deck_ids?.length || 0} cards +{" "}
                    {selectedDeck.legend_ids?.length || 0} Legends
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => startGame(selectedDeck)}
                    className="flex-1 px-6 py-3 bg-term-green text-term-black font-bold rounded font-mono hover:bg-green-400 transition-colors"
                  >
                    START GAME
                  </button>
                  <button
                    onClick={() => setSelectedDeck(null)}
                    className="px-6 py-3 bg-term-gray-light text-term-amber font-bold rounded font-mono border border-term-amber/40 hover:bg-term-amber/10 transition-colors"
                  >
                    BACK
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
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
                <div className="bg-term-gray border-2 border-term-amber rounded-lg p-8 max-w-lg w-full mx-4">
                  <h2 className="text-term-amber font-mono font-bold text-2xl mb-2">
                    MULLIGAN?
                  </h2>
                  <p className="text-term-green/70 font-mono text-sm mb-4">
                    Shuffle your hand and draw 6 new cards. You can only do this
                    once.
                  </p>
                  <div className="flex gap-2 mb-6 flex-wrap">
                    {gameRef.current?.players[1].hand.map((card, i) => (
                      <div
                        key={i}
                        className="bg-term-black border border-term-amber/30 rounded p-2 text-xs font-mono text-term-amber"
                      >
                        <div className="font-bold truncate max-w-[90px]">
                          {card.name}
                        </div>
                        <div className="text-term-green/60">
                          {card.cost}€ · {card.type}
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
                </div>
              </div>
            )}

            {/* WIN SCREEN */}
            {game.winner && (
              <div className="bg-term-green border-2 border-term-green rounded p-6 text-center">
                <h2 className="text-4xl font-bold text-term-black mb-2 font-mono">
                  PLAYER {game.winner.player} WINS!
                </h2>
                <p className="text-term-black font-mono">
                  {game.winner.condition}
                </p>
                <button
                  onClick={() => {
                    gameRef.current = null;
                    setGame(null);
                    setSelectedDeck(null);
                  }}
                  className="mt-4 px-6 py-3 bg-term-black text-term-green font-bold rounded font-mono hover:bg-term-gray transition-colors"
                >
                  BACK TO DECK SELECTION
                </button>
              </div>
            )}

            {/* PLAYMAT */}
            <div
              className={`relative transition-all duration-500 ${cyberspaceMode ? "brightness-110 contrast-110 saturate-150" : ""}`}
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
                  if (callingLegend) return; // lock
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
                  else refresh();
                }}
                onDeclareBlocker={(blockerIndex) => {
                  const cr = new CombatResolver(gameRef.current);
                  const rivalId = gameRef.current.activePlayer === 1 ? 2 : 1;
                  const attackerIndex = gameRef.current.players[
                    gameRef.current.activePlayer
                  ].field.findIndex((u) => u.isAttacking);
                  if (attackerIndex === -1) {
                    alert("No attacking unit");
                    return;
                  }
                  const result = cr.declareBlocker(
                    rivalId,
                    blockerIndex,
                    attackerIndex,
                  );
                  if (!result.success) alert(result.error);
                  else refresh();
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
              />
            </div>

            {/* CONTROLS BAR */}
            <div className="bg-term-gray border border-term-amber/30 rounded p-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-term-green/60 font-mono text-xs">
                  YOUR EDDIES
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
              <div className="font-mono text-term-amber text-sm font-bold">
                TURN {game.turn} —{" "}
                <span className="text-term-green">{game.phase}</span>
              </div>
              {game.isOvertime && (
                <span className="px-2 py-1 bg-term-red text-white font-bold rounded text-xs animate-pulse font-mono">
                  OVERTIME
                </span>
              )}
              <div className="ml-auto flex gap-3">
                <button
                  onClick={() => {
                    const wasPlayer = gameRef.current.activePlayer;
                    if (gameRef.current.phase === "ATTACK") {
                      const cr = new CombatResolver(gameRef.current);
                      cr.resolveCombat(gameRef.current.activePlayer);
                      gameRef.current.clearExpiredEffects?.();
                    }
                    gameRef.current.advancePhase();
                    refresh();
                    // Pass device screen (only in hotseat mode)
                    if (!aiMode && gameRef.current.activePlayer !== wasPlayer) {
                      setShowPassDevice(true);
                    }
                    // AI turn
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
                </button>
                <button
                  onClick={() => {
                    gameRef.current = null;
                    setGame(null);
                    setSelectedDeck(null);
                  }}
                  className="px-5 py-2 bg-term-red/20 text-term-red border border-term-red font-bold rounded font-mono hover:bg-term-red/30 transition-colors text-sm"
                >
                  FORFEIT
                </button>
              </div>
            </div>

            {/* GAME LOG */}
            {game.combatLog?.length > 0 && (
              <div className="bg-term-black border border-term-amber/20 rounded p-4 max-h-40 overflow-y-auto">
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
