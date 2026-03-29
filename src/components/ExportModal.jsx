import { useState } from 'react';

export default function ExportModal({ deck, deckName, onClose }) {
  const [copied, setCopied] = useState(false);

  const generateExportText = () => {
    let text = `DECK: ${deckName || 'Untitled Deck'}\n\n`;

    text += `LEGENDS (${deck.legends.length}):\n`;
    deck.legends.forEach(legend => {
      text += `1x ${legend.name}\n`;
    });

    text += `\nMAIN DECK (${deck.mainDeck.length}):\n`;
    
    const cardCounts = deck.mainDeck.reduce((acc, card) => {
      acc[card.id] = (acc[card.id] || { card, count: 0 });
      acc[card.id].count++;
      return acc;
    }, {});

    const sortedCards = Object.values(cardCounts).sort((a, b) => 
      a.card.name.localeCompare(b.card.name)
    );

    sortedCards.forEach(({ card, count }) => {
      text += `${count}x ${card.name}\n`;
    });

    return text;
  };

  const exportText = generateExportText();

  const handleCopy = () => {
    navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-term-black border-2 border-term-amber p-6 rounded max-w-2xl w-full max-h-[80vh] overflow-auto">
        <h2 className="text-term-amber font-bold text-xl mb-4 font-mono">EXPORT_DECK.TXT</h2>
        <div className="mb-4 p-4 bg-term-gray rounded border border-term-amber/20 font-mono text-sm text-term-green max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap">{exportText}</pre>
        </div>
        <div className="flex gap-3">
          <button onClick={handleCopy} className="flex-1 bg-term-green text-term-black px-4 py-2 rounded font-mono font-bold hover:bg-green-400 transition-colors">
            {copied ? '[✓ COPIED!]' : '[COPY TO CLIPBOARD]'}
          </button>
          <button onClick={onClose} className="flex-1 bg-term-gray border border-term-amber/40 text-term-amber px-4 py-2 rounded font-mono font-bold hover:bg-term-amber/10 transition-colors">
            [CLOSE]
          </button>
        </div>
      </div>
    </div>
  );
}
