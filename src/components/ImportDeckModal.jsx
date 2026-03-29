import { useState } from "react";

export default function ImportDeckModal({ onImport, onClose, allCards }) {
  const [deckText, setDeckText] = useState("");
  const [error, setError] = useState("");

  const parseDecklist = (text) => {
    const lines = text.split("\n").filter((line) => line.trim());
    const legends = [];
    const mainDeck = [];
    const errors = [];

    for (let line of lines) {
      // Skip section headers
      if (line.includes("LEGENDS:") || line.includes("MAIN DECK:")) continue;

      // Parse format: "3x Card Name" or "Card Name"
      const match = line.match(/^(\d+)x?\s+(.+)$/i);
      if (!match) {
        errors.push(`Invalid format: "${line}"`);
        continue;
      }

      const count = parseInt(match[1]);
      const cardName = match[2].trim();

      // Find card in database (case-insensitive)
      // Supports formats: "Card Name" or "Card Name (Subtitle)"
      const card = allCards.find((c) => {
        const nameLower = c.name.toLowerCase();
        const cardNameLower = cardName.toLowerCase();

        // Exact name match
        if (nameLower === cardNameLower) return true;

        // Match "Name (Subtitle)" format
        if (c.subtitle) {
          const fullName = `${c.name} (${c.subtitle})`.toLowerCase();
          if (fullName === cardNameLower) return true;
        }

        return false;
      });

      if (!card) {
        errors.push(`Card not found: "${cardName}"`);
        continue;
      }

      // Add to appropriate deck section
      if (card.type === "LEGEND") {
        if (!legends.some((l) => l.id === card.id)) {
          legends.push(card);
        }
      } else {
        for (let i = 0; i < count; i++) {
          mainDeck.push(card);
        }
      }
    }

    return { legends, mainDeck, errors };
  };

  const handleImport = () => {
    if (!deckText.trim()) {
      setError("Please paste a decklist");
      return;
    }

    const { legends, mainDeck, errors } = parseDecklist(deckText);

    if (errors.length > 0) {
      setError(errors.join("\n"));
      return;
    }

    if (legends.length === 0 && mainDeck.length === 0) {
      setError("No valid cards found in decklist");
      return;
    }

    onImport({ legends, mainDeck });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-term-gray border-2 border-term-amber rounded-lg max-w-2xl w-full p-6">
        <h2 className="text-term-amber text-2xl font-mono font-bold mb-4">
          [IMPORT DECK]
        </h2>

        <p className="text-term-green/80 font-mono text-sm mb-4">
          Paste your decklist below. Format: "3x Card Name" or "Card Name"
        </p>

        <textarea
          value={deckText}
          onChange={(e) => {
            setDeckText(e.target.value);
            setError("");
          }}
          placeholder="3x V (Streetkid)&#10;2x Dying Night&#10;1x Viktor Vektor&#10;..."
          className="w-full h-64 bg-black/40 text-term-green border border-term-amber/30 rounded p-3 font-mono text-sm focus:border-term-amber focus:outline-none resize-none"
        />

        {error && (
          <div className="mt-3 p-3 bg-term-red/20 border border-term-red/40 rounded">
            <p className="text-term-red font-mono text-xs whitespace-pre-wrap">
              {error}
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleImport}
            className="flex-1 bg-term-green text-term-black px-6 py-3 rounded font-mono font-bold hover:bg-green-400 transition-colors"
          >
            [IMPORT]
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-term-gray border border-term-amber/30 text-term-amber px-6 py-3 rounded font-mono font-bold hover:border-term-amber transition-colors"
          >
            [CANCEL]
          </button>
        </div>
      </div>
    </div>
  );
}
