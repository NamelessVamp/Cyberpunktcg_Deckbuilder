import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

export default function LanguageSwitcher() {
  const { language, changeLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = availableLanguages.find((lang) => lang.code === language);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-term-gray border border-term-green/30 rounded font-mono text-sm text-term-green hover:bg-term-green/10 transition-colors"
        title="Change Language"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="hidden sm:inline">
          {currentLang.code.toUpperCase()}
        </span>
        <span className="text-term-amber">▼</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop para cerrar al hacer click afuera */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-term-gray border-2 border-term-green rounded shadow-lg z-50">
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 font-mono text-sm transition-colors ${
                  language === lang.code
                    ? "bg-term-green/20 text-term-green border-l-4 border-term-green"
                    : "text-term-amber hover:bg-term-amber/10"
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="flex-1 text-left">{lang.name}</span>
                {language === lang.code && (
                  <span className="text-term-green">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
