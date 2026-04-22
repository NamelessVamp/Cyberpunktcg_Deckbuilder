import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getWishlist,
  removeFromWishlist,
  updateWishlistItem,
  getWishlistStats,
  exportWishlistAsText,
} from "../lib/wishlistService";
import cards from "../data/cards.json";
import SmartCardImage from "./SmartCardImage";
import { motion, AnimatePresence } from "framer-motion";

export default function WishlistView() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("created_at");

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user, sortBy]);

  async function loadWishlist() {
    setLoading(true);
    try {
      const [wishlistData, statsData] = await Promise.all([
        getWishlist(sortBy, false),
        getWishlistStats(),
      ]);
      setWishlist(wishlistData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading wishlist:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(cardId) {
    try {
      await removeFromWishlist(cardId);
      loadWishlist();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  }

  async function handlePriorityChange(cardId, newPriority) {
    try {
      await updateWishlistItem(cardId, { priority: newPriority });
      loadWishlist();
    } catch (error) {
      console.error("Error updating priority:", error);
    }
  }

  async function handleExport() {
    try {
      const text = await exportWishlistAsText();
      navigator.clipboard.writeText(text);
      alert("Wishlist copied to clipboard!");
    } catch (error) {
      console.error("Error exporting wishlist:", error);
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-term-amber text-xl font-bold mb-2">
            ⭐ WISHLIST REQUIRES LOGIN
          </div>
          <div className="text-term-amber/60">
            Sign in to track cards you want to collect
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-term-amber font-mono animate-pulse">
          LOADING WISHLIST...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-term-amber mb-2">
            ˗ˏˋ ♡ ˎˊ˗ MY WISHLIST
          </h1>
          {stats && (
            <div className="text-term-green text-sm">
              {stats.total} cards • {stats.totalQuantity} total quantity •{" "}
              {stats.byPriority.high} high priority
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-term-gray border border-term-amber text-term-amber px-3 py-2 rounded font-mono"
          >
            <option value="created_at">Newest First</option>
            <option value="priority">By Priority</option>
            <option value="card_id">By Card Name</option>
          </select>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-term-green text-black font-bold rounded font-mono hover:bg-green-400 transition-colors"
          >
            EXPORT
          </button>
        </div>
      </div>

      {/* Empty State */}
      {wishlist.length === 0 && (
        <div className="text-center py-12">
          <div className="text-term-amber/60 text-lg mb-2">
            Your wishlist is empty
          </div>
          <div className="text-term-amber/40 text-sm">
            Add cards from the Gallery or Preview Modal
          </div>
        </div>
      )}

      {/* Wishlist Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <AnimatePresence>
          {wishlist.map((item) => {
            const card = cards.find((c) => c.id === item.card_id);
            if (!card) return null;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-term-gray border border-term-amber/30 rounded p-3 relative group"
              >
                {/* Priority Badge */}
                <div
                  className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-xs font-bold ${
                    item.priority === "high"
                      ? "bg-term-red text-white"
                      : item.priority === "medium"
                        ? "bg-term-amber text-black"
                        : "bg-term-gray-light text-term-amber"
                  }`}
                >
                  {item.priority.toUpperCase()}
                </div>

                {/* Card Image */}
                <SmartCardImage card={card} className="w-full rounded mb-2" />

                {/* Card Info */}
                <div className="text-term-amber text-sm font-bold mb-1 line-clamp-1">
                  {card.name}
                </div>
                <div className="text-term-green text-xs mb-2">
                  Quantity: {item.quantity}
                </div>

                {/* Actions (show on hover) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <select
                    value={item.priority}
                    onChange={(e) =>
                      handlePriorityChange(item.card_id, e.target.value)
                    }
                    className="flex-1 bg-term-black border border-term-amber/40 text-term-amber text-xs px-1 py-1 rounded"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Med</option>
                    <option value="high">High</option>
                  </select>
                  <button
                    onClick={() => handleRemove(item.card_id)}
                    className="px-2 py-1 bg-term-red text-white text-xs rounded hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Notes */}
                {item.notes && (
                  <div className="text-term-amber/60 text-xs mt-2 line-clamp-2">
                    {item.notes}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
