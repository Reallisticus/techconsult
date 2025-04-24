// src/provider/BackgroundProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { HeroBackground } from "~/components/utils/HeroBackground";
import { useSmoothScroll } from "./SmoothScrollProvider";
import { useDebouncedCallback } from "use-debounce";

interface BackgroundContextType {
  backgroundRef: React.RefObject<HTMLDivElement> | null;
}

const BackgroundContext = createContext<BackgroundContextType>({
  backgroundRef: null,
});

export const useBackground = () => useContext(BackgroundContext);

interface BackgroundProviderProps {
  children: ReactNode;
}

export const BackgroundProvider = ({ children }: BackgroundProviderProps) => {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { scroll } = useSmoothScroll();
  const lastFilterValue = useRef<number>(1);
  const rafId = useRef<number | null>(null);
  const isScrolling = useRef(false);
  const scrollTimeoutId = useRef<NodeJS.Timeout | null>(null);

  const handleScrollStop = useDebouncedCallback(() => {
    isScrolling.current = false;
  }, 150);

  const updateBackgroundFilter = useDebouncedCallback(
    () => {
      if (!backgroundRef.current || rafId.current) return;

      // Set scrolling state
      isScrolling.current = true;
      handleScrollStop();

      rafId.current = requestAnimationFrame(() => {
        if (backgroundRef.current) {
          const maxScrollDepth = Math.min(
            document.body.scrollHeight * 0.5,
            3000,
          );
          const scrollProgress = Math.min(1, scroll.current / maxScrollDepth);
          const newBrightness = Math.max(0.7, 1 - scrollProgress * 0.3);
          const roundedBrightness = Math.round(newBrightness * 100) / 100;

          if (Math.abs(roundedBrightness - lastFilterValue.current) >= 0.01) {
            backgroundRef.current.style.filter = `brightness(${roundedBrightness})`;
            lastFilterValue.current = roundedBrightness;
          }
        }
        rafId.current = null;
      });
    },
    10,
    { maxWait: 30 },
  );

  useEffect(() => {
    setMounted(true);

    // Ensure transparent background
    if (typeof document !== "undefined") {
      document.documentElement.style.background = "transparent";
      document.body.style.background = "transparent";
    }

    // Use the pre-defined debounced function
    window.addEventListener("scroll", updateBackgroundFilter, {
      passive: true,
    });

    return () => {
      setMounted(false);
      window.removeEventListener("scroll", updateBackgroundFilter);
      updateBackgroundFilter.cancel();
      handleScrollStop.cancel();

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [scroll, updateBackgroundFilter, handleScrollStop]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ backgroundRef }), []);

  return (
    <BackgroundContext.Provider value={contextValue}>
      <>
        <div
          ref={backgroundRef}
          className="fixed-background"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            zIndex: "-1000",
            opacity: 1,
            visibility: "visible",
            transition: "filter 0.2s ease-out",
            willChange: "filter", // Hint to browser to optimize for this property
          }}
        >
          {mounted && <HeroBackground />}

          {/* Semi-transparent overlay gradient with scroll-dependent opacity */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-primary-900/30 to-black/70"
            style={{
              transition: "opacity 0.5s ease-out",
            }}
          />
        </div>

        {/* Ensure content sections have transparent backgrounds */}
        <div className="relative">{children}</div>
      </>
    </BackgroundContext.Provider>
  );
};
