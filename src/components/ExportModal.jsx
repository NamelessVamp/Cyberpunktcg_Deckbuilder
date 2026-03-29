import { useState } from "react";

export default function ExportModal({ deck, deckName, onClose }) {
  const [copied, setCopied] = useState(false);

  const generateExportText = () => {
    let text = `DECK: ${deckName || "Untitled Deck"}\n\n`;

    text += `LEGENDS (${deck.legends.length}):\n`;
    deck.legends.forEach((legend) => {
      text += `1x ${legend.name}\n`;
    });

    text += `\nMAIN DECK (${deck.mainDeck.length}):\n`;

    const cardCounts = deck.mainDeck.reduce((acc, card) => {
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

  // Copy to clipboard
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

  // Download as .txt file
  const handleDownload = () => {
    const blob = new Blob([exportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${deckName.replace(/[^a-z0-9]/gi, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0a0a0a] border-2 border-term-amber rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-term-amber font-bold text-xl mb-4 font-mono">
          EXPORT_DECK.TXT
        </h2>

        {/* Text Preview */}
        <div className="mb-4 p-4 bg-term-gray-light rounded border border-term-amber/20 font-mono text-sm text-term-green max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap">{exportText}</pre>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={handleCopyToClipboard}
            className="bg-term-green text-term-black py-3 px-6 rounded font-mono font-bold hover:bg-green-400 transition-colors"
          >
            {copied ? "[✓ COPIED!]" : "[COPY]"}
          </button>

          <button
            onClick={handleDownload}
            className="bg-term-blue text-term-black py-3 px-6 rounded font-mono font-bold hover:bg-blue-400 transition-colors"
          >
            [DOWNLOAD]
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-term-gray border-2 border-term-amber/40 text-term-amber py-3 px-6 rounded font-mono font-bold hover:border-term-amber transition-colors"
        >
          [CLOSE]
        </button>
      </div>
    </div>
  );
}
