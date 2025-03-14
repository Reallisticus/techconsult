// src/provider/AnimationProvider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { usePerformance } from "~/lib/perf";
import { useSmoothScroll } from "./SmoothScrollProvider";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Animation Context Type
interface AnimationContextType {
  // Global state
  isPageLoaded: boolean;
  isNavigating: boolean;
  currentSection: string;
  lastScrollPosition: number;

  // Theme
  isDarkTheme: boolean;
  toggleTheme: () => void;

  // Animation utilities
  registerScrollTrigger: (
    id: string,
    trigger: Element | string,
    config: ScrollTriggerConfig,
  ) => gsap.core.Timeline | undefined;
  unregisterScrollTrigger: (id: string) => void;
  createSplitText: (
    element: Element | string,
    config?: {
      type?: string | undefined;
      linesClass?: string | undefined;
      charsClass?: string | undefined;
      wordsClass?: string | undefined;
    },
  ) => any;

  // Page transitions
  transitionIn: (callback?: () => void) => void;
  transitionOut: (callback?: () => void) => void;

  // Animation control
  pauseAnimations: () => void;
  resumeAnimations: () => void;
  refreshAnimations: () => void;

  // Mouse position for hover effects
  mousePosition: { x: number; y: number };
}

// ScrollTrigger Configuration Type
interface ScrollTriggerConfig {
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
  toggleActions?: string;
  pin?: boolean | Element | string;
  anticipatePin?: number;
  onEnter?: (self: ScrollTrigger) => void;
  onLeave?: (self: ScrollTrigger) => void;
  onEnterBack?: (self: ScrollTrigger) => void;
  onLeaveBack?: (self: ScrollTrigger) => void;
  onUpdate?: (self: ScrollTrigger) => void;
  onToggle?: (self: ScrollTrigger) => void;
  invalidateOnRefresh?: boolean;
  animation?: gsap.core.Timeline;
}

// Default Context Values
const defaultContextValue: AnimationContextType = {
  isPageLoaded: false,
  isNavigating: false,
  currentSection: "",
  lastScrollPosition: 0,

  isDarkTheme: true,
  toggleTheme: () => {},

  registerScrollTrigger: () => undefined,
  unregisterScrollTrigger: () => {},
  createSplitText: () => null,

  transitionIn: () => {},
  transitionOut: () => {},

  pauseAnimations: () => {},
  resumeAnimations: () => {},
  refreshAnimations: () => {},

  mousePosition: { x: 0, y: 0 },
};

// Create Context
const AnimationContext =
  createContext<AnimationContextType>(defaultContextValue);

// Provider Props
interface AnimationProviderProps {
  children: React.ReactNode;
}

