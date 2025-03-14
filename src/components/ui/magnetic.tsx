// src/components/ui/magnetic-button.tsx
"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useSpring, useTransform, MotionValue } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { usePerformance } from "~/lib/perf";
import { cn } from "~/lib/utils";
import { useSmoothScroll } from "~/provider/SmoothScrollProvider";

// Define button variants using cva
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-accent-500 text-white hover:bg-accent-400",
        gradient: "bg-gradient-to-r from-accent-600 to-accent-400 text-white",
        outline:
          "border border-white/30 text-white backdrop-blur-sm hover:border-white",
        ghost: "text-white hover:bg-white/10",
        secondary: "bg-secondary-500 text-white hover:bg-secondary-400",
      },
      size: {
        sm: "h-9 px-4 py-1.5 text-sm",
        default: "h-10 px-6 py-2",
        md: "h-11 px-6 py-2.5 text-base",
        lg: "h-12 px-8 py-3 text-lg",
        xl: "h-14 px-8 py-4 text-lg",
      },
      glow: {
        true: "hover:shadow-glow",
        false: "",
      },
      magnetic: {
        true: "",
        false: "",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      glow: false,
      magnetic: false,
      fullWidth: false,
    },
  },
);

// Button props interface
export interface MagneticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
  as?: React.ElementType;
  magneticStrength?: number;
  magneticRadius?: number;
  magneticEase?: number;
  magneticScale?: number;
  glowColor?: string;
  children: React.ReactNode;
  buttonClassName?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  loadingText?: string;
}

export const MagneticButton = React.forwardRef<
  HTMLButtonElement,
  MagneticButtonProps
