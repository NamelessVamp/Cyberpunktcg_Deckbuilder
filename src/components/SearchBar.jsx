import { useState, useEffect } from 'react';

export default function SearchBar({ onSearch, onToggleFilters, filtersOpen }) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, onSearch]);

  return (
    <div className="mb-6 flex gap-3">
      {/* SEARCH INPUT */}
      <input 
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="SEARCH_CARDS.EXE // NAME, TEXT, KEYWORDS..."
        className="input-terminal flex-1 text-lg"
      />
      
      {/* TOGGLE FILTERS BUTTON */}
      <button
        onClick={onToggleFilters}
        className={`px-6 py-2 rounded font-mono font-bold transition-colors ${
          filtersOpen 
            ? 'bg-term-green text-term-black' 
            : 'bg-term-gray border border-term-amber/40 text-term-amber hover:bg-term-amber/10'
        }`}
      >
        {filtersOpen ? '[HIDE]' : '[☰ FILTERS]'}
      </button>
    </div>
  );
}