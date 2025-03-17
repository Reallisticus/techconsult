"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLoadingManager } from "~/provider/LoadingProvider";

interface LoadingScreenProps {
  className?: string;
}

export const LoadingScreen = ({ className }: LoadingScreenProps) => {
  const { progress, isLoading } = useLoadingManager();

  // Smoothed progress for visual purposes
  const [smoothProgress, setSmoothProgress] = useState(0);

  // Smooth out progress updates for better visual experience
  useEffect(() => {
    if (progress > smoothProgress) {
      // Progress is increasing, animate towards it
      const interval = setInterval(() => {
        setSmoothProgress((prev) => {
          const increment = Math.max(1, (progress - prev) * 0.1);
          const next = Math.min(progress, prev + increment);

          if (next >= progress) {
            clearInterval(interval);
          }

          return next;
        });
      }, 16);

      return () => clearInterval(interval);
    } else if (progress < smoothProgress) {
      // In case progress decreases (shouldn't normally happen)
      setSmoothProgress(progress);
    }
  }, [progress, smoothProgress]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
        >
          <div className="mb-8 text-3xl font-bold">TechConsult.BG</div>

          <div className="w-64 overflow-hidden rounded-full bg-neutral-800">
            <motion.div
              className="h-2 bg-gradient-to-r from-primary-500 to-accent-500"
              style={{ width: `${smoothProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="mt-4 text-sm text-neutral-400">
            {smoothProgress < 100
              ? `Loading... ${Math.floor(smoothProgress)}%`
              : "Ready!"}
          </div>

          {/* Optional loading tips/messages */}
          <motion.div
            className="mt-8 max-w-md text-center text-xs text-neutral-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            {smoothProgress < 30 && "Initializing resources..."}
            {smoothProgress >= 30 &&
              smoothProgress < 60 &&
              "Loading 3D elements..."}
            {smoothProgress >= 60 &&
              smoothProgress < 90 &&
              "Preparing animations..."}
            {smoothProgress >= 90 && "Almost ready!"}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
