// NON OMNIS MORIAR — useDeckBuilder.js
// EX MACHINA — Custom hook: deck state + all deck mutation logic
// Extraído de App.jsx (Fase 16 — Refactor Arquitectura)
import { useState } from "react";

const EMPTY_DECK = { legends: [], mainDeck: [], sideboard: [] };

export function useDeckBuilder({
  cards,
  showToast,
  resetFilters,
  setFilters,
  setFiltersOpen,
  setActiveTab,
}) {
  const [deck, setDeck] = useState(EMPTY_DECK);
  const [freeBuildMode, setFreeBuildMode] = useState(true);

  // ── ADD TO MAIN DECK / LEGENDS ─────────────────────────────────────────────
  const handleAddToDeck = (card, quantity = 1) => {
    if (card.type === "LEGEND") {
      if (deck.legends.length >= 3) {
        showToast("Ya tienes 3 Leyendas (máximo permitido)", "warning");
        return;
      }
      if (deck.legends.some((l) => l.id === card.id)) {
        showToast("Esta Leyenda ya está en tu deck", "warning");
        return;
      }
      setDeck((prev) => ({ ...prev, legends: [...prev.legends, card] }));
      showToast(`${card.name} added to legends`, "success");
    } else {
      const currentCount = deck.mainDeck.filter((c) => c.id === card.id).length;
      const canAdd = Math.min(quantity, 3 - currentCount);

      if (canAdd === 0) {
        showToast(
          "Ya tienes 3 copias de esta carta (máximo permitido)",
          "warning",
        );
        return;
      }

      const ramBudget = deck.legends.reduce(
        (acc, legend) => {
          if (legend.ram_color && legend.ram) {
            acc[legend.ram_color] = (acc[legend.ram_color] || 0) + legend.ram;
          }
          return acc;
        },
        { Red: 0, Yellow: 0, Green: 0, Blue: 0 },
      );

      if (
        !freeBuildMode &&
        card.ram_color &&
        ramBudget[card.ram_color] < card.ram
      ) {
        showToast(
          `RAM insuficiente: Necesitas ${card.ram} ${card.ram_color} RAM (tienes ${ramBudget[card.ram_color]})`,
          "error",
        );
        return;
      }

      setDeck((prev) => {
        const newMainDeck = [...prev.mainDeck];
        for (let i = 0; i < canAdd; i++) newMainDeck.push(card);
        return { ...prev, mainDeck: newMainDeck };
      });

      if (canAdd < quantity) {
        showToast(
          `${card.name}: Added ${canAdd} ${canAdd === 1 ? "copy" : "copies"} (max 3 reached)`,
          "warning",
        );
      } else {
        showToast(
          `${card.name}: Added ${canAdd} ${canAdd === 1 ? "copy" : "copies"}`,
          "success",
        );
      }
    }
  };

  // ── ADD TO SIDEBOARD ───────────────────────────────────────────────────────
  const handleAddToSideboard = (card, quantity = 1) => {
    if (deck.sideboard.length >= 15) {
      showToast("Sideboard is full (max 15 cards)", "warning");
      return;
    }
    const currentCount = deck.sideboard.filter(
      (c) => c.name === card.name,
    ).length;
    const canAdd = Math.min(quantity, 3 - currentCount);

    if (canAdd === 0) {
      showToast(`Maximum 3 copies of ${card.name} allowed`, "warning");
      return;
    }
    if (deck.sideboard.length + canAdd > 15) {
      showToast(
        `Only ${15 - deck.sideboard.length} slots left in sideboard`,
        "warning",
      );
      return;
    }

    setDeck((prev) => {
      const newSideboard = [...prev.sideboard];
      for (let i = 0; i < canAdd; i++) newSideboard.push(card);
      return { ...prev, sideboard: newSideboard };
    });
    showToast(`Added ${canAdd}x ${card.name} to sideboard`, "success");
  };

  // ── REMOVE CARD ────────────────────────────────────────────────────────────
  const handleRemoveCard = (card, from) => {
    if (from === "legends") {
      setDeck((prev) => ({
        ...prev,
        legends: prev.legends.filter((c) => c.id !== card.id),
      }));
    } else if (from === "sideboard") {
      setDeck((prev) => {
        const index = prev.sideboard.findIndex((c) => c.id === card.id);
        const newSideboard = [...prev.sideboard];
        newSideboard.splice(index, 1);
        return { ...prev, sideboard: newSideboard };
      });
    } else {
      setDeck((prev) => {
        const index = prev.mainDeck.findIndex((c) => c.id === card.id);
        const newDeck = [...prev.mainDeck];
        newDeck.splice(index, 1);
        return { ...prev, mainDeck: newDeck };
      });
    }
  };

  // ── CLEAR DECK ─────────────────────────────────────────────────────────────
  const handleClearDeck = () => {
    setDeck(EMPTY_DECK);
    resetFilters();
  };

  // ── LOAD PRECON ────────────────────────────────────────────────────────────
  const handleLoadPrecon = (preconDeck) => {
    const legends = [];
    const mainDeck = [];

    preconDeck.legends.forEach((legendData) => {
      const card = cards.find((c) => c.id === legendData.id);
      if (card) legends.push(card);
      else console.warn(`Legend not found: ${legendData.id}`);
    });

    Object.entries(preconDeck.mainDeck).forEach(([cardName, count]) => {
      const card = cards.find((c) => {
        const nameLower = c.name.toLowerCase();
        const searchLower = cardName.toLowerCase();
        if (nameLower === searchLower) return true;
        if (c.subtitle) {
          const fullName = `${c.name} (${c.subtitle})`.toLowerCase();
          if (fullName === searchLower) return true;
        }
        return false;
      });
      if (card) {
        for (let i = 0; i < count; i++) mainDeck.push(card);
      } else {
        console.warn(`Card not found: ${cardName}`);
      }
    });

    const deckRamColors = [
      ...new Set(legends.map((c) => c.ram_color).filter(Boolean)),
    ];

    setDeck({ legends, mainDeck, sideboard: [] });
    setFilters({
      types: [],
      factions: [],
      costMin: 0,
      costMax: 9,
      powerMin: 0,
      powerMax: 15,
      ramMin: 1,
      ramMax: 5,
      ramColors: deckRamColors,
      keywords: [],
      set: "",
    });
    setFiltersOpen(false);
    setActiveTab("build");
    showToast(
      `${preconDeck.name} loaded! Gallery auto-filtered to ${deckRamColors.join(" + ")} RAM colors.`,
      "success",
    );
  };

  // ── IMPORT DECK ────────────────────────────────────────────────────────────
  const handleImportDeck = (importedDeck) => {
    setDeck(importedDeck);
    showToast(
      `Deck imported: ${importedDeck.legends.length} Legends, ${importedDeck.mainDeck.length} cards`,
      "success",
    );
  };

  return {
    deck,
    setDeck,
    freeBuildMode,
    setFreeBuildMode,
    handleAddToDeck,
    handleAddToSideboard,
    handleRemoveCard,
    handleClearDeck,
    handleLoadPrecon,
    handleImportDeck,
  };
}
