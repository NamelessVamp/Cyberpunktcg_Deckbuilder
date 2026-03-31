import * as deckService from "./deckService";

/**
 * Migrate decks from localStorage to Supabase
 * Returns: { migrated: number, failed: number, errors: [] }
 */
export const migrateLocalDecksToSupabase = async (userId, allCards) => {
  const results = {
    migrated: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Get decks from localStorage
    const localDecksJSON = localStorage.getItem("cyberpunk_decks");

    if (!localDecksJSON) {
      return results; // No decks to migrate
    }

    const localDecks = JSON.parse(localDecksJSON);

    if (!Array.isArray(localDecks) || localDecks.length === 0) {
      return results;
    }

    // Migrate each deck
    for (const localDeck of localDecks) {
      try {
        await deckService.saveDeck(
          userId,
          localDeck.name,
          localDeck.deck,
          localDeck.notes || "",
        );
        results.migrated++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          deckName: localDeck.name,
          error: error.message,
        });
      }
    }

    // If all migrated successfully, clear localStorage
    if (results.failed === 0) {
      localStorage.removeItem("cyberpunk_decks");
    }
  } catch (error) {
    console.error("Migration error:", error);
    results.errors.push({
      deckName: "GENERAL",
      error: error.message,
    });
  }

  return results;
};

/**
 * Check if user has local decks that need migration
 */
export const hasLocalDecks = () => {
  const localDecksJSON = localStorage.getItem("cyberpunk_decks");

  if (!localDecksJSON) return false;

  try {
    const localDecks = JSON.parse(localDecksJSON);
    return Array.isArray(localDecks) && localDecks.length > 0;
  } catch {
    return false;
  }
};
