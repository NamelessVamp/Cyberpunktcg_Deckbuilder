import { useState } from "react";

export default function SaveDeckModal({ deck, onSave, onClose }) {
  const [deckName, setDeckName] = useState("");

  const handleSave = () => {
    if (!deckName.trim()) {
      alert("Please enter a deck name");
      return;
    }
    onSave(deckName.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-term-black border-2 border-term-amber p-6 rounded max-w-md w-full">
        <h2 className="text-term-amber font-bold text-xl mb-4 font-mono">
          SAVE_DECK.EXE
        </h2>

        {/* Deck Stats */}
        <div className="mb-4 p-3 bg-term-gray rounded">
          <p className="text-term-green text-sm font-mono">
            Legends: {deck.legends.length}/3
          </p>
          <p className="text-term-green text-sm font-mono">
            Main Deck: {deck.mainDeck.length}/40-50
          </p>
        </div>

        {/* Name Input */}
        <label className="block mb-2 text-term-green text-sm font-mono">
          DECK NAME:
        </label>
        <input
          type="text"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          placeholder="e.g., Johnny's Rebellion"
          className="input-terminal w-full mb-4"
          autoFocus
          maxLength={50}
        />

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-term-green text-term-black px-4 py-2 rounded font-mono font-bold hover:bg-green-400 transition-colors"
          >
            [SAVE]
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-term-gray border border-term-amber/40 text-term-amber px-4 py-2 rounded font-mono font-bold hover:bg-term-amber/10 transition-colors"
          >
            [CANCEL]
          </button>
        </div>
      </div>
    </div>
  );
}
