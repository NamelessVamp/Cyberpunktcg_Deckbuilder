import { useState, useEffect } from "react";
import { useFeatureFlag } from "../hooks/useFeatureFlag";
import { useAuth } from "../contexts/AuthContext";
import { loadDecks } from "../lib/deckService";
import cards from "../data/cards.json";
import { GameState } from "../lib/game/GameState";
import PlaymatV2 from "./PlaymatV2";
import CyberspaceParticles from "./CyberspaceParticles";
import { CardLogic } from "../lib/CardLogic";
import { CombatResolver } from "../lib/CombatResolver";

// Precon deck IDs (from Alpha Kit)
const PRECON_DECKS = {
  merc: {
    id: "precon-merc",
    name: "📦 Alpha Kit - Merc Deck",
    legend_ids: [
      "v-streetkid",
      "jackie-welles-the-good-friend",
      "panam-palmer-nomad-queen",
    ],
    main_deck_ids: [
      "dying-night",
      "dying-night",
      "dying-night",
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
    name: "📦 Alpha Kit - Arasaka Deck",
    legend_ids: [
      "saburo-arasaka-emperor",
      "yorinobu-arasaka-embracing-destruction",
      "goro-takemura-loyal-soldier",
    ],
    main_deck_ids: [
      "satori",
      "satori",
      "satori",
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
      "adam-smasher",
      "adam-smasher",
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
      "mtod12-flathead",
      "mtod12-flathead",
      "mtod12-flathead",
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
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);
  const [cyberspaceMode, setCyberspaceMode] = useState(false);
  const cardLogic = game ? new CardLogic(game) : null;
  const combatResolver = game ? new CombatResolver(game) : null;
  const refresh = () =>
    setGame((g) =>
      g ? Object.assign(Object.create(Object.getPrototypeOf(g)), g) : g,
    );

  // Load saved decks + precons + current deck
  useEffect(() => {
    async function loadAllDecks() {
      setIsLoadingDecks(true);
      let decks = [];

      // Add precon decks (always available)
      decks.push(PRECON_DECKS.merc);
      decks.push(PRECON_DECKS.arasaka);

      // Add current deck from builder (if exists)
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

      // Add saved decks (if logged in)
      if (user) {
        try {
          const userDecks = await loadDecks(user.id);
          decks = [...decks, ...userDecks];
        } catch (error) {
          console.error("Error loading user decks:", error);
        }
      }

      setSavedDecks(decks);
      setIsLoadingDecks(false);
    }

    loadAllDecks();
  }, [user, currentDeck]);

  // Convert deck to game format
  function prepareDeckForGame(deck) {
    const deckCards = [];

    // Add Legends
    deck.legend_ids.forEach((id) => {
      const card = cards.find((c) => c.id === id);
      if (card) deckCards.push({ ...card });
    });

    // Add Main Deck
    deck.main_deck_ids.forEach((id) => {
      const card = cards.find((c) => c.id === id);
      if (card) deckCards.push({ ...card });
    });

    return deckCards;
  }

  // Start game with selected deck
  function startGame(deck) {
    const playerDeck = prepareDeckForGame(deck);
    // For now, opponent uses same deck (TODO: Add AI deck selection)
    const opponentDeck = prepareDeckForGame(
      deck.id === PRECON_DECKS.merc.id
        ? PRECON_DECKS.arasaka
        : PRECON_DECKS.merc,
    );

    const newGame = new GameState(playerDeck, opponentDeck);
    newGame.startGame();

    setGame(newGame);
    setSelectedDeck(deck);
  }

  if (featureLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-term-black">
        <div className="text-term-amber font-mono">
          <div className="animate-pulse">LOADING SIMULATOR...</div>
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
      className={`min-h-screen p-4 relative transition-all duration-500 ${
        cyberspaceMode ? "bg-[#02050a]" : "bg-term-black"
      }`}
    >
      {cyberspaceMode && (
        <CyberspaceParticles count={250} className="opacity-60" />
      )}
      <div className="w-full mx-auto overflow-x-auto">
        {/* Beta Badge */}
        <div className="mb-6 flex items-center gap-3">
          <span className="px-3 py-1 bg-term-amber text-term-black font-bold text-xs rounded font-mono">
            ADMIN BETA
          </span>
          <span className="text-term-amber/60 text-sm font-mono">
            Phase 9 Simulator v0.2.0 - Playmat V2
          </span>
          {/* Cyberspace Mode Toggle */}
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

        <h1 className="text-4xl font-bold text-term-amber mb-8 font-mono">
          THE ARENA
        </h1>

        {!game ? (
          <>
            {/* Deck Selection */}
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
              /* Deck Confirmation */
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
          /* Game UI with PlaymatV2 */
          <div className="space-y-6">
            {/* Win Condition Check */}
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
                    setGame(null);
                    setSelectedDeck(null);
                  }}
                  className="mt-4 px-6 py-3 bg-term-black text-term-green font-bold rounded font-mono hover:bg-term-gray transition-colors"
                >
                  BACK TO DECK SELECTION
                </button>
              </div>
            )}

            {/* Playmat V2 */}
            <div
              className={`relative transition-all duration-500 overflow-x-auto ${
                cyberspaceMode ? "brightness-110 contrast-110 saturate-150" : ""
              }`}
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
                onGameUpdate={(updatedGame) => setGame(updatedGame)}
                onPlayCard={(cardIndex, targetIndex) => {
                  const result = cardLogic.playCard(1, cardIndex, targetIndex);
                  if (!result.success) alert(result.error);
                  else {
                    game.log(`Played card`);
                    refresh();
                  }
                }}
                onSellCard={(cardIndex) => {
                  const result = cardLogic.sellCard(1, cardIndex);
                  if (!result.success) alert(result.error);
                  else {
                    game.log(`Sold card for 1 Eddie`);
                    refresh();
                  }
                }}
                onCallLegend={(legendIndex) => {
                  const result = cardLogic.callLegend(1, legendIndex);
                  if (!result.success) alert(result.error);
                  else {
                    game.log(`Called legend`);
                    refresh();
                  }
                }}
                onDeclareAttacker={(unitIndex) => {
                  const result = combatResolver.declareAttacker(1, unitIndex);
                  if (!result.success) alert(result.error);
                  else {
                    game.log(`Declared attacker`);
                    refresh();
                  }
                }}
                onResolveCombat={() => {
                  const result = combatResolver.resolveCombat(1);
                  game.log(`Combat resolved`);
                  game.clearExpiredEffects();
                  refresh();
                }}
              />
            </div>

            {/* Actions */}
            <div className="bg-term-gray border-2 border-term-amber/30 rounded p-6">
              <h3 className="text-term-amber font-bold mb-4 font-mono">
                ACTIONS
              </h3>
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={() => {
                    game.advancePhase();
                    setGame(
                      Object.assign(
                        Object.create(Object.getPrototypeOf(game)),
                        game,
                      ),
                    );
                  }}
                  disabled={!!game.winner}
                  className="px-6 py-3 bg-term-green text-term-black font-bold rounded font-mono hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {game.phase === "END" ? "END TURN ▶" : `NEXT PHASE ▶`}
                </button>
                <button
                  onClick={() => {
                    setGame(null);
                    setSelectedDeck(null);
                  }}
                  className="px-6 py-3 bg-term-red text-white font-bold rounded font-mono hover:bg-red-600 transition-colors"
                >
                  FORFEIT GAME
                </button>
                <div className="flex-1 flex items-center justify-end gap-4 text-sm font-mono">
                  <div className="text-term-amber/60">
                    TURN {game.turn} • {game.phase}
                  </div>
                  {game.isOvertime && (
                    <div className="px-3 py-1 bg-term-red text-white font-bold rounded animate-pulse">
                      OVERTIME
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
