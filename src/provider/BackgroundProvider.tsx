"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { HeroBackground } from "~/components/utils/HeroBackground";
import { useBackgroundState } from "~/hooks/useBackgroundState";
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
  const {} = useBackgroundState();
  const { scroll } = useSmoothScroll();

  useEffect(() => {
    setMounted(true);

    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";

    // Apply subtle effects based on scroll position
    const handleScroll = () => {
      if (backgroundRef.current) {
        // Calculate scroll progress
        const maxScrollDepth = Math.min(document.body.scrollHeight * 0.5, 3000);
        const scrollProgress = Math.min(1, scroll.current / maxScrollDepth);

        // Apply subtle background effects based on scroll
        backgroundRef.current.style.filter = `brightness(${Math.max(0.7, 1 - scrollProgress * 0.3)})`;
      }
    };

    // Listen for scroll events
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      setMounted(false);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scroll]);

  return (
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
  );
};
