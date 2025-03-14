// src/components/sections/Hero.tsx (updated)

// Update the keywordAnimations section in the Hero component
"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useAnimation } from "~/provider/AnimationProvider";
import { useLanguage } from "~/i18n/context";
import { getDisplayFontClass } from "~/lib/fonts";
import { cn } from "~/lib/utils";
import {
  useSmoothScroll,
  ScrollTriggerAnimation,
} from "~/provider/SmoothScrollProvider";
import { usePerformance, PerformanceGate } from "~/lib/perf";
import { MagneticButton } from "../ui/magnetic";
import { useIsomorphicLayoutEffect } from "~/hooks/useIsomorphicLayout";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { ScrollIndicator } from "../utils/ScrollIndicator";

// Define tech keywords outside component to avoid re-creation on renders
const TECH_KEYWORDS = [
  "React",
  "NextJS",
  "TypeScript",
  "ThreeJS",
  "GSAP",
  "Architecture",
  "Cloud",
  "AI",
  "TailwindCSS",
  "PostgreSQL",
  "Node.js",
  "DevOps",
];

// Update the Hero component to handle client-side only animations
export const Hero: React.FC = () => {
  // Hooks and refs
  const { t, language } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const gsapCtxRef = useRef<gsap.Context | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(true);
  const { isReady, lenis } = useSmoothScroll();
  const { isPageLoaded } = useAnimation();
  const displayFontClass = getDisplayFontClass(language);
  const { enableAdvancedAnimations, level } = usePerformance();

  // State for client-side rendering and keyword animations
  const [isClient, setIsClient] = useState(false);
  const [keywordAnimations, setKeywordAnimations] = useState<
    Array<{
      keyword: string;
      xPos: string;
      yPos: string;
      rotation: number;
      opacity: number;
      animRotate: number;
      duration: number;
      delay: number;
    }>
  >([]);

  // Mouse tracking for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const lastMouseUpdateRef = useRef(0);

  // Set client-side state once mounted
  useEffect(() => {
    setIsClient(true);

    // Generate keyword animations only on the client
    if (TECH_KEYWORDS.length > 0) {
      // Deterministic seeded random for consistent positioning
      const seededRandom = (seed: number) => {
        let state = seed;
        return () => {
          state = (state * 9301 + 49297) % 233280;
          return state / 233280;
        };
      };

      const randomizer = seededRandom(42); // Fixed seed for consistent layout

      const animations = TECH_KEYWORDS.map((keyword) => ({
        keyword,
        xPos: `${-10 + randomizer() * 120}%`,
        yPos: `${10 + randomizer() * 80}%`,
        rotation: randomizer() * 360,
        opacity: 0.2 + randomizer() * 0.3,
        animRotate: randomizer() > 0.5 ? 10 : -10,
        duration: 3 + randomizer() * 5,
        delay: randomizer() * 2,
      }));

      setKeywordAnimations(animations);
    }
  }, []);

  // Spring physics for smoother mouse following
  const springConfig = { damping: 25, stiffness: 300 };
  const followX = useSpring(mouseX, springConfig);
  const followY = useSpring(mouseY, springConfig);

  // Create transforms based on mouse position - scaled down for performance
  const moveScale = level === "high" ? 1 : level === "medium" ? 0.6 : 0.3;
  const moveX = useTransform(
    followX,
    [-800, 800],
    [-15 * moveScale, 15 * moveScale],
  );
  const moveY = useTransform(
    followY,
    [-800, 800],
    [-15 * moveScale, 15 * moveScale],
  );
  const rotateX = useTransform(
    followY,
    [-800, 800],
    [2, -2].map((v) => v * moveScale),
  );
  const rotateY = useTransform(
    followX,
    [-800, 800],
    [-2, 2].map((v) => v * moveScale),
  );

  // Track mouse position with throttling for performance
  useEffect(() => {
    if (!enableAdvancedAnimations || !isClient) return;

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      // Limit updates to 60fps at most
      if (now - lastMouseUpdateRef.current < 16) return;
      lastMouseUpdateRef.current = now;

      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set(clientX - centerX);
      mouseY.set(clientY - centerY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, enableAdvancedAnimations, isClient]);

  // Handle GSAP animations for headlines and content entry
  useIsomorphicLayoutEffect(() => {
    if (
      !headlineRef.current ||
      !imagesLoaded ||
      gsapCtxRef.current ||
      !isReady ||
      !isClient
    )
      return;

    // Skip advanced animations on low performance devices
    if (level === "low" && !enableAdvancedAnimations) {
      // Simple fade-in animation instead
      gsap.to(headlineRef.current, { opacity: 1, duration: 0.8, delay: 0.3 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Headlines animation
      const splitHeadlines = (selector: string) => {
        const headlines = gsap.utils.toArray<HTMLElement>(selector);
        return headlines.map((headline) => {
          const chars = headline.textContent?.split("") || [];
          headline.innerHTML = "";

          return chars.map((char) => {
            const charSpan = document.createElement("span");
            charSpan.textContent = char;
            charSpan.style.display = "inline-block";
            charSpan.style.opacity = "0";
            charSpan.style.transform = "translateY(50px) rotateX(-90deg)";
            headline.appendChild(charSpan);
            return charSpan;
          });
        });
      };

      // Split and animate headlines
      const headlineChars = splitHeadlines(".headline");
      headlineChars.forEach((chars, i) => {
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.02,
          duration: 0.5,
          ease: "back.out(1.7)",
          delay: 0.2 + i * 0.1,
        });
      });

      // Animate the subheading
      gsap.fromTo(
        ".hero-subheading",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.8,
          ease: "power3.out",
        },
      );

      // Animate the buttons
      gsap.fromTo(
        ".hero-button",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.7,
          delay: 1,
          ease: "power2.out",
        },
      );

      // Parallax scroll effect
      if (heroRef.current && lenis) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          })
          .to(contentRef.current, {
            y: 200,
            opacity: 0.8,
            ease: "none",
          });
      }
    }, heroRef);

    gsapCtxRef.current = ctx;

    return () => {
      ctx.revert();
      gsapCtxRef.current = null;
    };
  }, [imagesLoaded, isReady, lenis, level, enableAdvancedAnimations, isClient]);

  // Additional transforms for layered motion
  const x = useTransform(moveX, (v) => -v * 0.5);
  const y = useTransform(moveY, (v) => -v * 0.5);

  // Static floating animation values
  const floatY = [0, 8, 0];
  const floatDuration = 6;

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100vh] w-full overflow-hidden bg-transparent"
    >
      {/* Background gradient elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {isClient && (
          <PerformanceGate minLevel="medium">
            {/* Animated gradient circles following mouse - only for medium+ performance */}
            <motion.div
              className="absolute left-1/2 top-1/3 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl"
              style={{
                x: moveX,
                y: moveY,
                rotate: rotateX,
              }}
            />
            <motion.div
              className="absolute right-1/3 top-2/3 h-64 w-64 rounded-full bg-accent-500/10 blur-3xl"
              style={{
                x,
                y,
                rotate: rotateY,
              }}
            />
          </PerformanceGate>
        )}

        {/* Static gradient for all devices */}
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="absolute right-1/3 top-2/3 h-64 w-64 -translate-x-1/2 rounded-full bg-accent-500/10 blur-3xl" />
        </div>
      </div>

      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Main content with floating animation */}
        <motion.div
          className="relative"
          animate={{ y: floatY }}
          transition={{
            duration: floatDuration,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "reverse",
          }}
        >
          <motion.div
            ref={contentRef}
            className="hero-content container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-24"
            style={
              isClient && enableAdvancedAnimations
                ? {
                    rotateX,
                    rotateY,
                    transformPerspective: 1000,
                  }
                : {}
            }
          >
            <div ref={headlineRef} className="max-w-5xl text-center opacity-0">
              <div className="mb-6 overflow-hidden">
                <h1
                  className={cn(
                    "mb-6 text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl",
                    language === "bg" ? displayFontClass : "font-display",
                  )}
                >
                  {/* Explicit white text avoids transparent fill */}
                  <span className="headline block text-white">
                    {t("hero.headline1")}
                  </span>
                  <span className="headline block text-white">
                    {t("hero.headline2")}
                  </span>
                  <span className="headline block text-accent-400">
                    {t("hero.headline3")}
                  </span>
                  <span className="headline block text-accent-400">
                    {t("hero.headline4")}
                  </span>
                </h1>
              </div>

              <p className="hero-subheading mx-auto mb-10 max-w-2xl text-xl text-white md:text-2xl">
                {t("hero.subheading")}
              </p>

              <div className="mb-16 flex flex-wrap justify-center gap-6">
                <MagneticButton
                  href="/contact"
                  variant="primary"
                  size="xl"
                  glow
                  magnetic={isClient}
                  magneticStrength={0.4}
                  className="hero-button"
                  icon={
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-2"
                    >
                      <path
                        d="M5 12h14M12 5l7 7-7 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                >
                  {t("hero.startProject")}
                </MagneticButton>

                <MagneticButton
                  href="/services"
                  variant="outline"
                  size="xl"
                  magnetic={isClient}
                  magneticStrength={0.3}
                  className="hero-button"
                >
                  {t("hero.exploreServices")}
                </MagneticButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Interactive scroll indicator */}
      {isPageLoaded && imagesLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <ScrollIndicator />
        </motion.div>
      )}

      {/* Tech keywords floating in 3D space - Only render client-side */}
      {isClient && (
        <PerformanceGate minLevel="medium">
          {keywordAnimations.length > 0 && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {keywordAnimations.map((item) => (
                <motion.div
                  key={item.keyword}
                  className="absolute text-sm font-light text-white/20 md:text-base"
                  style={{
                    x: item.xPos,
                    y: item.yPos,
                    rotateZ: item.rotation,
                    opacity: item.opacity,
                  }}
                  animate={{
                    y: ["0%", "5%", "0%"],
                    rotate: [0, item.animRotate, 0],
                  }}
                  transition={{
                    duration: item.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: item.delay,
                  }}
                >
                  {item.keyword}
                </motion.div>
              ))}
            </div>
          )}
        </PerformanceGate>
      )}
    </section>
  );
};
