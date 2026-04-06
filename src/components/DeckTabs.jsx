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
    <div className="flex gap-2 mb-6 border-b border-term-amber/20 pb-2 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-2 rounded-t font-mono font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === tab.id
              ? "bg-term-amber text-term-black"
              : "bg-term-gray border border-term-amber/40 text-term-amber hover:bg-term-amber/10"
          }`}
        >
          <span>[{tab.label}]</span>
          {tab.isBeta && (
            <span className="px-2 py-0.5 bg-term-green text-term-black text-xs rounded font-bold">
              BETA
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
