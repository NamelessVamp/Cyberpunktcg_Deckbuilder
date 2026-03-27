import { useState, useEffect } from 'react'
import cardsData from './data/cards.json'
import SearchBar from './components/SearchBar'
import FilterPanel from './components/FilterPanel'

function App() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState()
  const [filters, setFilters] = useState({
  type: '',
  faction: '',
  costMin: 0,
  costMax: 9,
  powerMin: 0,
  powerMax: 15,
  ramMin: 1,
  ramMax: 5,
  
})
const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setCards(cardsData)
      setLoading(false)
    }, 500)
  }, [])

  // Filtrar cartas basado en el término de búsqueda
const filteredCards = cards.filter(card => {
  // FILTRO 1: SEARCH TERM
  if (searchTerm) {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      card.name.toLowerCase().includes(search) ||
      (card.subtitle && card.subtitle.toLowerCase().includes(search)) ||
      (card.text && card.text.toLowerCase().includes(search)) ||
      (card.keywords && card.keywords.some(k => k.toLowerCase().includes(search)));
    
    if (!matchesSearch) return false;
  }
  
  // FILTRO 2: TYPE
  if (filters.type && card.type !== filters.type) return false;
  
  // FILTRO 3: FACTION
  if (filters.faction && card.faction !== filters.faction) return false;
  
  // FILTRO 4: COST
  if (card.cost !== undefined) {
    if (card.cost < filters.costMin || card.cost > filters.costMax) return false;
  }
  
  // FILTRO 5: POWER
  if (card.power !== undefined) {
    if (card.power < filters.powerMin || card.power > filters.powerMax) return false;
  }
  
  // FILTRO 6: RAM
  if (card.ram < filters.ramMin || card.ram > filters.ramMax) return false;
  
  return true;
});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-term-green text-2xl font-mono">
          [LOADING DECK_BUILDER.EXE...]
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <header className="mb-8 border-b border-term-amber/20 pb-4">
        <h1 className="text-4xl font-bold text-term-amber mb-2 font-mono">
          CYBERPUNK TCG // DECK_BUILDER.EXE
        </h1>
        <p className="text-term-green font-mono">
          [{filteredCards.length} / {cards.length} CARDS] // [ALPHA/BETA KIT 2026]
        </p>
      </header>

      {/* Search Bar */}
      <SearchBar 
        onSearch={setSearchTerm}
        onToggleFilters={() => setFiltersOpen(!filtersOpen)}
        filtersOpen={filtersOpen}
      />
      <FilterPanel 
      cards={cards} 
      onFilterChange={setFilters}
      isOpen={filtersOpen}
      />

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCards.map((card) => (
          <div 
            key={card.id} 
            className="card-container hover:border-term-green transition-all duration-300 cursor-pointer group"
          >
            {/* Card Image */}
            <div className="relative overflow-hidden rounded mb-3 bg-term-gray-light">
              <img 
                src={card.image_url} 
                alt={card.name}
                className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x420/1a1a1a/ffb300?text=IMAGE+ERROR'
                }}
              />
              {/* RAM Color Indicator */}
              {card.ram_color && (
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                  card.ram_color === 'Red' ? 'bg-term-red' :
                  card.ram_color === 'Yellow' ? 'bg-term-amber' :
                  card.ram_color === 'Green' ? 'bg-term-green' :
                  card.ram_color === 'Blue' ? 'bg-term-blue' : 'bg-gray-500'
                }`}></div>
              )}
            </div>

            {/* Card Info */}
            <h3 className="text-term-green font-bold font-mono text-lg">
              {card.name}
            </h3>
            
            {card.subtitle && (
              <p className="text-term-amber/60 text-sm font-mono mb-2">
                {card.subtitle}
              </p>
            )}

            {/* Stats */}
            <div className="flex gap-3 text-xs font-mono mb-2">
              {card.cost !== undefined && (
                <span className="text-term-blue">COST: {card.cost}</span>
              )}
              {card.power !== undefined && (
                <span className="text-term-red">PWR: {card.power}</span>
              )}
              <span className="text-term-green">RAM: {card.ram}</span>
            </div>

            {/* Type & Faction */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-term-amber/80">{card.type}</span>
              {card.faction && (
                <>
                  <span className="text-term-amber/40">//</span>
                  <span className="text-term-green/80">{card.faction}</span>
                </>
              )}
            </div>

            {/* Keywords */}
            {card.keywords && card.keywords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {card.keywords.map((keyword, idx) => (
                  <span 
                    key={idx}
                    className="text-xs px-2 py-0.5 bg-term-amber/10 text-term-amber rounded font-mono"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-term-amber/40 text-sm font-mono">
        // UMBR4_ONLINE // NAMELESS_V4MP_CORE_ACTIVE
      </footer>
    </div>
  )
}

export default App