>(
  (
    {
      className,
      variant,
      size,
      glow = false,
      magnetic = false,
      fullWidth = false,
      href,
      as,
      magneticStrength = 0.3,
      magneticRadius = 150,
      magneticEase = 0.15,
      magneticScale = 1.05,
      glowColor,
      children,
      buttonClassName,
      icon,
      iconPosition = "right",
      isLoading = false,
      loadingText,
      ...props
    },
    ref,
  ) => {
    // Refs and state
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [hovered, setHovered] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Get performance settings to adapt behavior
    const { enableAdvancedAnimations, level } = usePerformance();
    const { lenis } = useSmoothScroll();

    // Skip magnetic effect on lower performance devices
    const useMagnetic = magnetic && enableAdvancedAnimations && level !== "low";

    // Set up motion values with appropriate spring configuration
    const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
    const x = useSpring(0, springConfig);
    const y = useSpring(0, springConfig);
    const scale = useSpring(1, springConfig);

    // Add subtle rotation for more natural movement
    const rotateX = useSpring(0, springConfig);
    const rotateY = useSpring(0, springConfig);

    // Track refs for cleanup
    const animationRef = useRef<number | null>(null);
    const lastMousePosition = useRef({ x: 0, y: 0 });

    // Handle SSR
    useEffect(() => {
      setIsClient(true);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, []);

    // Mouse move handler
    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!buttonRef.current || !useMagnetic) return;

        const { clientX, clientY } = e;
        lastMousePosition.current = { x: clientX, y: clientY };

        // Only process movement if no animation frame is pending
        if (!animationRef.current) {
          animationRef.current = requestAnimationFrame(() => {
            animationFrameCallback();
            animationRef.current = null;
          });
        }
      },
      [useMagnetic],
    );

    // Animation frame callback to calculate magnetic effect
    const animationFrameCallback = useCallback(() => {
      if (!buttonRef.current || !hovered) return;

      const { x: clientX, y: clientY } = lastMousePosition.current;
      const { left, top, width, height } =
        buttonRef.current.getBoundingClientRect();

      const centerX = left + width / 2;
      const centerY = top + height / 2;

      // Calculate distance from cursor to center
      const distanceX = centerX - clientX;
      const distanceY = centerY - clientY;
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      // Only apply effect if mouse is within radius
      if (distance < magneticRadius) {
        const magneticPull = (magneticRadius - distance) / magneticRadius;

        // Move TOWARD the cursor instead of away (using negative value)
        x.set(-distanceX * magneticPull * magneticStrength);
        y.set(-distanceY * magneticPull * magneticStrength);

        // Add subtle rotation for enhanced effect
        rotateX.set(distanceY * magneticPull * 0.1);
        rotateY.set(-distanceX * magneticPull * 0.1);

        // Scale up slightly when close
        scale.set(1 + magneticPull * (magneticScale - 1));
      }
    }, [
      hovered,
      magneticRadius,
      magneticStrength,
      magneticScale,
      x,
      y,
      rotateX,
      rotateY,
      scale,
    ]);

    // Mouse enter/leave handlers
    const handleMouseEnter = useCallback(() => {
      setHovered(true);
      lenis?.stop(); // Stop scrolling while hovering for better UX
    }, [lenis]);

    const handleMouseLeave = useCallback(() => {
      setHovered(false);
      x.set(0);
      y.set(0);
      rotateX.set(0);
      rotateY.set(0);
      scale.set(1);
      lenis?.start(); // Resume scrolling
    }, [x, y, rotateX, rotateY, scale, lenis]);

    // Set up event listeners
    useEffect(() => {
      if (!isClient || !useMagnetic) return;

      window.addEventListener("mousemove", handleMouseMove, { passive: true });

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }, [isClient, handleMouseMove, useMagnetic]);

    // Determine component to render
    const Component = as || (href ? "a" : "button");

    // Handle loading state
    const buttonContent = isLoading ? (
      <>
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        {loadingText || children}
      </>
    ) : (
      <>
        {icon && iconPosition === "left" && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
        {icon && iconPosition === "right" && (
          <span className="ml-2">{icon}</span>
        )}
      </>
    );

    // Determine glow color based on variant
    const getGlowColor = () => {
      if (glowColor) return glowColor;

      switch (variant) {
        case "primary":
        case "gradient":
          return "rgba(124, 58, 237, 0.5)"; // Accent color
        case "secondary":
          return "rgba(5, 150, 105, 0.5)"; // Secondary color
        default:
          return "rgba(255, 255, 255, 0.3)"; // White for other variants
      }
    };

    const Tag = Component as any;
    if (!isClient) {
      // SSR fallback
      return (
        <Tag
          ref={ref}
          href={href}
          className={cn(
            buttonVariants({ variant, size, glow, magnetic: false, fullWidth }),
            buttonClassName,
          )}
          {...props}
        >
          {buttonContent}
        </Tag>
      );
    }

    if (!useMagnetic) {
      // Non-magnetic version
      return (
        <Tag
          ref={ref}
          href={href}
          className={cn(
            buttonVariants({ variant, size, glow, magnetic: false, fullWidth }),
            buttonClassName,
          )}
          {...props}
        >
          {buttonContent}
          {glow && (
            <div
              className="absolute inset-0 -z-10 rounded-full opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
              style={{ backgroundColor: getGlowColor() }}
            />
          )}
        </Tag>
      );
    }

    // Magnetic version
    return (
      <motion.div
        className={cn("relative", className)}
        style={{ transformStyle: "preserve-3d" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{ scale: 1 }}
      >
        <motion.div
          style={{
            x,
            y,
            rotateX,
            rotateY,
            scale,
            transformStyle: "preserve-3d",
          }}
          transition={{ ease: "linear", duration: magneticEase }}
        >
          <Tag
            ref={(el: HTMLButtonElement) => {
              // Handle both forwardRef and our local ref
              buttonRef.current = el;
              if (typeof ref === "function") {
                ref(el);
              } else if (ref) {
                ref.current = el;
              }
            }}
            href={href}
            className={cn(
              buttonVariants({
                variant,
                size,
                glow,
                magnetic: true,
                fullWidth,
              }),
              "relative transition-colors duration-300",
              glow ? "group" : "",
              buttonClassName,
            )}
            {...props}
          >
            {buttonContent}

            {/* Glow effect */}
            {glow && (
              <div
                className="absolute inset-0 -z-10 rounded-full opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
                style={{ backgroundColor: getGlowColor() }}
              />
            )}

            {/* Optional shine effect */}
            {variant === "gradient" && (
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div
                  className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  style={{
                    left: "-50%",
                    animation: "shine 2s infinite",
                    animationDelay: "1s",
                  }}
                />
              </div>
            )}
          </Tag>
        </motion.div>
      </motion.div>
    );
  },
);

MagneticButton.displayName = "MagneticButton";
