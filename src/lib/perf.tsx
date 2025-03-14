// src/lib/perf.tsx
"use client";

import { useEffect, useState } from "react";

/**
 * Available performance levels
 */
export type PerformanceLevel = "low" | "medium" | "high";

/**
 * Device type detection
 */
export type DeviceType = "mobile" | "tablet" | "desktop";

/**
 * Performance detection settings
 */
interface PerformanceSettings {
  /**
   * The maximum frames per second to target
   */
  targetFPS?: number;

  /**
   * Whether to enable 3D effects
   */
  enable3D?: boolean;

  /**
   * Whether to enable advanced animations
   */
  enableAdvancedAnimations?: boolean;

  /**
   * The quality of 3D effects (texture sizes, mesh complexity)
   */
  quality3D?: "low" | "medium" | "high";

  /**
   * The device pixel ratio to use
   */
  pixelRatio?: number;

  /**
   * The performance level
   */
  level: PerformanceLevel;
}

/**
 * Gets the device type based on screen size
 */
export function getDeviceType(): DeviceType {
  if (typeof window === "undefined") return "desktop"; // SSR fallback

  const width = window.innerWidth;

  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

/**
 * Detects the performance level of the device
 */
export function detectPerformanceLevel(): PerformanceLevel {
  if (typeof window === "undefined") return "medium"; // SSR fallback

  // Check for GPU capabilities
  const hasGPU = "gpu" in navigator;

  // Check for mobile devices
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  // Check for hardware concurrency (CPU cores)
  const cpuCores = navigator.hardwareConcurrency || 4;

  // Check for device memory (in GB)
  const deviceMemory = (navigator as any).deviceMemory || 4;

  // Device pixel ratio
  const pixelRatio = window.devicePixelRatio || 1;

  // Calculate performance score
  let score = 0;

  // GPU availability is a big factor
  if (hasGPU) score += 2;

  // Mobile devices typically have lower performance
  if (isMobile) score -= 2;

  // CPU cores contribute to performance
  score += Math.min(cpuCores / 2, 3);

  // Memory contributes to performance
  score += Math.min(deviceMemory / 2, 3);

  // High pixel ratios can impact performance
  if (pixelRatio > 2) score -= 1;

  // Determine performance level based on score
  if (score <= 2) return "low";
  if (score <= 5) return "medium";
  return "high";
}

/**
 * Gets performance settings based on performance level and device type
 */
export function getPerformanceSettings(): PerformanceSettings {
  const performanceLevel = detectPerformanceLevel();
  const deviceType = getDeviceType();
  const pixelRatio =
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  // Base settings for each performance level
  const settings: Record<PerformanceLevel, PerformanceSettings> = {
    low: {
      targetFPS: 30,
      enable3D: deviceType !== "mobile",
      enableAdvancedAnimations: false,
      quality3D: "low",
      pixelRatio: Math.min(pixelRatio, 1),
      level: "low",
    },
    medium: {
      targetFPS: 60,
      enable3D: true,
      enableAdvancedAnimations: deviceType !== "mobile",
      quality3D: "medium",
      pixelRatio: Math.min(pixelRatio, 1.5),
      level: "medium",
    },
    high: {
      targetFPS: 60,
      enable3D: true,
      enableAdvancedAnimations: true,
      quality3D: "high",
      pixelRatio: Math.min(pixelRatio, 2),
      level: "high",
    },
  };

  return settings[performanceLevel];
}

/**
 * React hook for accessing performance settings
 */
export function usePerformance() {
  const [settings, setSettings] = useState<PerformanceSettings>(() =>
    typeof window !== "undefined"
      ? getPerformanceSettings()
      : {
          targetFPS: 60,
          enable3D: true,
          enableAdvancedAnimations: true,
          quality3D: "medium",
          pixelRatio: 1,
          level: "medium",
        },
  );

  const [deviceType, setDeviceType] = useState<DeviceType>(() =>
    typeof window !== "undefined" ? getDeviceType() : "desktop",
  );

  // Update settings on window resize
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setDeviceType(getDeviceType());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    ...settings,
    deviceType,
    isMobile: deviceType === "mobile",
    isTablet: deviceType === "tablet",
    isDesktop: deviceType === "desktop",
  };
}

/**
 * FPS monitor for debugging performance
 */
export function useFPSMonitor() {
  const [fps, setFPS] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined" || process.env.NODE_ENV !== "development")
      return;

    let frameCount = 0;
    let lastTime = performance.now();
    let frameTimes: number[] = [];
    let rafId: number;

    const measureFPS = () => {
      const now = performance.now();
      const elapsed = now - lastTime;

      // Only update every 500ms for more stable readings
      if (elapsed > 500) {
        const currentFPS = Math.round((frameCount * 1000) / elapsed);
        frameTimes.push(currentFPS);

        // Keep only the last 5 readings for smoother average
        if (frameTimes.length > 5) {
          frameTimes.shift();
        }

        const averageFPS = Math.round(
          frameTimes.reduce((sum, val) => sum + val, 0) / frameTimes.length,
        );

        setFPS(averageFPS);

        frameCount = 0;
        lastTime = now;
      }

      frameCount++;
      rafId = requestAnimationFrame(measureFPS);
    };

    rafId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  return fps;
}

/**
 * A React component that only renders high-cost UI elements when the device
 * performance level meets the minimum requirement
 */
export function PerformanceGate({
  children,
  minLevel = "low",
  fallback = null,
}: {
  children: React.ReactNode;
  minLevel?: PerformanceLevel;
  fallback?: React.ReactNode;
}) {
  // Always call all hooks unconditionally
  const [isClient, setIsClient] = useState(false);
  const { level } = usePerformance();

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate requirement score outside conditional rendering
  const levelScores: Record<PerformanceLevel, number> = {
    low: 0,
    medium: 1,
    high: 2,
  };

  const meetsRequirement = levelScores[level] >= levelScores[minLevel];

  // If not client-side yet, show fallback or nothing
  if (!isClient) {
    return fallback ? <>{fallback}</> : null;
  }

  // When client-side, show children if performance meets requirement
  return <>{meetsRequirement ? children : fallback}</>;
}
