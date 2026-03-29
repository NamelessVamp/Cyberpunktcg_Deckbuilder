import { useState, useEffect } from "react";
import cardsData from "./data/cards.json";
import preconDecks from "./data/PreconDecks.json";
import SearchBar from "./components/SearchBar";
import FilterPanel from "./components/FilterPanel";
import DeckArea from "./components/DeckArea";
import DeckTabs from "./components/DeckTabs";
import SaveDeckModal from "./components/SaveDeckModal";
import MyDecksView from "./components/MyDecksView";
import PreconDecksView from "./components/PreconDecksView";
import DeckAnalytics from "./components/DeckAnalytics";
import ExportModal from "./components/ExportModal";
import Toast from "./components/Toast";
import ConfirmModal from "./components/ConfirmModal";
import CardPreviewModal from "./components/CardPreviewModal";
import ImportDeckModal from "./components/ImportDeckModal";

// DECK ENCODING/DECODING UTILITIES
const encodeDeck = (deck) => {
  try {
    const deckData = {
      legends: deck.legends.map((c) => c.id),
      mainDeck: deck.mainDeck.map((c) => c.id),
    };
    const jsonString = JSON.stringify(deckData);
    return btoa(jsonString); // Base64 encode
  } catch (error) {
    console.error("Error encoding deck:", error);
    return null;
  }
};

const decodeDeck = (encodedString, allCards) => {
  try {
    const jsonString = atob(encodedString); // Base64 decode
    const deckData = JSON.parse(jsonString);

    const legends = deckData.legends
      .map((id) => allCards.find((c) => c.id === id))
      .filter(Boolean);

    const mainDeck = deckData.mainDeck
      .map((id) => allCards.find((c) => c.id === id))
      .filter(Boolean);

    return { legends, mainDeck };
  } catch (error) {
    console.error("Error decoding deck:", error);
    return null;
  }
};