// Provider Component
export const AnimationProvider: React.FC<AnimationProviderProps> = ({
  children,
}) => {
  // Get performance settings
  const { level, enableAdvancedAnimations } = usePerformance();
  const { lenis } = useSmoothScroll();

  // State
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentSection, setCurrentSection] = useState("");
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Refs for all registered scroll triggers
  const scrollTriggersRef = useRef<Map<string, ScrollTrigger>>(new Map());
  const timelinesRef = useRef<Map<string, gsap.core.Timeline>>(new Map());

  // Set page loaded state on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Track mouse position for hover effects - throttled for performance
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Throttle for performance
    let lastUpdateTime = 0;
    const updateThreshold =
      level === "low" ? 100 : level === "medium" ? 50 : 16;

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastUpdateTime < updateThreshold) return;

      lastUpdateTime = now;
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [level]);

  // Monitor scroll position for direction detection
  useEffect(() => {
    if (!lenis) return;

    const handleScroll = () => {
      setLastScrollPosition(lenis.scroll);
    };

    lenis.on("scroll", handleScroll);

    return () => {
      lenis.off("scroll", handleScroll);
    };
  }, [lenis]);

  // Handle theme toggle
  const toggleTheme = useCallback(() => {
    setIsDarkTheme((prev) => !prev);

    // Apply theme class to html element
    if (typeof document !== "undefined") {
      if (isDarkTheme) {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
      }
    }
  }, [isDarkTheme]);

  // Register a ScrollTrigger animation
  const registerScrollTrigger = useCallback(
    (
      id: string,
      trigger: Element | string,
      config: ScrollTriggerConfig,
    ): gsap.core.Timeline | undefined => {
      // Skip for low performance when advanced animations are disabled
      if (level === "low" && !enableAdvancedAnimations) return undefined;

      // Create timeline if not provided
      const timeline = config.animation || gsap.timeline();

      // Create the ScrollTrigger
      const st = ScrollTrigger.create({
        trigger,
        start: config.start || "top 80%",
        end: config.end || "bottom 20%",
        scrub: config.scrub || false,
        markers: config.markers || false,
        toggleActions: config.toggleActions || "play none none reverse",
        pin: config.pin || false,
        anticipatePin: config.anticipatePin,
        onEnter: config.onEnter,
        onLeave: config.onLeave,
        onEnterBack: config.onEnterBack,
        onLeaveBack: config.onLeaveBack,
        onUpdate: config.onUpdate,
        onToggle: config.onToggle,
        invalidateOnRefresh: config.invalidateOnRefresh,
        animation: timeline,
      });

      // Store the ScrollTrigger and timeline
      scrollTriggersRef.current.set(id, st);
      timelinesRef.current.set(id, timeline);

      return timeline;
    },
    [level, enableAdvancedAnimations],
  );

  // Unregister a ScrollTrigger animation
  const unregisterScrollTrigger = useCallback((id: string) => {
    const st = scrollTriggersRef.current.get(id);
    if (st) {
      st.kill();
      scrollTriggersRef.current.delete(id);
    }

    const timeline = timelinesRef.current.get(id);
    if (timeline) {
      timeline.kill();
      timelinesRef.current.delete(id);
    }
  }, []);

  // Create split text for text animations - GSAP SplitText compatible API
  const createSplitText = useCallback(
    (
      element: Element | string,
      config = {
        type: "words,chars",
        charsClass: "char",
        wordsClass: "word",
        linesClass: "line",
      } as {
        type?: string;
        charsClass?: string;
        wordsClass?: string;
        linesClass?: string;
      },
    ) => {
      // Skip for low performance when advanced animations are disabled
      if (level === "low" && !enableAdvancedAnimations) return null;

      // Get the element
      const targetElement =
        typeof element === "string" ? document.querySelector(element) : element;
      if (!targetElement) return null;

      // Default implementation that mimics GSAP SplitText
      // In a real implementation, you'd use GSAP SplitText or another library
      const content = targetElement.innerHTML;
      const types = config.type?.split(",") || ["words", "chars"];

      // Split text
      let splitHTML = content;

      // Split by lines first if needed
      if (types.includes("lines")) {
        // For simplicity, we're just wrapping existing content
        // A full implementation would do actual line splitting
        splitHTML = `<div class="${config.linesClass}">${splitHTML}</div>`;
      }

      // Split by words
      if (types.includes("words")) {
        splitHTML = splitHTML.replace(
          /(\S+)/g,
          `<div class="${config.wordsClass}">$1</div>`,
        );
      }

      // Split by chars
      if (types.includes("chars")) {
        splitHTML = splitHTML.replace(
          /(<div class="${config.wordsClass}">)(\S+)(<\/div>)/g,
          (match, p1, p2, p3) => {
            const chars = p2
              .split("")
              .map(
                (char: any) =>
                  `<div class="${config.charsClass}">${char}</div>`,
              )
              .join("");
            return `${p1}${chars}${p3}`;
          },
        );
      }

      // Set the HTML
      targetElement.innerHTML = splitHTML;

      // Return an object with references to the split elements
      const linesElements = targetElement.querySelectorAll(
        `.${config.linesClass}`,
      );
      const wordsElements = targetElement.querySelectorAll(
        `.${config.wordsClass}`,
      );
      const charsElements = targetElement.querySelectorAll(
        `.${config.charsClass}`,
      );

      return {
        lines: Array.from(linesElements),
        words: Array.from(wordsElements),
        chars: Array.from(charsElements),
        revert: () => {
          targetElement.innerHTML = content;
        },
      };
    },
    [level, enableAdvancedAnimations],
  );

  // Page transition effects
  const transitionIn = useCallback((callback?: () => void) => {
    // Simple fade in effect
    const tl = gsap.timeline({
      onComplete: () => {
        if (callback) callback();
      },
    });

    tl.fromTo(
      "body > main",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
    );

    return tl;
  }, []);

  const transitionOut = useCallback((callback?: () => void) => {
    // Simple fade out effect
    const tl = gsap.timeline({
      onComplete: () => {
        if (callback) callback();
      },
    });

    tl.to("body > main", {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: "power2.in",
    });

    return tl;
  }, []);

  // Animation control functions
  const pauseAnimations = useCallback(() => {
    // Pause all active animations
    gsap.globalTimeline.pause();

    // Pause Lenis scrolling
    if (lenis) {
      lenis.stop();
    }
  }, [lenis]);

  const resumeAnimations = useCallback(() => {
    // Resume all animations
    gsap.globalTimeline.resume();

    // Resume Lenis scrolling
    if (lenis) {
      lenis.start();
    }
  }, [lenis]);

  const refreshAnimations = useCallback(() => {
    // Refresh all ScrollTrigger instances
    ScrollTrigger.refresh(true);
  }, []);

  // Create context value
  const contextValue: AnimationContextType = {
    isPageLoaded,
    isNavigating,
    currentSection,
    lastScrollPosition,

    isDarkTheme,
    toggleTheme,

    registerScrollTrigger,
    unregisterScrollTrigger,
    createSplitText,

    transitionIn,
    transitionOut,

    pauseAnimations,
    resumeAnimations,
    refreshAnimations,

    mousePosition,
  };

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};

