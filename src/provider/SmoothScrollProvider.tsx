// src/provider/SmoothScrollProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import Lenis from "@studio-freight/lenis";
import { useIsomorphicLayoutEffect } from "~/hooks/useIsomorphicLayout";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  AnimationControls,
  MotionValue,
} from "framer-motion";
import { cn } from "~/lib/utils";

// Smooth Scroll Context Types
interface ScrollData {
  current: number;
  progress: number;
  velocity: number;
  direction: "up" | "down" | null;
  limit: number;
}

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scroll: ScrollData;
  scrollTo: (
    target: HTMLElement | string | number,
    options?: ScrollToOptions,
  ) => void;
  stop: () => void;
  start: () => void;
  isReady: boolean;
}

interface ScrollToOptions {
  offset?: number;
  immediate?: boolean;
  duration?: number;
  easing?: (t: number) => number;
  lock?: boolean;
  force?: boolean;
  onComplete?: () => void;
}

// Create context with default values
const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scroll: {
    current: 0,
    progress: 0,
    velocity: 0,
    direction: null,
    limit: 0,
  },
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
  isReady: false,
});

// Provider Props
interface SmoothScrollProviderProps {
  children: ReactNode;
  options?: {
    duration?: number;
    easing?: (t: number) => number;
    smoothWheel?: boolean;
    smoothTouch?: boolean;
    wheelMultiplier?: number;
    touchMultiplier?: number;
    infinite?: boolean;
    orientation?: "vertical" | "horizontal";
    gestureOrientation?: "vertical" | "horizontal" | "both";
    touchInertiaMultiplier?: number;
  };
}

// Throttle function to improve performance
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let inThrottle = false;
  let lastResult: ReturnType<T> | undefined;

  return function (
    this: any,
    ...args: Parameters<T>
  ): ReturnType<T> | undefined {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    return lastResult;
  };
}

