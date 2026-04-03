import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

export default function SearchBar({
  onSearch,
  onToggleFilters,
  filtersOpen,
  onCloseFilters,
}) {
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    setSearch(e.target.value);
    onSearch(e.target.value);

    // Close filters when user starts typing
    if (e.target.value && filtersOpen && onCloseFilters) {
      onCloseFilters();
    }
  };

  const handleClear = () => {
    setSearch("");
    onSearch("");
  };

  return (
    <div className="mb-4 flex gap-2">
      <div className="flex-1 relative">
        <input
          id="search-input"
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="SEARCH_CARDS.EXE // NAME, TEXT, KEYWORDS..."
          className="input-terminal w-full pr-10"
        />
        {search && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-term-red hover:text-term-red/80 transition-colors font-mono font-bold"
          >
            ✕
          </button>
        )}
      </div>
      <button
        onClick={onToggleFilters}
        className={`px-4 py-2 rounded font-mono font-bold transition-colors ${
          filtersOpen
            ? "bg-term-amber text-term-black"
            : "bg-term-gray border border-term-amber/40 text-term-amber hover:bg-term-amber/10"
        }`}
      >
        {filtersOpen ? "[HIDE]" : "[FILTERS]"}
      </button>
    </div>
  );
}