function App() {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDeckName, setExportDeckName] = useState("");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    types: [],
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
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const cardsPerPage = 18;
  const [previewCard, setPreviewCard] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setCards(cardsData);
      setLoading(false);
    }, 500);
  }, []);

  // AUTO-LOAD DECK FROM URL
  useEffect(() => {
    if (cards.length === 0) return; // Wait for cards to load

    const urlParams = new URLSearchParams(window.location.search);
    const encodedDeck = urlParams.get("d");

    if (encodedDeck) {
      const decodedDeck = decodeDeck(encodedDeck, cards);

      if (decodedDeck) {
        setDeck(decodedDeck);
        setActiveTab("build");
        showToast(
          `Deck loaded from URL: ${decodedDeck.legends.length} Legends, ${decodedDeck.mainDeck.length} cards`,
          "success",
        );

        // Clean URL after loading
        window.history.replaceState({}, "", window.location.pathname);
      } else {
        showToast("Invalid deck URL", "error");
      }
    }
  }, [cards]);

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

  // KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if Ctrl or Cmd is pressed
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Ctrl+S: Save Deck
      if (isCtrlOrCmd && e.key === "s") {
        e.preventDefault(); // Prevent browser save dialog
        if (deck.mainDeck.length > 0 || deck.legends.length > 0) {
          setShowSaveModal(true);
        }
      }

      // Ctrl+F: Focus Search
      if (isCtrlOrCmd && e.key === "f") {
        e.preventDefault(); // Prevent browser find dialog
        document.getElementById("search-input")?.focus();
      }

      // ESC: Close modals/filters
      if (e.key === "Escape") {
        setShowSaveModal(false);
        setShowExportModal(false);
        setShowImportModal(false);
        setPreviewCard(null);
        setFiltersOpen(false);
        setConfirmModal(null);
      }

      // Ctrl+E: Export Deck
      if (isCtrlOrCmd && e.key === "e") {
        e.preventDefault();
        if (deck.mainDeck.length > 0) {
          setExportDeckName("My Deck");
          setShowExportModal(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    deck,
    showSaveModal,
    showExportModal,
    showImportModal,
    previewCard,
    filtersOpen,
    confirmModal,
  ]);

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

    // FILTRO 4: SET
    if (filters.set && card.set !== filters.set) return false;

    // FILTRO 5: KEYWORDS
    if (filters.keywords && filters.keywords.length > 0) {
      const cardKeywords = card.keywords || [];
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

  // PAGINACIÓN
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);

  // RESETEAR PÁGINA CUANDO CAMBIAN FILTROS
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // AGREGAR CARTA AL DECK
  const handleAddToDeck = (card, quantity = 1) => {
    if (card.type === "LEGEND") {
      if (deck.legends.length >= 3) {
        showToast("Ya tienes 3 Leyendas (máximo permitido)", "warning");
        return;
      }
      if (deck.legends.some((l) => l.id === card.id)) {
        showToast("Esta Leyenda ya está en tu deck", "warning");
        return;
      }
      setDeck((prev) => ({
        ...prev,
        legends: [...prev.legends, card],
      }));
      showToast(`${card.name} added to legends`, "success");
    } else {
      const currentCount = deck.mainDeck.filter((c) => c.id === card.id).length;
      const canAdd = Math.min(quantity, 3 - currentCount);

      if (canAdd === 0) {
        showToast(
          "Ya tienes 3 copias de esta carta (máximo permitido)",
          "warning",
        );
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
        showToast(
          `RAM insuficiente: Necesitas ${card.ram} ${card.ram_color} RAM (tienes ${ramBudget[card.ram_color]})`,
          "error",
        );
        return;
      }

      setDeck((prev) => {
        const newMainDeck = [...prev.mainDeck];
        for (let i = 0; i < canAdd; i++) {
          newMainDeck.push(card);
        }
        return { ...prev, mainDeck: newMainDeck };
      });

      if (canAdd < quantity) {
        showToast(
          `${card.name}: Added ${canAdd} ${canAdd === 1 ? "copy" : "copies"} (max 3 reached)`,
          "warning",
        );
      } else {
        showToast(
          `${card.name}: Added ${canAdd} ${canAdd === 1 ? "copy" : "copies"}`,
          "success",
        );
      }
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
  const handleSaveDeck = (deckName, deckNotes = "") => {
    const newDeck = {
      id: Date.now().toString(),
      name: deckName,
      notes: deckNotes,
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
    showToast(`Deck "${deckName}" saved successfully!`, "success");
  };

  // LOAD DECK
  const handleLoadDeck = (savedDeck) => {
    setDeck(savedDeck.deck);
    setActiveTab("build");
    showToast(`Deck "${savedDeck.name}" loaded!`, "success");
  };

  // DELETE DECK
  const handleDeleteDeck = (deckId) => {
    const deckToDelete = savedDecks.find((d) => d.id === deckId);

    setConfirmModal({
      title: "DELETE DECK",
      message: `Are you sure you want to delete "${deckToDelete?.name}"? This cannot be undone.`,
      onConfirm: () => {
        const updated = savedDecks.filter((d) => d.id !== deckId);
        setSavedDecks(updated);
        localStorage.setItem("cyberpunk_decks", JSON.stringify(updated));
        showToast("Deck deleted", "success");
        setConfirmModal(null);
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  // SHARE DECK VIA URL
  const handleShareDeck = () => {
    if (deck.mainDeck.length === 0) {
      showToast("Deck is empty", "warning");
      return;
    }

    const encoded = encodeDeck(deck);

    if (!encoded) {
      showToast("Failed to generate share URL", "error");
      return;
    }

    const shareUrl = `${window.location.origin}${window.location.pathname}?d=${encoded}`;

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        showToast("Deck URL copied to clipboard!", "success");
      })
      .catch(() => {
        // Fallback: Show URL in prompt
        prompt("Copy this URL:", shareUrl);
      });
  };

  // EXPORT ALL DECKS
  const handleExportAllDecks = () => {
    if (savedDecks.length === 0) {
      showToast("No decks to export", "warning");
      return;
    }

    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      decks: savedDecks,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cyberpunk_decks_backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Exported ${savedDecks.length} decks successfully!`, "success");
  };

  // IMPORT ALL DECKS
  const handleImportAllDecks = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importData = JSON.parse(event.target.result);

          if (!importData.decks || !Array.isArray(importData.decks)) {
            showToast("Invalid backup file format", "error");
            return;
          }

          // Merge with existing decks (avoid duplicates by ID)
          const existingIds = new Set(savedDecks.map((d) => d.id));
          const newDecks = importData.decks.filter(
            (d) => !existingIds.has(d.id),
          );

          if (newDecks.length === 0) {
            showToast("All decks already exist", "warning");
            return;
          }

          const merged = [...savedDecks, ...newDecks];
          setSavedDecks(merged);
          localStorage.setItem("cyberpunk_decks", JSON.stringify(merged));

          showToast(
            `Imported ${newDecks.length} new decks! (${importData.decks.length - newDecks.length} duplicates skipped)`,
            "success",
          );
        } catch (error) {
          console.error("Import error:", error);
          showToast("Failed to import decks. Invalid file.", "error");
        }
      };

      reader.readAsText(file);
    };

    input.click();
  };

  // DUPLICATE DECK
  const handleDuplicateDeck = (deckId) => {
    const deckToDuplicate = savedDecks.find((d) => d.id === deckId);

    if (!deckToDuplicate) return;

    const duplicatedDeck = {
      id: Date.now().toString(),
      name: `${deckToDuplicate.name} (Copy)`,
      deck: {
        legends: [...deckToDuplicate.deck.legends],
        mainDeck: [...deckToDuplicate.deck.mainDeck],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...savedDecks, duplicatedDeck];
    setSavedDecks(updated);
    localStorage.setItem("cyberpunk_decks", JSON.stringify(updated));
    showToast(`Deck "${duplicatedDeck.name}" created!`, "success");
  };

  // RENAME DECK
  const handleRenameDeck = (deckId) => {
    const deckToRename = savedDecks.find((d) => d.id === deckId);

    if (!deckToRename) return;

    const newName = prompt("Enter new deck name:", deckToRename.name);

    if (!newName || newName.trim() === "") {
      showToast("Deck name cannot be empty", "warning");
      return;
    }

    if (newName === deckToRename.name) {
      return; // No change
    }

    const updated = savedDecks.map((d) =>
      d.id === deckId
        ? { ...d, name: newName.trim(), updatedAt: new Date().toISOString() }
        : d,
    );

    setSavedDecks(updated);
    localStorage.setItem("cyberpunk_decks", JSON.stringify(updated));
    showToast(`Deck renamed to "${newName.trim()}"`, "success");
  };

  // LOAD PRECON DECK
  const handleLoadPrecon = (preconDeck) => {
    const legends = [];
    const mainDeck = [];

    // Load legends
    preconDeck.legends.forEach((legendName) => {
      const card = cards.find((c) => {
        const nameLower = c.name.toLowerCase();
        const searchLower = legendName.toLowerCase();
        if (nameLower === searchLower) return true;
        if (c.subtitle) {
          const fullName = `${c.name} (${c.subtitle})`.toLowerCase();
          if (fullName === searchLower) return true;
        }
        return false;
      });
      if (card) legends.push(card);
    });

    // Load main deck
    Object.entries(preconDeck.mainDeck).forEach(([cardName, count]) => {
      const card = cards.find((c) => {
        const nameLower = c.name.toLowerCase();
        const searchLower = cardName.toLowerCase();
        if (nameLower === searchLower) return true;
        if (c.subtitle) {
          const fullName = `${c.name} (${c.subtitle})`.toLowerCase();
          if (fullName === searchLower) return true;
        }
        return false;
      });
      if (card) {
        for (let i = 0; i < count; i++) {
          mainDeck.push(card);
        }
      }
    });

    setDeck({ legends, mainDeck });

    // RESTRICTIVE AUTO-FILTER: Extract RAM colors from LEGENDS ONLY
    const deckRamColors = [
      ...new Set(legends.map((c) => c.ram_color).filter(Boolean)),
    ];

    // Clear all filters and apply ONLY deck RAM colors
    setFilters({
      types: [],
      factions: [],
      costMin: 0,
      costMax: 9,
      powerMin: 0,
      powerMax: 15,
      ramMin: 1,
      ramMax: 5,
      ramColors: deckRamColors,
      keywords: [],
      set: "",
    });

    setActiveTab("build");
    showToast(
      `${preconDeck.name} loaded! Gallery filtered to ${deckRamColors.join(" + ")} cards only.`,
      "success",
    );
  };

  // TOAST HELPER
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // IMPORT DECK
  const handleImportDeck = (importedDeck) => {
    setDeck(importedDeck);
    showToast(
      `Deck imported: ${importedDeck.legends.length} Legends, ${importedDeck.mainDeck.length} cards`,
      "success",
    );
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
                onCloseFilters={() => setFiltersOpen(false)}
              />

              <FilterPanel
                cards={cards}
                filters={filters}
                onFilterChange={setFilters}
                isOpen={filtersOpen}
              />

              {/* Card Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-0">
                {currentCards.map((card) => (
                  <div
                    key={card.id}
                    className="card-container hover:border-term-green transition-all duration-300 cursor-pointer group"
                    onClick={() => setPreviewCard(card)}
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

                    {/* Preview Indicator */}
                    <div className="mt-3 text-center">
                      <span className="text-term-green text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        [CLICK TO PREVIEW]
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-4">
                  <button
                    onClick={() => {
                      setCurrentPage((prev) => Math.max(prev - 1, 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
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
                    onClick={() => {
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
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
              <div className="lg:sticky lg:top-8 space-y-6">
                <DeckArea
                  deck={deck}
                  onRemoveCard={handleRemoveCard}
                  onClearDeck={handleClearDeck}
                  onShareDeck={handleShareDeck}
                />

                {/* SAVE + IMPORT + EXPORT BUTTONS */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setShowSaveModal(true)}
                    disabled={
                      deck.mainDeck.length === 0 && deck.legends.length === 0
                    }
                    className="bg-term-green text-term-black px-3 py-3 rounded font-mono font-bold text-sm hover:bg-green-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    [SAVE]
                  </button>

                  <button
                    onClick={() => setShowImportModal(true)}
                    className="bg-term-blue text-term-black px-3 py-3 rounded font-mono font-bold text-sm hover:bg-blue-400 transition-colors"
                  >
                    [IMPORT]
                  </button>

                  <button
                    onClick={() => {
                      setExportDeckName("My Deck");
                      setShowExportModal(true);
                    }}
                    disabled={deck.mainDeck.length === 0}
                    className="bg-term-amber text-term-black px-3 py-3 rounded font-mono font-bold text-sm hover:bg-yellow-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    [EXPORT]
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
          onDuplicateDeck={handleDuplicateDeck}
          onRenameDeck={handleRenameDeck}
          onExportAll={handleExportAllDecks}
          onImportAll={handleImportAllDecks}
        />
      )}

      {/* PRECON DECKS TAB */}
      {activeTab === "precon" && (
        <PreconDecksView onLoadPrecon={handleLoadPrecon} />
      )}

      {/* MODALS */}
      {showSaveModal && (
        <SaveDeckModal
          deck={deck}
          onSave={handleSaveDeck}
          onClose={() => setShowSaveModal(false)}
        />
      )}

      {showExportModal && (
        <ExportModal
          deck={deck}
          deckName={exportDeckName}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
        />
      )}

      {previewCard && (
        <CardPreviewModal
          card={previewCard}
          onClose={() => setPreviewCard(null)}
          onAddToDeck={handleAddToDeck}
        />
      )}

      {showImportModal && (
        <ImportDeckModal
          allCards={cards}
          onImport={handleImportDeck}
          onClose={() => setShowImportModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-term-amber/40 text-sm font-mono space-y-2">
        <div className="text-xs">
          <span className="text-term-green/60">SHORTCUTS:</span>{" "}
          <kbd className="px-2 py-1 bg-term-gray border border-term-amber/20 rounded text-term-amber/60">
            Ctrl+S
          </kbd>{" "}
          Save{" "}
          <kbd className="px-2 py-1 bg-term-gray border border-term-amber/20 rounded text-term-amber/60">
            Ctrl+F
          </kbd>{" "}
          Search{" "}
          <kbd className="px-2 py-1 bg-term-gray border border-term-amber/20 rounded text-term-amber/60">
            Ctrl+E
          </kbd>{" "}
          Export{" "}
          <kbd className="px-2 py-1 bg-term-gray border border-term-amber/20 rounded text-term-amber/60">
            ESC
          </kbd>{" "}
          Close
        </div>
        <div>// NAMELESS_V4MP</div>
      </footer>
    </div>
  );
}

export default App;
