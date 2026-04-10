// NON OMNIS MORIAR — Publish Deck Modal
// EX MACHINA — Reemplaza el prompt() nativo con UI temática
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ARCHETYPES = [
  { value: "",          label: "— Select archetype —" },
  { value: "aggro",     label: "AGGRO — Fast, low-cost pressure" },
  { value: "control",   label: "CONTROL — Slow, disruptive, wins late" },
  { value: "combo",     label: "COMBO — Specific card synergy win con" },
  { value: "midrange",  label: "MIDRANGE — Balanced curve, flexible" },
  { value: "jank",      label: "JANK — Experimental / meme deck" },
];

export default function PublishDeckModal({ deck, onConfirm, onClose }) {
  const [description, setDescription] = useState("");
  const [archetype, setArchetype]     = useState("");
  const [submitting, setSubmitting]   = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await onConfirm({ description: description.trim(), archetype: archetype || null });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-term-gray border-2 border-term-amber rounded-lg w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.25 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-term-amber/20">
            <div>
              <h2 className="text-term-amber font-bold text-xl font-mono mb-0.5">
                ▓ PUBLISH TO BLACK MARKET
              </h2>
              <p className="text-term-green/60 font-mono text-xs">
                &gt; Uploading intel package: <span className="text-term-amber">{deck?.name}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-term-green text-2xl font-bold transition-colors leading-none ml-4"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Archetype */}
            <div>
              <label className="text-term-green/80 font-mono text-xs font-bold mb-1.5 block">
                ARCHETYPE <span className="text-term-amber/50">(optional)</span>
              </label>
              <select
                value={archetype}
                onChange={(e) => setArchetype(e.target.value)}
                className="w-full bg-term-black border border-term-amber/40 text-term-amber font-mono text-xs px-3 py-2 rounded focus:outline-none focus:border-term-amber"
              >
                {ARCHETYPES.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="text-term-green/80 font-mono text-xs font-bold mb-1.5 block">
                STRATEGY NOTES <span className="text-term-amber/50">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="> Describe your strategy, win conditions, key synergies..."
                className="w-full bg-term-black border border-term-amber/40 text-term-amber placeholder-term-amber/30 font-mono text-xs px-3 py-2 rounded resize-none focus:outline-none focus:border-term-amber"
              />
              <p className="text-term-amber/30 font-mono text-[10px] mt-1 text-right">
                {description.length}/500
              </p>
            </div>

            {/* Deck preview */}
            <div className="bg-term-black/50 border border-term-amber/15 rounded p-3 font-mono text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-term-amber/50">LEGENDS</span>
                <span className="text-term-amber">{deck?.deck?.legends?.length ?? 0}/3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-term-amber/50">MAIN DECK</span>
                <span className={`font-bold ${
                  (deck?.deck?.mainDeck?.length ?? 0) >= 40 && (deck?.deck?.mainDeck?.length ?? 0) <= 50
                    ? "text-term-green" : "text-term-red"
                }`}>
                  {deck?.deck?.mainDeck?.length ?? 0} cards
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 p-5 pt-0">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-term-amber/30 text-term-amber/60 font-mono font-bold text-sm rounded hover:bg-term-amber/10 transition-colors"
            >
              [CANCEL]
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-2.5 bg-term-amber text-term-black font-mono font-bold text-sm rounded hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "[UPLOADING...]" : "[▓ PUBLISH]"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
