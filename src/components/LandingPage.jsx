import { useState } from "react";
import * as collectionService from "../lib/collectionService";
import GuideModal from "./GuideModal";
import PreconCard from "./PreconCard";
import preconDecksData from "../data/preconDecks.json";

// Kickstarter widget iframe
const KickstarterWidget = () => (
  <div className="flex justify-center">
    <div className="w-[220px] h-[420px] border-2 border-term-amber/50 rounded-lg shadow-2xl overflow-hidden">
      <iframe
        src="https://www.kickstarter.com/projects/cyberpunktcg/the-official-cyberpunk-trading-card-game/widget/card.html?v=2"
        width="220"
        height="420"
        frameBorder="0"
        scrolling="no"
      ></iframe>
    </div>
  </div>
);

function LandingPage({
  user,
  collection,
  allCards,
  savedDecks,
  onNavigate,
  onLoadPrecon,
}) {
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Calculate user stats
  const stats =
    user && collection.length > 0
      ? collectionService.getCollectionStats(collection, allCards)
      : null;

  return (
    <div className="max-w-6xl mx-auto">
      {/* HERO SECTION */}
      <div className="mb-16 border-2 border-term-amber/30 bg-term-gray/20 p-12 rounded-lg">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-8 items-center">
          {/* Left: Hero text */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl md:text-7xl font-bold text-term-amber mb-4 tracking-tight font-mono">
              AFTERLIFE DECKS
            </h1>
            <p className="text-xl md:text-2xl text-term-green/80 mb-2 font-mono">
              Professional Deck Builder for Cyberpunk 2077 TCG
            </p>
            <p className="text-sm text-term-amber/50 font-mono mb-2">
              WeirdCo Alpha/Beta Kit 2026 — Fan-made tool, free forever
            </p>
            <p className="text-lg md:text-xl text-term-green/60 mb-8 font-mono">
              Build. Analyze. Dominate Night City.
            </p>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-4 text-xs font-mono text-term-green/60">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-term-green rounded-full animate-pulse"></span>
                ONLINE
              </div>
              <span className="hidden sm:inline">//</span>
              <div>{allCards.length} CARDS LOADED</div>
              <span className="hidden sm:inline">//</span>
              <div>{savedDecks.length} DECKS SAVED</div>
            </div>
          </div>

          {/* Right: Kickstarter widget */}
          <div className="hidden lg:block">
            <KickstarterWidget />
            <p className="text-term-green/60 font-mono text-xs text-center mt-3">
              Support the official game
            </p>
          </div>
        </div>
      </div>

      {/* USER STATS DASHBOARD (if logged in) */}
      {user && (
        <div className="mb-12 bg-term-gray/30 border border-term-green/20 p-6 rounded-lg">
          <h3 className="text-term-green font-mono font-bold text-lg mb-4">
            [NETRUNNER PROFILE]
          </h3>
          {savedDecks.length === 0 && collection.length === 0 ? (
            // Empty state — new user
            <div className="text-center py-4">
              <p className="text-term-amber/60 font-mono text-sm mb-4">
                Welcome to Night City, Runner. Your stats will appear here once
                you start building.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={() => onNavigate("build")}
                  className="px-4 py-2 bg-term-amber/20 border border-term-amber text-term-amber font-mono text-xs rounded hover:bg-term-amber/30 transition-colors"
                >
                  [BUILD YOUR FIRST DECK →]
                </button>
                <button
                  onClick={() => onNavigate("packs")}
                  className="px-4 py-2 bg-term-green/20 border border-term-green text-term-green font-mono text-xs rounded hover:bg-term-green/30 transition-colors"
                >
                  [OPEN YOUR FIRST PACK →]
                </button>
              </div>
            </div>
          ) : (
            // Stats for returning users
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-term-black/40 border border-term-amber/20 rounded">
                <div className="text-3xl font-bold text-term-amber font-mono mb-1">
                  {savedDecks.length}
                </div>
                <div className="text-xs text-term-green/60 font-mono">
                  DECKS BUILT
                </div>
              </div>
              <div className="text-center p-4 bg-term-black/40 border border-term-blue/20 rounded">
                <div className="text-3xl font-bold text-term-blue font-mono mb-1">
                  {collection.length}
                </div>
                <div className="text-xs text-term-green/60 font-mono">
                  UNIQUE CARDS OWNED
                </div>
              </div>
              <div className="text-center p-4 bg-term-black/40 border border-term-green/20 rounded">
                <div className="text-3xl font-bold text-term-green font-mono mb-1">
                  {stats ? stats.completionPercent : 0}%
                </div>
                <div className="text-xs text-term-green/60 font-mono">
                  COLLECTION COMPLETE
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <button
          onClick={() => onNavigate("build")}
          className="bg-term-amber/10 border-2 border-term-amber p-6 rounded-lg hover:bg-term-amber/20 transition-all text-left group"
        >
          <div className="text-term-amber font-mono text-3xl font-bold mb-3 group-hover:translate-x-1 transition-transform">
            ▶
          </div>
          <h3 className="text-xl font-bold text-term-amber font-mono mb-2">
            BUILD A DECK
          </h3>
          <p className="text-term-green/60 text-sm font-mono mb-4">
            Card gallery, advanced filters, real-time validation
          </p>
          <div className="text-term-amber font-mono text-xs">
            [OPEN BUILDER →]
          </div>
        </button>
        <button
          onClick={() => onNavigate("packs")}
          className="bg-term-green/10 border-2 border-term-green p-6 rounded-lg hover:bg-term-green/20 transition-all text-left group"
        >
          <div className="text-term-green font-mono text-3xl font-bold mb-3 group-hover:translate-x-1 transition-transform">
            ⊞
          </div>
          <h3 className="text-xl font-bold text-term-green font-mono mb-2">
            PACKS & DRAFT
          </h3>
          <p className="text-term-green/60 text-sm font-mono mb-4">
            Open virtual packs or run a 40-card draft simulator
          </p>
          <div className="text-term-green font-mono text-xs">
            [OPEN PACKS →]
          </div>
        </button>
        <button
          onClick={() => setShowGuideModal(true)}
          className="bg-term-blue/10 border-2 border-term-blue p-6 rounded-lg hover:bg-term-blue/20 transition-all text-left group"
        >
          <div className="text-term-blue font-mono text-3xl font-bold mb-3 group-hover:translate-x-1 transition-transform">
            ◎
          </div>
          <h3 className="text-xl font-bold text-term-blue font-mono mb-2">
            LEARN TO PLAY
          </h3>
          <p className="text-term-green/60 text-sm font-mono mb-4">
            Rules, deck building guide, and gameplay basics
          </p>
          <div className="text-term-blue font-mono text-xs">[READ GUIDE →]</div>
        </button>
      </div>

      {/* PRECON DECKS SECTION */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-term-green font-mono">
            [STARTER DECKS]
          </h2>
          <span className="text-term-green/60 text-sm font-mono">
            Ready-to-play with strategy guides
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {preconDecksData.preconDecks.map((deck) => (
            <PreconCard
              key={deck.id}
              deck={deck}
              onLoad={(deckData) => {
                if (onLoadPrecon) {
                  onLoadPrecon(deckData);
                  onNavigate("build");
                }
              }}
            />
          ))}
        </div>
      </section>

      {/* RECENT ACTIVITY */}
      {savedDecks.length > 0 && (
        <div className="bg-term-gray/20 border border-term-amber/20 p-6 rounded-lg">
          <h3 className="text-term-green font-mono font-bold text-lg mb-4">
            [RECENT DECKS]
          </h3>
          <div className="space-y-2">
            {savedDecks.slice(0, 5).map((deck) => (
              <div
                key={deck.id}
                className="flex items-center justify-between p-3 bg-term-black/40 border border-term-green/10 rounded hover:border-term-amber/40 transition-colors cursor-pointer"
                onClick={() => onNavigate("mydecks")}
              >
                <div>
                  <span className="text-term-amber font-mono font-bold">
                    {deck.name}
                  </span>
                  <span className="text-term-green/60 text-xs font-mono ml-3">
                    {deck.deck.legends.length} Legends //{" "}
                    {deck.deck.mainDeck.length} Cards
                  </span>
                </div>
                <div className="text-term-green/40 text-xs font-mono">
                  {new Date(deck.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
          {savedDecks.length > 5 && (
            <button
              onClick={() => onNavigate("mydecks")}
              className="mt-4 w-full text-center text-term-amber font-mono text-sm hover:text-term-amber/80 transition-colors"
            >
              [VIEW ALL {savedDecks.length} DECKS →]
            </button>
          )}
        </div>
      )}

      {/* WELCOME MESSAGE FOR NEW USERS */}
      {!user && (
        <div className="mt-12 bg-term-amber/10 border-2 border-term-amber/40 p-6 rounded-lg text-center">
          <h3 className="text-term-amber font-mono font-bold text-xl mb-3">
            NEW TO AFTERLIFE DECKS?
          </h3>
          <p className="text-term-green font-mono text-sm mb-4">
            Login with Discord to save your decks to the cloud, track your
            physical collection, and sync across devices.
          </p>
          <p className="text-term-green/60 font-mono text-xs">
            You can also use the deck builder offline - decks save to your
            browser automatically.
          </p>
        </div>
      )}

      {/* GUIDE MODAL */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-term-gray border-2 border-term-green max-w-5xl w-full max-h-[90vh] overflow-y-auto p-8 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-term-green font-mono">
                [NETRUNNER'S GUIDE]
              </h2>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-term-red hover:text-red-400 text-3xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* TABS */}
            <GuideModal onClose={() => setShowGuideModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
