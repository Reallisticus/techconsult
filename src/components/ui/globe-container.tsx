"use client";
import React, {
  Suspense,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Canvas } from "@react-three/fiber";
import { Html, useProgress } from "@react-three/drei";
import InteractiveGlobe from "../home/utils/InteractiveGlobe";
import { usePerformance } from "~/lib/perf";

interface GlobeContainerProps {
  markerLabel?: string;
  className?: string;
  globeSize?: number;
  markerSize?: number;
  labelSize?: number;
  pulseColor?: string;
  globeColor?: string;
  atmosphereColor?: string;
  enableAtmosphere?: boolean;
  enablePulse?: boolean;
  enableInertia?: boolean;
  onMarkerClick?: () => void;
  autoRotateSpeed?: number;
}

// Enhanced loading indicator component
const Loader = () => {
  const { progress, active } = useProgress();
  const [dots, setDots] = useState("");

  // Animate the dots for better visual feedback
  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    return () => clearInterval(interval);
  }, [active]);

  return (
    <Html center>
      <div className="transform rounded-lg bg-neutral-900/70 p-4 text-white shadow-xl backdrop-blur-sm transition-all duration-300">
        <div className="mb-2 flex items-center justify-between text-sm font-medium">
          <span>Loading globe{dots}</span>
          <span className="ml-2 font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="relative h-1.5 w-40 overflow-hidden rounded-full bg-neutral-700">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-accent-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Html>
  );
};

