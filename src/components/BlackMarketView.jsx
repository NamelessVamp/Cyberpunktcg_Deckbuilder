// NON OMNIS MORIAR — BLACK MARKET: Community Hub
// EX MACHINA — Feed de mazos públicos de la comunidad
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import * as communityService from "../lib/communityService";
import * as deckService from "../lib/deckService";

const ARCHETYPES = [
  "All",
  "Aggro",
  "Control",
  "Combo",
  "Midrange",
  "Tempo",
  "Mill",
];
const RAM_COLORS = ["All", "Red", "Blue", "Green", "Yellow"];
const SORT_OPTIONS = [
  { value: "created_at", label: "NEWEST" },
  { value: "upvotes", label: "TRENDING" },
  { value: "views", label: "MOST VIEWED" },
];

// RAM color dot helper
function RamDot({ color }) {
  const colorMap = {
    Red: "bg-term-red",
    Blue: "bg-term-blue",
    Green: "bg-term-green",
    Yellow: "bg-term-amber",
  };
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${colorMap[color] || "bg-gray-500"}`}
      title={color}
    />
  );
}

// Single deck card in the feed
function DeckCard({ deck, onClone, onViewDetail, user, cloningId }) {
  const isCloning = cloningId === deck.id;

  // Extract RAM colors from legend_ids metadata (best effort from archetype field)
  const ramColors = deck.ram_colors || [];

  // 🔌 INYECCIÓN DE IDENTIDAD: Jerarquía de nombres y avatares
  const p = deck.profiles || {};

  // Aquí la magia: Si tienes display_name o username, se sobreescribe el pasado.
  const authorName =
    p.display_name || p.username || p.discord_username || "UNKNOWN_RUNNER";
  const authorAvatar = p.avatar_url || p.discord_avatar;

  return (
    <div className="bg-term-gray border border-term-amber/20 rounded-lg p-4 hover:border-term-amber/50 transition-all group flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3
            className="text-term-amber font-bold font-mono text-base truncate cursor-pointer hover:text-yellow-400 transition-colors"
            onClick={() => onViewDetail(deck)}
            title={deck.name}
          >
            {deck.name}
          </h3>
          {deck.archetype && (
            <span className="text-[10px] font-mono px-2 py-0.5 border border-term-green/40 text-term-green/80 rounded mt-1 inline-block">
              {deck.archetype.toUpperCase()}
            </span>
          )}
        </div>

        {/* Street Cred */}
        <div className="flex flex-col items-center min-w-[40px]">
          <span className="text-term-amber font-mono font-bold text-lg leading-none">
            {deck.netUpvotes ?? 0}
          </span>
          <span className="text-term-amber/50 font-mono text-[9px]">CRED</span>
        </div>
      </div>

      {/* Author row */}
      <div className="flex items-center gap-2">
        {authorAvatar ? (
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-5 h-5 rounded-full border border-term-amber/30"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-term-gray-light border border-term-amber/30 flex items-center justify-center">
            <span className="text-[8px] text-term-amber/60">?</span>
          </div>
        )}
        <span className="text-term-green/70 font-mono text-xs truncate">
          {authorName}
        </span>
        <span className="text-term-amber/30 font-mono text-xs ml-auto">
          {new Date(deck.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs font-mono text-term-amber/60">
        <span>{deck.legend_ids?.length ?? 0} LEG</span>
        <span>{deck.main_deck_ids?.length ?? 0} CARDS</span>
        {ramColors.length > 0 && (
          <div className="flex items-center gap-1 ml-auto">
            {ramColors.map((c) => (
              <RamDot key={c} color={c} />
            ))}
          </div>
        )}
        <span className="ml-auto text-term-green/50">👁 {deck.views ?? 0}</span>
      </div>

      {/* Description preview */}
      {deck.description && (
        <p className="text-term-green/60 font-mono text-xs line-clamp-2 border-l-2 border-term-green/20 pl-2">
          {deck.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <button
          onClick={() => onViewDetail(deck)}
          className="flex-1 py-1.5 border border-term-amber/40 text-term-amber font-mono font-bold text-xs rounded hover:bg-term-amber/10 transition-colors"
        >
          [INSPECT]
        </button>
        {user && (
          <button
            onClick={() => onClone(deck)}
            disabled={isCloning}
            className="flex-1 py-1.5 bg-term-green/20 border border-term-green text-term-green font-mono font-bold text-xs rounded hover:bg-term-green/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isCloning ? "[CLONING...]" : "[CLONE >_]"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BlackMarketView({
  allCards,
  onLoadDeck,
  onShowToast,
  onViewPublicDeck,
}) {
  const { user } = useAuth();

  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("created_at");
  const [filterArchetype, setFilterArchetype] = useState("All");
  const [filterColor, setFilterColor] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cloningId, setCloningId] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 12;

  // ── Load decks ────────────────────────────────────────────────────────────
  async function loadDecks(reset = false) {
    setLoading(true);
    try {
      const offset = reset ? 0 : page * PAGE_SIZE;
      const { decks: newDecks } = await communityService.getPublicDecks({
        limit: PAGE_SIZE,
        offset,
        sortBy,
        order: "desc",
      });

      setDecks(reset ? newDecks : (prev) => [...prev, ...newDecks]);
      setHasMore(newDecks.length === PAGE_SIZE);
      if (reset) setPage(0);
    } catch (err) {
      console.error("Black Market load error:", err);
      onShowToast?.("Error loading the Black Market", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDecks(true);
  }, [sortBy]);

  // ── Clone deck ────────────────────────────────────────────────────────────
  async function handleClone(deck) {
    if (!user) {
      onShowToast?.("Login required to clone decks", "warning");
      return;
    }
    setCloningId(deck.id);
    try {
      const cloned = await deckService.duplicateDeck(
        user.id,
        deck.id,
        allCards,
      );
      const appDeck = {
        id: cloned.id,
        name: cloned.name,
        notes: cloned.notes || "",
        deck: deckService.supabaseToDeck(cloned, allCards),
        createdAt: cloned.created_at,
        updatedAt: cloned.updated_at,
      };
      onLoadDeck?.(appDeck, true); // true = clone mode (don't navigate away)
      onShowToast?.(`"${deck.name}" cloned to your terminal ✓`, "success");
    } catch (err) {
      console.error("Clone error:", err);
      onShowToast?.("Clone failed. Try again.", "error");
    } finally {
      setCloningId(null);
    }
  }

  // ── Client-side filter (archetype + color + search) ───────────────────────
  const filtered = decks.filter((d) => {
    if (
      filterArchetype !== "All" &&
      d.archetype?.toLowerCase() !== filterArchetype.toLowerCase()
    )
      return false;
    if (filterColor !== "All" && !(d.ram_colors || []).includes(filterColor))
      return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const inName = d.name?.toLowerCase().includes(q);
      const inAuthor =
        d.profiles?.display_name?.toLowerCase().includes(q) ||
        d.profiles?.username?.toLowerCase().includes(q) ||
        d.profiles?.discord_username?.toLowerCase().includes(q);
      const inDesc = d.description?.toLowerCase().includes(q);
      if (!inName && !inAuthor && !inDesc) return false;
    }
    return true;
  });

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[60vh]">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="mb-6 p-4 bg-term-gray border-2 border-term-amber/40 rounded">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-term-amber font-bold text-2xl font-mono mb-1">
              ▓ BLACK_MARKET.EXE
            </h2>
            <p className="text-term-green/60 font-mono text-xs">
              &gt; ACCESSING UNDERGROUND DECK DATABASE... CONNECTION ESTABLISHED
            </p>
            <p className="text-term-amber/40 font-mono text-xs mt-0.5">
              &gt; {filtered.length} INTEL PACKAGES AVAILABLE // STREET CRED
              VERIFIED
            </p>
          </div>
          {!user && (
            <div className="text-term-red/70 font-mono text-xs border border-term-red/30 px-3 py-2 rounded">
              ⚠ LOGIN TO CLONE DECKS
            </div>
          )}
        </div>
      </div>

      {/* ── Filters bar ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        {/* Search */}
        <input
          type="text"
          placeholder="&gt; SEARCH INTEL..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[180px] bg-term-gray border border-term-amber/40 text-term-amber placeholder-term-amber/30 font-mono text-xs px-3 py-1.5 rounded focus:outline-none focus:border-term-amber"
        />

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-term-gray border border-term-amber/40 text-term-amber font-mono text-xs px-2 py-1.5 rounded"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Archetype filter */}
        <select
          value={filterArchetype}
          onChange={(e) => setFilterArchetype(e.target.value)}
          className="bg-term-gray border border-term-amber/40 text-term-amber font-mono text-xs px-2 py-1.5 rounded"
        >
          {ARCHETYPES.map((a) => (
            <option key={a} value={a}>
              {a === "All" ? "ARCHETYPE: ALL" : a.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Color filter */}
        <select
          value={filterColor}
          onChange={(e) => setFilterColor(e.target.value)}
          className="bg-term-gray border border-term-amber/40 text-term-amber font-mono text-xs px-2 py-1.5 rounded"
        >
          {RAM_COLORS.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "COLOR: ALL" : c.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Refresh */}
        <button
          onClick={() => loadDecks(true)}
          className="px-3 py-1.5 border border-term-green/40 text-term-green/70 font-mono text-xs rounded hover:bg-term-green/10 transition-colors"
        >
          [↺ REFRESH]
        </button>
      </div>

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {loading && decks.length === 0 && (
        <div className="flex items-center justify-center py-24">
          <p className="text-term-amber font-mono animate-pulse">
            &gt; CONNECTING TO BLACK MARKET...
          </p>
        </div>
      )}

      {/* ── Empty ─────────────────────────────────────────────────────────── */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-term-amber/60 font-mono text-lg mb-2">
            NO INTEL PACKAGES FOUND
          </p>
          <p className="text-term-green/40 font-mono text-sm">
            {decks.length === 0
              ? "Be the first to publish a deck from [MY DECKS]"
              : "Try adjusting your filters"}
          </p>
        </div>
      )}

      {/* ── Deck Grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            user={user}
            onClone={handleClone}
            onViewDetail={onViewPublicDeck}
            cloningId={cloningId}
          />
        ))}
      </div>

      {/* ── Load more ─────────────────────────────────────────────────────── */}
      {hasMore && !loading && filtered.length > 0 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => {
              setPage((p) => p + 1);
              loadDecks(false);
            }}
            className="px-6 py-2 border border-term-amber/40 text-term-amber font-mono font-bold text-sm rounded hover:bg-term-amber/10 transition-colors"
          >
            [LOAD MORE PACKAGES]
          </button>
        </div>
      )}

      {loading && decks.length > 0 && (
        <div className="text-center py-4">
          <p className="text-term-amber/50 font-mono text-xs animate-pulse">
            FETCHING DATA...
          </p>
        </div>
      )}
    </div>
  );
}
