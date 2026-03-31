import { supabase } from "./supabase";

// =====================================================
// DECK CRUD OPERATIONS
// =====================================================

/**
 * Convert deck object to Supabase format (IDs only)
 */
export const deckToSupabase = (deck) => {
  return {
    legend_ids: deck.legends.map((c) => c.id),
    main_deck_ids: deck.mainDeck.map((c) => c.id),
    sideboard_ids: deck.sideboard?.map((c) => c.id) || [],
  };
};

/**
 * Convert Supabase format to deck object (hydrate IDs)
 */
export const supabaseToDeck = (supabaseDeck, allCards) => {
  const legends = supabaseDeck.legend_ids
    .map((id) => allCards.find((c) => c.id === id))
    .filter(Boolean);

  const mainDeck = supabaseDeck.main_deck_ids
    .map((id) => allCards.find((c) => c.id === id))
    .filter(Boolean);

  const sideboard = (supabaseDeck.sideboard_ids || [])
    .map((id) => allCards.find((c) => c.id === id))
    .filter(Boolean);

  return { legends, mainDeck, sideboard };
};

/**
 * Save deck to Supabase
 */
export const saveDeck = async (userId, deckName, deck, notes = "") => {
  const deckData = deckToSupabase(deck);

  const { data, error } = await supabase
    .from("decks")
    .insert({
      user_id: userId,
      name: deckName,
      notes: notes,
      legend_ids: deckData.legend_ids,
      main_deck_ids: deckData.main_deck_ids,
      sideboard_ids: deckData.sideboard_ids,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Load all decks for user
 */
export const loadDecks = async (userId) => {
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Update existing deck
 */
export const updateDeck = async (deckId, deckName, deck, notes = "") => {
  const deckData = deckToSupabase(deck);

  const { data, error } = await supabase
    .from("decks")
    .update({
      name: deckName,
      notes: notes,
      legend_ids: deckData.legend_ids,
      main_deck_ids: deckData.main_deck_ids,
      sideboard_ids: deckData.sideboard_ids,
      updated_at: new Date().toISOString(),
    })
    .eq("id", deckId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete deck
 */
export const deleteDeck = async (deckId) => {
  const { error } = await supabase.from("decks").delete().eq("id", deckId);

  if (error) throw error;
};

/**
 * Duplicate deck
 */
export const duplicateDeck = async (userId, deckId, allCards) => {
  // Load original deck
  const { data: originalDeck, error: loadError } = await supabase
    .from("decks")
    .select("*")
    .eq("id", deckId)
    .single();

  if (loadError) throw loadError;

  // Create copy
  const { data, error } = await supabase
    .from("decks")
    .insert({
      user_id: userId,
      name: `${originalDeck.name} (Copy)`,
      notes: originalDeck.notes,
      legend_ids: originalDeck.legend_ids,
      main_deck_ids: originalDeck.main_deck_ids,
      sideboard_ids: originalDeck.sideboard_ids || [],
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
