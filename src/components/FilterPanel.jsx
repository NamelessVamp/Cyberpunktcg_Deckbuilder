import { useState, useEffect } from "react";

export default function FilterPanel({ cards, onFilterChange, isOpen }) {
  const [filters, setFilters] = useState({
    type: "",
    faction: "",
    costMin: 0,
    costMax: 9,
    powerMin: 0,
    powerMax: 15,
    ramMin: 1,
    ramMax: 5,
  });

  const types = [...new Set(cards.map((c) => c.type))].sort();
  const factions = [
    ...new Set(cards.map((c) => c.faction).filter(Boolean)),
  ].sort();

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      type: "",
      faction: "",
      costMin: 0,
      costMax: 9,
      powerMin: 0,
      powerMax: 15,
      ramMin: 1,
      ramMax: 5,
    });
  };

  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div className="mb-6 p-4 card-container animate-slideDown">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-term-amber font-bold text-lg font-mono">
          FILTERS.SYS
        </h2>
        <button
          onClick={resetFilters}
          className="text-term-green text-sm hover:text-term-amber transition-colors font-mono"
        >
          [RESET]
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* TYPE */}
        <div>
          <label className="text-term-green text-xs mb-2 block font-mono">
            TYPE
          </label>
          <select
            value={filters.type}
            onChange={(e) => updateFilter("type", e.target.value)}
            className="input-terminal w-full text-sm"
          >
            <option value="">ALL</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* FACTION */}
        <div>
          <label className="text-term-green text-xs mb-2 block font-mono">
            FACTION
          </label>
          <select
            value={filters.faction}
            onChange={(e) => updateFilter("faction", e.target.value)}
            className="input-terminal w-full text-sm"
          >
            <option value="">ALL</option>
            {factions.map((faction) => (
              <option key={faction} value={faction}>
                {faction}
              </option>
            ))}
          </select>
        </div>

        {/* COST */}
        <div>
          <label className="text-term-green text-xs mb-2 block font-mono">
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
          <label className="text-term-green text-xs mb-2 block font-mono">
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
          <label className="text-term-green text-xs mb-2 block font-mono">
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
    </div>
  );
}