// Custom hook to use the context
export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error("useAnimation must be used within an AnimationProvider");
  }
  return context;
};

// Hook to create a reveal animation
export const useRevealAnimation = (
  element: React.RefObject<HTMLElement>,
  options = {
    direction: "up" as "up" | "down" | "left" | "right",
    duration: 0.6,
    delay: 0,
    distance: 50,
    stagger: 0.1,
    start: "top 80%",
    end: "bottom 20%",
    scrub: false,
    once: true,
  },
) => {
  const { registerScrollTrigger, unregisterScrollTrigger } = useAnimation();
  const { level, enableAdvancedAnimations } = usePerformance();
  const id = useRef(
    `reveal-${Math.random().toString(36).substr(2, 9)}`,
  ).current;

  useEffect(() => {
    if (!element.current) return;

    // Skip complex animations for low performance settings
    if (level === "low" && !enableAdvancedAnimations) {
      // Simple fade in without scroll trigger
      gsap.set(element.current, { opacity: 0 });
      gsap.to(element.current, { opacity: 1, duration: 0.6, delay: 0.2 });
      return;
    }

    const getTransform = () => {
      switch (options.direction) {
        case "up":
          return { y: options.distance };
        case "down":
          return { y: -options.distance };
        case "left":
          return { x: options.distance };
        case "right":
          return { x: -options.distance };
      }
    };

    // Create revealing animation
    const tl = gsap.timeline({ paused: true });
    tl.from(element.current, {
      opacity: 0,
      ...getTransform(),
      duration: options.duration,
      delay: options.delay,
      ease: "power2.out",
    });

    // Register with scroll trigger
    const timeline = registerScrollTrigger(id, element.current, {
      start: options.start,
      end: options.end,
      scrub: options.scrub,
      toggleActions: options.once
        ? "play none none none"
        : "play reverse play reverse",
      animation: tl,
    });

    return () => {
      unregisterScrollTrigger(id);
    };
  }, [
    element,
    registerScrollTrigger,
    unregisterScrollTrigger,
    id,
    options.delay,
    options.direction,
    options.distance,
    options.duration,
    options.end,
    options.once,
    options.scrub,
    options.stagger,
    options.start,
    level,
    enableAdvancedAnimations,
  ]);
};

// Mouse-following animation hook
export const useMouseFollower = (
  ref: React.RefObject<HTMLElement>,
  options = {
    strength: 0.1,
    ease: 0.1,
    scale: 1.05,
    radius: 300,
  },
) => {
  const { mousePosition } = useAnimation();
  const { enableAdvancedAnimations } = usePerformance();

  // Store current position state
  const positionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!ref.current || !enableAdvancedAnimations) return;

    let animationFrameId: number;

    // Animation loop
    const animate = () => {
      if (!ref.current) return;

      const element = ref.current;
      const rect = element.getBoundingClientRect();

      // Element center
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Distance from mouse to center
      const distanceX = mousePosition.x - centerX;
      const distanceY = mousePosition.y - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      // Calculate movement based on distance
      if (distance < options.radius) {
        // Mouse is within influence radius
        const magneticPull = (options.radius - distance) / options.radius;

        // Target position
        const targetX = -distanceX * magneticPull * options.strength;
        const targetY = -distanceY * magneticPull * options.strength;

        // Apply easing
        positionRef.current.x +=
          (targetX - positionRef.current.x) * options.ease;
        positionRef.current.y +=
          (targetY - positionRef.current.y) * options.ease;

        // Scale effect
        const scale = 1 + (options.scale - 1) * magneticPull;

        // Apply transform
        element.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px) scale(${scale})`;
      } else {
        // Return to original position
        positionRef.current.x += (0 - positionRef.current.x) * options.ease;
        positionRef.current.y += (0 - positionRef.current.y) * options.ease;

        // Only update if there's still movement
        if (
          Math.abs(positionRef.current.x) > 0.01 ||
          Math.abs(positionRef.current.y) > 0.01
        ) {
          element.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px) scale(1)`;
        } else {
          // Reset transform when close enough to original
          element.style.transform = "";
          positionRef.current.x = 0;
          positionRef.current.y = 0;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      // Reset transform on unmount
      if (ref.current) {
        ref.current.style.transform = "";
      }
    };
  }, [
    mousePosition,
    enableAdvancedAnimations,
    options.ease,
    options.radius,
    options.scale,
    options.strength,
  ]);

  return {
    position: positionRef.current,
  };
};
