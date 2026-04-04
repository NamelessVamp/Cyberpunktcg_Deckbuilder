import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExportModal({ deck, deckName, onClose }) {
  const [copied, setCopied] = useState(false);

  const generateExportText = () => {
    // Aseguramos que deckName tenga un valor por defecto
    const name = deckName || "Untitled Deck";
    let text = `DECK: ${name}\n\n`;

    text += `LEGENDS (${deck.legends?.length || 0}):\n`;
    deck.legends?.forEach((legend) => {
      text += `1x ${legend.name}\n`;
    });

    text += `\nMAIN DECK (${deck.mainDeck?.length || 0}):\n`;

    const cardCounts = (deck.mainDeck || []).reduce((acc, card) => {
      acc[card.id] = acc[card.id] || { card, count: 0 };
      acc[card.id].count++;
      return acc;
    }, {});

    const sortedCards = Object.values(cardCounts).sort((a, b) =>
      a.card.name.localeCompare(b.card.name),
    );

    sortedCards.forEach(({ card, count }) => {
      text += `${count}x ${card.name}\n`;
    });

    return text;
  };

  const exportText = generateExportText();

  const handleCopyToClipboard = () => {
    navigator.clipboard
      .writeText(exportText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        alert("❌ Failed to copy to clipboard");
      });
  };

  const handleDownload = () => {
    const name = deckName || "Untitled_Deck";
    const blob = new Blob([exportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/[^a-z0-9]/gi, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-term-gray border-2 border-term-amber rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col p-6 shadow-2xl"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-term-amber font-bold text-xl mb-4 font-mono">
            EXPORT_DECK.TXT
          </h2>

          {/* Text Preview */}
          <div className="mb-6 p-4 bg-black/40 rounded border border-term-amber/20 font-mono text-sm text-term-green overflow-y-auto flex-grow">
            <pre className="whitespace-pre-wrap leading-relaxed">
              {exportText}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={handleCopyToClipboard}
              className="bg-term-green text-term-black py-3 rounded font-mono font-bold hover:bg-green-400 transition-all active:scale-95"
            >
              {copied ? "[✓ COPIED!]" : "[COPY]"}
            </button>

            <button
              onClick={handleDownload}
              className="bg-term-blue text-term-black py-3 rounded font-mono font-bold hover:bg-blue-400 transition-all active:scale-95"
            >
              [DOWNLOAD]
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-transparent border-2 border-term-amber/40 text-term-amber py-2 rounded font-mono font-bold hover:border-term-amber transition-colors"
          >
            [CLOSE]
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
