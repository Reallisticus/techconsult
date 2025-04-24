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
import { LoadingOverlay } from "../components/ui/loading-overlay";
import { memo, useEffect } from "react";
import { useLanguage } from "~/i18n/context";
import { getFontFamily, getFontVariables } from "~/lib/fonts";
import { GSAPProvider } from "../provider/GSAPProvider";
import { CustomCursor } from "~/components/ui/custom-cursor";

// Memoizing main content to prevent unnecessary re-renders
const MainContent = memo(({ children }: { children: React.ReactNode }) => {
  return (
    <div className="transition-opacity duration-500">
      <Navbar />
      <main className="relative z-10">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </main>
      <Footer />
    </div>
  );
});

MainContent.displayName = "MainContent";

// Font Manager component to dynamically set font classes based on language
const FontManager = memo(({ children }: { children: React.ReactNode }) => {
  const { language } = useLanguage();

  return (
    <div className={cn(getFontVariables(language), getFontFamily(language))}>
      {children}
    </div>
  );
});

FontManager.displayName = "FontManager";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Early initialize GSAP to avoid flicker
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("../lib/GSAP").then(({ initGSAP }) => {
        initGSAP();
      });
    }
  }, []);

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
        {" "}
        {/* Add CustomCursor here */}
        <CustomCursor
          color="accent-500"
          size={32}
          hoverSize={48}
          enableTrail={true}
          hoverSelectors="a, button, [role=button], input, textarea, select, [data-cursor-hover]"
        />
        {/* Loading overlay - will automatically disappear after assets load */}
        <LoadingOverlay minDuration={1000} />
        {/* Application providers, correctly nested for dependencies */}
        <LanguageProvider defaultLanguage="en">
          <FontManager>
            <MotionConfig reducedMotion="user">
              <GSAPProvider>
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
                    <MainContent>{children}</MainContent>
                  </BackgroundProvider>
                </SmoothScrollProvider>
              </GSAPProvider>
            </MotionConfig>
          </FontManager>
        </LanguageProvider>
      </body>
    </html>
  );
}
