// NON OMNIS MORIAR — Wishlist service for card collection management
import { supabase } from "./supabase";

/**
 * Add card to wishlist
 * @param {string} cardId - Card ID to add
 * @param {number} quantity - Quantity wanted (default 1)
 * @param {string} priority - Priority level: 'low', 'medium', 'high'
 * @param {string} notes - Optional notes
 */
export const addToWishlist = async (
  cardId,
  quantity = 1,
  priority = "medium",
  notes = "",
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in to add to wishlist");

  const { data, error } = await supabase
    .from("wishlist")
    .insert({
      user_id: user.id,
      card_id: cardId,
      quantity,
      priority,
      notes,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Remove card from wishlist
 * @param {string} cardId - Card ID to remove
 */
export const removeFromWishlist = async (cardId) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in to remove from wishlist");

  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("user_id", user.id)
    .eq("card_id", cardId);

  if (error) throw error;
  return true;
};

/**
 * Update wishlist item
 * @param {string} cardId - Card ID to update
 * @param {object} updates - Fields to update (quantity, priority, notes)
 */
export const updateWishlistItem = async (cardId, updates) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in to update wishlist");

  const { data, error } = await supabase
    .from("wishlist")
    .update(updates)
    .eq("user_id", user.id)
    .eq("card_id", cardId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get user's entire wishlist
 * @param {string} sortBy - Sort field: 'created_at', 'priority', 'card_id'
 * @param {boolean} ascending - Sort order
 */
export const getWishlist = async (sortBy = "created_at", ascending = false) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in to view wishlist");

  const { data, error } = await supabase
    .from("wishlist")
    .select("*")
    .eq("user_id", user.id)
    .order(sortBy, { ascending });

  if (error) throw error;
  return data || [];
};

/**
 * Check if card is in wishlist
 * @param {string} cardId - Card ID to check
 */
export const isInWishlist = async (cardId) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("wishlist")
    .select("id")
    .eq("user_id", user.id)
    .eq("card_id", cardId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
};

/**
 * Get wishlist stats
 */
export const getWishlistStats = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  const { data, error } = await supabase
    .from("wishlist")
    .select("priority, quantity")
    .eq("user_id", user.id);

  if (error) throw error;

  const stats = {
    total: data.length,
    totalQuantity: data.reduce((sum, item) => sum + item.quantity, 0),
    byPriority: {
      high: data.filter((i) => i.priority === "high").length,
      medium: data.filter((i) => i.priority === "medium").length,
      low: data.filter((i) => i.priority === "low").length,
    },
  };

  return stats;
};

/**
 * Export wishlist as text (for shopping)
 */
export const exportWishlistAsText = async () => {
  const wishlist = await getWishlist("priority", false);

  let text = "# MY WISHLIST - CYBERPUNK TCG\n\n";

  const byPriority = {
    high: wishlist.filter((i) => i.priority === "high"),
    medium: wishlist.filter((i) => i.priority === "medium"),
    low: wishlist.filter((i) => i.priority === "low"),
  };

  Object.entries(byPriority).forEach(([priority, items]) => {
    if (items.length === 0) return;

    text += `## ${priority.toUpperCase()} PRIORITY\n`;
    items.forEach((item) => {
      text += `- ${item.quantity}x ${item.card_id}`;
      if (item.notes) text += ` (${item.notes})`;
      text += "\n";
    });
    text += "\n";
  });

  return text;
};
