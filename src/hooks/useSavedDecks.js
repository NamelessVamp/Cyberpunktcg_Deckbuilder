// NON OMNIS MORIAR — useSavedDecks.js
// EX MACHINA — Custom hook: saved decks CRUD + publish/unpublish
// Extraído de App.jsx (Fase 16 — Refactor Arquitectura)
import { useState } from "react";
import * as deckService from "../lib/deckService";
import * as communityService from "../lib/communityService";

export function useSavedDecks({
  user,
  cards,
  deck,
  showToast,
  setDeck,
  setActiveTab,
  setConfirmModal,
}) {
  const [savedDecks, setSavedDecks] = useState([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);

  // ── SAVE ──────────────────────────────────────────────────────────────────
  const handleSaveDeck = async (deckName, deckNotes = "") => {
    if (user) {
      try {
        const savedDeck = await deckService.saveDeck(
          user.id,
          deckName,
          deck,
          deckNotes,
        );
        const appDeck = {
          id: savedDeck.id,
          name: savedDeck.name,
          notes: savedDeck.notes || "",
          deck: deckService.supabaseToDeck(savedDeck, cards),
          createdAt: savedDeck.created_at,
          updatedAt: savedDeck.updated_at,
        };
        setSavedDecks((prev) => [appDeck, ...prev]);
        showToast(`Deck "${deckName}" saved to cloud!`, "success");
      } catch (error) {
        console.error("Error saving deck:", error);
        showToast("Error saving deck to cloud", "error");
      }
    } else {
      const newDeck = {
        id: Date.now().toString(),
        name: deckName,
        notes: deckNotes,
        deck: { legends: [...deck.legends], mainDeck: [...deck.mainDeck] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [...savedDecks, newDeck];
      setSavedDecks(updated);
      localStorage.setItem("cyberpunk_decks", JSON.stringify(updated));
      showToast(`Deck "${deckName}" saved locally!`, "warning");
    }
  };

  // ── LOAD ──────────────────────────────────────────────────────────────────
  const handleLoadDeck = (savedDeck) => {
    setDeck(savedDeck.deck);
    setActiveTab("build");
    showToast(`Deck "${savedDeck.name}" loaded!`, "success");
  };

  // ── DELETE ─────────────────────────────────────────────────────────────────
  const handleDeleteDeck = (deckId) => {
    const deckToDelete = savedDecks.find((d) => d.id === deckId);
    setConfirmModal({
      title: "DELETE DECK",
      message: `Are you sure you want to delete "${deckToDelete?.name}"? This cannot be undone.`,
      onConfirm: async () => {
        try {
          if (user) await deckService.deleteDeck(deckId);
          const updated = savedDecks.filter((d) => d.id !== deckId);
          setSavedDecks(updated);
          if (!user)
            localStorage.setItem("cyberpunk_decks", JSON.stringify(updated));
          showToast("Deck deleted", "success");
          setConfirmModal(null);
        } catch (error) {
          console.error("Error deleting deck:", error);
          showToast("Error deleting deck", "error");
          setConfirmModal(null);
        }
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  // ── DUPLICATE ─────────────────────────────────────────────────────────────
  const handleDuplicateDeck = async (deckId) => {
    const deckToDuplicate = savedDecks.find((d) => d.id === deckId);
    if (!deckToDuplicate) return;

    if (user) {
      try {
        const duplicatedDeck = await deckService.duplicateDeck(
          user.id,
          deckId,
          cards,
        );
        const appDeck = {
          id: duplicatedDeck.id,
          name: duplicatedDeck.name,
          notes: duplicatedDeck.notes || "",
          deck: deckService.supabaseToDeck(duplicatedDeck, cards),
          createdAt: duplicatedDeck.created_at,
          updatedAt: duplicatedDeck.updated_at,
        };
        setSavedDecks((prev) => [appDeck, ...prev]);
        showToast(`Deck "${appDeck.name}" created!`, "success");
      } catch (error) {
        console.error("Error duplicating deck:", error);
        showToast("Error duplicating deck", "error");
      }
    } else {
      const duplicatedDeck = {
        id: Date.now().toString(),
        name: `${deckToDuplicate.name} (Copy)`,
        notes: deckToDuplicate.notes || "",
        deck: {
          legends: [...deckToDuplicate.deck.legends],
          mainDeck: [...deckToDuplicate.deck.mainDeck],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [...savedDecks, duplicatedDeck];
      setSavedDecks(updated);
      localStorage.setItem("cyberpunk_decks", JSON.stringify(updated));
      showToast(`Deck "${duplicatedDeck.name}" created!`, "success");
    }
  };

  // ── RENAME ─────────────────────────────────────────────────────────────────
  const handleRenameDeck = async (deckId) => {
    const deckToRename = savedDecks.find((d) => d.id === deckId);
    if (!deckToRename) return;

    const newName = prompt("Enter new deck name:", deckToRename.name);
    if (!newName || newName.trim() === "") {
      showToast("Deck name cannot be empty", "warning");
      return;
    }
    if (newName === deckToRename.name) return;

    if (user) {
      try {
        await deckService.updateDeck(
          deckId,
          newName.trim(),
          deckToRename.deck,
          deckToRename.notes,
        );
        setSavedDecks((prev) =>
          prev.map((d) =>
            d.id === deckId
              ? {
                  ...d,
                  name: newName.trim(),
                  updatedAt: new Date().toISOString(),
                }
              : d,
          ),
        );
        showToast(`Deck renamed to "${newName.trim()}"`, "success");
      } catch (error) {
        console.error("Error renaming deck:", error);
        showToast("Error renaming deck", "error");
      }
    } else {
      const updated = savedDecks.map((d) =>
        d.id === deckId
          ? { ...d, name: newName.trim(), updatedAt: new Date().toISOString() }
          : d,
      );
      setSavedDecks(updated);
      localStorage.setItem("cyberpunk_decks", JSON.stringify(updated));
      showToast(`Deck renamed to "${newName.trim()}"`, "success");
    }
  };

  // ── EXPORT / IMPORT ALL ────────────────────────────────────────────────────
  const handleExportAllDecks = () => {
    if (savedDecks.length === 0) {
      showToast("No decks to export", "warning");
      return;
    }
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      decks: savedDecks,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cyberpunk_decks_backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${savedDecks.length} decks successfully!`, "success");
  };

  const handleImportAllDecks = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importData = JSON.parse(event.target.result);
          if (!importData.decks || !Array.isArray(importData.decks)) {
            showToast("Invalid backup file format", "error");
            return;
          }
          const existingIds = new Set(savedDecks.map((d) => d.id));
          const newDecks = importData.decks.filter(
            (d) => !existingIds.has(d.id),
          );
          if (newDecks.length === 0) {
            showToast("All decks already exist", "warning");
            return;
          }
          const merged = [...savedDecks, ...newDecks];
          setSavedDecks(merged);
          localStorage.setItem("cyberpunk_decks", JSON.stringify(merged));
          showToast(
            `Imported ${newDecks.length} new decks! (${importData.decks.length - newDecks.length} duplicates skipped)`,
            "success",
          );
        } catch (error) {
          console.error("Import error:", error);
          showToast("Failed to import decks. Invalid file.", "error");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // ── PUBLISH / UNPUBLISH ────────────────────────────────────────────────────
  const handleConfirmPublish = async ({
    deckToPublish,
    description,
    archetype,
    setShowPublishModal,
    setDeckToPublish,
  }) => {
    if (!deckToPublish) return;
    try {
      await communityService.publishDeck(deckToPublish.id, description);
      if (archetype)
        await communityService.updatePublicDeck(deckToPublish.id, {
          archetype,
        });
      setSavedDecks((prev) =>
        prev.map((d) =>
          d.id === deckToPublish.id
            ? { ...d, deck: { ...d.deck, visibility: "public" } }
            : d,
        ),
      );
      showToast("Deck published to the Black Market ▓", "success");
    } catch (err) {
      console.error("Publish error:", err);
      showToast("Error publishing deck", "error");
    } finally {
      setShowPublishModal(false);
      setDeckToPublish(null);
    }
  };

  const handleUnpublishDeck = async (deckId) => {
    try {
      await communityService.unpublishDeck(deckId);
      setSavedDecks((prev) =>
        prev.map((d) =>
          d.id === deckId
            ? { ...d, deck: { ...d.deck, visibility: "private" } }
            : d,
        ),
      );
      showToast("Deck removed from Black Market", "success");
    } catch (err) {
      console.error("Unpublish error:", err);
      showToast("Error unpublishing deck", "error");
    }
  };

  return {
    savedDecks,
    setSavedDecks,
    isLoadingDecks,
    setIsLoadingDecks,
    handleSaveDeck,
    handleLoadDeck,
    handleDeleteDeck,
    handleDuplicateDeck,
    handleRenameDeck,
    handleExportAllDecks,
    handleImportAllDecks,
    handleConfirmPublish,
    handleUnpublishDeck,
  };
}
