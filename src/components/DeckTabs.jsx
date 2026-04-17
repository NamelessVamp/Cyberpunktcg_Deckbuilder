import { useFeatureFlag } from "../hooks/useFeatureFlag";

export default function DeckTabs({
  activeTab,
  onTabChange,
  publicDeckCount = 0,
}) {
  const { isEnabled: canAccessSimulator } = useFeatureFlag("phase9_simulator");

  const tabs = [
    { id: "home", label: "HOME", icon: "🏠" },
    { id: "build", label: "BUILD", icon: "🔨" },
    { id: "collection", label: "COLLECTION", icon: "💎" },
    {
      id: "blackmarket",
      label: "BLACK MARKET",
      icon: "▓",
      badge: publicDeckCount > 0 ? publicDeckCount : null,
    },
    { id: "mydecks", label: "MY DECKS", icon: "📚" },
    { id: "practice", label: "SIMULATOR", icon: "🎯" },
    { id: "packs", label: "PACKS & DRAFT", icon: "🎁" },

    ...(canAccessSimulator
      ? [{ id: "simulator", label: "SIMULATOR", icon: "🎮", isBeta: true }]
      : []),
  ];

  return (
    <div>
      {/* Contenedor relativo para los tabs y el efecto fade */}
      <div className="relative mb-4 sm:mb-6 border-b border-term-amber/20 pb-2">
        <div
          className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide"
          id="tabs-scroll"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex-shrink-0
                px-2 sm:px-3
                py-0.5 sm:py-1
                rounded-t
                font-mono font-bold
                transition-colors
                touch-optimized
                flex items-center justify-center gap-1
                text-[9px] sm:text-xs
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
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.badge && (
                <span className="ml-1 px-1 py-0.5 bg-term-green text-term-black text-[8px] rounded font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Fade indicator — hints at scrollable content on mobile */}
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-term-black to-transparent pointer-events-none sm:hidden" />
      </div>
    </div>
  );
}
