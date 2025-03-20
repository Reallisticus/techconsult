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

  // Keep track of the last applied filter value to avoid unnecessary DOM updates
  const lastFilterValue = useRef<number>(1);
  // Use requestAnimationFrame for smoother scrolling
  const rafId = useRef<number | null>(null);
  // Track if user is scrolling
  const isScrolling = useRef(false);
  const scrollTimeoutId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);

    // Ensure transparent background
    if (typeof document !== "undefined") {
      document.documentElement.style.background = "transparent";
      document.body.style.background = "transparent";
    }

    // Apply subtle effects based on scroll position using requestAnimationFrame
    const handleScroll = () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      // Mark as scrolling
      isScrolling.current = true;

      // Clear previous timeout
      if (scrollTimeoutId.current) {
        clearTimeout(scrollTimeoutId.current);
      }

      // Set timeout to mark when scrolling stops
      scrollTimeoutId.current = setTimeout(() => {
        isScrolling.current = false;
      }, 150);

      rafId.current = requestAnimationFrame(() => {
        if (backgroundRef.current) {
          // Calculate scroll progress
          const maxScrollDepth = Math.min(
            document.body.scrollHeight * 0.5,
            3000,
          );
          const scrollProgress = Math.min(1, scroll.current / maxScrollDepth);

          // Calculate new brightness with less precision to avoid small changes
          const newBrightness = Math.max(0.7, 1 - scrollProgress * 0.3);
          // Only update the DOM if the change is significant (more than 1%)
          const roundedBrightness = Math.round(newBrightness * 100) / 100;

          if (Math.abs(roundedBrightness - lastFilterValue.current) >= 0.01) {
            backgroundRef.current.style.filter = `brightness(${roundedBrightness})`;
            lastFilterValue.current = roundedBrightness;
          }
        }
        rafId.current = null;
      });
    };

    // Throttled scroll listener
    const throttledScrollHandler = () => {
      if (!rafId.current) {
        handleScroll();
      }
    };

    // Listen for scroll events with passive flag for performance
    window.addEventListener("scroll", throttledScrollHandler, {
      passive: true,
    });

    return () => {
      setMounted(false);
      window.removeEventListener("scroll", throttledScrollHandler);

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }

      if (scrollTimeoutId.current) {
        clearTimeout(scrollTimeoutId.current);
        scrollTimeoutId.current = null;
      }
    };
  }, [scroll]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ backgroundRef }), []);

  // Control rendering quality based on scroll state
  const backgroundQuality = isScrolling.current ? "reduced" : "full";

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
