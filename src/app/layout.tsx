"use client";
import "~/styles/globals.css";

import { type Metadata } from "next";
import { MotionConfig } from "framer-motion";

import { TRPCReactProvider } from "~/trpc/react";
import { cn } from "../lib/utils";
import { Footer } from "../components/layout/footer";
import { siteConfig } from "../lib/constants";
import { SmoothScroll } from "~/components/providers/scroll-provider";
import { Navbar } from "../components/layout/navbar";
import { LanguageProvider } from "~/i18n/context";
import { ptSans, roboto, silkscreen, spaceGrotesk } from "~/lib/fonts";

// export const metadata: Metadata = {
//   title: {
//     default: siteConfig.name,
//     template: `%s | ${siteConfig.name}`,
//   },
//   description: siteConfig.description,
// };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Pre-load all font families to prevent FOUT (Flash of Unstyled Text) */}
        <style jsx global>{`
          :root {
            --font-space-grotesk: ${spaceGrotesk.style.fontFamily};
            --font-silkscreen: ${silkscreen.style.fontFamily};
            --font-pt-sans: ${ptSans.style.fontFamily};
            --font-roboto: ${roboto.style.fontFamily};
          }
        `}</style>
      </head>
      <body className="overflow-x-hidden bg-neutral-950 text-white">
        <LanguageProvider defaultLanguage="en">
          <FontManager>
            <MotionConfig reducedMotion="user">
              <SmoothScroll>
                <Navbar />
                <main className="flex-1">
                  <TRPCReactProvider>{children}</TRPCReactProvider>
                </main>
                <Footer />
              </SmoothScroll>
            </MotionConfig>
          </FontManager>
        </LanguageProvider>
      </body>
    </html>
  );
}

// Font Manager component to dynamically set font classes based on language
import { useLanguage } from "~/i18n/context";
import { getFontFamily, getFontVariables } from "~/lib/fonts";

function FontManager({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();

  return (
    <div className={cn(getFontVariables(language), getFontFamily(language))}>
      {children}
    </div>
  );
}
