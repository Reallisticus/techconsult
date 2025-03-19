// src/app/layout.tsx
"use client";
import "~/styles/globals.css";

import { MotionConfig } from "framer-motion";
import { TRPCReactProvider } from "~/trpc/react";
import { cn } from "../lib/utils";
import { Footer } from "../components/layout/footer";
import { Navbar } from "../components/layout/navbar";
import { LanguageProvider } from "~/i18n/context";
import { ptSans, roboto, silkscreen, spaceGrotesk } from "~/lib/fonts";
import { BackgroundProvider } from "../provider/BackgroundProvider";
import { SmoothScrollProvider } from "../provider/SmoothScrollProvider";

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
      <body className="overflow-x-hidden text-white">
        {/* Application providers, correctly nested for dependencies */}
        <LanguageProvider defaultLanguage="en">
          <FontManager>
            <MotionConfig reducedMotion="user">
              <SmoothScrollProvider
                options={{
                  duration: 1.2,
                  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                  wheelMultiplier: 1,
                  touchMultiplier: 2,
                  smoothWheel: true,
                  smoothTouch: false,
                }}
              >
                <BackgroundProvider>
                  {/* Loading overlay */}

                  {/* Main app content */}
                  <div className="transition-opacity duration-500">
                    <Navbar />
                    <main className="relative z-10">
                      <TRPCReactProvider>{children}</TRPCReactProvider>
                    </main>
                    <Footer />
                  </div>
                </BackgroundProvider>
              </SmoothScrollProvider>
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
