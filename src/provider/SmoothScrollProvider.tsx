"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import Lenis from "@studio-freight/lenis";
import { useIsomorphicLayoutEffect } from "~/hooks/useIsomorphicLayout";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scroll: {
    current: number;
    progress: number;
    velocity: number;
    direction: "up" | "down" | null;
  };
  scrollTo: (
    target: HTMLElement | string | number,
    options?: ScrollToOptions,
  ) => void;
  stop: () => void;
  start: () => void;
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

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scroll: {
    current: 0,
    progress: 0,
    velocity: 0,
    direction: null,
  },
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
});

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

export function SmoothScrollProvider({
  children,
  options = {},
}: SmoothScrollProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const reqIdRef = useRef<number | null>(null);
  const [scrollState, setScrollState] = useState({
    current: 0,
    progress: 0,
    velocity: 0,
    direction: null as "up" | "down" | null,
  });

  // Initialize Lenis with default options
  useIsomorphicLayoutEffect(() => {
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 2,
      wheelMultiplier: 1,
      ...options,
    });

    setLenis(lenisInstance);

    // Clean up on unmount
    return () => {
      if (reqIdRef.current) {
        cancelAnimationFrame(reqIdRef.current);
      }
      lenisInstance.destroy();
    };
  }, [options]);

  // Set up GSAP ScrollTrigger integration
  useEffect(() => {
    if (!lenis) return;

    gsap.registerPlugin(ScrollTrigger);

    // Update ScrollTrigger on scroll
    lenis.on("scroll", ScrollTrigger.update);

    // Tell ScrollTrigger to use these proxy methods for the root scroller
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value!, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: "transform",
    });

    // Refresh ScrollTrigger and update scroll on page resize
    const resizeObserver = new ResizeObserver(() => {
      ScrollTrigger.refresh();
    });
    resizeObserver.observe(document.documentElement);

    // Clean up
    return () => {
      resizeObserver.disconnect();
      lenis.off("scroll", ScrollTrigger.update);
    };
  }, [lenis]);

  // Raf animation loop
  const raf = useCallback(
    (time: number) => {
      if (!lenis) return;
      lenis.raf(time);
      reqIdRef.current = requestAnimationFrame(raf);
    },
    [lenis],
  );

  // Start the animation loop when lenis is ready
  useEffect(() => {
    if (!lenis) return;

    // Update scroll state on scroll
    const handleScroll = (e: {
      scroll: number;
      progress: number;
      velocity: number;
      direction: 1 | -1;
    }) => {
      setScrollState({
        current: e.scroll,
        progress: e.progress,
        velocity: e.velocity,
        direction: e.direction === 1 ? "down" : "up",
      });
    };

    lenis.on("scroll", handleScroll);

    reqIdRef.current = requestAnimationFrame(raf);

    return () => {
      lenis.off("scroll", handleScroll);
      if (reqIdRef.current) {
        cancelAnimationFrame(reqIdRef.current);
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

  return (
    <SmoothScrollContext.Provider
      value={{
        lenis,
        scroll: scrollState,
        scrollTo,
        stop,
        start,
      }}
    >
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

export function Parallax({
  children,
  speed = 0.5,
  direction = "up",
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}) {
  const { scroll } = useSmoothScroll();
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");

  useEffect(() => {
    if (!ref.current) return;

    const handleScroll = () => {
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;

      if (isInView) {
        const scrollPos = scroll.current;
        const offsetFromTop = rect.top + scrollPos;
        const windowHeight = window.innerHeight;
        const elementVisibility =
          (scrollPos + windowHeight - offsetFromTop) /
          (windowHeight + rect.height);

        // Calculate movement based on element's visibility in the viewport
        const movement = (elementVisibility - 0.5) * speed * 100;

        let newTransform = "";
        switch (direction) {
          case "up":
            newTransform = `translateY(${-movement}px)`;
            break;
          case "down":
            newTransform = `translateY(${movement}px)`;
            break;
          case "left":
            newTransform = `translateX(${-movement}px)`;
            break;
          case "right":
            newTransform = `translateX(${movement}px)`;
            break;
        }

        setTransform(newTransform);
      }
    };

    // Initial calculation
    handleScroll();

    // Subscribe to scroll updates
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scroll, speed, direction]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform,
        transition: "transform 0.1s linear",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  threshold = 0.1,
  className = "",
  once = true,
}: {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  threshold?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry!.isIntersecting) {
          setIsInView(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold },
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [threshold, once]);

  const getTransform = () => {
    const distance = 50; // px
    if (!isInView) {
      switch (direction) {
        case "up":
          return `translateY(${distance}px)`;
        case "down":
          return `translateY(-${distance}px)`;
        case "left":
          return `translateX(${distance}px)`;
        case "right":
          return `translateX(-${distance}px)`;
      }
    }
    return "translate(0, 0)";
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: getTransform(),
        opacity: isInView ? 1 : 0,
        transition: `transform 0.7s ease-out ${delay}s, opacity 0.7s ease-out ${delay}s`,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}
