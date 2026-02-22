import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import type { Translations } from "@/data/translations";

export type Language = "en" | "vi" | "zh" | "ja" | "ko" | "th" | "fr" | "de" | "es" | "pt" | "ru" | "ar" | "hi";

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "/flags/vi.png" },
  { code: "en", name: "English", nativeName: "English", flag: "/flags/en.png" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "/flags/zh.png" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "/flags/ja.png" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "/flags/ko.png" },
  { code: "th", name: "Thai", nativeName: "ภาษาไทย", flag: "/flags/th.png" },
  { code: "fr", name: "French", nativeName: "Français", flag: "/flags/fr.png" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "/flags/de.png" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "/flags/es.png" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "/flags/pt.png" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "/flags/ru.png" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "/flags/ar.png" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "/flags/hi.png" },
];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("app-language");
    return (stored as Language) || "en";
  });
  const [translations, setTranslations] = useState<Translations | null>(null);

  // Lazy load translations
  useEffect(() => {
    import("@/data/translations-data").then((mod) => {
      setTranslations(mod.translations);
    });
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
  };

  const t = useCallback((key: string): string => {
    if (!translations) return key;
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.en;
  }, [translations, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
