// src/components/ui/loading-overlay.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type LoadingOverlayProps = {
  minDuration?: number; // Minimum time to show the loader in ms
  fadeOutDuration?: number; // Duration of fade out animation in ms
};

export const LoadingOverlay = ({
  minDuration = 2500, // At least 2.5 seconds to allow background load
  fadeOutDuration = 600,
}: LoadingOverlayProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start progress animation
    const startTime = Date.now();
    const endTime = startTime + minDuration;

    // Animate progress from 0 to 100 over minDuration
    const progressInterval = setInterval(() => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const newProgress = Math.min(
        100,
        Math.floor((elapsed / minDuration) * 100),
      );
      setProgress(newProgress);

      if (currentTime >= endTime) {
        clearInterval(progressInterval);
        setIsLoading(false);
      }
    }, 50);

    // Handle browser resources loading
    const handleLoad = () => {
      // We still respect the minDuration
      const remainingTime = Math.max(0, endTime - Date.now());
      if (remainingTime === 0) {
        setIsLoading(false);
      } else {
        setTimeout(() => setIsLoading(false), remainingTime);
      }
    };

    // Check if document is already loaded
    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      clearInterval(progressInterval);
      window.removeEventListener("load", handleLoad);
    };
  }, [minDuration]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fadeOutDuration / 1000 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
        >
          <div className="relative flex flex-col items-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-8"
            >
              <h1 className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-5xl font-bold text-transparent">
                TechConsult.BG
              </h1>
            </motion.div>

            {/* Progress bar */}
            <div className="relative h-1 w-64 overflow-hidden rounded-full bg-neutral-800">
              <motion.div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Moving light effect on progress bar */}
            <motion.div
              className="absolute left-0 top-0 h-full w-20 bg-white/20 blur-sm"
              animate={{ left: ["0%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />

            {/* Loading text */}
            <motion.p
              className="mt-4 text-sm text-neutral-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Loading experience...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
