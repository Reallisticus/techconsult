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
export type TranslationKey = keyof typeof en & string;
export type Translations = typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isLoading: boolean;
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
    try {
      const translation = translations[language][key] || key;

      if (!params) return translation;

      // Handle interpolation for params like {{name}}
      return Object.entries(params).reduce(
        (result, [paramKey, paramValue]) =>
          result.replace(
            new RegExp(`{{${paramKey}}}`, "g"),
            String(paramValue),
          ),
        translation,
      );
    } catch (error) {
      console.error(`Translation error for key "${key}":`, error);
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
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
