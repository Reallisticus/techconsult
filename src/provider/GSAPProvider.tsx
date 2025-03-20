// src/provider/GSAPProvider.tsx
"use client";

import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { initGSAP } from "~/lib/GSAP";
import { useState } from "react";

interface GSAPContextType {
  isReady: boolean;
}

const GSAPContext = createContext<GSAPContextType>({
  isReady: false,
});

export const useGSAPContext = () => useContext(GSAPContext);

interface GSAPProviderProps {
  children: ReactNode;
}

export const GSAPProvider = ({ children }: GSAPProviderProps) => {
  const [isReady, setIsReady] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // Initialize GSAP plugins
    initGSAP();

    // Set a small timeout to ensure plugins are registered
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <GSAPContext.Provider value={{ isReady }}>{children}</GSAPContext.Provider>
  );
};