// Main Provider Component
export function SmoothScrollProvider({
  children,
  options = {},
}: SmoothScrollProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const requestRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Scroll state with memoization to reduce rerenders
  const [scrollState, setScrollState] = useState<ScrollData>({
    current: 0,
    progress: 0,
    velocity: 0,
    direction: null,
    limit: 0,
  });

  // Refs to prevent unnecessary rerenders
  const prevScrollRef = useRef({
    current: 0,
    progress: 0,
    velocity: 0,
    direction: null as "up" | "down" | null,
  });

  // Initialize Lenis with improved options
  useIsomorphicLayoutEffect(() => {
    // Don't initialize during SSR
    if (typeof window === "undefined") return;

    const defaultOptions = {
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical" as const,
      gestureOrientation: "vertical" as const,
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 2,
      wheelMultiplier: 1,
    };

    // Create Lenis instance with merged options
    const lenisInstance = new Lenis({
      ...defaultOptions,
      ...options,
      // Ensure we have a proper wrapper for Lenis
      wrapper: window,
      content: document.documentElement,
    });

    // Set initial values
    lenisInstance.on(
      "scroll",
      ({ scroll, limit }: { scroll: number; limit: number }) => {
        // Update our limit value
        if (scrollState.limit !== limit) {
          setScrollState((prev) => ({ ...prev, limit }));
        }
      },
    );

    // Set Lenis and mark as ready
    setLenis(lenisInstance);
    setIsReady(true);

    // Clean up on unmount
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      lenisInstance.destroy();
    };
  }, [options.duration, options.smoothWheel]); // Only re-initialize on critical option changes

  // Set up GSAP ScrollTrigger integration
  useEffect(() => {
    if (!lenis || typeof window === "undefined") return;

    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Update ScrollTrigger on scroll
    const scrollTriggerUpdate = throttle(() => {
      ScrollTrigger.update();
    }, 20); // 50fps max update rate for performance

    lenis.on("scroll", scrollTriggerUpdate);

    // Configure ScrollTrigger proxy
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length && lenis) {
          lenis.scrollTo(value as number, { immediate: true });
        }
        return lenis?.scroll || 0;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.documentElement.style.transform ? "transform" : "fixed",
    });

    // Refresh ScrollTrigger on resize
    const resizeObserver = new ResizeObserver(
      throttle(() => {
        ScrollTrigger.refresh(true); // Force recalculation
      }, 100),
    );

    resizeObserver.observe(document.documentElement);

    // Clean up
    return () => {
      lenis.off("scroll", scrollTriggerUpdate);
      resizeObserver.disconnect();
    };
  }, [lenis]);

  // Animation loop with performance optimizations
  const raf = useCallback(
    (time: number) => {
      if (!lenis) return;

      // Process multiple frames at once to avoid RAF congestion
      lenis.raf(time);

      if (document.visibilityState === "visible") {
        requestRef.current = requestAnimationFrame(raf);
      } else {
        // Don't animate when tab is hidden
        setTimeout(() => {
          requestRef.current = requestAnimationFrame(raf);
        }, 300);
      }
    },
    [lenis],
  );

  const handleScroll = useCallback(
    (e: {
      scroll: number;
      progress: number;
      velocity: number;
      direction: 1 | -1;
    }) => {
      // Only update state if values have significantly changed
      const prevState = prevScrollRef.current;
      const newDirection: "up" | "down" | null =
        e.direction === 1 ? "down" : "up";

      // Check for meaningful changes to avoid needless re-renders
      // Use percentage-based thresholds for scroll position
      const currentScrollThreshold = Math.max(1, scrollState.limit * 0.001);
      const significantScrollChange =
        Math.abs(prevState.current - e.scroll) > currentScrollThreshold;
      const significantProgressChange =
        Math.abs(prevState.progress - e.progress) > 0.01;
      const significantVelocityChange =
        Math.abs(prevState.velocity - e.velocity) > 0.05;
      const directionChanged = prevState.direction !== newDirection;

      const hasSignificantChange =
        significantScrollChange ||
        significantProgressChange ||
        significantVelocityChange ||
        directionChanged;

      if (hasSignificantChange) {
        const newState = {
          current: e.scroll,
          progress: e.progress,
          velocity: e.velocity,
          direction: newDirection,
          limit: scrollState.limit,
        };

        prevScrollRef.current = {
          current: e.scroll,
          progress: e.progress,
          velocity: e.velocity,
          direction: newDirection,
        };

        // Use functional state update to avoid stale closures
        setScrollState(newState);
      }
    },
    [scrollState.limit],
  );

  // Set up scroll event handler with performance optimization
  useEffect(() => {
    if (!lenis) return;

    lenis.on("scroll", handleScroll);
    requestRef.current = requestAnimationFrame(raf);

    return () => {
      lenis.off("scroll", handleScroll);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [lenis, raf]);

  // Helper functions
  const scrollTo = useCallback(
    (target: HTMLElement | string | number, options?: ScrollToOptions) => {
      if (!lenis) return;
      lenis.scrollTo(target, options);
    },
    [lenis],
  );

  const stop = useCallback(() => {
    if (!lenis) return;
    lenis.stop();
  }, [lenis]);

  const start = useCallback(() => {
    if (!lenis) return;
    lenis.start();
  }, [lenis]);

  // Memoize context value to prevent unnecessary renders
  const contextValue = useMemo(
    () => ({
      lenis,
      scroll: scrollState,
      scrollTo,
      stop,
      start,
      isReady,
    }),
    [lenis, scrollState, scrollTo, stop, start, isReady],
  );

  return (
    <SmoothScrollContext.Provider value={contextValue}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export const useSmoothScroll = () => {
  const context = useContext(SmoothScrollContext);
  if (!context) {
    throw new Error(
      "useSmoothScroll must be used within a SmoothScrollProvider",
    );
  }
  return context;
};

// Parallax Component with Performance Optimizations
interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
  as?: React.ElementType;
  ease?: number;
}

export function Parallax({
  children,
  speed = 0.5,
  direction = "up",
  className = "",
  as: Component = "div",
  ease = 0.1,
}: ParallaxProps) {
  const { scroll } = useSmoothScroll();
  const ref = useRef<HTMLDivElement>(null);
  const [elementTop, setElementTop] = useState(0);
  const [elementHeight, setElementHeight] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  // Motion values for smoother animations
  const y = useMotionValue(0);
  const x = useMotionValue(0);

  // Calculate element position once it's in the viewport
  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const updatePosition = () => {
      const rect = element.getBoundingClientRect();
      setElementTop(rect.top + scroll.current);
      setElementHeight(rect.height);
      setWindowHeight(window.innerHeight);
    };

    updatePosition();

    // Update on resize
    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [scroll.current]);

  // Update parallax effect on scroll
  useEffect(() => {
    if (elementTop === 0 || elementHeight === 0 || windowHeight === 0) return;

    const handleScroll = () => {
      if (!ref.current) return;

      const scrollPos = scroll.current;
      const elementScrollStart = elementTop - windowHeight;
      const elementScrollEnd = elementTop + elementHeight;

      // Check if element is in view
      if (scrollPos >= elementScrollStart && scrollPos <= elementScrollEnd) {
        // Calculate movement based on element's visibility in the viewport
        const scrollPercentage =
          (scrollPos - elementScrollStart) /
          (elementScrollEnd - elementScrollStart);
        const movement = (scrollPercentage - 0.5) * speed * 100;

        // Apply movement based on direction
        switch (direction) {
          case "up":
            y.set(-movement);
            break;
          case "down":
            y.set(movement);
            break;
          case "left":
            x.set(-movement);
            break;
          case "right":
            x.set(movement);
            break;
        }
      }
    };

    handleScroll();

    return () => {
      // Reset values when unmounting
      y.set(0);
      x.set(0);
    };
  }, [
    scroll.current,
    elementTop,
    elementHeight,
    windowHeight,
    speed,
    direction,
    x,
    y,
  ]);
  const Tag = Component as any;

  return (
    <Tag ref={ref as any} className={className}>
      <motion.div
        style={{ x, y }}
        transition={{ ease: "linear", duration: ease }}
      >
        {children}
      </motion.div>
    </Tag>
  );
}

// Scroll Reveal Component with Animation Controls
interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  threshold?: number;
  className?: string;
  once?: boolean;
  amount?: "some" | "all" | number;
  as?: React.ElementType;
  stagger?: number;
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  threshold = 0.1,
  className = "",
  once = true,
  amount = 0.2,
  as: Component = "div",
  stagger = 0,
}: ScrollRevealProps) {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Initial and animate variants
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 50 : direction === "down" ? -50 : 0,
      x: direction === "left" ? 50 : direction === "right" ? -50 : 0,
    },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        opacity: { duration: 0.5, ease: "easeOut" },
        y: { duration: 0.7, ease: [0.165, 0.84, 0.44, 1] },
        x: { duration: 0.7, ease: [0.165, 0.84, 0.44, 1] },
        delay: delay + stagger * i,
      },
    }),
  };

  // Set up intersection observer
  useEffect(() => {
    if (!ref.current) return;

    // Use IntersectionObserver with better thresholds
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const isNowInView = entry?.intersectionRatio! > threshold;

        // Only update state if visibility actually changed
        if (isNowInView !== isInView) {
          setIsInView(isNowInView);

          if (isNowInView) {
            // Use requestIdleCallback if available to defer animation to idle time
            if (window.requestIdleCallback) {
              window.requestIdleCallback(() => controls.start("visible"), {
                timeout: 300,
              });
            } else {
              controls.start("visible");
            }

            if (once) {
              observer.disconnect();
            }
          } else if (!once) {
            controls.start("hidden");
          }
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [controls, once, threshold, isInView]);

  const Tag = Component as any;
  return (
    <Tag ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div
        initial="hidden"
        animate={controls}
        custom={0}
        variants={variants}
      >
        {children}
      </motion.div>
    </Tag>
  );
}

// Scroll Trigger Component for more complex animations
interface ScrollTriggerProps {
  children: ReactNode;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
  className?: string;
  pin?: boolean;
  animation?: (progress: MotionValue<number>) => Record<string, any>;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
}

export function ScrollTriggerAnimation({
  children,
  start = "top 80%",
  end = "bottom 20%",
  scrub = false,
  markers = false,
  className = "",
  pin = false,
  animation,
  onEnter,
  onLeave,
  onEnterBack,
  onLeaveBack,
}: ScrollTriggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const progressValue = useMotionValue(0);
  const { lenis } = useSmoothScroll();

  // Set up GSAP ScrollTrigger
  useIsomorphicLayoutEffect(() => {
    if (!ref.current || !lenis) return;

    gsap.registerPlugin(ScrollTrigger);

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start,
      end,
      scrub: scrub === true ? true : scrub ? scrub : false,
      markers,
      pin: pin,
      onUpdate: (self) => {
        progressValue.set(self.progress);
      },
      onEnter: onEnter,
      onLeave: onLeave,
      onEnterBack: onEnterBack,
      onLeaveBack: onLeaveBack,
    });

    return () => {
      trigger.kill();
    };
  }, [
    lenis,
    start,
    end,
    scrub,
    markers,
    pin,
    onEnter,
    onLeave,
    onEnterBack,
    onLeaveBack,
  ]);

  // Calculate styles based on animation function
  const animatedStyles = animation ? animation(progressValue) : {};

  return (
    <div ref={ref} className={className}>
      {animation ? (
        <motion.div style={animatedStyles}>{children}</motion.div>
      ) : (
        children
      )}
    </div>
  );
}
