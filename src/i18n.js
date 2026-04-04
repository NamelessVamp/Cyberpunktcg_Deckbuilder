import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Importamos tus JSON actuales
import enRes from "./i18n/translations/en.json";
import esRes from "./i18n/translations/es.json";
import ptRes from "./i18n/translations/pt.json";
import "./i18n";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enRes },
      es: { translation: esRes },
      pt: { translation: ptRes },
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
