import { useState, useEffect } from 'react'
import cardsData from './data/cards.json'

function App() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga
    setTimeout(() => {
      setCards(cardsData)
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-term-green text-2xl">
          [LOADING DECK_BUILDER.EXE...]
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8 border-b border-term-amber/20 pb-4">
        <h1 className="text-4xl font-bold text-term-amber mb-2">
          CYBERPUNK TCG // DECK_BUILDER.EXE
        </h1>
        <p className="text-term-green">
          [{cards.length} CARDS LOADED] // [ALPHA/BETA KIT 2026]
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.slice(0, 8).map((card) => (
          <div key={card.id} className="card-container hover:border-term-green transition-colors">
            <h3 className="text-term-green font-bold">{card.name}</h3>
            {card.subtitle && (
              <p className="text-term-amber/60 text-sm">{card.subtitle}</p>
            )}
            <div className="mt-2 flex gap-2 text-xs">
              <span className="text-term-blue">COST: {card.cost || 'N/A'}</span>
              <span className="text-term-red">PWR: {card.power || 'N/A'}</span>
              <span className="text-term-green">RAM: {card.ram}</span>
            </div>
            <div className="mt-2">
              <span className="text-term-amber/80 text-xs">{card.type}</span>
              {card.faction && (
                <span className="text-term-green/80 text-xs ml-2">// {card.faction}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-8 text-center text-term-amber/40 text-sm">
        //Nameles V4mp
      </footer>
    </div>
  )
}

export default App