const GlobeContainer: React.FC<GlobeContainerProps> = ({
  markerLabel = "Sofia",
  className = "",
  globeSize = 3.5,
  markerSize = 0.0005,
  labelSize = 0.2,
  pulseColor = "#7C3AED",
  globeColor = "#2563EB",
  atmosphereColor = "#93C5FD",
  enableAtmosphere = true,
  enablePulse = true,
  enableInertia = true,
  onMarkerClick,
  autoRotateSpeed = 0.9,
}) => {
  // Refs and state
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHighQuality, setIsHighQuality] = useState<boolean | null>(null);
  const [showHints, setShowHints] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [interactionTimeout, setInteractionTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const { level, isMobile, isTablet } = usePerformance();

  // Touch handling state
  const touchStartY = useRef<number | null>(null);
  const lastTouchTime = useRef<number>(0);
  const isScrollingRef = useRef(false);

  // Set isMounted to true when component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Use the performance level directly
    const hasReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Determine quality based on performance level
    const determineQuality = () => {
      if (hasReducedMotion) {
        return false; // Always use low quality for reduced motion
      }

      // Use performance level to determine quality
      switch (level) {
        case "high":
          return true;
        case "medium":
          return !isMobile; // Medium quality, but low for mobile
        case "low":
        default:
          return false; // Low quality for low performance devices
      }
    };

    setIsHighQuality(determineQuality());

    // Re-evaluate quality when tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setIsHighQuality(false);
      } else {
        setIsHighQuality(determineQuality());
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isMounted, level, isMobile]);

  // Hide interaction hints after delay or user interaction
  useEffect(() => {
    if (!isMounted || !showHints) return;

    const timer = setTimeout(() => {
      setShowHints(false);
    }, 5000);

    const hideHintsOnInteraction = () => {
      setShowHints(false);
    };

    window.addEventListener("pointerdown", hideHintsOnInteraction, {
      once: true,
    });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", hideHintsOnInteraction);
    };
  }, [showHints, isMounted]);

  // Enhanced wheel event handler with better physics
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!isHovering || !containerRef.current) return;

      // Block scroll only when directly interacting with globe
      e.preventDefault();
      e.stopPropagation();

      // Reset the interaction timeout to keep preventing scroll
      if (interactionTimeout) {
        clearTimeout(interactionTimeout);
      }

      // Set a timeout to release scroll prevention after interaction stops
      const timeout = setTimeout(() => {
        isScrollingRef.current = false;
      }, 300);

      setInteractionTimeout(timeout);
    },
    [isHovering, interactionTimeout],
  );

  // Enhanced touch handling to distinguish between globe interaction and page scrolling
  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Store initial touch position
    if (e.touches.length === 1) {
      touchStartY.current = e.touches[0]!.clientY;
      lastTouchTime.current = Date.now();
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isHovering || touchStartY.current === null || e.touches.length !== 1)
        return;

      const currentY = e.touches[0]!.clientY;
      const deltaY = currentY - touchStartY.current;
      const timeDelta = Date.now() - lastTouchTime.current;

      // Calculate velocity for better detection of scrolling vs. rotation
      const velocity = Math.abs(deltaY) / timeDelta;

      // If movement is mostly vertical and fast, it's likely a scroll
      if (Math.abs(deltaY) > 10 && velocity > 0.3) {
        isScrollingRef.current = true;
      }

      // If we've determined this is a scrolling motion, don't prevent default
      if (isScrollingRef.current) {
        return;
      }

      // Otherwise, prevent default to allow globe interaction
      e.preventDefault();
      lastTouchTime.current = Date.now();
    },
    [isHovering],
  );

  const handleTouchEnd = useCallback(() => {
    // Reset touch tracking
    touchStartY.current = null;
    isScrollingRef.current = false;
  }, []);

  // Setup comprehensive event listeners for wheel and touch
  useEffect(() => {
    if (!isMounted) return;

    const container = containerRef.current;
    if (!container) return;

    // Options for event listeners
    const options = { passive: false };

    // Add event listeners
    container.addEventListener("wheel", handleWheel, options);
    container.addEventListener("touchstart", handleTouchStart, options);
    container.addEventListener("touchmove", handleTouchMove, options);
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      // Clean up event listeners
      container.removeEventListener(
        "wheel",
        handleWheel,
        options as EventListenerOptions,
      );
      container.removeEventListener(
        "touchstart",
        handleTouchStart,
        options as EventListenerOptions,
      );
      container.removeEventListener(
        "touchmove",
        handleTouchMove,
        options as EventListenerOptions,
      );
      container.removeEventListener("touchend", handleTouchEnd);

      // Also clear any pending timeouts
      if (interactionTimeout) {
        clearTimeout(interactionTimeout);
      }
    };
  }, [
    isMounted,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    interactionTimeout,
  ]);

  // Advanced pointer tracking for better interaction
  const handlePointerDown = useCallback(() => {
    setIsPointerDown(true);
  }, []);

  const handlePointerUp = useCallback(() => {
    setIsPointerDown(false);
  }, []);

  // Mouse enter/leave with debouncing for better performance
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);

    // Apply style changes for better visual feedback
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setIsPointerDown(false);

    // Reset cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = "auto";
    }
  }, []);

  // Update cursor when pointer is down
  useEffect(() => {
    if (!containerRef.current) return;

    if (isHovering) {
      containerRef.current.style.cursor = isPointerDown ? "grabbing" : "grab";
    }
  }, [isHovering, isPointerDown]);

  // Calculate camera position and field of view based on container size
  const [cameraSettings, dpr] = useMemo(() => {
    // Default settings with proper tuple typing
    const defaultCamera = {
      position: [0, 0, 2.5 + globeSize * 0.5] as [number, number, number],
      fov: 60,
    };

    if (!isMounted) {
      return [defaultCamera, [1, 2] as [number, number]];
    }

    // Adjust for container size
    const container = containerRef.current;
    if (container) {
      const { width, height } = container.getBoundingClientRect();
      const aspectRatio = width / height;

      // Adjust FOV based on aspect ratio
      const adjustedFov = aspectRatio < 1 ? 70 : 60;

      // Adjust position for small screens
      const zPosition = 2.5 + globeSize * 0.5;

      // Calculate appropriate DPR based on performance
      let maxDpr = 2;

      // Scale DPR based on performance score
      maxDpr = level === "high" ? 2 : level === "medium" ? 1.5 : 1;

      return [
        {
          position: [0, 0, zPosition] as [number, number, number],
          fov: adjustedFov,
        },
        [1, Math.min(maxDpr, window.devicePixelRatio)] as [number, number],
      ];
    }

    return [defaultCamera, [1, 2] as [number, number]];
  }, [isMounted, globeSize, level]);

  // Don't render the Canvas until we're mounted on the client and have determined quality settings
  if (!isMounted || isHighQuality === null) {
    return (
      <div
        className={`relative aspect-square h-full w-full ${className} flex items-center justify-center bg-neutral-900/30`}
      >
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative aspect-square h-full w-full ${className} overflow-hidden rounded-xl`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{
        touchAction: isHovering && !isScrollingRef.current ? "none" : "auto",
        transition: "box-shadow 0.3s ease",
        boxShadow: isHovering ? "0 0 20px rgba(124, 58, 237, 0.2)" : "none",
      }}
    >
      <Canvas
        ref={canvasRef}
        camera={cameraSettings}
        dpr={dpr}
        performance={{ min: 0.5 }}
        gl={{
          antialias: isHighQuality,
          powerPreference: "high-performance",
          alpha: true,
          depth: true,
          stencil: false,
          logarithmicDepthBuffer: false,
        }}
      >
        <Suspense fallback={<Loader />}>
          <InteractiveGlobe
            markerPosition={[42.6977, 23.3219]} // Sofia, Bulgaria
            markerLabel={markerLabel}
            autoRotate={true}
            autoRotateSpeed={autoRotateSpeed}
            highQuality={isHighQuality}
            size={globeSize}
            markerSize={markerSize}
            labelSize={labelSize}
            enableAtmosphere={enableAtmosphere}
            enablePulse={enablePulse}
            pulseColor={pulseColor}
            atmosphereColor={atmosphereColor}
            globeColor={globeColor}
            onMarkerClick={onMarkerClick}
            enableInertia={enableInertia}
          />
        </Suspense>
      </Canvas>

      {/* Interaction hints with improved styling */}
      {showHints && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 transform rounded-lg bg-neutral-900/70 px-3 py-2 text-center text-sm text-white shadow-lg backdrop-blur-sm transition-all duration-300"
          style={{
            opacity: 0.9,
            animation: "pulse 2s infinite ease-in-out",
          }}
        >
          <p className="flex items-center justify-center space-x-2">
            <svg
              className="mr-1 h-4 w-4 opacity-70"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span>Drag to rotate • Scroll to zoom</span>
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: translate(-50%, 0) scale(1);
          }
          50% {
            transform: translate(-50%, 0) scale(1.05);
          }
          100% {
            transform: translate(-50%, 0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default GlobeContainer;
