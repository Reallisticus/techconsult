// src/lib/fonts.ts
import {
  Inter,
  Space_Grotesk,
  Silkscreen,
  PT_Sans,
  Roboto,
  DotGothic16,
} from "next/font/google";
import { Language } from "~/i18n/context";

// Latin fonts
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const silkscreen = Silkscreen({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-silkscreen",
});

// Cyrillic fonts
export const ptSans = PT_Sans({
  weight: ["400", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-pt-sans",
});

export const roboto = DotGothic16({
  weight: ["400"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-roboto",
});

// Font for primary display usage (hero headings) - providing a fallback
export const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

/**
 * Returns the appropriate font variables CSS class based on language
 */
export function getFontVariables(language: Language): string {
  switch (language) {
    case "bg":
      return `${ptSans.variable} ${roboto.variable} ${silkscreen.variable}`;
    default:
      return `${spaceGrotesk.variable} ${silkscreen.variable}`;
  }
}

/**
 * Returns the font family CSS class based on language
 */
export function getFontFamily(language: Language): string {
  switch (language) {
    case "bg":
      return "font-pt-sans";
    default:
      return "font-sans";
  }
}

/**
 * Returns the appropriate display font for hero/headings based on language
 */
export function getDisplayFontClass(language: Language): string {
  switch (language) {
    case "bg":
      return "font-roboto";
    default:
      return "font-display";
  }
}
