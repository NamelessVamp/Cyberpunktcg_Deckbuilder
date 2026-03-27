export default function DeckTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: "build", label: "BUILD" },
    { id: "mydecks", label: "MY DECKS" },
    { id: "precon", label: "PRECON DECKS" },
  ];

  return (
    <div className="flex gap-2 mb-6 border-b border-term-amber/20 pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-2 rounded-t font-mono font-bold transition-colors ${
            activeTab === tab.id
              ? "bg-term-amber text-term-black"
              : "bg-term-gray border border-term-amber/40 text-term-amber hover:bg-term-amber/10"
          }`}
        >
          [{tab.label}]
        </button>
      ))}
    </div>
  );
}
