// NON OMNIS MORIAR — shareService.js
// Clean UUID share links — Fase 7 #37
import { supabase } from "./supabase";

export async function createShareLink(deck, deckName, authorName) {
  const { data, error } = await supabase
    .from("shared_decks")
    .insert({
      deck_data: deck,
      deck_name: deckName || "Untitled Deck",
      author_name: authorName || "Anonymous Runner",
    })
    .select("id")
    .single();

  if (error) throw error;
  return `${window.location.origin}/deck/${data.id}`;
}

export async function loadSharedDeck(uuid) {
  const { data, error } = await supabase
    .from("shared_decks")
    .select("*")
    .eq("id", uuid)
    .single();

  if (error) throw error;

  // Bump view count
  await supabase
    .from("shared_decks")
    .update({
      views: (data.views || 0) + 1,
      last_viewed: new Date().toISOString(),
    })
    .eq("id", uuid);

  return data;
}
