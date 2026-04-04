import { supabase } from "./supabase";

// =====================================================
// COLLECTION CRUD OPERATIONS (FIXED FOR 406 ERROR)
// =====================================================

/**
 * Add card to collection (or increment quantity)
 */
export const addToCollection = async (
  userId,
  cardId,
  quantity = 1,
  isFoil = false,
) => {
  // Check if card already exists
  // CAMBIO: Usa .maybeSingle() en vez de .single()
  const { data: existing, error: checkError } = await supabase
    .from("collection")
    .select("*")
    .eq("user_id", userId)
    .eq("card_id", cardId)
    .eq("is_foil", isFoil)
    .maybeSingle(); // ← FIX: maybeSingle() no tira error si hay 0 o múltiples filas

  if (checkError) {
    throw checkError;
  }

  if (existing) {
    // Update quantity
    const { data, error } = await supabase
      .from("collection")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Insert new
    const { data, error } = await supabase
      .from("collection")
      .insert({
        user_id: userId,
        card_id: cardId,
        quantity: quantity,
        is_foil: isFoil,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

/**
 * Remove card from collection (or decrement quantity)
 */
export const removeFromCollection = async (
  userId,
  cardId,
  quantity = 1,
  isFoil = false,
) => {
  // CAMBIO: Usa .maybeSingle()
  const { data: existing, error: checkError } = await supabase
    .from("collection")
    .select("*")
    .eq("user_id", userId)
    .eq("card_id", cardId)
    .eq("is_foil", isFoil)
    .maybeSingle(); // ← FIX

  if (checkError) throw checkError;

  if (!existing) {
    // No existe la carta, no hacer nada
    return null;
  }

  const newQuantity = existing.quantity - quantity;

  if (newQuantity <= 0) {
    // Delete entry
    const { error } = await supabase
      .from("collection")
      .delete()
      .eq("id", existing.id);

    if (error) throw error;
    return null;
  } else {
    // Update quantity
    const { data, error } = await supabase
      .from("collection")
      .update({ quantity: newQuantity })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

/**
 * Get user's full collection
 */
export const loadCollection = async (userId) => {
  const { data, error } = await supabase
    .from("collection")
    .select("*")
    .eq("user_id", userId)
    .order("acquired_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Check if user owns a specific card
 */
export const ownsCard = (collection, cardId) => {
  return collection.some(
    (item) => item.card_id === cardId && item.quantity > 0,
  );
};

/**
 * Get quantity of a specific card
 */
export const getCardQuantity = (collection, cardId) => {
  const item = collection.find((item) => item.card_id === cardId);
  return item ? item.quantity : 0;
};

/**
 * Get collection stats
 */
export const getCollectionStats = (collection, allCards) => {
  const totalCards = collection.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueCards = collection.length;
  const totalPossible = allCards.length;

  const completionPercent =
    totalPossible > 0 ? Math.round((uniqueCards / totalPossible) * 100) : 0;

  return {
    totalCards,
    uniqueCards,
    totalPossible,
    completionPercent,
  };
};
