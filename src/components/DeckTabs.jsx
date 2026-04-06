import { useFeatureFlag } from "../hooks/useFeatureFlag";

export default function DeckTabs({ activeTab, onTabChange }) {
  // Check if user can access simulator (admin-only)
  const { isEnabled: canAccessSimulator } = useFeatureFlag("phase9_simulator");

  const tabs = [
    { id: "home", label: "HOME", icon: "🏠" },
    { id: "build", label: "BUILD", icon: "🔨" },
    { id: "mydecks", label: "MY DECKS", icon: "📚" },
    { id: "precon", label: "PRECON", icon: "📦" },
    { id: "practice", label: "PRACTICE", icon: "🎯" },
    { id: "packs", label: "PACKS", icon: "🎁" },
    { id: "collection", label: "COLLECTION", icon: "💎" },
    { id: "legal", label: "LEGAL", icon: "⚖️" },
    // ADMIN-ONLY: Simulator Beta tab
    ...(canAccessSimulator
      ? [{ id: "simulator", label: "SIMULATOR", icon: "🎮", isBeta: true }]
      : []),
  ];

  return (
    <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-term-amber/20 pb-2 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex-shrink-0
            px-1.5 sm:px-4 md:px-6 
            py-1 sm:py-2 
            rounded-t 
            font-mono font-bold 
            transition-colors 
            touch-optimized
            flex items-center justify-center gap-1 sm:gap-2
            text-[9px] xs:text-[10px] sm:text-sm md:text-base
            leading-tight
            ${
              activeTab === tab.id
                ? "bg-term-amber text-term-black"
                : "bg-term-gray border border-term-amber/40 text-term-amber hover:bg-term-amber/10 active:bg-term-amber/20"
            }
          `}
          aria-label={`${tab.label} tab`}
          aria-current={activeTab === tab.id ? "page" : undefined}
        >
          {/* Brackets hidden on mobile */}
          <span className="hidden sm:inline">[</span>

          {/* Text always visible */}
          <span className="whitespace-nowrap">{tab.label}</span>

          <span className="hidden sm:inline">]</span>

          {/* Beta badge */}
          {tab.isBeta && (
            <span className="px-1 sm:px-2 py-0.5 bg-term-green text-term-black text-[8px] sm:text-xs rounded font-bold whitespace-nowrap">
              BETA
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
