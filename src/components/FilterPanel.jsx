import { useState } from "react";

export default function FilterPanel({
  cards,
  filters,
  onFilterChange,
  isOpen,
  showOwnedOnly,
  onToggleOwnedOnly,
  collectionCount,
  isLoggedIn,
}) {
  const [openSection, setOpenSection] = useState(null);

  const types = [...new Set(cards.map((c) => c.type))].sort();
  const rarities = [...new Set(cards.map((c) => c.rarity).filter(Boolean))];
  const factions = [
    ...new Set(
      cards.flatMap((c) =>
        Array.isArray(c.faction) ? c.faction : c.faction ? [c.faction] : [],
      ),
    ),
  ].sort();
  const allKeywords = [
    ...new Set(cards.flatMap((c) => c.keywords || [])),
  ].sort();

  const allSets = [...new Set(cards.map((c) => c.set).filter(Boolean))].sort();
  const allArtists = [
    ...new Set(cards.map((c) => c.artist).filter(Boolean)),
  ].sort();

  const updateFilter = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFilterChange({
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
      showOnlyNew: false, // ← AGREGAR
    });
  };

  const toggleKeyword = (keyword) => {
    const current = filters.keywords || [];
    const updated = current.includes(keyword)
      ? current.filter((k) => k !== keyword)
      : [...current, keyword];
    updateFilter("keywords", updated);
  };

  const toggleType = (type) => {
    const current = filters.types || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    updateFilter("types", updated);
  };

  const toggleFaction = (faction) => {
    const current = filters.factions || [];
    const updated = current.includes(faction)
      ? current.filter((f) => f !== faction)
      : [...current, faction];
    updateFilter("factions", updated);
  };

  const toggleRamColor = (color) => {
    const current = filters.ramColors || [];
    const updated = current.includes(color)
      ? current.filter((c) => c !== color)
      : [...current, color];
    updateFilter("ramColors", updated);
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  if (!isOpen) return null;

  // Dropdown Button Component
  const DropdownButton = ({ section, label, activeCount }) => (
    <button
      onClick={() => toggleSection(section)}
      className={`px-3 sm:px-4 py-2 rounded font-mono font-bold text-xs sm:text-sm transition-all border min-w-[80px] sm:min-w-[100px] ${
        openSection === section
          ? "bg-term-amber text-term-black border-term-amber"
          : activeCount > 0
            ? "bg-term-amber/20 text-term-amber border-term-amber/60"
            : "bg-term-gray text-term-amber/80 border-term-amber/30 hover:border-term-amber/60"
      }`}
    >
      {label}
      {activeCount > 0 && ` (${activeCount})`}
      <span className="ml-2">{openSection === section ? "▲" : "▼"}</span>
    </button>
  );

  return (
    <div className="mb-6 p-4 card-container animate-slideDown">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-term-amber font-bold text-base sm:text-lg font-mono">
          FILTERS.SYS
        </h2>
        <button
          onClick={resetFilters}
          className="text-term-amber/80 text-xs sm:text-sm hover:text-term-amber transition-colors font-mono"
        >
          [RESET]
        </button>
      </div>

      {/* COLLECTION FILTER - FIRST */}
      {isLoggedIn && collectionCount > 0 && (
        <div className="mb-4 pb-4 border-b border-term-amber/20">
          <h3 className="text-term-green/80 font-bold text-sm mb-2 font-mono">
            COLLECTION
          </h3>

          <label className="flex items-center gap-2 cursor-pointer bg-term-gray-light p-2 rounded hover:bg-term-gray transition-colors">
            <input
              type="checkbox"
              checked={showOwnedOnly}
              onChange={(e) => onToggleOwnedOnly(e.target.checked)}
              className="w-4 h-4 accent-term-green"
            />
            <span className="text-term-green font-mono text-sm">
              Show only owned cards
            </span>
          </label>

          <p className="text-term-amber/60 text-xs font-mono mt-2">
            {collectionCount} unique cards owned
          </p>
        </div>
      )}

      {/* DROPDOWN BUTTONS ROW + NEW FILTER CHECKBOX */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <DropdownButton
          section="color"
          label="Color"
          activeCount={filters.ramColors?.length || 0}
        />
        <DropdownButton
          section="type"
          label="Type"
          activeCount={filters.types?.length || 0}
        />
        <DropdownButton
          section="faction"
          label="Faction"
          activeCount={filters.factions?.length || 0}
        />
        <DropdownButton
          section="keyword"
          label="Keyword"
          activeCount={filters.keywords?.length || 0}
        />
        <DropdownButton section="cost" label="Cost" activeCount={0} />
        <DropdownButton section="power" label="Power" activeCount={0} />
        <DropdownButton section="ram" label="RAM" activeCount={0} />
        <DropdownButton
          section="set"
          label="Set"
          activeCount={filters.set ? 1 : 0}
        />
        <DropdownButton
          section="artist"
          label="Artist"
          activeCount={filters.artists?.length || 0}
        />
        <DropdownButton
          section="number"
          label="Card #"
          activeCount={filters.cardNumber ? 1 : 0}
        />

        {/* NEW CARDS CHECKBOX - A LA DERECHA */}
        <label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-term-gray border border-term-amber/30 rounded hover:border-term-amber transition-colors">
          <input
            type="checkbox"
            checked={filters.showOnlyNew || false}
            onChange={(e) => updateFilter("showOnlyNew", e.target.checked)}
            className="w-4 h-4 accent-term-green cursor-pointer"
          />
          <span className="text-term-amber/80 text-sm font-mono whitespace-nowrap">
            New Only
          </span>
        </label>
      </div>

      {/* COLOR SECTION */}
      {openSection === "color" && (
        <div className="mb-4 p-4 bg-term-gray-light rounded border border-term-amber/30 animate-slideDown">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
              <span className="text-term-amber/80 text-sm font-mono">
                Yellow
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 bg-term-gray border border-term-amber/30 rounded hover:border-term-amber transition-colors">
              <input
                type="checkbox"
                checked={filters.ramColors?.includes("Green")}
                onChange={() => toggleRamColor("Green")}
                className="w-4 h-4 accent-term-green"
              />
              <span className="w-4 h-4 rounded-full bg-term-green"></span>
              <span className="text-term-amber/80 text-sm font-mono">
                Green
              </span>
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
      )}

      {/* TYPE SECTION */}
      {openSection === "type" && (
        <div className="mb-4 p-4 bg-term-gray-light rounded border border-term-amber/30 animate-slideDown">
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
      )}

      {/* FACTION SECTION */}
      {openSection === "faction" && (
        <div className="mb-4 p-4 bg-term-gray-light rounded border border-term-amber/30 animate-slideDown">
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
      )}

      {/* KEYWORD SECTION */}
      {openSection === "keyword" && (
        <div className="mb-4 p-4 bg-term-gray-light rounded border border-term-amber/30 animate-slideDown">
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

      {/* COST SECTION */}
      {openSection === "cost" && (
        <div className="mb-4 p-4 bg-term-gray-light rounded border border-term-amber/30 animate-slideDown">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="0"
              max="9"
              value={filters.costMin}
              onChange={(e) => updateFilter("costMin", Number(e.target.value))}
              className="input-terminal w-16 sm:w-20 text-sm text-center min-h-[44px]"
            />
            <span className="text-term-amber">-</span>
            <input
              type="number"
              min="0"
              max="9"
              value={filters.costMax}
              onChange={(e) => updateFilter("costMax", Number(e.target.value))}
              className="input-terminal w-16 sm:w-20 text-sm text-center min-h-[44px]"
            />
          </div>
        </div>
      )}

      {/* POWER SECTION */}
      {openSection === "power" && (
        <div className="mb-4 p-4 bg-term-gray-light rounded border border-term-amber/30 animate-slideDown">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="0"
              max="15"
              value={filters.powerMin}
              onChange={(e) => updateFilter("powerMin", Number(e.target.value))}
              className="input-terminal w-16 sm:w-20 text-sm text-center min-h-[44px]"
            />
            <span className="text-term-amber">-</span>
            <input
              type="number"
              min="0"
              max="15"
              value={filters.powerMax}
              onChange={(e) => updateFilter("powerMax", Number(e.target.value))}
              className="input-terminal w-16 sm:w-20 text-sm text-center min-h-[44px]"
            />
          </div>
        </div>
      )}

      {/* RAM SECTION */}
      {openSection === "ram" && (
        <div className="mb-4 p-4 bg-term-gray-light rounded border border-term-amber/30 animate-slideDown">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="1"
              max="5"
              value={filters.ramMin}
              onChange={(e) => updateFilter("ramMin", Number(e.target.value))}
              className="input-terminal w-16 sm:w-20 text-sm text-center min-h-[44px]"
            />
            <span className="text-term-amber">-</span>
            <input
              type="number"
              min="1"
              max="5"
              value={filters.ramMax}
              onChange={(e) => updateFilter("ramMax", Number(e.target.value))}
              className="input-terminal w-16 sm:w-20 text-sm text-center min-h-[44px]"
            />
          </div>
        </div>
      )}

      {/* SET SECTION */}
      {openSection === "set" && (
        <div className="mb-4 p-4 bg-term-gray-light rounded border border-term-amber/30 animate-slideDown">
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
      )}
      {openSection === "artist" && (
        <div className="mb-4 p-4 bg-term-gray-light rounded border border-term-amber/30 animate-slideDown">
          <p className="text-term-amber/60 text-xs font-mono mb-3">
            FILTER BY ARTIST
          </p>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {allArtists.map((artist) => (
              <label
                key={artist}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.artists?.includes(artist) || false}
                  onChange={(e) => {
                    const current = filters.artists || [];
                    updateFilter(
                      "artists",
                      e.target.checked
                        ? [...current, artist]
                        : current.filter((a) => a !== artist),
                    );
                  }}
                  className="accent-term-amber"
                />
                <span className="text-term-amber/80 text-xs font-mono group-hover:text-term-amber truncate max-w-[180px]">
                  {artist}
                </span>
              </label>
            ))}
          </div>
          {(filters.artists?.length || 0) > 0 && (
            <button
              onClick={() => updateFilter("artists", [])}
              className="mt-2 text-term-red text-xs font-mono hover:text-red-400"
            >
              [CLEAR ARTISTS]
            </button>
          )}
        </div>
      )}

      {openSection === "number" && (
        <div className="mb-4 p-4 bg-term-gray-light rounded border border-term-amber/30 animate-slideDown">
          <p className="text-term-amber/60 text-xs font-mono mb-3">
            SEARCH BY CARD NUMBER
          </p>
          <input
            type="text"
            placeholder="e.g. α001, 019, 132a"
            value={filters.cardNumber || ""}
            onChange={(e) => updateFilter("cardNumber", e.target.value)}
            className="w-full bg-term-gray text-term-amber border border-term-amber/30 rounded px-3 py-2 font-mono text-sm focus:border-term-amber focus:outline-none placeholder-term-amber/30"
          />
          {filters.cardNumber && (
            <button
              onClick={() => updateFilter("cardNumber", "")}
              className="mt-2 text-term-red text-xs font-mono hover:text-red-400"
            >
              [CLEAR]
            </button>
          )}
        </div>
      )}
    </div>
  );
}
