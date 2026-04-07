// EX MACHINA — Hover action menu for cards in deck

import { useState } from "react";

export default function DeckCardActions({
  card,
  count,
  onPreview,
  onRemove,
  onMoveToSideboard,
  onMoveToMainDeck,
  onEditQuantity,
  location, // 'mainDeck' | 'sideboard' | 'legends'
}) {
  const [showQuantityInput, setShowQuantityInput] = useState(false);
  const [newQuantity, setNewQuantity] = useState(count);

  const handleQuantitySubmit = () => {
    if (newQuantity && newQuantity !== count) {
      onEditQuantity(card, newQuantity, location);
    }
    setShowQuantityInput(false);
  };

  return (
    <div className="absolute inset-0 bg-black/90 rounded opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2">
      {/* Preview Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPreview(card);
        }}
        className="w-full bg-term-green/80 hover:bg-term-green text-term-black text-[10px] font-mono font-bold py-1 px-1 rounded transition-colors"
      >
        PREVIEW
      </button>

      {/* Move to Sideboard (only for mainDeck cards) */}
      {location === "mainDeck" && onMoveToSideboard && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveToSideboard(card);
          }}
          className="w-full bg-term-blue/80 hover:bg-term-blue text-term-black text-[10px] font-mono font-bold py-1 px-1 rounded transition-colors"
        >
          SIDEBOARD
        </button>
      )}

      {/* Move to Main Deck (only for sideboard cards) */}
      {location === "sideboard" && onMoveToMainDeck && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveToMainDeck(card);
          }}
          className="w-full bg-term-green/80 hover:bg-term-green text-term-black text-[10px] font-mono font-bold py-1 px-1 rounded transition-colors"
        >
          MAIN DECK
        </button>
      )}

      {/* Edit Quantity (only for mainDeck/sideboard) */}
      {location !== "legends" && count > 1 && !showQuantityInput && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowQuantityInput(true);
          }}
          className="w-full bg-term-amber/80 hover:bg-term-amber text-term-black text-[10px] font-mono font-bold py-1 px-1 rounded transition-colors"
        >
          EDIT QTY
        </button>
      )}

      {/* Quantity Input */}
      {showQuantityInput && (
        <div className="w-full flex gap-1" onClick={(e) => e.stopPropagation()}>
          <input
            type="number"
            min="1"
            max="3"
            value={newQuantity}
            onChange={(e) => setNewQuantity(parseInt(e.target.value))}
            className="w-12 bg-term-black text-term-amber text-center text-xs font-mono font-bold rounded border border-term-amber/40 px-1 py-0.5"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleQuantitySubmit();
              if (e.key === "Escape") setShowQuantityInput(false);
            }}
          />
          <button
            onClick={handleQuantitySubmit}
            className="flex-1 bg-term-green/80 hover:bg-term-green text-term-black text-[10px] font-mono font-bold py-0.5 rounded"
          >
            ✓
          </button>
        </div>
      )}

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(card, location);
        }}
        className="w-full bg-term-red/80 hover:bg-term-red text-term-black text-[10px] font-mono font-bold py-1 px-1 rounded transition-colors"
      >
        REMOVE
      </button>
    </div>
  );
}
