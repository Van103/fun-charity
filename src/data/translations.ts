import type { Language } from "@/contexts/LanguageContext";

interface TranslationValue {
  en: string;
  vi: string;
  zh: string;
  ja: string;
  ko: string;
  th: string;
  fr: string;
  de: string;
  es: string;
  pt: string;
  ru: string;
  ar: string;
  hi: string;
}

export interface Translations {
  [key: string]: TranslationValue;
}

// This file is auto-extracted from LanguageContext.tsx for code-splitting
// All translations are lazy-loaded to reduce initial bundle size
let _translations: Translations | null = null;

export async function loadTranslations(): Promise<Translations> {
  if (_translations) return _translations;
  const mod = await import('./translations-data');
  _translations = mod.translations;
  return _translations;
}

export function getTranslationsSync(): Translations | null {
  return _translations;
}
