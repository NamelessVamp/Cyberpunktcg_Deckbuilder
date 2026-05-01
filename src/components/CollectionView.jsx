// NON OMNIS MORIAR — CollectionView v2: owned vs missing gallery
import { useState } from "react";
import SmartCardImage from "./SmartCardImage";
import * as collectionService from "../lib/collectionService";

export default function CollectionView({
  collection,
  allCards,
  onAddToCollection,
  onRemoveFromCollection,
  onViewCard,
  wishlistIds,
  onToggleWishlist,
  isLoggedIn,
  onOpenScanner,
}) {
  const [viewFilter, setViewFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const stats = {
    totalCards: collection.reduce((sum, item) => sum + item.quantity, 0),
    uniqueOwned: collection.length,
    totalPossible: allCards.length,
    completionPercent: Math.round((collection.length / allCards.length) * 100),
    wishlistCount: wishlistIds.size,
  };

  const sortedCards = [...allCards].sort((a, b) => {
    if (sortBy === "cost") return (a.cost ?? 0) - (b.cost ?? 0);
    if (sortBy === "type") return a.type.localeCompare(b.type);
    return a.name.localeCompare(b.name);
  });

  const displayCards = sortedCards.filter((card) => {
    const owned = collectionService.ownsCard(collection, card.id);
    if (viewFilter === "owned") return owned;
    if (viewFilter === "missing") return !owned;
    if (viewFilter === "wishlist") return wishlistIds.has(card.id);
    return true;
  });

  const filterBtns = [
    { id: "all", label: `ALL (${allCards.length})` },
    { id: "owned", label: `OWNED (${stats.uniqueOwned})` },
    {
      id: "missing",
      label: `MISSING (${stats.totalPossible - stats.uniqueOwned})`,
    },
    { id: "wishlist", label: `WISHLIST (${stats.wishlistCount})` },
  ];

  return (
    <div>
      {/* Stats Header */}
      <div className="mb-6 p-4 bg-term-gray border-2 border-term-amber/40 rounded">
        <h2 className="text-term-amber font-bold text-xl font-mono mb-3">
          MY_COLLECTION.DAT
        </h2>

        {/* Scanner button */}
        {isLoggedIn && onOpenScanner && (
          <button
            onClick={onOpenScanner}
            className="mb-4 bg-term-amber text-term-black font-mono font-bold px-4 py-2 rounded hover:bg-amber-400 transition-colors min-h-[44px] flex items-center justify-center gap-2"
          >
            <span>[SCAN_CARD.EXE]</span>
          </button>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-term-green/60 text-xs font-mono mb-1">
              TOTAL COPIES
            </p>
            <p className="text-term-green font-bold text-2xl font-mono">
              {stats.totalCards}
            </p>
          </div>
          <div>
            <p className="text-term-amber/60 text-xs font-mono mb-1">
              UNIQUE OWNED
            </p>
            <p className="text-term-amber font-bold text-2xl font-mono">
              {stats.uniqueOwned}
            </p>
          </div>
          <div>
            <p className="text-term-blue/60 text-xs font-mono mb-1">
              COMPLETION
            </p>
            <p className="text-term-blue font-bold text-2xl font-mono">
              {stats.completionPercent}%
            </p>
          </div>
          <div>
            <p className="text-term-red/60 text-xs font-mono mb-1">MISSING</p>
            <p className="text-term-red font-bold text-2xl font-mono">
              {stats.totalPossible - stats.uniqueOwned}
            </p>
          </div>
        </div>
        <div className="mt-4 h-2 bg-term-gray-light rounded overflow-hidden">
          <div
            className="h-full bg-term-green transition-all duration-500"
            style={{ width: `${stats.completionPercent}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4 items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {filterBtns.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setViewFilter(btn.id)}
              className={`px-3 py-1.5 rounded font-mono font-bold text-xs transition-colors ${
                viewFilter === btn.id
                  ? "bg-term-amber text-term-black"
                  : "border border-term-amber/40 text-term-amber hover:bg-term-amber/10"
              }`}
            >
              [{btn.label}]
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-term-gray border border-term-amber/40 text-term-amber px-3 py-1.5 rounded font-mono text-xs"
        >
          <option value="name">SORT: NAME</option>
          <option value="cost">SORT: COST</option>
          <option value="type">SORT: TYPE</option>
        </select>
      </div>

      {/* Empty state */}
      {displayCards.length === 0 && (
        <div className="text-center py-16">
          <p className="text-term-amber/60 text-lg font-mono mb-2">
            NO CARDS FOUND
          </p>
          <p className="text-term-green/40 text-sm font-mono">
            {viewFilter === "owned" &&
              "Add cards from [BUILD] to your collection"}
            {viewFilter === "missing" && "You own all cards! Congrats, choom."}
            {viewFilter === "wishlist" &&
              "Star cards in [BUILD] to add them here"}
            {viewFilter === "all" && "No cards in database"}
          </p>
        </div>
      )}

      {/* Card Grid — ALL cards, owned full color, missing grayed */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
        {displayCards.map((card) => {
          const qty = collectionService.getCardQuantity(collection, card.id);
          const owned = qty > 0;
          const inWishlist = wishlistIds.has(card.id);

          return (
            <div
              key={card.id}
              className={`relative rounded overflow-hidden border-2 transition-all duration-200 group ${
                owned
                  ? "border-term-green/50 hover:border-term-green"
                  : "border-term-amber/15 hover:border-term-amber/40"
              }`}
            >
              <div
                className="relative cursor-pointer"
                onClick={() => onViewCard(card)}
              >
                <SmartCardImage
                  card={card}
                  className={`w-full h-auto transition-all duration-200 ${
                    owned ? "" : "grayscale opacity-40 group-hover:opacity-60"
                  }`}
                  showLoadingState={true}
                />

                {/* Owned qty badge */}
                {owned && (
                  <div className="absolute top-2 left-2 bg-term-green text-term-black font-mono font-bold text-xs px-2 py-0.5 rounded">
                    x{qty}
                  </div>
                )}

                {/* NOT OWNED overlay on hover */}
                {!owned && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-term-red font-mono font-bold text-xs bg-black/70 px-2 py-1 rounded">
                      NOT OWNED
                    </span>
                  </div>
                )}

                {/* Wishlist star */}
                {isLoggedIn && onToggleWishlist && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(card.id);
                    }}
                    className={`absolute top-2 right-2 text-lg leading-none transition-all select-none ${
                      inWishlist
                        ? "opacity-100 text-term-amber drop-shadow-[0_0_6px_#ffb300]"
                        : "opacity-0 group-hover:opacity-60 text-term-amber"
                    }`}
                    title={
                      inWishlist ? "Quitar de wishlist" : "Agregar a wishlist"
                    }
                  >
                    {inWishlist ? "★" : "☆"}
                  </button>
                )}
              </div>

              {/* Card footer */}
              <div className="bg-term-gray px-2 py-1.5">
                <p
                  className={`font-bold font-mono text-xs truncate ${owned ? "text-term-green" : "text-term-amber/50"}`}
                >
                  {card.name}
                </p>
                <div className="flex justify-between items-center mt-0.5">
                  <span className="text-term-amber/60 font-mono text-[10px]">
                    {card.type}
                  </span>
                  {card.cost !== undefined && (
                    <span className="text-term-blue font-mono text-[10px]">
                      €{card.cost}
                    </span>
                  )}
                </div>
                {isLoggedIn && (
                  <div className="grid grid-cols-2 gap-1 mt-1.5">
                    <button
                      onClick={() => onAddToCollection(card.id, 1)}
                      className="bg-term-green/20 border border-term-green/60 text-term-green px-1 py-0.5 rounded font-mono font-bold text-xs hover:bg-term-green/30 transition-colors"
                    >
                      [+]
                    </button>
                    <button
                      onClick={() => onRemoveFromCollection(card.id, 1)}
                      disabled={!owned}
                      className="bg-term-red/20 border border-term-red/60 text-term-red px-1 py-0.5 rounded font-mono font-bold text-xs hover:bg-term-red/30 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      [-]
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
