import { useAuth } from "./contexts/AuthContext";
import LoginModal from "./components/LoginModal";
import UserProfileModal from "./components/UserProfileModal";
import * as deckService from "./lib/deckService";
import { useState, useEffect } from "react";
import { useDeckBuilder } from "./hooks/useDeckBuilder";
import { useFilters } from "./hooks/useFilters";
import { useSavedDecks } from "./hooks/useSavedDecks";
import { useCollection } from "./hooks/useCollection";
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
import DraftSimulator from "./components/DraftSimulator";
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
import BlackMarketView from "./components/BlackMarketView";
import DeckImageExport from "./components/DeckImageExport";
import CyberspaceLoader from "./components/CyberspaceLoader";
import CyberspaceParticles from "./components/CyberspaceParticles";
import { AnimatePresence, motion } from "framer-motion";
import PublicDeckView from "./components/PublicDeckView";
import * as communityService from "./lib/communityService";
import PublishDeckModal from "./components/PublishDeckModal";

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
  const [shareUrl, setShareUrl] = useState("");
  const [showShareImageModal, setShowShareImageModal] = useState(false);
  const [blackMarketKey, setBlackMarketKey] = useState(0);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [deckToPublish, setDeckToPublish] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDeckName, setExportDeckName] = useState("");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("build");
  const { isEnabled: canAccessSimulator } = useFeatureFlag("phase9_simulator");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const cardsPerPage = 18;
  const [previewCard, setPreviewCard] = useState(null);
  const [publicDeckId, setPublicDeckId] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [packMode, setPackMode] = useState("open"); // "open" | "draft"
  const [profileAvatarUrl, setProfileAvatarUrl] = useState("");
  const [profileDisplayName, setProfileDisplayName] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [localDeckCount, setLocalDeckCount] = useState(0);
  const { user, signOut } = useAuth();
  const [showProxyModal, setShowProxyModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [showAdminFeedback, setShowAdminFeedback] = useState(false);

  // ── showToast — definido antes del hook para que useDeckBuilder pueda usarlo ──
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // ── COLLECTION HOOK ──────────────────────────────────────────────────────────
  const {
    collection,
    setCollection,
    wishlistIds,
    setWishlistIds,
    handleAddToCollection,
    handleRemoveFromCollection,
    handleToggleWishlist,
  } = useCollection({ user, showToast });
  // ─────────────────────────────────────────────────────────────────────────────

  // ── FILTERS HOOK — debe ir ANTES de useDeckBuilder (provee resetFilters) ─────
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filtersOpen,
    setFiltersOpen,
    currentPage,
    setCurrentPage,
    filteredCards,
    resetFilters,
    INITIAL_FILTERS,
    showOwnedOnly,
    setShowOwnedOnly,
  } = useFilters({ cards, collection, user, isNewCard });
  // ─────────────────────────────────────────────────────────────────────────────

  // ── DECK BUILDER HOOK — usa resetFilters de useFilters ───────────────────────
  const {
    deck,
    setDeck,
    freeBuildMode,
    setFreeBuildMode,
    handleAddToDeck,
    handleAddToSideboard,
    handleRemoveCard,
    handleClearDeck,
    handleLoadPrecon,
    handleImportDeck,
  } = useDeckBuilder({
    cards,
    showToast,
    resetFilters,
    setFilters,
    setFiltersOpen,
    setActiveTab,
  });
  // ─────────────────────────────────────────────────────────────────────────────

  // ── SAVED DECKS HOOK ─────────────────────────────────────────────────────────
  const {
    savedDecks,
    setSavedDecks,
    isLoadingDecks,
    setIsLoadingDecks,
    handleSaveDeck,
    handleLoadDeck,
    handleDeleteDeck,
    handleDuplicateDeck,
    handleRenameDeck,
    handleExportAllDecks,
    handleImportAllDecks,
    handleConfirmPublish: _handleConfirmPublish,
    handleUnpublishDeck,
  } = useSavedDecks({
    user,
    cards,
    deck,
    showToast,
    setDeck,
    setActiveTab,
    setConfirmModal,
  });

  // Abre el modal de publicación — wrapper local
  const handlePublishDeck = (deckId) => {
    if (!user) {
      showToast("Login required to publish", "warning");
      return;
    }
    const d = savedDecks.find((sd) => sd.id === deckId);
    if (!d) return;
    setDeckToPublish(d);
    setShowPublishModal(true);
  };

  // Wrapper: inyecta deckToPublish + setters del estado local
  const handleConfirmPublish = async ({ description, archetype }) => {
    const { moderateText } = await import("./lib/moderationService");
    const modCheck = moderateText(description);
    if (!modCheck.ok) {
      showToast(modCheck.reason, "error");
      return;
    }
    _handleConfirmPublish({
      deckToPublish,
      description,
      archetype,
      setShowPublishModal,
      setDeckToPublish,
    });
  };
  // ─────────────────────────────────────────────────────────────────────────────

  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);

  useEffect(() => {
    setTimeout(() => {
      setCards(cardsData);
      setLoading(false);
    }, 500);
  }, []);

  // AUTO-LOAD DECK FROM URL
  // AUTO-LOAD DECK FROM URL (UUID & Base64)
  useEffect(() => {
    if (cards.length === 0) return;

    const handleUrlLoading = async () => {
      // 1. Intentar cargar por UUID (/deck/:uuid)
      const deckUuidMatch = window.location.pathname.match(
        /\/deck\/([a-f0-9-]{36})/,
      );

      if (deckUuidMatch) {
        const { loadSharedDeck } = await import("./lib/shareService");
        try {
          const shared = await loadSharedDeck(deckUuidMatch[1]);
          if (shared?.deck_data) {
            setDeck(shared.deck_data);
            showToast(
              `Loaded: ${shared.deck_name || "Shared Deck"}`,
              "success",
            );
            window.history.replaceState({}, "", "/");
            return; // Detener aquí si cargó por UUID
          }
        } catch {
          showToast("Shared deck not found", "error");
        }
      }

      // 2. Intentar cargar por Query Param (?d=...)
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
    };

    handleUrlLoading();
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

  // Load user profile (display_name, avatar_url)
  useEffect(() => {
    if (!user) {
      setProfileDisplayName("");
      setProfileAvatarUrl("");
      return;
    }
    const loadProfile = async () => {
      try {
        const { supabase: sb } = await import("./lib/supabase");
        const { data } = await sb
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", user.id)
          .single();
        if (data?.display_name) setProfileDisplayName(data.display_name);
        if (data?.avatar_url) setProfileAvatarUrl(data.avatar_url);
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    loadProfile();
  }, [user]);

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

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const handleShareDeck = async () => {
    if (deck.mainDeck.length === 0 && deck.legends.length === 0) {
      showToast("Deck is empty", "warning");
      return;
    }
    try {
      const { createShareLink } = await import("./lib/shareService");
      const authorName =
        profileDisplayName ||
        user?.discord_username ||
        user?.email?.split("@")[0] ||
        "Runner";
      const deckName =
        deck.legends.length > 0
          ? deck.legends.map((l) => l.name).join(" / ")
          : "My Deck";
      const url = await createShareLink(deck, deckName, authorName);
      setShareUrl(url);
    } catch {
      // Fallback to Base64 URL if Supabase fails
      const encoded = encodeDeck(deck);
      const url = `${window.location.origin}${window.location.pathname}?d=${encoded}`;
      setShareUrl(url);
      showToast("Using legacy share link", "warning");
    }
    setShowShareImageModal(true);
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

  if (loading) {
    return <CyberspaceLoader />;
  }

  return (
    <div className="min-h-screen bg-term-black text-term-green relative">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* ── CYBERSPACE BACKGROUND GLOBAL ── */}
      <CyberspaceParticles className="opacity-100" />

      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
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
        <header className="mb-4 sm:mb-8 border-b border-term-amber/20 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h1 className="text-xl sm:text-4xl font-bold text-term-amber mb-1 font-mono leading-tight">
                    AFTERLIFE DECKS // DECK_BUILDER.EXE
                  </h1>
                  <p className="text-xs text-term-amber/50 font-mono tracking-wider -mt-1">
                    [UNOFFICIAL FAN PROJECT - NOT AFFILIATED WITH CDPR OR
                    WEIRDCO]
                  </p>
                </div>
                {/* Login button — mobile solo, se mueve inline con el título */}
                <div className="sm:hidden flex-shrink-0 mt-1">
                  {user ? (
                    <button
                      onClick={signOut}
                      className="px-2 py-1 bg-term-red/20 text-term-red border border-term-red rounded font-mono text-xs hover:bg-term-red/30 transition-colors"
                    >
                      [OUT]
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="px-2 py-1 bg-term-green/20 text-term-green border border-term-green rounded font-mono text-xs hover:bg-term-green/30 transition-colors"
                    >
                      [LOGIN]
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1 mt-2">
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

            <div className="hidden sm:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="relative group focus:outline-none"
                    title="View profile"
                  >
                    {profileAvatarUrl || user.discord_avatar ? (
                      <img
                        src={profileAvatarUrl || user.discord_avatar}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full border-2 border-term-amber group-hover:border-term-green transition-colors object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border-2 border-term-amber group-hover:border-term-green bg-term-black flex items-center justify-center transition-colors">
                        <span className="text-term-amber font-mono font-bold text-sm">
                          {profileDisplayName ||
                            user.discord_username ||
                            user.email?.split("@")[0].substring(0, 12)}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-term-green border-2 border-term-gray"></div>
                  </button>

                  <div
                    className="text-right cursor-pointer"
                    onClick={() => setShowProfileModal(true)}
                  >
                    <p className="text-term-amber font-mono text-sm font-bold hover:text-term-green transition-colors">
                      {profileDisplayName ||
                        user.discord_username ||
                        user.email?.split("@")[0].substring(0, 12)}
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
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, filter: "blur(4px)", y: 6 }}
              animate={{
                opacity: 1,
                filter: "blur(0px)",
                y: 0,
                transitionEnd: { filter: "none", transform: "none" },
              }}
              exit={{ opacity: 0, filter: "blur(3px)", y: -4 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* HOME */}
              {activeTab === "home" && (
                <div key="home-tab">
                  <LandingPage
                    user={user}
                    collection={collection}
                    allCards={cards}
                    savedDecks={savedDecks}
                    onNavigate={setActiveTab}
                    onLoadPrecon={handleLoadPrecon}
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
                            className="deck-card-container glitch-card hover:border-term-green transition-all duration-300 cursor-pointer group"
                            onClick={() => setPreviewCard(card)}
                          >
                            <div className="relative overflow-hidden rounded mb-3 bg-term-gray-light">
                              <SmartCardImage
                                card={card}
                                className="w-full h-auto transition-transform duration-300 group-hover:scale-105 glitch-img"
                                showLoadingState={true}
                              />

                              {/* Owned Badge */}
                              {user &&
                                collectionService.ownsCard(
                                  collection,
                                  card.id,
                                ) && (
                                  <div className="absolute top-2 left-2 bg-term-green text-term-black font-mono font-bold text-xs px-2 py-1 rounded flex items-center gap-1">
                                    ✓ x
                                    {collectionService.getCardQuantity(
                                      collection,
                                      card.id,
                                    )}
                                  </div>
                                )}

                              {/* Deck Count Badge */}
                              {(() => {
                                const deckCount = [
                                  ...deck.mainDeck,
                                  ...deck.legends,
                                ].filter((c) => c.id === card.id).length;
                                return deckCount > 0 ? (
                                  <div className="absolute bottom-2 left-2 bg-term-blue text-white font-mono font-bold text-xs px-2 py-0.5 rounded">
                                    x{deckCount}
                                  </div>
                                ) : null;
                              })()}

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
                                  className={`absolute bottom-2 right-2 text-xl leading-none transition-all select-none
  rounded px-1 py-0.5
  ${
    wishlistIds.has(card.id)
      ? "opacity-100 text-term-amber drop-shadow-[0_0_8px_#ffb300] bg-black/50"
      : "opacity-0 group-hover:opacity-100 text-term-amber bg-black/40"
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
                              <span className="text-term-amber/80">
                                {card.type}
                              </span>
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
                          onToggleAnalytics={() =>
                            setShowAnalytics(!showAnalytics)
                          }
                          onGenerateProxies={() => setShowProxyModal(true)}
                          onAddToDeck={handleAddToDeck}
                          onAddToSideboard={handleAddToSideboard}
                          freeBuildMode={freeBuildMode}
                          onToggleFreeBuild={() =>
                            setFreeBuildMode(!freeBuildMode)
                          }
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
                    onPublishDeck={user ? handlePublishDeck : null}
                    onUnpublishDeck={user ? handleUnpublishDeck : null}
                  />
                </div>
              )}

              {activeTab === "precon" && cards && cards.length > 0 && (
                <div key="precon-tab">
                  <PreconDecksView
                    onLoadPrecon={handleLoadPrecon}
                    allCards={cards}
                  />
                </div>
              )}

              {activeTab === "practice" && (
                <div key="practice-tab">
                  <MulliganSimulator deck={deck} allCards={cards} />
                </div>
              )}

              {activeTab === "packs" && (
                <div key="packs-tab">
                  {/* Mode toggle */}
                  <div className="flex gap-2 mb-6 border-b border-term-amber/20 pb-4">
                    <button
                      onClick={() => setPackMode("open")}
                      className={`px-5 py-2 font-mono font-bold text-sm rounded transition-colors ${
                        packMode === "open"
                          ? "bg-term-amber text-term-black"
                          : "border border-term-amber/40 text-term-amber/60 hover:text-term-amber"
                      }`}
                    >
                      📦 PACK OPENER
                    </button>
                    <button
                      onClick={() => setPackMode("draft")}
                      className={`px-5 py-2 font-mono font-bold text-sm rounded transition-colors ${
                        packMode === "draft"
                          ? "bg-cyan-500 text-white"
                          : "border border-cyan-500/40 text-cyan-400/60 hover:text-cyan-400"
                      }`}
                    >
                      🃏 DRAFT SIMULATOR
                    </button>
                  </div>
                  {packMode === "open" && <PackOpener allCards={cards} />}
                  {packMode === "draft" && (
                    <DraftSimulator
                      allCards={cards}
                      onLoadDraft={(draftDeck) => {
                        setDeck(draftDeck);
                        setActiveTab("build");
                        showToast(
                          `Draft loaded: ${draftDeck.mainDeck.length} cards`,
                          "success",
                        );
                      }}
                    />
                  )}
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

              {activeTab === "blackmarket" && (
                <div key="blackmarket-tab">
                  <BlackMarketView
                    key={blackMarketKey}
                    allCards={cards}
                    onLoadDeck={(clonedDeck) => {
                      setSavedDecks((prev) => [clonedDeck, ...prev]);
                    }}
                    onShowToast={showToast}
                    onViewPublicDeck={(deck) => setPublicDeckId(deck.id)}
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
            </motion.div>
          </AnimatePresence>

          {/* MODALS — outside AnimatePresence */}
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

          {showShareImageModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-term-gray border-2 border-term-amber rounded-lg p-6 max-w-sm w-full">
                <h3 className="text-term-amber font-bold font-mono text-lg mb-1">
                  ▓ SHARE DECK
                </h3>
                <p className="text-term-green/60 font-mono text-xs mb-4">
                  &gt; Choose how to share
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      showToast("URL copied!", "success");
                    }}
                    className="w-full py-2 border border-term-green text-term-green font-mono font-bold text-sm rounded hover:bg-term-green/10 transition-colors"
                  >
                    [🔗 COPY LINK]
                  </button>
                  <DeckImageExport
                    deck={deck}
                    deckName="My Deck"
                    authorName={
                      user?.discord_username ||
                      user?.email?.split("@")[0] ||
                      "RUNNER"
                    }
                    shareUrl={shareUrl}
                    className="w-full py-2 bg-term-amber/20 border border-term-amber text-term-amber rounded hover:bg-term-amber/30"
                  />
                  <button
                    onClick={() => setShowShareImageModal(false)}
                    className="w-full py-2 border border-term-amber/30 text-term-amber/60 font-mono text-xs rounded hover:bg-term-amber/10 transition-colors"
                  >
                    [CLOSE]
                  </button>
                </div>
              </div>
            </div>
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

          {publicDeckId && (
            <PublicDeckView
              deckId={publicDeckId}
              allCards={cards}
              onClose={() => setPublicDeckId(null)}
              onCloneSuccess={(clonedDeck) => {
                setSavedDecks((prev) => [clonedDeck, ...prev]);
                showToast(`Deck cloned to your terminal ✓`, "success");
              }}
              onShowToast={showToast}
              currentUserId={user?.id}
              isAdmin={isAdmin}
              onDeckDeleted={() => {
                setPublicDeckId(null);
                setBlackMarketKey((k) => k + 1);
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

          {showProfileModal && user && (
            <UserProfileModal
              user={user}
              savedDecks={savedDecks}
              onClose={() => setShowProfileModal(false)}
              onProfileUpdate={async () => {
                const { supabase: sb } = await import("./lib/supabase");
                const { data } = await sb
                  .from("profiles")
                  .select("avatar_url")
                  .eq("id", user.id)
                  .single();
                if (data?.avatar_url) setProfileAvatarUrl(data.avatar_url);
              }}
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

        {showPublishModal && deckToPublish && (
          <PublishDeckModal
            deck={deckToPublish}
            onConfirm={handleConfirmPublish}
            onClose={() => {
              setShowPublishModal(false);
              setDeckToPublish(null);
            }}
          />
        )}

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
