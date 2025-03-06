// src/components/scroll/smooth-scroll.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";

interface SmoothScrollProps {
  children: React.ReactNode;
}

export const SmoothScroll: React.FC<SmoothScrollProps> = ({ children }) => {
  // Reference to the scrollable container
  const scrollRef = useRef<HTMLDivElement>(null);

  // State to store dimensions
  const [pageHeight, setPageHeight] = useState(0);

  // Scroll values
  const { scrollY } = useScroll();
  const transform = useTransform(scrollY, [0, pageHeight], [0, -pageHeight]);

  // Smooth physics
  const smoothTransform = useSpring(transform, {
    damping: 15,
    mass: 0.1,
    stiffness: 100,
  });

  // Update dimensions when content changes
  useEffect(() => {
    const updateHeight = () => {
      if (scrollRef.current) {
        const contentHeight = scrollRef.current.scrollHeight;
        setPageHeight(contentHeight);
        document.body.style.height = `${contentHeight}px`;
      }
    };

    // Initial height
    updateHeight();

    // Update on resize or content change
    window.addEventListener("resize", updateHeight);
    const resizeObserver = new ResizeObserver(updateHeight);
    if (scrollRef.current) resizeObserver.observe(scrollRef.current);

    return () => {
      window.removeEventListener("resize", updateHeight);
      if (scrollRef.current) resizeObserver.unobserve(scrollRef.current);
      document.body.style.height = "auto";
    };
  }, [children]);

  // Custom scroll tracking for better visual feedback
  const [direction, setDirection] = useState<"up" | "down" | null>(null);
  const [velocity, setVelocity] = useState(0);
  const prevScrollY = useRef(0);

  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      const current = latest;
      const previous = prevScrollY.current;

      // Calculate direction
      const dir = current > previous ? "down" : "up";
      setDirection(dir);

      // Calculate velocity (with dampening)
      const delta = current - previous;
      setVelocity(Math.abs(delta) * 0.01);

      prevScrollY.current = current;
    });

    return () => unsubscribe();
  }, [scrollY]);

  return (
    <>
      {/* Custom cursor element that reacts to scroll */}
      <ScrollCursor direction={direction} velocity={velocity} />

      {/* Smooth scroll container */}
      <motion.div
        ref={scrollRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          y: smoothTransform,
        }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </>
  );
};

// Custom cursor component that reacts to scroll speed and direction
interface ScrollCursorProps {
  direction: "up" | "down" | null;
  velocity: number;
}

const ScrollCursor: React.FC<ScrollCursorProps> = ({ direction, velocity }) => {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Calculate size based on velocity
  const cursorSize = 20 + velocity * 100;

  return (
    <motion.div
      className="pointer-events-none fixed z-50 mix-blend-difference"
      style={{
        left: mousePos.x,
        top: mousePos.y,
        x: "-50%",
        y: "-50%",
      }}
      animate={{
        width: cursorSize,
        height: cursorSize,
        opacity: visible ? 1 : 0,
        backgroundColor:
          direction === "down"
            ? "#C026D3"
            : direction === "up"
              ? "#3730A3"
              : "#ffffff",
        borderRadius: "50%",
      }}
      transition={{
        duration: 0.15,
        ease: "easeOut",
      }}
    />
  );
};

// Custom scroll reveal component for elements
interface RevealProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
}

export const ScrollReveal: React.FC<RevealProps> = ({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  threshold = 0.1,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry!.isIntersecting);
      },
      { threshold },
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [threshold]);

  // Define animations for different directions
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 60 : direction === "down" ? -60 : 0,
      x: direction === "left" ? 60 : direction === "right" ? -60 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Custom ease for smooth reveals
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

// Parallax effect component
interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  direction?: "up" | "down";
}

export const Parallax: React.FC<ParallaxProps> = ({
  children,
  speed = 0.5,
  className = "",
  direction = "up",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Calculate parallax effect (negative speed moves opposite to scroll)
  const parallaxEffect = direction === "up" ? -speed : speed;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `${parallaxEffect * 100}%`],
  );

  return (
    <motion.div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </motion.div>
  );
};
