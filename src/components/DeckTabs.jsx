import { useLanguage } from "../i18n/LanguageContext";

export default function DeckTabs({ activeTab, onTabChange }) {
  const { t } = useLanguage();

  const tabs = [
    { id: "home", label: t("navigation.home"), icon: "🏠" },
    { id: "build", label: t("navigation.build"), icon: "🔨" },
    { id: "mydecks", label: t("navigation.mydecks"), icon: "📚" },
    { id: "precon", label: t("navigation.precon"), icon: "📦" },
    { id: "practice", label: t("navigation.practice"), icon: "🎯" },
    { id: "packs", label: t("navigation.packs"), icon: "🎁" },
    { id: "collection", label: t("navigation.collection"), icon: "💎" },
    { id: "legal", label: t("navigation.legal"), icon: "⚖️" },
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
