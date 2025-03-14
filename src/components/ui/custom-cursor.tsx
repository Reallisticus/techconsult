// src/components/ui/custom-cursor.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { usePerformance } from "~/lib/perf";
import { cn } from "~/lib/utils";

interface CustomCursorProps {
  /**
   * Class name to apply to the cursor.
   */
  className?: string;

  /**
   * Color of the cursor.
   * @default "accent-500"
   */
  color?: string;

  /**
   * Size of the cursor in pixels. This is the diameter.
   * @default 32
   */
  size?: number;

  /**
   * Size of the cursor when hovering over a clickable element.
   * @default 48
   */
  hoverSize?: number;

  /**
   * Cursor styling when hovering over a clickable element.
   */
  hoverClassName?: string;

  /**
   * Border width in pixels.
   * @default 2
   */
  borderWidth?: number;

  /**
   * Transition speed factor. Higher is faster.
   * @default 0.15
   */
  transitionSpeed?: number;

  /**
   * Whether to enable the trail effect.
   * @default true
   */
  enableTrail?: boolean;

  /**
   * Selector for clickable elements.
   * @default "a, button, [role=button], input, textarea, select, [data-cursor-hover]"
   */
  hoverSelectors?: string;

  /**
   * Additional elements to add hover effect to.
   */
  additionalHoverElements?: HTMLElement[];
}

export const CustomCursor: React.FC<CustomCursorProps> = ({
  className,
  color = "accent-500",
  size = 32,
  hoverSize = 48,
  hoverClassName,
  borderWidth = 2,
  transitionSpeed = 0.15,
  enableTrail = true,
  hoverSelectors = "a, button, [role=button], input, textarea, select, [data-cursor-hover]",
  additionalHoverElements = [],
}) => {
  // Performance check - only enable on desktop with high performance
  const { isMobile, isTablet, level } = usePerformance();

  // Skip cursor on mobile/tablet or low performance devices
  if (isMobile || isTablet || level === "low") return null;

  // Client-side rendering check
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <ClientCursor
      className={className}
      color={color}
      size={size}
      hoverSize={hoverSize}
      hoverClassName={hoverClassName}
      borderWidth={borderWidth}
      transitionSpeed={transitionSpeed}
      enableTrail={enableTrail}
      hoverSelectors={hoverSelectors}
      additionalHoverElements={additionalHoverElements}
    />
  );
};

// Separated client-side implementation to avoid SSR issues
const ClientCursor: React.FC<CustomCursorProps> = ({
  className,
  color = "accent-500",
  size = 32,
  hoverSize = 48,
  hoverClassName,
  borderWidth = 2,
  transitionSpeed = 0.15,
  enableTrail = true,
  hoverSelectors = "a, button, [role=button], input, textarea, select, [data-cursor-hover]",
  additionalHoverElements = [],
}) => {
  // Element refs
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  // Track mouse position and hover state
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Use springs for smooth movement
  const springConfig = { damping: 25, stiffness: 300 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  // Trail follows with delay
  const trailX = useSpring(mouseX, { ...springConfig, stiffness: 100 });
  const trailY = useSpring(mouseY, { ...springConfig, stiffness: 100 });

  // Track animation frame for cleanup
  const animationFrameRef = useRef<number | null>(null);

  // Set up mouse event listeners
  useEffect(() => {
    let hoverElements: Element[] = [];

    const updateCursorPosition = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      if (!isVisible) {
        setIsVisible(true);
      }
    };

    const throttledUpdatePosition = (e: MouseEvent) => {
      // Use requestAnimationFrame for smoother performance
      if (animationFrameRef.current) return;

      animationFrameRef.current = requestAnimationFrame(() => {
        updateCursorPosition(e);
        animationFrameRef.current = null;
      });
    };

    // Handle clicks
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // Handle mouse leaving window
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Initialize hover elements
    const updateHoverElements = () => {
      hoverElements = [
        ...Array.from(document.querySelectorAll(hoverSelectors)),
        ...additionalHoverElements,
      ];

      // Add event listeners to all hover elements
      hoverElements.forEach((element) => {
        element.addEventListener("mouseenter", () => setIsHovering(true));
        element.addEventListener("mouseleave", () => setIsHovering(false));
      });
    };

    // Initialize hover elements after a short delay to ensure DOM is ready
    const initTimeout = setTimeout(updateHoverElements, 500);

    // Set up main event listeners
    window.addEventListener("mousemove", throttledUpdatePosition);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseenter", handleMouseEnter);

    // Refresh hover elements periodically for dynamic content
    const refreshInterval = setInterval(updateHoverElements, 2000);

    // Cleanup
    return () => {
      clearTimeout(initTimeout);
      clearInterval(refreshInterval);

      window.removeEventListener("mousemove", throttledUpdatePosition);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseenter", handleMouseEnter);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Remove hover listeners
      hoverElements.forEach((element) => {
        element.removeEventListener("mouseenter", () => setIsHovering(true));
        element.removeEventListener("mouseleave", () => setIsHovering(false));
      });
    };
  }, [hoverSelectors, additionalHoverElements, mouseX, mouseY, isVisible]);

  // Calculate cursor size based on state
  const cursorSize = isHovering ? hoverSize : size;

  // Determine base styles
  const baseStyles = {
    width: cursorSize,
    height: cursorSize,
    borderWidth,
    transform: "translate(-50%, -50%)",
    borderColor: `rgb(var(--color-${color}))`,
  };

  return (
    <>
      {/* Main Cursor */}
      <motion.div
        ref={cursorRef}
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-[9999] rounded-full border-2 mix-blend-difference transition-[width,height] duration-200",
          isHovering ? hoverClassName : "",
          isClicking ? "scale-90" : "",
          !isVisible ? "opacity-0" : "opacity-100",
          className,
        )}
        style={{
          ...baseStyles,
          x: cursorX,
          y: cursorY,
          transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        }}
      />

      {/* Trail effect (optional) */}
      {enableTrail && (
        <motion.div
          ref={trailRef}
          className={cn(
            "pointer-events-none fixed left-0 top-0 z-[9998] rounded-full mix-blend-difference",
            !isVisible ? "opacity-0" : "opacity-60",
          )}
          style={{
            ...baseStyles,
            width: cursorSize * 0.5,
            height: cursorSize * 0.5,
            backgroundColor: `rgb(var(--color-${color}))`,
            borderWidth: 0,
            x: trailX,
            y: trailY,
          }}
        />
      )}
    </>
  );
};

export default CustomCursor;
