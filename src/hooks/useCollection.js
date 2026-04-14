// NON OMNIS MORIAR — useCollection.js
// EX MACHINA — Custom hook: collection + wishlist state & handlers
// Extraído de App.jsx (Fase 16 — Refactor Arquitectura)
import { useState } from "react";
import * as collectionService from "../lib/collectionService";

export function useCollection({ user, showToast }) {
  const [collection, setCollection] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // ── COLLECTION ─────────────────────────────────────────────────────────────
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

  // ── WISHLIST ───────────────────────────────────────────────────────────────
  const handleToggleWishlist = async (cardId) => {
    if (!user) {
      showToast("Login required to use wishlist", "warning");
      return;
    }
    const { addToWishlist, removeFromWishlist } =
      await import("../lib/wishlistService");
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

  return {
    collection,
    setCollection,
    wishlistIds,
    setWishlistIds,
    handleAddToCollection,
    handleRemoveFromCollection,
    handleToggleWishlist,
  };
}
