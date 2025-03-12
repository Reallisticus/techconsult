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

    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";

    return () => setMounted(false);
  }, []);
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
        }}
      >
        {mounted && <HeroBackground />}

        {/* Semi-transparent overlay gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-primary-900/30 to-black/70" />
      </div>

      {/* Ensure content sections have transparent backgrounds */}
      <div className="relative">{children}</div>
    </>
  );
};
