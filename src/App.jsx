import { useAuth } from "./contexts/AuthContext";
import LoginModal from "./components/LoginModal";
import * as deckService from "./lib/deckService";
import { useState, useEffect } from "react";
import cardsData from "./data/cards.json";
import preconDecks from "./data/preconDecks.json";
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
import MulliganSimulator from "./components/MulliganSimulator";
import PackOpener from "./components/PackOpener";
import MigrationModal from "./components/MigrationModal";
import * as migrationHelper from "./lib/migrationHelper";
import * as collectionService from "./lib/collectionService";
import CollectionView from "./components/CollectionView";
import FeedbackModal from "./components/FeedbackModal";
import * as feedbackService from "./lib/feedbackService";
import SmartCardImage from "./components/SmartCardImage";
import LandingPage from "./components/LandingPage";
import LegalDisclaimer from "./components/LegalDisclaimer";
import ProxyModal from "./components/ProxyModal";
import AnalyticsModal from "./components/AnalyticsModal";
import AdminFeedbackViewer from "./components/AdminFeedbackViewer";
import { useIsAdmin } from "./hooks/useIsAdmin";
import SimulatorBeta from "./components/SimulatorBeta";
import { useFeatureFlag } from "./hooks/useFeatureFlag";

const isNewCard = (card, days = 7) => {
  if (!card.date_added) return false;
  const addedDate = new Date(card.date_added);
  const today = new Date();
  const diffTime = today.getTime() - addedDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= days && diffDays >= 0;
};

// DECK ENCODING/DECODING UTILITIES
const encodeDeck = (deck) => {
  try {
    const deckData = {
      legends: deck.legends.map((c) => c.id),
      mainDeck: deck.mainDeck.map((c) => c.id),
      sideboard: deck.sideboard.map((c) => c.id),
    };
    const jsonString = JSON.stringify(deckData);
    return btoa(jsonString);
  } catch (error) {
    console.error("Error encoding deck:", error);
    return null;
  }
};

