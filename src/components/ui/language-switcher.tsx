// src/components/ui/language-switcher.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Magnetic } from "./magnetic";
import { useLanguage, type Language } from "~/i18n/context";
import { cn } from "~/lib/utils";

type LanguageSwitcherProps = {
  variant?: "icon" | "text" | "full";
  className?: string;
};

export const LanguageSwitcher = ({
  variant = "full",
  className,
}: LanguageSwitcherProps) => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languageOptions: { code: Language; label: string; flag: string }[] = [
    { code: "en", label: t("common.english"), flag: "🇬🇧" },
    { code: "bg", label: t("common.bulgarian"), flag: "🇧🇬" },
  ];

  // Find the current language
  const currentLanguage = languageOptions.find(
    (lang) => lang.code === language,
  );

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  // Animation variants
  const dropdownVariants = {
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    open: { opacity: 1, y: 0 },
    closed: { opacity: 0, y: -10 },
  };

  return (
    <div className={cn("relative z-50", className)}>
      <Magnetic strength={10}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-2 rounded-md p-2 text-white transition-colors hover:text-accent-400"
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={t("common.language")}
        >
          {variant !== "text" && (
            <span className="text-lg">{currentLanguage?.flag}</span>
          )}

          {variant !== "icon" && (
            <>
              <span className="text-sm font-medium">
                {currentLanguage?.code.toUpperCase()}
              </span>

              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={cn(
                  "transition-transform duration-200",
                  isOpen ? "rotate-180" : "",
                )}
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          )}
        </button>
      </Magnetic>

      {/* Dropdown menu */}
      <motion.div
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={dropdownVariants}
        className="absolute right-0 mt-2 w-40 origin-top-right overflow-hidden rounded-md bg-neutral-900 shadow-lg ring-1 ring-black ring-opacity-5"
      >
        <div className="py-1">
          {languageOptions.map((option) => (
            <motion.button
              key={option.code}
              variants={itemVariants}
              onClick={() => handleLanguageChange(option.code)}
              className={cn(
                "flex w-full items-center gap-2 px-4 py-2 text-left text-sm",
                language === option.code
                  ? "bg-accent-500/10 text-accent-400"
                  : "text-white hover:bg-neutral-800",
              )}
            >
              <span className="text-lg">{option.flag}</span>
              <span>{option.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Backdrop for closing dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
