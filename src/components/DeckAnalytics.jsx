export default function DeckAnalytics({ deck }) {
  const mainDeck = deck.mainDeck || [];

  const eddieCurve = mainDeck.reduce((acc, card) => {
    const cost = card.cost || 0;
    const bucket = cost >= 4 ? '4+' : String(cost);
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, {});

  const avgCost = mainDeck.length > 0 ? (mainDeck.reduce((sum, card) => sum + (card.cost || 0), 0) / mainDeck.length).toFixed(2) : 0;
  const deckTooSlow = avgCost > 2.5;

  const typeDistribution = mainDeck.reduce((acc, card) => {
    const type = card.type || 'UNKNOWN';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typePercentages = Object.entries(typeDistribution).map(([type, count]) => ({
    type, count, percentage: ((count / mainDeck.length) * 100).toFixed(1)
  }));

  const factionDistribution = mainDeck.reduce((acc, card) => {
    const faction = card.faction || 'Neutral';
    acc[faction] = (acc[faction] || 0) + 1;
    return acc;
  }, {});

  const factionPercentages = Object.entries(factionDistribution).map(([faction, count]) => ({
    faction, count, percentage: ((count / mainDeck.length) * 100).toFixed(1)
  })).sort((a, b) => b.count - a.count);

  const strongTribal = factionPercentages.length > 0 && parseFloat(factionPercentages[0].percentage) > 50;

  const drawSources = mainDeck.filter(card => {
    const text = (card.text || '').toLowerCase();
    return text.includes('draw') || text.includes('roba');
  });

  const lowDrawSources = drawSources.length < 3;

  if (mainDeck.length === 0) {
    return (
      <div className="card-container">
        <h2 className="text-term-amber font-bold mb-3 font-mono">ANALYTICS.SYS</h2>
        <p className="text-term-green/60 text-sm font-mono">Add cards to see analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card-container">
        <h3 className="text-term-amber font-bold mb-3 font-mono text-sm">EDDIE COST CURVE</h3>
        <div className="space-y-2 mb-3">
          {['0', '1', '2', '3', '4+'].map(cost => {
            const count = eddieCurve[cost] || 0;
            const maxCount = Math.max(...Object.values(eddieCurve), 1);
            const width = (count / maxCount) * 100;
            return (
              <div key={cost} className="flex items-center gap-2">
                <span className="text-term-green font-mono text-xs w-6">{cost}€</span>
                <div className="flex-1 bg-term-gray-light rounded h-5 relative overflow-hidden">
                  <div className="bg-term-green/60 h-full rounded transition-all" style={{ width: `${width}%` }}></div>
                  <span className="absolute inset-0 flex items-center justify-center text-term-green font-mono text-xs font-bold">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-term-amber/20">
          <span className="text-term-green/80 text-xs font-mono">AVG COST:</span>
          <span className={`font-mono font-bold ${deckTooSlow ? 'text-term-red' : 'text-term-green'}`}>{avgCost}€</span>
        </div>
        {deckTooSlow && (
          <div className="mt-2 p-2 bg-term-red/10 border border-term-red/40 rounded">
            <p className="text-term-red text-xs font-mono">⚠️ DECK TOO SLOW (avg cost &gt; 2.5)</p>
          </div>
        )}
      </div>

      <div className="card-container">
        <h3 className="text-term-amber font-bold mb-3 font-mono text-sm">CARD TYPES</h3>
        <div className="space-y-2">
          {typePercentages.map(({ type, count, percentage }) => (
            <div key={type} className="flex justify-between items-center">
              <span className="text-term-green text-xs font-mono">{type}</span>
              <div className="flex items-center gap-2">
                <span className="text-term-amber text-xs font-mono">{count}</span>
                <span className="text-term-green/60 text-xs font-mono">({percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-container">
        <h3 className="text-term-amber font-bold mb-3 font-mono text-sm">FACTION SYNERGY</h3>
        <div className="space-y-2 mb-2">
          {factionPercentages.map(({ faction, count, percentage }) => (
            <div key={faction} className="flex justify-between items-center">
              <span className="text-term-green text-xs font-mono">{faction}</span>
              <div className="flex items-center gap-2">
                <span className="text-term-amber text-xs font-mono">{count}</span>
                <span className="text-term-green/60 text-xs font-mono">({percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
        {strongTribal && (
          <div className="mt-2 p-2 bg-term-green/10 border border-term-green/40 rounded">
            <p className="text-term-green text-xs font-mono">✅ STRONG TRIBAL FOCUS</p>
          </div>
        )}
      </div>

      <div className="card-container">
        <h3 className="text-term-amber font-bold mb-3 font-mono text-sm">ENGINE TRACKER</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-term-green/80 text-xs font-mono">DRAW SOURCES:</span>
          <span className={`font-mono font-bold ${lowDrawSources ? 'text-term-red' : 'text-term-green'}`}>{drawSources.length}</span>
        </div>
        {lowDrawSources && (
          <div className="mt-2 p-2 bg-term-red/10 border border-term-red/40 rounded">
            <p className="text-term-red text-xs font-mono">⚠️ LOW CARD DRAW (&lt; 3 sources)</p>
          </div>
        )}
        {drawSources.length > 0 && (
          <div className="mt-2">
            <p className="text-term-green/60 text-xs font-mono mb-1">Sources:</p>
            <div className="space-y-1">
              {drawSources.slice(0, 5).map((card, idx) => (
                <p key={idx} className="text-term-amber text-xs font-mono truncate">• {card.name}</p>
              ))}
              {drawSources.length > 5 && <p className="text-term-green/40 text-xs font-mono">+ {drawSources.length - 5} more</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
