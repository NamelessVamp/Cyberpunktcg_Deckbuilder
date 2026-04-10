// NON OMNIS MORIAR — Community features service

import { supabase } from "./supabase";

// =====================================================
// PUBLIC DECKLISTS
// =====================================================

/**
 * Get all public decks with pagination
 */
export const getPublicDecks = async (options = {}) => {
  const {
    limit = 20,
    offset = 0,
    sortBy = "created_at", // 'created_at' | 'upvotes' | 'views'
    order = "desc",
  } = options;

  let query = supabase
    .from("decks")
    .select(
      `
      *,
      profiles!decks_user_id_profiles_fkey(discord_username, discord_avatar),
      deck_votes(vote_type)
    `,
    )
    .eq("visibility", "public")
    .order(sortBy, { ascending: order === "asc" })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  // Calculate net upvotes for each deck
  const decksWithVotes = data?.map((deck) => ({
    ...deck,
    netUpvotes:
      deck.deck_votes?.filter((v) => v.vote_type === "up").length -
        deck.deck_votes?.filter((v) => v.vote_type === "down").length || 0,
  }));

  return { decks: decksWithVotes, total: count };
};

/**
 * Get a single deck by ID (public or unlisted)
 */
export const getPublicDeck = async (deckId, incrementViews = true) => {
  const { data: deck, error } = await supabase
    .from("decks")
    .select(
      `
      *,
     profiles!decks_user_id_profiles_fkey(discord_username, discord_avatar), 
      deck_votes(vote_type, user_id),
      deck_comments(
        id,
        comment_text,
        created_at,
        profiles!deck_comments_user_id_profiles_fkey(discord_username, discord_avatar)
      )
    `,
    )
    .eq("id", deckId)
    .single();

  if (error) throw error;

  // Increment view count
  if (incrementViews) {
    await supabase.rpc("increment_deck_views", { deck_uuid: deckId });
  }

  return deck;
};

/**
 * Publish a deck (make it public)
 */
export const publishDeck = async (deckId, description = "") => {
  const { data, error } = await supabase
    .from("decks")
    .update({
      visibility: "public",
      description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", deckId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Unpublish a deck (make it private)
 */
export const unpublishDeck = async (deckId) => {
  const { data, error } = await supabase
    .from("decks")
    .update({
      visibility: "private",
      updated_at: new Date().toISOString(),
    })
    .eq("id", deckId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// =====================================================
// VOTING
// =====================================================

/**
 * Vote on a deck (upvote or downvote)
 */
export const voteDeck = async (deckId, voteType) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Must be logged in to vote");

  // Check if user already voted
  const { data: existingVote } = await supabase
    .from("deck_votes")
    .select("*")
    .eq("deck_id", deckId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingVote) {
    // Update existing vote
    if (existingVote.vote_type === voteType) {
      // Remove vote if clicking same button
      const { error } = await supabase
        .from("deck_votes")
        .delete()
        .eq("deck_id", deckId)
        .eq("user_id", user.id);

      if (error) throw error;
      return { removed: true };
    } else {
      // Change vote
      const { data, error } = await supabase
        .from("deck_votes")
        .update({ vote_type: voteType })
        .eq("deck_id", deckId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return { changed: true, vote: data };
    }
  } else {
    // Create new vote
    const { data, error } = await supabase
      .from("deck_votes")
      .insert({
        deck_id: deckId,
        user_id: user.id,
        vote_type: voteType,
      })
      .select()
      .single();

    if (error) throw error;
    return { created: true, vote: data };
  }
};

// =====================================================
// COMMENTS
// =====================================================

/**
 * Add a comment to a deck
 */
export const addComment = async (deckId, commentText) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Must be logged in to comment");

  const { data, error } = await supabase
    .from("deck_comments")
    .insert({
      deck_id: deckId,
      user_id: user.id,
      comment_text: commentText,
    })
    .select(
      `
      *,
      profiles!deck_comments_user_id_profiles_fkey(discord_username, discord_avatar)
    `,
    )
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId) => {
  const { error } = await supabase
    .from("deck_comments")
    .delete()
    .eq("id", commentId);

  if (error) throw error;
};

/**
 * Get user's vote on a deck
 */
export const getUserVote = async (deckId, userId) => {
  const { data, error } = await supabase
    .from("deck_votes")
    .select("vote_type")
    .eq("deck_id", deckId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.vote_type || null;
};

/**
 * Delete a public deck (owner or admin)
 */
export const deletePublicDeck = async (deckId) => {
  const { error } = await supabase.from("decks").delete().eq("id", deckId);
  if (error) throw error;
};

/**
 * Update deck description and archetype (owner or admin)
 */
export const updatePublicDeck = async (deckId, updates) => {
  const { data, error } = await supabase
    .from("decks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", deckId)
    .select()
    .single();
  if (error) throw error;
  return data;
};
