import { createContext, useContext, useState, useEffect } from "react";
import en from "./translations/en.json";
import es from "./translations/es.json";
import pt from "./translations/pt.json";

const LanguageContext = createContext();

const translations = {
  en,
  es,
  pt,
};

export function LanguageProvider({ children }) {
  // Detectar idioma del navegador o usar localStorage
  const getInitialLanguage = () => {
    // 1. Verificar localStorage
    const savedLang = localStorage.getItem("afterlife_language");
    if (savedLang && translations[savedLang]) {
      return savedLang;
    }

    // 2. Detectar idioma del navegador
    const browserLang = navigator.language.split("-")[0]; // "es-MX" → "es"
    if (translations[browserLang]) {
      return browserLang;
    }

    // 3. Default a inglés
    return "en";
  };

  const [language, setLanguage] = useState(getInitialLanguage);

  // Guardar cambios en localStorage
  useEffect(() => {
    localStorage.setItem("afterlife_language", language);
  }, [language]);

  // Función helper para obtener traducciones anidadas
  const t = (key) => {
    const keys = key.split(".");
    let value = translations[language];

    for (const k of keys) {
      if (value && typeof value === "object") {
        value = value[k];
      } else {
        // Si no encuentra la traducción, usar inglés como fallback
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === "object") {
            value = value[fallbackKey];
          } else {
            return key; // Si ni siquiera existe en inglés, retornar la key
          }
        }
        break;
      }
    }

    return value || key;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  const value = {
    language,
    changeLanguage,
    t,
    availableLanguages: [
      { code: "en", name: "English", flag: "🇺🇸" },
      { code: "es", name: "Español", flag: "🇪🇸" },
      { code: "pt", name: "Português", flag: "🇧🇷" },
    ],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook para usar el contexto
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
