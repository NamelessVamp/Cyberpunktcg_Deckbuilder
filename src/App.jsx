import { useState, useEffect } from "react";
import cardsData from "./data/cards.json";
import SearchBar from "./components/SearchBar";
import FilterPanel from "./components/FilterPanel";
import DeckArea from "./components/DeckArea";
import DeckTabs from "./components/DeckTabs";
import SaveDeckModal from "./components/SaveDeckModal";
import MyDecksView from "./components/MyDecksView";
import PreconDecksView from "./components/PreconDecksView";
import DeckAnalytics from "./components/DeckAnalytics";
import ExportModal from "./components/ExportModal";

function App() {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDeckName, setExportDeckName] = useState("");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    types: [], // CAMBIADO de "type" a "types"
    factions: [],
    costMin: 0,
    costMax: 9,
    powerMin: 0,
    powerMax: 15,
    ramMin: 1,
    ramMax: 5,
    ramColors: [],
    keywords: [],
    set: "",
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [deck, setDeck] = useState({
    legends: [],
    mainDeck: [],
  });
  const [activeTab, setActiveTab] = useState("build");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedDecks, setSavedDecks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 12;

  useEffect(() => {
    setTimeout(() => {
      setCards(cardsData);
      setLoading(false);
    }, 500);
  }, []);

  // Cargar decks guardados desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cyberpunk_decks");
    if (saved) {
      try {
        setSavedDecks(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading saved decks:", e);
      }
    }
  }, []);

  // FILTRAR CARTAS
  const filteredCards = cards.filter((card) => {
    // FILTRO 1: SEARCH TERM
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        card.name.toLowerCase().includes(search) ||
        (card.subtitle && card.subtitle.toLowerCase().includes(search)) ||
        (card.text && card.text.toLowerCase().includes(search)) ||
        (card.keywords &&
          card.keywords.some((k) => k.toLowerCase().includes(search)));

      if (!matchesSearch) return false;
    }

    // FILTRO 2: TYPE (multi-select)
    if (filters.types && filters.types.length > 0) {
      if (!filters.types.includes(card.type)) return false;
    }

    // FILTRO 3: FACTION (multi-select)
    if (filters.factions && filters.factions.length > 0) {
      if (!filters.factions.includes(card.faction)) return false;
    }

    // FILTRO 4: SET - NUEVO
    if (filters.set && card.set !== filters.set) return false;

    // FILTRO 5: KEYWORDS - NUEVO
    if (filters.keywords && filters.keywords.length > 0) {
      const cardKeywords = card.keywords || [];
      // Card must have ALL selected keywords
      const hasAllKeywords = filters.keywords.every((keyword) =>
        cardKeywords.includes(keyword),
      );
      if (!hasAllKeywords) return false;
    }

    // FILTRO 6: COST
    if (card.cost !== undefined) {
      if (card.cost < filters.costMin || card.cost > filters.costMax)
        return false;
    }

    // FILTRO 7: POWER
    if (card.power !== undefined) {
      if (card.power < filters.powerMin || card.power > filters.powerMax)
        return false;
    }

    // FILTRO 8: RAM
    if (card.ram < filters.ramMin || card.ram > filters.ramMax) return false;

    // FILTRO 9: RAM COLOR
    if (filters.ramColors && filters.ramColors.length > 0) {
      if (!filters.ramColors.includes(card.ram_color)) return false;
    }

    return true;
  });

  // PAGINACIÓN (DESPUÉS del filtro)
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);

  // RESETEAR PÁGINA CUANDO CAMBIAN FILTROS
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // AGREGAR CARTA AL DECK
  const handleAddCard = (card) => {
    if (card.type === "LEGEND") {
      if (deck.legends.length >= 3) {
        alert("Ya tienes 3 Leyendas (máximo permitido)");
        return;
      }
      if (deck.legends.some((l) => l.id === card.id)) {
        alert("Esta Leyenda ya está en tu deck");
        return;
      }
      setDeck((prev) => ({
        ...prev,
        legends: [...prev.legends, card],
      }));
    } else {
      const count = deck.mainDeck.filter((c) => c.id === card.id).length;
      if (count >= 3) {
        alert("Ya tienes 3 copias de esta carta (máximo permitido)");
        return;
      }

      const ramBudget = deck.legends.reduce(
        (acc, legend) => {
          if (legend.ram_color && legend.ram) {
            acc[legend.ram_color] = (acc[legend.ram_color] || 0) + legend.ram;
          }
          return acc;
        },
        { Red: 0, Yellow: 0, Green: 0, Blue: 0 },
      );

      if (card.ram_color && ramBudget[card.ram_color] < card.ram) {
        alert(
          `RAM insuficiente: Necesitas ${card.ram} ${card.ram_color} RAM (tienes ${ramBudget[card.ram_color]})`,
        );
        return;
      }

      setDeck((prev) => ({
        ...prev,
        mainDeck: [...prev.mainDeck, card],
      }));
    }
  };

  // QUITAR CARTA DEL DECK
  const handleRemoveCard = (card, from) => {
    if (from === "legends") {
      setDeck((prev) => ({
        ...prev,
        legends: prev.legends.filter((c) => c.id !== card.id),
      }));
    } else {
      setDeck((prev) => {
        const index = prev.mainDeck.findIndex((c) => c.id === card.id);
        const newDeck = [...prev.mainDeck];
        newDeck.splice(index, 1);
        return { ...prev, mainDeck: newDeck };
      });
    }
  };
  // CLEAR ENTIRE DECK
  const handleClearDeck = () => {
    setDeck({
      legends: [],
      mainDeck: [],
    });
  };

  // SAVE DECK
  const handleSaveDeck = (deckName) => {
    const newDeck = {
      id: Date.now().toString(),
      name: deckName,
      deck: {
        legends: [...deck.legends],
        mainDeck: [...deck.mainDeck],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...savedDecks, newDeck];
    setSavedDecks(updated);
    localStorage.setItem("cyberpunk_decks", JSON.stringify(updated));
    setShowSaveModal(false);
    alert(`Deck "${deckName}" saved successfully!`);
  };

  // LOAD DECK
  const handleLoadDeck = (savedDeck) => {
    setDeck(savedDeck.deck);
    setActiveTab("build");
    alert(`Deck "${savedDeck.name}" loaded!`);
  };

  // DELETE DECK
  const handleDeleteDeck = (deckId) => {
    if (!confirm("Are you sure you want to delete this deck?")) return;

    const updated = savedDecks.filter((d) => d.id !== deckId);
    setSavedDecks(updated);
    localStorage.setItem("cyberpunk_decks", JSON.stringify(updated));
  };

  // LOAD PRECON DECK
  const handleLoadPrecon = (preconId) => {
    alert(`Loading ${preconId}... (To be implemented)`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-term-green text-2xl font-mono">
          [LOADING DECK_BUILDER.EXE...]
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <header className="mb-8 border-b border-term-amber/20 pb-4">
        <h1 className="text-4xl font-bold text-term-amber mb-2 font-mono">
          CYBERPUNK TCG // DECK_BUILDER.EXE
        </h1>
        <p className="text-term-green font-mono">
          [{filteredCards.length} / {cards.length} CARDS] // [ALPHA/BETA KIT
          2026]
        </p>
      </header>

      {/* TABS */}
      <DeckTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* CONTENT BY TAB */}
      {activeTab === "build" && (
        <>
          {/* 2 COLUMN LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN: CARD BROWSER (2/3) */}
            <div className="lg:col-span-2">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {currentCards.map((card) => (
                  <div
                    key={card.id}
                    className="card-container hover:border-term-green transition-all duration-300 cursor-pointer group"
                    onClick={() => handleAddCard(card)}
                  >
                    {/* Card Image */}
                    <div className="relative overflow-hidden rounded mb-3 bg-term-gray-light">
                      <img
                        src={card.image_url}
                        alt={card.name}
                        className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/300x420/1a1a1a/ffb300?text=IMAGE+ERROR";
                        }}
                      />
                      {card.ram_color && (
                        <div
                          className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                            card.ram_color === "Red"
                              ? "bg-term-red"
                              : card.ram_color === "Yellow"
                                ? "bg-term-amber"
                                : card.ram_color === "Green"
                                  ? "bg-term-green"
                                  : card.ram_color === "Blue"
                                    ? "bg-term-blue"
                                    : "bg-gray-500"
                          }`}
                        ></div>
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
                        <span className="text-term-blue">
                          COST: {card.cost}
                        </span>
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
                          <span className="text-term-green/80">
                            {card.faction}
                          </span>
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

                    {/* Add Indicator */}
                    <div className="mt-3 text-center">
                      <span className="text-term-green text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        [CLICK TO ADD]
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-4">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded font-mono font-bold transition-colors ${
                      currentPage === 1
                        ? "bg-term-gray border border-term-amber/20 text-term-amber/40 cursor-not-allowed"
                        : "bg-term-gray border border-term-amber/40 text-term-amber hover:bg-term-amber/10"
                    }`}
                  >
                    [◄ PREV]
                  </button>

                  <span className="text-term-green font-mono">
                    PAGE {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded font-mono font-bold transition-colors ${
                      currentPage === totalPages
                        ? "bg-term-gray border border-term-amber/20 text-term-amber/40 cursor-not-allowed"
                        : "bg-term-gray border border-term-amber/40 text-term-amber hover:bg-term-amber/10"
                    }`}
                  >
                    [NEXT ►]
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: DECK + ANALYTICS (1/3) */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* DECK AREA (con scroll independiente, incluye Analytics adentro) */}
                <DeckArea
                  deck={deck}
                  onRemoveCard={handleRemoveCard}
                  onClearDeck={handleClearDeck}
                />

                {/* SAVE + EXPORT BUTTONS - FUERA DEL SCROLL */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowSaveModal(true)}
                    disabled={
                      deck.mainDeck.length === 0 && deck.legends.length === 0
                    }
                    className="bg-term-green text-term-black px-4 py-3 rounded font-mono font-bold hover:bg-green-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    [💾 SAVE]
                  </button>

                  <button
                    onClick={() => {
                      const name = prompt("Deck name for export?") || "My Deck";
                      setExportDeckName(name);
                      setShowExportModal(true);
                    }}
                    disabled={deck.mainDeck.length === 0}
                    className="bg-term-amber text-term-black px-4 py-3 rounded font-mono font-bold hover:bg-yellow-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    [📋 EXPORT]
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MY DECKS TAB */}
      {activeTab === "mydecks" && (
        <MyDecksView
          savedDecks={savedDecks}
          onLoadDeck={handleLoadDeck}
          onDeleteDeck={handleDeleteDeck}
        />
      )}

      {/* PRECON DECKS TAB */}
      {activeTab === "precon" && (
        <PreconDecksView onLoadPrecon={handleLoadPrecon} />
      )}

      {/* SAVE DECK MODAL */}
      {showSaveModal && (
        <SaveDeckModal
          deck={deck}
          onSave={handleSaveDeck}
          onClose={() => setShowSaveModal(false)}
        />
      )}

      {/* EXPORT MODAL */}
      {showExportModal && (
        <ExportModal
          deck={deck}
          deckName={exportDeckName}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-term-amber/40 text-sm font-mono">
        // NAMELESS_V4MP
      </footer>
    </div>
  );
}

export default App;
