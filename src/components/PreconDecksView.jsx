import PreconCard from "./PreconCard";
import preconDecksData from "../data/preconDecks.json";

function PreconDecksView({ onNavigate }) {
  const handleLoadPrecon = (deckData) => {
    console.log("Loading precon:", deckData.name);
    // TODO: Integration with deck builder
    alert(
      `Precon "${deckData.name}" loaded!\n(Full integration with deck builder coming in next phase)`,
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-term-green font-mono mb-2">
          [STARTER DECKS]
        </h1>
        <p className="text-term-green/60 font-mono text-sm">
          Ready-to-play decks with full strategy guides. Perfect for beginners
          and experienced players testing new archetypes.
        </p>
      </div>

      {/* PRECON CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {preconDecksData.preconDecks.map((deck) => (
          <PreconCard key={deck.id} deck={deck} onLoad={handleLoadPrecon} />
        ))}
      </div>

      {/* INFO SECTION */}
      <div className="mt-12 bg-term-amber/10 border-2 border-term-amber/40 p-6 rounded-lg">
        <h3 className="text-term-amber font-mono font-bold text-lg mb-3">
          💡 ABOUT STARTER DECKS
        </h3>
        <div className="space-y-2 text-term-green/80 font-mono text-sm">
          <p>
            <span className="text-term-green font-bold">
              Beginner Decks (⭐):
            </span>{" "}
            Straightforward strategies, easy to pilot, great for learning the
            game.
          </p>
          <p>
            <span className="text-term-amber font-bold">
              Intermediate Decks (⭐⭐):
            </span>{" "}
            Moderate complexity with flexible gameplay and multiple win
            conditions.
          </p>
          <p>
            <span className="text-term-red font-bold">
              Advanced Decks (⭐⭐⭐):
            </span>{" "}
            High skill ceiling with intricate combos and decision trees.
            Rewarding when mastered.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PreconDecksView;
