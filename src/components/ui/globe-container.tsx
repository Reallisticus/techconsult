"use client";
import React, {
  Suspense,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Canvas } from "@react-three/fiber";
import { Html, useProgress } from "@react-three/drei";
import InteractiveGlobe from "../home/utils/InteractiveGlobe";

interface GlobeContainerProps {
  markerLabel?: string;
  className?: string;
  globeSize?: number;
  markerSize?: number;
  labelSize?: number;
}

// Loading indicator component
const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="rounded-lg bg-neutral-900/70 p-3 text-white backdrop-blur-sm">
        <div className="text-sm font-medium">
          {Math.round(progress)}% loaded
        </div>
        <div className="mt-1 h-1 w-32 overflow-hidden rounded-full bg-neutral-700">
          <div
            className="h-full rounded-full bg-accent-500"
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
  globeSize = 3.5, // Default to 3.5x size (between 3-4x as requested)
  markerSize = 0.0005, // Much smaller default marker
  labelSize = 0.2, // Small label (20% of original size)
}) => {
  // Detect if device is mobile/low-performance
  const [isHighQuality, setIsHighQuality] = useState<boolean | null>(null);
  const [showHints, setShowHints] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set isMounted to true when component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const checkPerformance = () => {
      // Simple performance check based on device
      const isMobile = window.innerWidth < 768;
      const isLowPowerDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);

      setIsHighQuality(!isMobile && !isLowPowerDevice);
    };

    checkPerformance();
    window.addEventListener("resize", checkPerformance);

    return () => {
      window.removeEventListener("resize", checkPerformance);
    };
  }, [isMounted]);

  // Hide interaction hints after delay
  useEffect(() => {
    if (!isMounted || !showHints) return;

    const timer = setTimeout(() => {
      setShowHints(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showHints, isMounted]);

  // Wheel event handler to prevent scrolling
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (isHovering) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [isHovering],
  );

  // Add and remove wheel event listener
  useEffect(() => {
    if (!isMounted) return;

    // We need to use passive: false to be able to prevent default
    // but this requires us to use addEventListener directly
    const options = { passive: false };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, options);

      return () => {
        container.removeEventListener(
          "wheel",
          handleWheel,
          options as EventListenerOptions,
        );
      };
    }
  }, [isMounted, handleWheel]);

  // Mouse enter/leave handlers
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

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

  // Adjust camera position based on globe size
  const cameraZ = 2.5 + globeSize * 0.5; // Increase camera distance proportionally

  return (
    <div
      ref={containerRef}
      className={`relative aspect-square h-full w-full ${className} overflow-hidden`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ touchAction: isHovering ? "none" : "auto" }} // Prevent touch scrolling when hovering
    >
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 60 }}
        dpr={[1, Math.min(2, window.devicePixelRatio)]} // Now safe since we only render on client
        performance={{ min: 0.5 }}
        gl={{
          antialias: isHighQuality,
          powerPreference: "high-performance",
          alpha: true,
        }}
      >
        <Suspense fallback={<Loader />}>
          <InteractiveGlobe
            markerPosition={[42.6977, 23.3219]} // Sofia, Bulgaria
            markerLabel={markerLabel}
            autoRotate={true}
            autoRotateSpeed={0.9}
            highQuality={isHighQuality}
            size={globeSize} // Apply the larger size
            markerSize={markerSize} // Apply custom marker size
            labelSize={labelSize} // Apply custom label size
          />
        </Suspense>
      </Canvas>

      {/* We removed the static label as it's now part of the 3D scene */}

      {/* Interaction hints */}
      {showHints && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform rounded-lg bg-neutral-900/70 px-3 py-2 text-center text-sm text-white backdrop-blur-sm transition-opacity duration-300">
          <p>Drag to rotate • Scroll to zoom</p>
        </div>
      )}
    </div>
  );
};

export default GlobeContainer;
