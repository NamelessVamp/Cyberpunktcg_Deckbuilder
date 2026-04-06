import { useState } from "react";

export default function SuggestedCards({ deck, allCards, onAddCard }) {
  const [isOpen, setIsOpen] = useState(false);

  // Calcular sugerencias
  const suggestions = getSuggestedCards(deck, allCards);

  if (suggestions.length === 0) {
    return null; // No mostrar si no hay sugerencias
  }

  return (
    <div className="mt-4 border border-term-green/30 rounded-lg overflow-hidden">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 bg-term-green/10 hover:bg-term-green/20 transition-colors flex justify-between items-center"
      >
        <span className="text-term-green font-mono font-bold">
          FIXER RECOMMENDATIONS
        </span>
        <span className="text-term-green font-mono text-sm">
          {isOpen ? "[HIDE]" : "[SHOW]"}
        </span>
      </button>

      {/* Suggestions List (Collapsible) */}
      {isOpen && (
        <div className="p-4 bg-black/20 space-y-2">
          {suggestions.map((card) => (
            <div
              key={card.id}
              className="flex justify-between items-center p-2 bg-term-gray/50 rounded border border-term-green/20 hover:border-term-green/50 transition-colors"
            >
              <div className="flex-1">
                <p className="text-term-green font-mono font-bold text-sm">
                  {card.name}
                </p>
                <p className="text-term-amber/60 font-mono text-xs">
                  Cost: {card.cost} • {card.faction}
                </p>
              </div>
              <button
                onClick={() => onAddCard(card)}
                className="px-3 py-1 bg-term-green/20 border border-term-green text-term-green rounded font-mono text-xs hover:bg-term-green/30 transition-colors"
              >
                [+ ADD]
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SUGGESTION ALGORITHM
// ============================================================================

function getSuggestedCards(deck, allCards) {
  // 1. Obtener colores de RAM de las Legends
  const ramColors = deck.legends.map((legend) => legend.ram_color);

  if (ramColors.length === 0) {
    return []; // No hay Legends, no hay sugerencias
  }

  // 2. Obtener IDs de cartas ya en el mazo
  const deckCardIds = new Set([
    ...deck.legends.map((c) => c.id),
    ...deck.mainDeck.map((c) => c.id),
    ...deck.sideboard.map((c) => c.id),
  ]);

  // 3. Filtrar cartas que cumplan criterios
  const candidates = allCards.filter((card) => {
    // Debe ser UNIT, GEAR, o BRAINDANCE (no LEGEND)
    if (card.type === "LEGEND") return false;

    // Debe ser coste 0, 1, o 2
    if (card.cost > 2) return false;

    // Debe coincidir con colores de RAM (o ser neutral)
    const isMatchingColor =
      ramColors.includes(card.ram_color) || card.ram_color === "Neutral";
    if (!isMatchingColor) return false;

    // No debe estar ya en el mazo
    if (deckCardIds.has(card.id)) return false;

    return true;
  });

  // 4. Ordenar por coste (0 → 1 → 2)
  candidates.sort((a, b) => a.cost - b.cost);

  // 5. Tomar Top 5
  return candidates.slice(0, 5);
}
