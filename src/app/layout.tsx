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
import { AnimationProvider } from "../provider/AnimationProvider";
import { useEffect, useState } from "react";
import { PerformanceGate } from "~/lib/perf";

// Loading screen component
const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 10;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
      <div className="mb-8 text-3xl font-bold">TechConsult.BG</div>
      <div className="w-64 overflow-hidden rounded-full bg-neutral-800">
        <div
          className="h-2 bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-4 text-sm text-neutral-400">
        {progress < 100 ? "Loading..." : "Ready!"}
      </div>
    </div>
  );
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate page loading
  useEffect(() => {
    // Preload essential resources
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
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
                  {isLoading && <LoadingScreen />}

                  {/* Main app content */}
                  <div
                    className={cn(
                      "transition-opacity duration-500",
                      isLoading ? "opacity-0" : "opacity-100",
                    )}
                  >
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
