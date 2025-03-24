// src/i18n/context.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { en } from "./translations/en";
import { bg } from "./translations/bg";

export type Language = "en" | "bg";
type NestedTranslationKeys<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends any[]
      ? never
      : T[K] extends object
        ? `${K}.${NestedTranslationKeys<T[K]>}`
        : never;
}[keyof T & string];

export type TranslationKey = NestedTranslationKeys<typeof en>;
export type Translations = typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isLoading: boolean;
  getNestedTranslation: <T>(key: string) => T;
}

const translations: Record<Language, Translations> = {
  en,
  bg,
};

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = "en",
}) => {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize language from localStorage or browser preferences
  useEffect(() => {
    setIsLoading(true);
    try {
      // First try to get the saved language preference
      const savedLang = localStorage.getItem("language") as Language | null;

      if (savedLang && Object.keys(translations).includes(savedLang)) {
        setLanguageState(savedLang);
      } else {
        // Otherwise, try to detect from browser
        const browserLang = navigator.language.split("-")[0] as Language;
        if (Object.keys(translations).includes(browserLang)) {
          setLanguageState(browserLang);
          localStorage.setItem("language", browserLang);
        }
      }
    } catch (error) {
      console.error("Error initializing language:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update language handler
  const setLanguage = (lang: Language) => {
    if (Object.keys(translations).includes(lang)) {
      setLanguageState(lang);
      try {
        localStorage.setItem("language", lang);
      } catch (error) {
        console.error("Error saving language preference:", error);
      }

      // Update html lang attribute for accessibility
      document.documentElement.lang = lang;
    }
  };

  // Translate function with interpolation support
  const t = (
    key: TranslationKey,
    params?: Record<string, string | number>,
  ): string => {
    // Cast to any so we can dynamically index by a dot-separated key.
    const translationsForLang = translations[language] as any;

    // First try a flat lookup.
    let translation: unknown = translationsForLang[key];

    // If not found, perform a nested lookup.
    if (typeof translation !== "string") {
      translation = key
        .split(".")
        .reduce(
          (acc, part) => (acc ? acc[part] : undefined),
          translationsForLang,
        );
    }

    if (typeof translation !== "string") {
      console.error(`Translation for key "${key}" is not a string.`);
      return key;
    }

    // Handle parameter interpolation.
    if (!params) return translation;

    return Object.entries(params).reduce(
      (result, [paramKey, paramValue]) =>
        result.replace(new RegExp(`{{${paramKey}}}`, "g"), String(paramValue)),
      translation,
    );
  };

  function getNestedTranslation<T>(key: string): T {
    return key
      .split(".")
      .reduce(
        (acc, part) => (acc ? (acc as any)[part] : undefined),
        translations[language],
      ) as T;
  }

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, isLoading, getNestedTranslation }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
