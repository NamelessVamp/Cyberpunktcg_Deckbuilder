import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SaveDeckModal({ deck, onSave, onClose }) {
  const [deckName, setDeckName] = useState("");
  const [deckNotes, setDeckNotes] = useState("");

  const handleSave = () => {
    if (deckName.trim() === "") {
      alert("Please enter a deck name");
      return;
    }
    onSave(deckName.trim(), deckNotes.trim());
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="bg-term-black border-2 border-term-amber p-6 rounded max-w-md w-full"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
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

          {/* Deck Notes */}
          <div className="mt-4">
            <label className="block text-term-green text-sm mb-2 font-mono">
              DECK NOTES (OPTIONAL):
            </label>
            <textarea
              value={deckNotes}
              onChange={(e) => setDeckNotes(e.target.value)}
              placeholder="Strategy, combos, sideboard notes..."
              className="input-terminal w-full h-32 resize-none"
              maxLength={500}
            />
            <p className="text-term-amber/40 text-xs mt-1 font-mono">
              {deckNotes.length}/500 characters
            </p>
          </div>

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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
