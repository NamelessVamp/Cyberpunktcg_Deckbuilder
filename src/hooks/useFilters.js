// NON OMNIS MORIAR — useFilters.js
// EX MACHINA — Custom hook: filter state + filteredCards logic
// Extraído de App.jsx (Fase 16 — Refactor Arquitectura)
import { useState, useMemo } from "react";
import * as collectionService from "../lib/collectionService";

const INITIAL_FILTERS = {
  types: [],
  factions: [],
  costMin: 0,
  costMax: 9,
  powerMin: 0,
  powerMax: 15,
  ramMin: 1,
  ramMax: 5,
  ramColors: [],
  keywords: [],
  set: "",
  showOnlyNew: false,
  artists: [],
  cardNumber: "",
};

export function useFilters({ cards, collection, user, isNewCard }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setFiltersOpen(false);
  };

  const filteredCards = useMemo(
    () =>
      cards.filter((card) => {
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          const matchesSearch =
            card.name.toLowerCase().includes(search) ||
            (card.subtitle && card.subtitle.toLowerCase().includes(search)) ||
            (card.text && card.text.toLowerCase().includes(search)) ||
            (card.keywords &&
              card.keywords.some((k) => k.toLowerCase().includes(search)));
          if (!matchesSearch) return false;
        }

        if (filters.types?.length > 0 && !filters.types.includes(card.type))
          return false;

        if (filters.factions?.length > 0) {
          const cardFactions = Array.isArray(card.faction)
            ? card.faction
            : card.faction
              ? [card.faction]
              : [];
          if (!filters.factions.some((f) => cardFactions.includes(f)))
            return false;
        }
        if (filters.set && card.set !== filters.set) return false;

        // Fase 11 — Enhanced Filters
        if (
          filters.artists?.length > 0 &&
          !filters.artists.includes(card.artist)
        )
          return false;
        if (filters.cardNumber?.trim()) {
          const numSearch = filters.cardNumber.trim().toLowerCase();
          if (!(card.number || "").toLowerCase().includes(numSearch))
            return false;
        }

        if (filters.keywords?.length > 0) {
          const cardKeywords = card.keywords || [];
          if (!filters.keywords.every((k) => cardKeywords.includes(k)))
            return false;
        }

        if (
          card.cost !== undefined &&
          (card.cost < filters.costMin || card.cost > filters.costMax)
        )
          return false;
        if (
          card.power !== undefined &&
          (card.power < filters.powerMin || card.power > filters.powerMax)
        )
          return false;
        if (
          card.ram !== undefined &&
          card.ram !== null &&
          (card.ram < filters.ramMin || card.ram > filters.ramMax)
        )
          return false;
        if (
          filters.ramColors?.length > 0 &&
          !filters.ramColors.includes(card.ram_color)
        )
          return false;
        if (
          showOwnedOnly &&
          user &&
          !collectionService.ownsCard(collection, card.id)
        )
          return false;
        if (filters.showOnlyNew && !isNewCard(card)) return false;

        return true;
      }),
    [cards, searchTerm, filters, showOwnedOnly, user, collection, isNewCard],
  );

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filtersOpen,
    setFiltersOpen,
    currentPage,
    setCurrentPage,
    filteredCards,
    resetFilters,
    INITIAL_FILTERS,
    showOwnedOnly,
    setShowOwnedOnly,
  };
}
