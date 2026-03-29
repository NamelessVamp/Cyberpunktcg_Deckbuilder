export default function CardDisplay({ cards, onAddCard }) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-term-amber/60 text-lg font-mono">NO CARDS FOUND</p>
        <p className="text-term-green/60 text-sm font-mono mt-2">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.id} className="card-container hover:border-term-green transition-all cursor-pointer" onClick={() => onAddCard(card)}>
          <div className="w-full h-48 bg-term-gray-light rounded flex items-center justify-center flex-col border-2 border-term-amber/20">
            <p className="text-term-amber text-xs font-mono mb-2 uppercase">{card.type}</p>
            <p className="text-term-green font-mono font-bold text-center px-4">{card.name}</p>
            {card.subtitle && <p className="text-term-amber/60 text-xs font-mono mt-1">{card.subtitle}</p>}
          </div>
          <div className="p-3">
            <div className="flex justify-between items-start mb-2">
              <span className="text-term-green text-xs font-mono">{card.faction || 'NO FACTION'}</span>
              <span className="text-term-amber text-xs font-mono">€{card.cost}</span>
            </div>
            {card.power !== null && (
              <div className="flex justify-between items-center">
                <span className="text-term-green/60 text-xs font-mono">POWER</span>
                <span className="text-term-green font-mono font-bold">{card.power}</span>
              </div>
            )}
            {card.ram && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: card.ram_color === 'Red' ? '#ff1744' : card.ram_color === 'Yellow' ? '#ffb300' : card.ram_color === 'Green' ? '#00ff41' : card.ram_color === 'Blue' ? '#00e5ff' : '#666' }}></div>
                <span className="text-term-green text-xs font-mono">RAM: {card.ram}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
