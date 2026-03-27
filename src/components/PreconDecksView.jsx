export default function PreconDecksView({ onLoadPrecon }) {
  const preconDecks = [
    {
      id: "alpha-merc",
      name: "Alpha Kit: Merc Deck",
      description: "30-card starter deck focused on aggressive Merc tactics",
      color: "Red/Green",
    },
    {
      id: "alpha-arasaka",
      name: "Alpha Kit: Arasaka Deck",
      description: "30-card starter deck focused on Arasaka control",
      color: "Blue/Yellow",
    },
  ];

  return (
    <div>
      <div className="mb-6 p-4 bg-term-amber/10 border border-term-amber/40 rounded">
        <p className="text-term-amber text-sm font-mono">
          ⚠️ NOTE: Alpha Kit decks are 30 cards and may not follow standard deck
          building rules. They are intended for learning and playtesting only.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {preconDecks.map((precon) => (
          <div
            key={precon.id}
            className="card-container hover:border-term-green transition-all"
          >
            <h3 className="text-term-amber font-bold text-lg mb-2 font-mono">
              {precon.name}
            </h3>
            <p className="text-term-green/80 text-sm mb-3 font-mono">
              {precon.description}
            </p>
            <p className="text-term-blue text-xs mb-4 font-mono">
              Colors: {precon.color}
            </p>
            <button
              onClick={() => onLoadPrecon(precon.id)}
              className="w-full bg-term-green text-term-black px-4 py-2 rounded font-mono font-bold hover:bg-green-400 transition-colors"
            >
              [LOAD DECK]
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
