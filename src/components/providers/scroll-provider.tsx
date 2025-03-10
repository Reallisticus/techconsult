"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useAnimation,
} from "framer-motion";
import gsap from "gsap";

interface SmoothScrollProps {
  children: React.ReactNode;
}

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

export const SmoothScroll: React.FC<SmoothScrollProps> = ({ children }) => {
  // Reference to the scrollable container
  const scrollRef = useRef<HTMLDivElement>(null);

  // Create refs with initial values to avoid read-only error
  const [heroSectionElement, setHeroSectionElement] =
    useState<HTMLDivElement | null>(null);
  const [servicesSectionElement, setServicesSectionElement] =
    useState<HTMLDivElement | null>(null);

  // State to store dimensions and tracking
  const [pageHeight, setPageHeight] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [hasZoomed, setHasZoomed] = useState(false);
  const [heroHeight, setHeroHeight] = useState(0);
  const [zoomProgress, setZoomProgress] = useState(0);

  // Controls for animations
  const zoomControls = useAnimation();

  // Scroll values
  const { scrollY } = useScroll();
  const scrollYProgress = useScroll().scrollYProgress;
  const transform = useTransform(scrollY, [0, pageHeight], [0, -pageHeight]);

  // Smooth physics
  const smoothTransform = useSpring(transform, {
    damping: 15,
    mass: 0.1,
    stiffness: 100,
  });

  // Find hero and services sections
  const findSections = useCallback(() => {
    if (!scrollRef.current) return;

    // Find hero and services sections
    const heroSection = scrollRef.current.querySelector(
      ".hero-section",
    ) as HTMLDivElement | null;

    const servicesSection = scrollRef.current.querySelector(
      ".services-section",
    ) as HTMLDivElement | null;

    if (heroSection) {
      setHeroSectionElement(heroSection);
      setHeroHeight(heroSection.offsetHeight);
    }

    if (servicesSection) {
      setServicesSectionElement(servicesSection);
    }
  }, []);

  // Update dimensions when content changes
  useEffect(() => {
    const updateHeight = () => {
      if (scrollRef.current) {
        const contentHeight = scrollRef.current.scrollHeight;
        setPageHeight(contentHeight);
        document.body.style.height = `${contentHeight}px`;

        findSections();
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
  }, [children, findSections]);

  // Zoom effect handler
  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      if (!heroSectionElement || hasZoomed) return;

      // Determine the scroll trigger point (50% through the hero section)
      const zoomTriggerPoint = heroHeight * 0.1;

      // Calculate how far into the zoom effect we are (from 0 to 1)
      const zoomRange = heroHeight * 0.5; // The range over which zooming occurs
      const scrollPosition = latest;

      if (
        scrollPosition >= zoomTriggerPoint &&
        scrollPosition <= zoomTriggerPoint + zoomRange
      ) {
        // We're in the zoom range
        const currentProgress = (scrollPosition - zoomTriggerPoint) / zoomRange;
        setZoomProgress(currentProgress);
        setIsZooming(true);
      } else if (scrollPosition < zoomTriggerPoint) {
        // Before zoom range
        setZoomProgress(0);
        setIsZooming(false);
      } else if (scrollPosition > zoomTriggerPoint + zoomRange) {
        // After zoom range
        setZoomProgress(1);
        setIsZooming(true);

        // Mark as zoomed when we've completed the effect
        if (zoomProgress >= 0.99) {
          setHasZoomed(true);
        }
      }
    });

    return () => unsubscribe();
  }, [scrollY, heroHeight, hasZoomed, heroSectionElement, zoomProgress]);

  // Apply the zoom effect to the hero background
  useEffect(() => {
    if (!heroSectionElement || !isZooming) return;

    // Target the background element
    const heroBackground = heroSectionElement.querySelector(
      ".hero-background",
    ) as HTMLDivElement;
    const heroContent = heroSectionElement.querySelector(
      ".hero-content",
    ) as HTMLDivElement;

    if (!heroBackground || !heroContent) return;

    // Apply zoom effect
    gsap.to(heroBackground, {
      scale: 1 + zoomProgress * 1.5, // Zoom from 1x to 2.5x
      duration: 0.3,
      ease: "power1.out",
      overwrite: true,
    });

    // Fade out content
    gsap.to(heroContent, {
      opacity: 1 - zoomProgress,
      duration: 0.3,
      ease: "power1.out",
      overwrite: true,
    });

    // Once zoom completes, show the services section
    if (zoomProgress >= 0.99 && servicesSectionElement) {
      gsap.to(servicesSectionElement, {
        opacity: 1,
        duration: 0.5,
        delay: 0.2,
        ease: "power2.out",
        overwrite: true,
      });
    }
  }, [zoomProgress, isZooming, heroSectionElement, servicesSectionElement]);

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

  // Logic to handle post-zoom scrolling
  useEffect(() => {
    if (!hasZoomed || !scrollRef.current) return;

    // After the zoom, we need to adjust the scroll behavior to skip past the hero section
    const unsubscribe = scrollY.onChange((latest) => {
      if (latest <= heroHeight && direction === "up") {
        // When scrolling back up to the hero, reset zoom state
        setHasZoomed(false);
        setZoomProgress(0);
        setIsZooming(false);

        // Reset any affected elements
        if (heroSectionElement) {
          const heroBackground = heroSectionElement.querySelector(
            ".hero-background",
          ) as HTMLDivElement;
          const heroContent = heroSectionElement.querySelector(
            ".hero-content",
          ) as HTMLDivElement;

          if (heroBackground) {
            gsap.to(heroBackground, {
              scale: 1,
              duration: 0.5,
              ease: "power2.out",
            });
          }

          if (heroContent) {
            gsap.to(heroContent, {
              opacity: 1,
              duration: 0.5,
              ease: "power2.out",
            });
          }
        }
      }
    });

    return () => unsubscribe();
  }, [hasZoomed, heroHeight, direction, scrollY, heroSectionElement]);

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
