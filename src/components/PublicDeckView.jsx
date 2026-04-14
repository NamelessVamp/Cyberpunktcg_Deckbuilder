// NON OMNIS MORIAR — PUBLIC DECK VIEW: Intel Package Detail
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import * as communityService from "../lib/communityService";
import * as deckService from "../lib/deckService";
import SmartCardImage from "./SmartCardImage";
import DeckImageExport, {
  generateDeckImage,
  DeckExportCanvas,
} from "./DeckImageExport";

function RamDot({ color }) {
  const colorMap = {
    Red: "bg-term-red",
    Blue: "bg-term-blue",
    Green: "bg-term-green",
    Yellow: "bg-term-amber",
  };
  return (
    <span
      className={`inline-block w-3 h-3 rounded-full ${colorMap[color] || "bg-gray-500"}`}
      title={color}
    />
  );
}

export default function PublicDeckView({
  deckId,
  allCards,
  onClose,
  onCloneSuccess,
  onShowToast,
  currentUserId = null,
  isAdmin = false,
  onDeckDeleted = null,
}) {
  const [editing, setEditing] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [userVote, setUserVote] = useState(null); // 'up' | 'down' | null
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (!deckId) return;
    loadDeck();
  }, [deckId]);

  async function loadDeck() {
    setLoading(true);
    try {
      const data = await communityService.getPublicDeck(deckId);
      setDeck(data);
      // Check user's existing vote
      if (user) {
        const myVote = data.deck_votes?.find((v) => v.user_id === user.id);
        setUserVote(myVote?.vote_type || null);
      }
    } catch (err) {
      console.error("PublicDeckView load error:", err);
      onShowToast?.("Error loading deck", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(type) {
    if (!user) {
      onShowToast?.("Login required to vote", "warning");
      return;
    }
    if (voting) return;
    setVoting(true);
    try {
      const result = await communityService.voteDeck(deck.id, type);
      if (result.removed) {
        setUserVote(null);
      } else {
        setUserVote(type);
      }
      await loadDeck(); // refresh vote counts
    } catch (err) {
      console.error("Vote error:", err);
    } finally {
      setVoting(false);
    }
  }

  async function handleComment() {
    if (!user || !comment.trim()) return;
    setSubmitting(true);
    try {
      await communityService.addComment(deck.id, comment.trim());
      setComment("");
      await loadDeck();
      onShowToast?.("Comment posted ✓", "success");
    } catch (err) {
      console.error("Comment error:", err);
      onShowToast?.("Error posting comment", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleClone() {
    if (!user) {
      onShowToast?.("Login required to clone decks", "warning");
      return;
    }
    setCloning(true);
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
      onCloneSuccess?.(appDeck);
      onShowToast?.(`"${deck.name}" cloned to your terminal ✓`, "success");
      onClose();
    } catch (err) {
      console.error("Clone error:", err);
      onShowToast?.("Clone failed. Try again.", "error");
    } finally {
      setCloning(false);
    }
  }

  const isOwnerOrAdmin = deck && (deck.user_id === currentUserId || isAdmin);

  async function handleDelete() {
    if (!window.confirm(`Delete "${deck.name}" from the Black Market?`)) return;
    setDeleting(true);
    try {
      await communityService.deletePublicDeck(deck.id);
      onShowToast?.("Deck removed from Black Market", "success");
      onDeckDeleted?.();
      onClose();
    } catch (err) {
      console.error("Delete error:", err);
      onShowToast?.("Error deleting deck", "error");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSaveEdit() {
    try {
      await communityService.updatePublicDeck(deck.id, {
        description: editDescription,
      });
      onShowToast?.("Deck updated ✓", "success");
      setEditing(false);
      await loadDeck();
    } catch (err) {
      console.error("Edit error:", err);
      onShowToast?.("Error updating deck", "error");
    }
  }

  // Hydrate deck cards from IDs
  const hydratedDeck = deck ? deckService.supabaseToDeck(deck, allCards) : null;

  const netUpvotes = deck
    ? (deck.deck_votes?.filter((v) => v.vote_type === "up").length ?? 0) -
      (deck.deck_votes?.filter((v) => v.vote_type === "down").length ?? 0)
    : 0;

  // Excluir leyendas del curve (no tienen Eddie cost)
  const eddieCurve = hydratedDeck
    ? hydratedDeck.mainDeck
        .filter((card) => card.type !== "LEGEND" && card.cost !== undefined)
        .reduce((acc, card) => {
          const cost = card.cost;
          acc[cost] = (acc[cost] || 0) + 1;
          return acc;
        }, {})
    : {};
  const maxCurveCount = Math.max(...Object.values(eddieCurve), 1);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-term-black border-2 border-term-amber rounded-lg w-full max-w-4xl my-4"
          onClick={(e) => e.stopPropagation()}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* ── Modal Header ─────────────────────────────────────────────── */}
          <div className="flex items-start justify-between p-5 border-b border-term-amber/20">
            <div>
              {loading ? (
                <div className="text-term-amber font-mono animate-pulse">
                  LOADING INTEL PACKAGE...
                </div>
              ) : (
                <>
                  <h2 className="text-term-amber font-bold text-2xl font-mono mb-1">
                    {deck?.name}
                  </h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    {deck?.archetype && (
                      <span className="text-[11px] font-mono px-2 py-0.5 border border-term-green/40 text-term-green rounded">
                        {deck.archetype.toUpperCase()}
                      </span>
                    )}
                    <span className="text-term-green/60 font-mono text-xs">
                      by {deck?.profiles?.discord_username || "UNKNOWN_RUNNER"}
                    </span>
                    <span className="text-term-amber/40 font-mono text-xs">
                      {deck && new Date(deck.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-term-green/50 font-mono text-xs">
                      👁 {deck?.views ?? 0} views
                    </span>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-term-green text-3xl font-bold transition-colors leading-none"
            >
              ✕
            </button>
          </div>

          {!loading && deck && hydratedDeck && (
            <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ── LEFT COL: Card list ───────────────────────────────────── */}
              <div className="lg:col-span-2 space-y-5">
                {/* Legends */}
                {hydratedDeck.legends.length > 0 && (
                  <div>
                    <h4 className="text-term-amber font-bold font-mono text-sm mb-2">
                      LEGENDS ({hydratedDeck.legends.length})
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {hydratedDeck.legends.map((card) => (
                        <div key={card.id} className="relative group">
                          <SmartCardImage
                            card={card}
                            className="w-full h-auto rounded border border-term-amber/30"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 rounded-b opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-term-amber font-mono text-[9px] truncate">
                              {card.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main deck list */}
                <div>
                  <h4 className="text-term-amber font-bold font-mono text-sm mb-2">
                    MAIN DECK ({hydratedDeck.mainDeck.length} cards)
                  </h4>
                  <div className="bg-term-gray rounded border border-term-amber/20 divide-y divide-term-amber/10 max-h-64 overflow-y-auto">
                    {(() => {
                      const counts = hydratedDeck.mainDeck.reduce(
                        (acc, card) => {
                          if (!acc[card.id]) acc[card.id] = { card, count: 0 };
                          acc[card.id].count++;
                          return acc;
                        },
                        {},
                      );
                      return Object.values(counts)
                        .sort((a, b) => a.card.name.localeCompare(b.card.name))
                        .map(({ card, count }) => (
                          <div
                            key={card.id}
                            className="flex items-center justify-between px-3 py-1.5 hover:bg-term-amber/5 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {card.ram_color && (
                                <RamDot color={card.ram_color} />
                              )}
                              <span className="text-term-green font-mono text-xs">
                                {card.name}
                              </span>
                              {card.subtitle && (
                                <span className="text-term-amber/40 font-mono text-[10px]">
                                  ({card.subtitle})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-term-blue/70 font-mono text-[10px]">
                                €{card.cost}
                              </span>
                              <span className="text-term-amber font-mono font-bold text-xs">
                                x{count}
                              </span>
                            </div>
                          </div>
                        ));
                    })()}
                  </div>
                </div>

                {/* Eddies Curve */}
                <div>
                  <h4 className="text-term-amber font-bold font-mono text-sm mb-2">
                    EDDIES CURVE
                  </h4>
                  <div className="flex items-end gap-1 h-28 bg-term-gray rounded border border-term-amber/20 px-3 pb-2 pt-3">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((cost) => {
                      const count = eddieCurve[cost] || 0;
                      const height =
                        count > 0
                          ? Math.max(12, (count / maxCurveCount) * 100)
                          : 0;
                      return (
                        <div
                          key={cost}
                          className="flex-1 flex flex-col items-center gap-0.5"
                        >
                          <div
                            className={`w-full rounded-t transition-all ${count > 0 ? "bg-term-amber" : "bg-term-gray-light"}`}
                            style={{ height: `${height}%` }}
                            title={`${cost} Eddie: ${count} cards`}
                          />
                          <span className="text-term-amber/50 font-mono text-[8px]">
                            {cost}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <h4 className="text-term-amber font-bold font-mono text-sm mb-3">
                    INTEL COMMENTS ({deck.deck_comments?.length ?? 0})
                  </h4>

                  {/* Comment input */}
                  {user ? (
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleComment()}
                        placeholder="> DROP YOUR INTEL..."
                        maxLength={280}
                        className="flex-1 bg-term-gray border border-term-amber/40 text-term-amber placeholder-term-amber/30 font-mono text-xs px-3 py-2 rounded focus:outline-none focus:border-term-amber"
                      />
                      <button
                        onClick={handleComment}
                        disabled={submitting || !comment.trim()}
                        className="px-3 py-2 bg-term-green/20 border border-term-green text-term-green font-mono font-bold text-xs rounded hover:bg-term-green/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {submitting ? "..." : "[POST]"}
                      </button>
                    </div>
                  ) : (
                    <p className="text-term-amber/40 font-mono text-xs mb-3">
                      Login to post intel
                    </p>
                  )}

                  {/* Comment list */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(deck.deck_comments || []).length === 0 && (
                      <p className="text-term-amber/30 font-mono text-xs text-center py-4">
                        No intel yet. Be the first.
                      </p>
                    )}
                    {(deck.deck_comments || [])
                      .sort(
                        (a, b) =>
                          new Date(b.created_at) - new Date(a.created_at),
                      )
                      .map((c) => (
                        <div
                          key={c.id}
                          className="bg-term-gray border border-term-amber/15 rounded px-3 py-2"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-term-green font-mono font-bold text-[10px]">
                              {c.profiles?.discord_username || "UNKNOWN"}
                            </span>
                            <span className="text-term-amber/30 font-mono text-[9px] ml-auto">
                              {new Date(c.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-term-amber/80 font-mono text-xs">
                            {c.comment_text}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* ── RIGHT COL: Actions + description ─────────────────────── */}
              <div className="space-y-4">
                {/* Street Cred / Voting */}
                <div className="bg-term-gray border border-term-amber/20 rounded p-4 text-center">
                  <p className="text-term-amber/60 font-mono text-xs mb-2">
                    STREET CRED
                  </p>
                  <p className="text-term-amber font-bold font-mono text-4xl mb-3">
                    {netUpvotes}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleVote("up")}
                      disabled={voting || !user}
                      className={`flex-1 py-2 font-mono font-bold text-sm rounded transition-colors ${
                        userVote === "up"
                          ? "bg-term-green text-term-black"
                          : "border border-term-green/40 text-term-green/70 hover:bg-term-green/10"
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      ▲ UP
                    </button>
                    <button
                      onClick={() => handleVote("down")}
                      disabled={voting || !user}
                      className={`flex-1 py-2 font-mono font-bold text-sm rounded transition-colors ${
                        userVote === "down"
                          ? "bg-term-red text-white"
                          : "border border-term-red/40 text-term-red/70 hover:bg-term-red/10"
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      ▼ DOWN
                    </button>
                  </div>
                </div>

                {/* Clone CTA */}
                <button
                  onClick={handleClone}
                  disabled={cloning || !user}
                  className="w-full py-3 bg-term-green/20 border-2 border-term-green text-term-green font-mono font-bold text-sm rounded hover:bg-term-green/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {cloning ? "[CLONING DATA...]" : "[>_ CLONE TO TERMINAL]"}
                </button>
                {!user && (
                  <p className="text-term-amber/40 font-mono text-[10px] text-center -mt-2">
                    Login required to clone
                  </p>
                )}

                {hydratedDeck && (
                  <DeckImageExport
                    deck={hydratedDeck}
                    deckName={deck?.name}
                    authorName={
                      deck?.profiles?.discord_username || "UNKNOWN_RUNNER"
                    }
                    shareUrl={`${window.location.origin}/?d=${btoa(JSON.stringify({ legends: deck?.legend_ids || [], mainDeck: deck?.main_deck_ids || [], sideboard: [] }))}`}
                    className="w-full py-2 border border-term-amber/40 text-term-amber font-mono font-bold text-sm rounded hover:bg-term-amber/10 transition-colors"
                  />
                )}

                {/* Owner/Admin controls */}
                {isOwnerOrAdmin && (
                  <div className="mt-3 pt-3 border-t border-term-red/20 space-y-2">
                    {!editing ? (
                      <button
                        onClick={() => {
                          setEditing(true);
                          setEditDescription(deck.description || "");
                        }}
                        className="w-full py-2 border border-term-amber/40 text-term-amber font-mono font-bold text-xs rounded hover:bg-term-amber/10 transition-colors"
                      >
                        [✎ EDIT DESCRIPTION]
                      </button>
                    ) : (
                      <div className="space-y-1.5">
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={3}
                          className="w-full bg-term-gray border border-term-amber/40 text-term-amber font-mono text-xs px-2 py-1.5 rounded resize-none focus:outline-none focus:border-term-amber"
                          placeholder="Strategy description..."
                        />
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={handleSaveEdit}
                            className="py-1.5 bg-term-green/20 border border-term-green text-term-green font-mono font-bold text-xs rounded hover:bg-term-green/30 transition-colors"
                          >
                            [✓ SAVE]
                          </button>
                          <button
                            onClick={() => setEditing(false)}
                            className="py-1.5 border border-term-amber/30 text-term-amber/60 font-mono font-bold text-xs rounded hover:bg-term-amber/10 transition-colors"
                          >
                            [✕ CANCEL]
                          </button>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="w-full py-2 bg-term-red/10 border border-term-red/50 text-term-red font-mono font-bold text-xs rounded hover:bg-term-red/20 transition-colors disabled:opacity-40"
                    >
                      {deleting
                        ? "[DELETING...]"
                        : "[🗑 DELETE FROM BLACK MARKET]"}
                    </button>
                  </div>
                )}

                {/* Description */}
                {deck.description && (
                  <div className="bg-term-gray border border-term-amber/20 rounded p-3">
                    <p className="text-term-green/60 font-mono text-[10px] mb-1">
                      STRATEGY NOTES
                    </p>
                    <p className="text-term-amber/80 font-mono text-xs leading-relaxed">
                      {deck.description}
                    </p>
                  </div>
                )}

                {/* Stats */}
                <div className="bg-term-gray border border-term-amber/20 rounded p-3 space-y-1.5">
                  <p className="text-term-green/60 font-mono text-[10px] mb-2">
                    PACKAGE STATS
                  </p>
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-term-amber/60">LEGENDS</span>
                    <span className="text-term-amber">
                      {hydratedDeck.legends.length}/3
                    </span>
                  </div>
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-term-amber/60">MAIN DECK</span>
                    <span className="text-term-amber">
                      {hydratedDeck.mainDeck.length} cards
                    </span>
                  </div>
                  {hydratedDeck.sideboard.length > 0 && (
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-term-amber/60">SIDEBOARD</span>
                      <span className="text-term-amber">
                        {hydratedDeck.sideboard.length} cards
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-term-amber/60">COMMENTS</span>
                    <span className="text-term-amber">
                      {deck.deck_comments?.length ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
