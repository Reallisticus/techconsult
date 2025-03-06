// src/components/ui/magnetic.tsx
"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

type MagneticProps = {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  radius?: number;
  scale?: number;
};

export const Magnetic = ({
  children,
  className = "",
  strength = 40,
  radius = 150,
  scale = 1.05,
}: MagneticProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  // Use spring-based motion values for smooth movement
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const xMotion = useSpring(0, springConfig);
  const yMotion = useSpring(0, springConfig);
  const scaleMotion = useSpring(1, springConfig);

  // Add subtle rotation for more natural movement
  const rotateXMotion = useSpring(0, springConfig);
  const rotateYMotion = useSpring(0, springConfig);

  // Create transforms from the springs
  const x = useTransform(xMotion, (v) => v);
  const y = useTransform(yMotion, (v) => v);
  const rotateX = useTransform(rotateYMotion, (v) => -v * 0.05); // Subtle rotation
  const rotateY = useTransform(rotateXMotion, (v) => v * 0.05); // Subtle rotation
  const s = useTransform(scaleMotion, (v) => v);

  // Debounced handler for performance
  const handleMouseMove = useDebouncedCallback((e: MouseEvent) => {
    if (!ref.current || !hovered) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();

    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // Calculate distance from cursor to center
    const distanceX = centerX - clientX;
    const distanceY = centerY - clientY;

    // Calculate distance from center
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

    // Only apply effect if mouse is within radius
    if (distance < radius) {
      // IMPORTANT: Using negative values here ensures attraction, not repulsion
      const magneticPull = (radius - distance) / radius;

      // Move TOWARD the cursor instead of away (using negative value)
      xMotion.set(-distanceX * magneticPull * (strength / 100));
      yMotion.set(-distanceY * magneticPull * (strength / 100));

      // Add subtle rotation for enhanced effect
      rotateXMotion.set(distanceX * magneticPull * 0.1);
      rotateYMotion.set(distanceY * magneticPull * 0.1);

      // Scale up slightly when close
      scaleMotion.set(1 + magneticPull * (scale - 1));
    }
  }, 5); // 5ms debounce for smoother performance

  const handleMouseEnter = () => {
    setHovered(true);
    scaleMotion.set(scale);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    xMotion.set(0);
    yMotion.set(0);
    rotateXMotion.set(0);
    rotateYMotion.set(0);
    scaleMotion.set(1);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          x,
          y,
          scale: s,
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
