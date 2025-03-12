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
  const { isVisible, opacity, zoom } = useBackgroundState();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <>
      <div
        ref={backgroundRef}
        className="fixed-background"
        style={{
          opacity: isVisible ? opacity : 0,
          transform: `scale(${zoom})`,
          visibility: isVisible ? "visible" : "hidden",
          zIndex: "-1000", // Explicitly set z-index here to ensure it's applied
        }}
      >
        {mounted && <HeroBackground />}

        {/* Overlay gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-primary-900/30 to-black/70" />
      </div>

      {/* Main content */}
      {children}
    </>
  );
};
