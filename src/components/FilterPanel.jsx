import { useState, useEffect } from "react";

export default function FilterPanel({ cards, onFilterChange, isOpen }) {
  const [filters, setFilters] = useState({
    types: [], // CAMBIADO: de "type" a "types" (array)
    faction: [],
    costMin: 0,
    costMax: 9,
    powerMin: 0,
    powerMax: 15,
    ramMin: 1,
    ramMax: 5,
    ramColors: [],
    keywords: [],
    set: "",
  });

  const types = [...new Set(cards.map((c) => c.type))].sort();
  const factions = [
    ...new Set(cards.map((c) => c.faction).filter(Boolean)),
  ].sort();

  // Extract unique keywords from all cards
  const allKeywords = [
    ...new Set(cards.flatMap((c) => c.keywords || [])),
  ].sort();

  // Extract unique sets
  const allSets = [...new Set(cards.map((c) => c.set).filter(Boolean))].sort();

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      types: [], // CAMBIADO
      faction: [],
      costMin: 0,
      costMax: 9,
      powerMin: 0,
      powerMax: 15,
      ramMin: 1,
      ramMax: 5,
      ramColors: [],
      keywords: [],
      set: "",
    });
  };

  // Toggle keyword in array
  const toggleKeyword = (keyword) => {
    const current = filters.keywords || [];
    const updated = current.includes(keyword)
      ? current.filter((k) => k !== keyword)
      : [...current, keyword];
    updateFilter("keywords", updated);
  };

  // Toggle type in array
  const toggleType = (type) => {
    const current = filters.types || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    updateFilter("types", updated);
  };
  // Toggle faction in array
  const toggleFaction = (faction) => {
    const current = filters.factions || [];
    const updated = current.includes(faction)
      ? current.filter((f) => f !== faction)
      : [...current, faction];
    updateFilter("factions", updated);
  };

  // Toggle RAM color
  const toggleRamColor = (color) => {
    const current = filters.ramColors || [];
    const updated = current.includes(color)
      ? current.filter((c) => c !== color)
      : [...current, color];
    updateFilter("ramColors", updated);
  };

  if (!isOpen) return null;

  return (
    <div className="mb-6 p-4 card-container animate-slideDown">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-term-amber font-bold text-lg font-mono">
          FILTERS.SYS
        </h2>
        <button
          onClick={resetFilters}
          className="text-term-amber/80 text-sm hover:text-term-amber transition-colors font-mono"
        >
          [RESET]
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* SET FILTER */}
        <div>
          <label className="text-term-amber/80 text-xs mb-2 block font-mono">
            SET
          </label>
          <select
            value={filters.set}
            onChange={(e) => updateFilter("set", e.target.value)}
            className="bg-term-gray text-term-amber border border-term-amber/30 rounded px-3 py-2 font-mono focus:border-term-amber focus:outline-none w-full"
          >
            <option value="">ALL</option>
            {allSets.map((set) => (
              <option key={set} value={set}>
                {set
                  .replace(" (ALPHA)", "")
                  .replace(" (SPOILER)", "")
                  .replace(" (PROMO)", "")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FACTION FILTER - Checkboxes row */}
      <div className="mt-4 pt-4 border-t border-term-amber/20">
        <label className="block text-term-amber/80 text-xs font-mono mb-3">
          FACTION
        </label>
        <div className="flex flex-wrap gap-2">
          {factions.map((faction) => (
            <label
              key={faction}
              className="flex items-center gap-2 cursor-pointer px-3 py-1.5 bg-term-gray border border-term-amber/30 rounded hover:border-term-amber transition-colors"
            >
              <input
                type="checkbox"
                checked={filters.factions?.includes(faction)}
                onChange={() => toggleFaction(faction)}
                className="w-4 h-4 accent-term-amber"
              />
              <span className="text-term-amber/80 text-sm font-mono">
                {faction}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* TYPE FILTER - NUEVO (Checkboxes row) */}
      <div className="mt-4 pt-4 border-t border-term-amber/20">
        <label className="block text-term-amber/80 text-xs font-mono mb-3">
          TYPE
        </label>
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 cursor-pointer px-3 py-1.5 bg-term-gray border border-term-amber/30 rounded hover:border-term-amber transition-colors"
            >
              <input
                type="checkbox"
                checked={filters.types?.includes(type)}
                onChange={() => toggleType(type)}
                className="w-4 h-4 accent-term-amber"
              />
              <span className="text-term-amber/80 text-sm font-mono">
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* NUMERIC FILTERS ROW */}
      <div className="mt-4 pt-4 border-t border-term-amber/20 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* COST */}
        <div>
          <label className="text-term-amber/80 text-xs mb-2 block font-mono">
            COST
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="0"
              max="9"
              value={filters.costMin}
              onChange={(e) => updateFilter("costMin", Number(e.target.value))}
              className="input-terminal w-16 text-sm text-center"
            />
            <span className="text-term-amber">-</span>
            <input
              type="number"
              min="0"
              max="9"
              value={filters.costMax}
              onChange={(e) => updateFilter("costMax", Number(e.target.value))}
              className="input-terminal w-16 text-sm text-center"
            />
          </div>
        </div>

        {/* POWER */}
        <div>
          <label className="text-term-amber/80 text-xs mb-2 block font-mono">
            POWER
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="0"
              max="15"
              value={filters.powerMin}
              onChange={(e) => updateFilter("powerMin", Number(e.target.value))}
              className="input-terminal w-16 text-sm text-center"
            />
            <span className="text-term-amber">-</span>
            <input
              type="number"
              min="0"
              max="15"
              value={filters.powerMax}
              onChange={(e) => updateFilter("powerMax", Number(e.target.value))}
              className="input-terminal w-16 text-sm text-center"
            />
          </div>
        </div>

        {/* RAM */}
        <div>
          <label className="text-term-amber/80 text-xs mb-2 block font-mono">
            RAM
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="1"
              max="5"
              value={filters.ramMin}
              onChange={(e) => updateFilter("ramMin", Number(e.target.value))}
              className="input-terminal w-16 text-sm text-center"
            />
            <span className="text-term-amber">-</span>
            <input
              type="number"
              min="1"
              max="5"
              value={filters.ramMax}
              onChange={(e) => updateFilter("ramMax", Number(e.target.value))}
              className="input-terminal w-16 text-sm text-center"
            />
          </div>
        </div>
      </div>

      {/* KEYWORDS FILTER - NUEVO (Full width row) */}
      {allKeywords.length > 0 && (
        <div className="mt-4 pt-4 border-t border-term-amber/20">
          <label className="block text-term-amber/80 text-xs font-mono mb-3">
            KEYWORDS
          </label>
          <div className="flex flex-wrap gap-2">
            {allKeywords.map((keyword) => (
              <label
                key={keyword}
                className="flex items-center gap-2 cursor-pointer px-3 py-1.5 bg-term-gray border border-term-amber/30 rounded hover:border-term-amber transition-colors"
              >
                <input
                  type="checkbox"
                  checked={filters.keywords?.includes(keyword)}
                  onChange={() => toggleKeyword(keyword)}
                  className="w-4 h-4 accent-term-amber"
                />
                <span className="text-term-amber/80 text-sm font-mono">
                  {keyword}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* RAM COLOR - Full width row */}
      <div className="mt-4 pt-4 border-t border-term-amber/20">
        <label className="block text-term-amber/80 text-xs font-mono mb-3">
          RAM COLOR
        </label>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 bg-term-gray border border-term-amber/30 rounded hover:border-term-amber transition-colors">
            <input
              type="checkbox"
              checked={filters.ramColors?.includes("Red")}
              onChange={() => toggleRamColor("Red")}
              className="w-4 h-4 accent-term-red"
            />
            <span className="w-4 h-4 rounded-full bg-term-red"></span>
            <span className="text-term-amber/80 text-sm font-mono">Red</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 bg-term-gray border border-term-amber/30 rounded hover:border-term-amber transition-colors">
            <input
              type="checkbox"
              checked={filters.ramColors?.includes("Yellow")}
              onChange={() => toggleRamColor("Yellow")}
              className="w-4 h-4 accent-term-amber"
            />
            <span className="w-4 h-4 rounded-full bg-term-amber"></span>
            <span className="text-term-amber/80 text-sm font-mono">Yellow</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 bg-term-gray border border-term-amber/30 rounded hover:border-term-amber transition-colors">
            <input
              type="checkbox"
              checked={filters.ramColors?.includes("Green")}
              onChange={() => toggleRamColor("Green")}
              className="w-4 h-4 accent-term-green"
            />
            <span className="w-4 h-4 rounded-full bg-term-green"></span>
            <span className="text-term-amber/80 text-sm font-mono">Green</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 bg-term-gray border border-term-amber/30 rounded hover:border-term-amber transition-colors">
            <input
              type="checkbox"
              checked={filters.ramColors?.includes("Blue")}
              onChange={() => toggleRamColor("Blue")}
              className="w-4 h-4 accent-term-blue"
            />
            <span className="w-4 h-4 rounded-full bg-term-blue"></span>
            <span className="text-term-amber/80 text-sm font-mono">Blue</span>
          </label>
        </div>
      </div>
    </div>
  );
}