const decodeDeck = (encodedString, allCards) => {
  try {
    const jsonString = atob(encodedString);
    const deckData = JSON.parse(jsonString);

    const legends = deckData.legends
      .map((id) => allCards.find((c) => c.id === id))
      .filter(Boolean);

    const mainDeck = deckData.mainDeck
      .map((id) => allCards.find((c) => c.id === id))
      .filter(Boolean);

    const sideboard = (deckData.sideboard || [])
      .map((id) => allCards.find((c) => c.id === id))
      .filter(Boolean);

    return { legends, mainDeck, sideboard };
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
    showOnlyNew: false,
  });

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [deck, setDeck] = useState({
    legends: [],
    mainDeck: [],
    sideboard: [],
  });

  const [activeTab, setActiveTab] = useState("build");
  const { isEnabled: canAccessSimulator } = useFeatureFlag("phase9_simulator");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedDecks, setSavedDecks] = useState([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const cardsPerPage = 18;
  const [previewCard, setPreviewCard] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [localDeckCount, setLocalDeckCount] = useState(0);
  const { user, signOut } = useAuth();
  const [showProxyModal, setShowProxyModal] = useState(false);
  const [collection, setCollection] = useState([]);
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  // ─── WISHLIST STATE ───────────────────────────────────────────────────────────
  const [wishlistIds, setWishlistIds] = useState(new Set());
  // ─────────────────────────────────────────────────────────────────────────────
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [showAdminFeedback, setShowAdminFeedback] = useState(false);
  const [freeBuildMode, setFreeBuildMode] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCards(cardsData);
      setLoading(false);
    }, 500);
  }, []);

  // AUTO-LOAD DECK FROM URL
  useEffect(() => {
    if (cards.length === 0) return;

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

        window.history.replaceState({}, "", window.location.pathname);
      } else {
        showToast("Invalid deck URL", "error");
      }
    }
  }, [cards]);

  // Load decks from Supabase when user logs in
  useEffect(() => {
    const loadUserDecks = async () => {
      if (!user || cards.length === 0) return;

      setIsLoadingDecks(true);
      try {
        const supabaseDecks = await deckService.loadDecks(user.id);

        const appDecks = supabaseDecks.map((sd) => ({
          id: sd.id,
          name: sd.name,
          notes: sd.notes || "",
          deck: deckService.supabaseToDeck(sd, cards),
          createdAt: sd.created_at,
          updatedAt: sd.updated_at,
        }));

        setSavedDecks(appDecks);
      } catch (error) {
        console.error("Error loading decks:", error);
        showToast("Error loading decks from cloud", "error");
      } finally {
        setIsLoadingDecks(false);
      }
    };

    loadUserDecks();
  }, [user, cards]);

  // Load user's collection
  useEffect(() => {
    const loadUserCollection = async () => {
      if (!user) {
        setCollection([]);
        return;
      }

      try {
        const userCollection = await collectionService.loadCollection(user.id);
        setCollection(userCollection);
      } catch (error) {
        console.error("Error loading collection:", error);
      }
    };

    loadUserCollection();
  }, [user]);

  // ─── LOAD WISHLIST IDS ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }
    import("./lib/wishlistService").then(({ getWishlist }) => {
      getWishlist("created_at", false)
        .then((items) => setWishlistIds(new Set(items.map((i) => i.card_id))))
        .catch(() => setWishlistIds(new Set()));
    });
  }, [user]);
  // ─────────────────────────────────────────────────────────────────────────────

  // Route to HOME for first-time users
  useEffect(() => {
    const hasVisited = localStorage.getItem("afterlife_hasVisited");

    if (!hasVisited) {
      setActiveTab("home");
      localStorage.setItem("afterlife_hasVisited", "true");
    } else if (!activeTab) {
      setActiveTab("build");
    }
  }, []);

  // Check for local decks migration on first login
  useEffect(() => {
    if (!user || cards.length === 0) return;

    if (migrationHelper.hasLocalDecks()) {
      const localDecksJSON = localStorage.getItem("cyberpunk_decks");
      const localDecks = JSON.parse(localDecksJSON);
      setLocalDeckCount(localDecks.length);
      setShowMigrationModal(true);
    }
  }, [user, cards]);

  // KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && e.key === "s") {
        e.preventDefault();
        if (deck.mainDeck.length > 0 || deck.legends.length > 0) {
          setShowSaveModal(true);
        }
      }

      if (isCtrlOrCmd && e.key === "f") {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }

      if (e.key === "Escape") {
        setShowSaveModal(false);
        setShowExportModal(false);
        setShowImportModal(false);
        setPreviewCard(null);
        setFiltersOpen(false);
        setConfirmModal(null);
      }

      if (isCtrlOrCmd && e.key === "e") {
        e.preventDefault();
        if (deck.mainDeck.length > 0) {
          setExportDeckName("My Deck");
          setShowExportModal(true);
        }
      }

      if (isCtrlOrCmd && e.key === "b") {
        e.preventDefault();
        setShowFeedbackModal(true);
      }

      if (e.ctrlKey && e.shiftKey && e.key === "F") {
        e.preventDefault();
        if (isAdmin) {
          setShowAdminFeedback(true);
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
    showFeedbackModal,
  ]);

  const filteredCards = cards.filter((card) => {
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

    if (filters.types && filters.types.length > 0) {
      if (!filters.types.includes(card.type)) return false;
    }

    if (filters.factions && filters.factions.length > 0) {
      if (!filters.factions.includes(card.faction)) return false;
    }

    if (filters.set && card.set !== filters.set) return false;

    if (filters.keywords && filters.keywords.length > 0) {
      const cardKeywords = card.keywords || [];
      const hasAllKeywords = filters.keywords.every((keyword) =>
        cardKeywords.includes(keyword),
      );
      if (!hasAllKeywords) return false;
    }

    if (card.cost !== undefined) {
      if (card.cost < filters.costMin || card.cost > filters.costMax)
        return false;
    }

    if (card.power !== undefined) {
      if (card.power < filters.powerMin || card.power > filters.powerMax)
        return false;
    }

    if (card.ram !== undefined && card.ram !== null) {
      if (card.ram < filters.ramMin || card.ram > filters.ramMax) return false;
    }

    if (filters.ramColors && filters.ramColors.length > 0) {
      if (!filters.ramColors.includes(card.ram_color)) return false;
    }

    if (showOwnedOnly && user) {
      if (!collectionService.ownsCard(collection, card.id)) {
        return false;
      }
    }

    if (filters.showOnlyNew && !isNewCard(card)) {
      return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

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

      if (
        !freeBuildMode &&
        card.ram_color &&
        ramBudget[card.ram_color] < card.ram
      ) {
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

  const handleAddToSideboard = (card, quantity = 1) => {
    if (deck.sideboard.length >= 15) {
      showToast("Sideboard is full (max 15 cards)", "warning");
      return;
    }

    const currentCount = deck.sideboard.filter(
      (c) => c.name === card.name,
    ).length;
    const canAdd = Math.min(quantity, 3 - currentCount);

    if (canAdd === 0) {
      showToast(`Maximum 3 copies of ${card.name} allowed`, "warning");
      return;
    }

    if (deck.sideboard.length + canAdd > 15) {
      showToast(
        `Only ${15 - deck.sideboard.length} slots left in sideboard`,
        "warning",
      );
      return;
    }

    setDeck((prev) => {
      const newSideboard = [...prev.sideboard];
      for (let i = 0; i < canAdd; i++) {
        newSideboard.push(card);
      }
      return { ...prev, sideboard: newSideboard };
    });

    showToast(`Added ${canAdd}x ${card.name} to sideboard`, "success");
  };

  const handleRemoveCard = (card, from) => {
    if (from === "legends") {
      setDeck((prev) => ({
        ...prev,
        legends: prev.legends.filter((c) => c.id !== card.id),
      }));
    } else if (from === "sideboard") {
      setDeck((prev) => {
        const index = prev.sideboard.findIndex((c) => c.id === card.id);
        const newSideboard = [...prev.sideboard];
        newSideboard.splice(index, 1);
        return { ...prev, sideboard: newSideboard };
      });
    } else {
      setDeck((prev) => {
        const index = prev.mainDeck.findIndex((c) => c.id === card.id);
        const newDeck = [...prev.mainDeck];
        newDeck.splice(index, 1);
        return { ...prev, mainDeck: newDeck };
      });
    }
  };

  const handleClearDeck = () => {
    setDeck({
      legends: [],
      mainDeck: [],
      sideboard: [],
    });

    setFilters({
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

    setFiltersOpen(false);
  };

  const handleSaveDeck = async (deckName, deckNotes = "") => {
    if (user) {
      try {
        const savedDeck = await deckService.saveDeck(
          user.id,
          deckName,
          deck,
          deckNotes,
        );

        const appDeck = {
          id: savedDeck.id,
          name: savedDeck.name,
          notes: savedDeck.notes || "",
          deck: deckService.supabaseToDeck(savedDeck, cards),
          createdAt: savedDeck.created_at,
          updatedAt: savedDeck.updated_at,
        };

        setSavedDecks([appDeck, ...savedDecks]);
        setShowSaveModal(false);
        showToast(`Deck "${deckName}" saved to cloud!`, "success");
      } catch (error) {
        console.error("Error saving deck:", error);
        showToast("Error saving deck to cloud", "error");
      }
    } else {
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
      showToast(`Deck "${deckName}" saved locally!`, "warning");
    }
  };

  const handleLoadDeck = (savedDeck) => {
    setDeck(savedDeck.deck);
    setActiveTab("build");
    showToast(`Deck "${savedDeck.name}" loaded!`, "success");
  };

  const handleDeleteDeck = (deckId) => {
    const deckToDelete = savedDecks.find((d) => d.id === deckId);

    setConfirmModal({
      title: "DELETE DECK",
      message: `Are you sure you want to delete "${deckToDelete?.name}"? This cannot be undone.`,
      onConfirm: async () => {
        try {
          if (user) {
            await deckService.deleteDeck(deckId);
          }

          const updated = savedDecks.filter((d) => d.id !== deckId);
          setSavedDecks(updated);

          if (!user) {
            localStorage.setItem("cyberpunk_decks", JSON.stringify(updated));
          }

          showToast("Deck deleted", "success");
          setConfirmModal(null);
        } catch (error) {
          console.error("Error deleting deck:", error);
          showToast("Error deleting deck", "error");
          setConfirmModal(null);
        }
      },
      onCancel: () => setConfirmModal(null),
    });
  };

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
        prompt("Copy this URL:", shareUrl);
      });
  };

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

  const handleDuplicateDeck = async (deckId) => {
    const deckToDuplicate = savedDecks.find((d) => d.id === deckId);

    if (!deckToDuplicate) return;

    if (user) {
      try {
        const duplicatedDeck = await deckService.duplicateDeck(
          user.id,
          deckId,
          cards,
        );

        const appDeck = {
          id: duplicatedDeck.id,
          name: duplicatedDeck.name,
          notes: duplicatedDeck.notes || "",
          deck: deckService.supabaseToDeck(duplicatedDeck, cards),
          createdAt: duplicatedDeck.created_at,
          updatedAt: duplicatedDeck.updated_at,
        };

        setSavedDecks([appDeck, ...savedDecks]);
        showToast(`Deck "${appDeck.name}" created!`, "success");
      } catch (error) {
        console.error("Error duplicating deck:", error);
        showToast("Error duplicating deck", "error");
      }
    } else {
      const duplicatedDeck = {
        id: Date.now().toString(),
        name: `${deckToDuplicate.name} (Copy)`,
        notes: deckToDuplicate.notes || "",
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
    }
  };

  const handleRenameDeck = async (deckId) => {
    const deckToRename = savedDecks.find((d) => d.id === deckId);

    if (!deckToRename) return;

    const newName = prompt("Enter new deck name:", deckToRename.name);

    if (!newName || newName.trim() === "") {
      showToast("Deck name cannot be empty", "warning");
      return;
    }

    if (newName === deckToRename.name) {
      return;
    }

    if (user) {
      try {
        await deckService.updateDeck(
          deckId,
          newName.trim(),
          deckToRename.deck,
          deckToRename.notes,
        );

        const updated = savedDecks.map((d) =>
          d.id === deckId
            ? {
                ...d,
                name: newName.trim(),
                updatedAt: new Date().toISOString(),
              }
            : d,
        );

        setSavedDecks(updated);
        showToast(`Deck renamed to "${newName.trim()}"`, "success");
      } catch (error) {
        console.error("Error renaming deck:", error);
        showToast("Error renaming deck", "error");
      }
    } else {
      const updated = savedDecks.map((d) =>
        d.id === deckId
          ? { ...d, name: newName.trim(), updatedAt: new Date().toISOString() }
          : d,
      );

      setSavedDecks(updated);
      localStorage.setItem("cyberpunk_decks", JSON.stringify(updated));
      showToast(`Deck renamed to "${newName.trim()}"`, "success");
    }
  };

  const handleMigration = async () => {
    if (!user) return;

    setShowMigrationModal(false);
    showToast("Migrating decks to cloud...", "success");

    try {
      const results = await migrationHelper.migrateLocalDecksToSupabase(
        user.id,
        cards,
      );

      if (results.migrated > 0) {
        const supabaseDecks = await deckService.loadDecks(user.id);
        const appDecks = supabaseDecks.map((sd) => ({
          id: sd.id,
          name: sd.name,
          notes: sd.notes || "",
          deck: deckService.supabaseToDeck(sd, cards),
          createdAt: sd.created_at,
          updatedAt: sd.updated_at,
        }));
        setSavedDecks(appDecks);

        showToast(
          `Successfully migrated ${results.migrated} deck${results.migrated !== 1 ? "s" : ""} to cloud!`,
          "success",
        );
      }

      if (results.failed > 0) {
        showToast(
          `Failed to migrate ${results.failed} deck${results.failed !== 1 ? "s" : ""}`,
          "error",
        );
      }
    } catch (error) {
      console.error("Migration error:", error);
      showToast("Migration failed. Please try again.", "error");
    }
  };

  const handleAddToCollection = async (cardId, quantity = 1) => {
    if (!user) {
      showToast("Login required to track collection", "warning");
      return;
    }

    try {
      await collectionService.addToCollection(user.id, cardId, quantity, false);

      const updated = await collectionService.loadCollection(user.id);
      setCollection(updated);

      const newQty = collectionService.getCardQuantity(updated, cardId);
      showToast(`Added to collection (now own ${newQty})`, "success");
    } catch (error) {
      console.error("Error adding to collection:", error);
      showToast("Error updating collection", "error");
    }
  };

  const handleRemoveFromCollection = async (cardId, quantity = 1) => {
    if (!user) return;

    try {
      await collectionService.removeFromCollection(
        user.id,
        cardId,
        quantity,
        false,
      );

      const updated = await collectionService.loadCollection(user.id);
      setCollection(updated);

      showToast("Removed from collection", "success");
    } catch (error) {
      console.error("Error removing from collection:", error);
      showToast("Error updating collection", "error");
    }
  };

  // ─── WISHLIST TOGGLE ──────────────────────────────────────────────────────────
  const handleToggleWishlist = async (cardId) => {
    if (!user) {
      showToast("Login required to use wishlist", "warning");
      return;
    }
    const { addToWishlist, removeFromWishlist } = await import(
      "./lib/wishlistService"
    );
    const isIn = wishlistIds.has(cardId);
    try {
      if (isIn) {
        await removeFromWishlist(cardId);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(cardId);
          return next;
        });
        showToast("Removed from wishlist", "success");
      } else {
        await addToWishlist(cardId, 1, "medium", "");
        setWishlistIds((prev) => new Set([...prev, cardId]));
        showToast("Added to wishlist ★", "success");
      }
    } catch (err) {
      console.error("Wishlist error:", err);
      showToast("Error updating wishlist", "error");
    }
  };
  // ─────────────────────────────────────────────────────────────────────────────

  const handleSkipMigration = () => {
    setShowMigrationModal(false);
    showToast("Keeping decks local. You can migrate later.", "warning");
  };

  const handleSubmitFeedback = async (category, message) => {
    setIsSubmittingFeedback(true);

    try {
      const userId = user ? user.id : "anonymous";
      const metadata = feedbackService.getSystemMetadata();

      const result = await feedbackService.submitFeedback(
        userId,
        category,
        message,
        metadata,
      );

      if (result.success) {
        showToast("Feedback sent successfully! Thanks, Netrunner", "success");
        setIsSubmittingFeedback(false);
        return true;
      } else {
        showToast(`Error: ${result.error}`, "error");
        setIsSubmittingFeedback(false);
        return false;
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
      showToast("Error sending feedback. Please try again.", "error");
      setIsSubmittingFeedback(false);
      return false;
    }
  };

  const handleLoadPrecon = (preconDeck) => {
    const legends = [];
    const mainDeck = [];

    preconDeck.legends.forEach((legendData) => {
      const card = cards.find((c) => c.id === legendData.id);
      if (card) legends.push(card);
      else console.warn(`Legend not found: ${legendData.id}`);
    });

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
      } else {
        console.warn(`Card not found: ${cardName}`);
      }
    });

    setDeck({ legends, mainDeck, sideboard: [] });

    const deckRamColors = [
      ...new Set(legends.map((c) => c.ram_color).filter(Boolean)),
    ];

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

    setFiltersOpen(false);
    setActiveTab("build");

    showToast(
      `${preconDeck.name} loaded! Gallery auto-filtered to ${deckRamColors.join(" + ")} RAM colors.`,
      "success",
    );
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

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
    <div className="min-h-screen bg-term-black text-term-green relative">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <header className="mb-8 border-b border-term-amber/20 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div>
                <h1 className="text-4xl font-bold text-term-amber mb-2 font-mono">
                  AFTERLIFE DECKS // DECK_BUILDER.EXE
                </h1>
                <p className="text-xs text-term-amber/50 font-mono tracking-wider -mt-1">
                  [UNOFFICIAL FAN PROJECT - NOT AFFILIATED WITH CDPR OR WEIRDCO]
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-term-green font-mono">
                  [{filteredCards.length} / {cards.length} CARDS] // [ALPHA/BETA
                  KIT 2026]
                </p>
                {user && collection.length > 0 && (
                  <p className="text-term-amber/80 font-mono text-sm">
                    📦 COLLECTION: {collection.length} unique cards
                    {(() => {
                      const stats = collectionService.getCollectionStats(
                        collection,
                        cards,
                      );
                      return ` (${stats.completionPercent}% complete)`;
                    })()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  {user.discord_avatar && (
                    <img
                      src={user.discord_avatar}
                      alt="Discord Avatar"
                      className="w-10 h-10 rounded-full border-2 border-term-amber"
                    />
                  )}

                  <div className="text-right">
                    <p className="text-term-amber font-mono text-sm font-bold">
                      {user.discord_username || user.email?.split("@")[0]}
                    </p>
                    <p className="text-term-green/60 font-mono text-xs">
                      {savedDecks.length} saved decks
                    </p>
                  </div>

                  <button
                    onClick={signOut}
                    className="px-4 py-2 bg-term-red/20 text-term-red border border-term-red rounded font-mono hover:bg-term-red/30 transition-colors"
                  >
                    [LOGOUT]
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 bg-term-green/20 text-term-green border border-term-green rounded font-mono hover:bg-term-green/30 transition-colors"
                >
                  [LOGIN]
                </button>
              )}
            </div>
          </div>
        </header>

        <main id="main-content" role="main">
          <DeckTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* HOME */}
          {activeTab === "home" && (
            <div key="home-tab">
              <LandingPage
                user={user}
                collection={collection}
                allCards={cards}
                savedDecks={savedDecks}
                onNavigate={setActiveTab}
              />
            </div>
          )}

          {/* BUILD */}
          {activeTab === "build" && (
            <div key="build-tab">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: Card Browser */}
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
                    showOwnedOnly={showOwnedOnly}
                    onToggleOwnedOnly={setShowOwnedOnly}
                    collectionCount={collection.length}
                    isLoggedIn={!!user}
                  />

                  {/* Card Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-0">
                    {currentCards.map((card) => (
                      <div
                        key={card.id}
                        className="deck-card-container hover:border-term-green transition-all duration-300 cursor-pointer group"
                        onClick={() => setPreviewCard(card)}
                      >
                        <div className="relative overflow-hidden rounded mb-3 bg-term-gray-light">
                          <SmartCardImage
                            card={card}
                            className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                            showLoadingState={true}
                          />

                          {/* Owned Badge */}
                          {user &&
                            collectionService.ownsCard(collection, card.id) && (
                              <div className="absolute top-2 left-2 bg-term-green text-term-black font-mono font-bold text-xs px-2 py-1 rounded flex items-center gap-1">
                                ✓ x
                                {collectionService.getCardQuantity(
                                  collection,
                                  card.id,
                                )}
                              </div>
                            )}

                          {/* NEW Badge */}
                          {isNewCard(card) && (
                            <div className="absolute top-2 right-2 bg-term-green text-term-black font-mono font-bold text-xs px-2 py-1 rounded animate-pulse flex items-center gap-1">
                              NEW
                            </div>
                          )}

                          {/* RAM Color Dot */}
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

                          {/* ─── WISHLIST STAR en Build Grid ─────────────────── */}
                          {user && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleWishlist(card.id);
                              }}
                              className={`absolute bottom-2 right-2 text-base leading-none transition-all select-none ${
                                wishlistIds.has(card.id)
                                  ? "opacity-100 text-term-amber drop-shadow-[0_0_6px_#ffb300]"
                                  : "opacity-0 group-hover:opacity-60 text-term-amber"
                              }`}
                              title={
                                wishlistIds.has(card.id)
                                  ? "Quitar de wishlist"
                                  : "Agregar a wishlist"
                              }
                            >
                              {wishlistIds.has(card.id) ? "★" : "☆"}
                            </button>
                          )}
                          {/* ──────────────────────────────────────────────────── */}
                        </div>

                        <h3 className="text-term-green font-bold font-mono text-lg">
                          {card.name}
                        </h3>

                        {card.subtitle && (
                          <p className="text-term-amber/60 text-sm font-mono mb-2">
                            {card.subtitle}
                          </p>
                        )}

                        <div className="flex gap-3 text-xs font-mono mb-2">
                          {card.cost !== undefined && (
                            <span className="text-term-blue">
                              COST: {card.cost}
                            </span>
                          )}
                          {card.power !== undefined && (
                            <span className="text-term-red">
                              PWR: {card.power}
                            </span>
                          )}
                          <span className="text-term-green">
                            RAM: {card.ram}
                          </span>
                        </div>

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

                        <div className="mt-3 text-center">
                          <span className="text-term-green text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                            [CLICK TO PREVIEW]
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
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
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          );
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

                {/* RIGHT: Deck Area */}
                <div className="lg:col-span-1">
                  <div className="lg:sticky lg:top-8 space-y-6">
                    <DeckArea
                      deck={deck}
                      onRemoveCard={handleRemoveCard}
                      onClearDeck={handleClearDeck}
                      onShareDeck={handleShareDeck}
                      allCards={cards}
                      showAnalytics={showAnalytics}
                      onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
                      onGenerateProxies={() => setShowProxyModal(true)}
                      onAddToDeck={handleAddToDeck}
                      onAddToSideboard={handleAddToSideboard}
                      freeBuildMode={freeBuildMode}
                      onToggleFreeBuild={() => setFreeBuildMode(!freeBuildMode)}
                    />

                    {showProxyModal && (
                      <ProxyModal
                        deck={deck}
                        onClose={() => setShowProxyModal(false)}
                      />
                    )}

                    {showAnalytics && (
                      <AnalyticsModal
                        deck={deck}
                        onClose={() => setShowAnalytics(false)}
                      />
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setShowSaveModal(true)}
                        disabled={
                          deck.mainDeck.length === 0 &&
                          deck.legends.length === 0
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
            </div>
          )}

          {activeTab === "mydecks" && (
            <div key="mydecks-tab">
              <MyDecksView
                savedDecks={savedDecks}
                onLoadDeck={handleLoadDeck}
                onDeleteDeck={handleDeleteDeck}
                onDuplicateDeck={handleDuplicateDeck}
                onRenameDeck={handleRenameDeck}
                onExportAll={handleExportAllDecks}
                onImportAll={handleImportAllDecks}
              />
            </div>
          )}

          {activeTab === "precon" && cards && cards.length > 0 && (
            <PreconDecksView onLoadPrecon={handleLoadPrecon} allCards={cards} />
          )}

          {activeTab === "practice" && (
            <div key="practice-tab">
              <MulliganSimulator deck={deck} allCards={cards} />
            </div>
          )}

          {activeTab === "packs" && (
            <div key="packs-tab">
              <PackOpener allCards={cards} />
            </div>
          )}

          {/* ─── COLLECTION TAB — now with wishlist props ─── */}
          {activeTab === "collection" && (
            <div key="collection-tab">
              <CollectionView
                collection={collection}
                allCards={cards}
                onAddToCollection={handleAddToCollection}
                onRemoveFromCollection={handleRemoveFromCollection}
                onViewCard={(card) => setPreviewCard(card)}
                wishlistIds={wishlistIds}
                onToggleWishlist={user ? handleToggleWishlist : null}
                isLoggedIn={!!user}
              />
            </div>
          )}

          {activeTab === "simulator" && (
            <div key="simulator-tab">
              <SimulatorBeta currentDeck={deck} />
            </div>
          )}

          {activeTab === "legal" && (
            <div key="legal-tab">
              <LegalDisclaimer />
            </div>
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
              duration={4000}
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

          {/* ─── CARD PREVIEW MODAL — con wishlist callback ─── */}
          {previewCard && (
            <CardPreviewModal
              card={previewCard}
              onClose={() => setPreviewCard(null)}
              onAddToDeck={handleAddToDeck}
              onAddToSideboard={handleAddToSideboard}
              onAddToCollection={handleAddToCollection}
              onRemoveFromCollection={handleRemoveFromCollection}
              ownedQuantity={collectionService.getCardQuantity(
                collection,
                previewCard.id,
              )}
              isLoggedIn={!!user}
              allFilteredCards={filteredCards}
              currentIndex={filteredCards.findIndex(
                (c) => c.id === previewCard.id,
              )}
              onNavigate={(direction) => {
                const currentIdx = filteredCards.findIndex(
                  (c) => c.id === previewCard.id,
                );
                if (direction === "prev" && currentIdx > 0) {
                  setPreviewCard(filteredCards[currentIdx - 1]);
                } else if (
                  direction === "next" &&
                  currentIdx < filteredCards.length - 1
                ) {
                  setPreviewCard(filteredCards[currentIdx + 1]);
                }
              }}
              onWishlistChange={(cardId, added) => {
                setWishlistIds((prev) => {
                  const next = new Set(prev);
                  added ? next.add(cardId) : next.delete(cardId);
                  return next;
                });
              }}
            />
          )}

          {showImportModal && (
            <ImportDeckModal
              allCards={cards}
              onImport={handleImportDeck}
              onClose={() => setShowImportModal(false)}
            />
          )}

          {showMigrationModal && (
            <MigrationModal
              localDeckCount={localDeckCount}
              onMigrate={handleMigration}
              onSkip={handleSkipMigration}
              onClose={handleSkipMigration}
            />
          )}

          {showLoginModal && (
            <LoginModal onClose={() => setShowLoginModal(false)} />
          )}

          {showFeedbackModal && (
            <FeedbackModal
              onClose={() => setShowFeedbackModal(false)}
              onSubmit={handleSubmitFeedback}
              isSubmitting={isSubmittingFeedback}
            />
          )}

          {showAdminFeedback && isAdmin && user && (
            <AdminFeedbackViewer
              onClose={() => setShowAdminFeedback(false)}
              user={user}
              showToast={showToast}
            />
          )}
        </main>

        <footer className="mt-12 border-t border-term-amber/20 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center md:text-left">
              <h4 className="text-term-green font-mono font-bold text-sm mb-3">
                KEYBOARD SHORTCUTS
              </h4>
              <div className="text-xs space-y-1 text-term-amber/60 font-mono">
                <div>
                  <kbd className="px-2 py-1 bg-term-gray border border-term-amber/20 rounded">
                    Ctrl+S
                  </kbd>{" "}
                  Save Deck
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-term-gray border border-term-amber/20 rounded">
                    Ctrl+F
                  </kbd>{" "}
                  Search
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-term-gray border border-term-amber/20 rounded">
                    Ctrl+E
                  </kbd>{" "}
                  Export
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-term-gray border border-term-amber/20 rounded">
                    Ctrl+B
                  </kbd>{" "}
                  Feedback
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-term-gray border border-term-amber/20 rounded">
                    ESC
                  </kbd>{" "}
                  Close Modals
                </div>
              </div>
            </div>

            <div className="text-center">
              <h4 className="text-term-green font-mono font-bold text-sm mb-3">
                SUPPORT & FEEDBACK
              </h4>
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="bg-term-amber/20 border border-term-amber text-term-amber px-6 py-2 rounded font-mono font-bold hover:bg-term-amber/30 transition-colors text-sm"
              >
                [SEND FEEDBACK]
              </button>
              <p className="text-term-green/60 text-xs font-mono mt-3">
                Report bugs, request features, or share feedback
              </p>
            </div>

            <div className="text-center md:text-right">
              <h4 className="text-term-green font-mono font-bold text-sm mb-3">
                CREDITS & LEGAL
              </h4>
              <div className="text-term-amber/60 text-xs font-mono space-y-1">
                <div>Built by // V4MP</div>
                <div className="text-term-red/60 text-xs">
                  Unofficial fan project
                </div>
                <div className="text-term-red/60 text-xs">
                  Not affiliated with CDPR or WeirdCo
                </div>

                <div className="flex flex-col items-center md:items-end gap-1 mt-2">
                  <button
                    onClick={() => setActiveTab("legal")}
                    className="text-term-blue hover:text-blue-400 transition-colors font-mono text-xs text-right"
                  >
                    [Legal & Disclaimer]
                  </button>
                </div>

                {isAdmin && !adminLoading && (
                  <button
                    onClick={() => setShowAdminFeedback(true)}
                    className="text-term-red hover:text-red-400 transition-colors font-mono text-xs"
                  >
                    [ADMIN PANEL]
                  </button>
                )}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
