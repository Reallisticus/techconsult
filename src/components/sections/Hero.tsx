"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { useLanguage } from "~/i18n/context";
import { getDisplayFontClass } from "~/lib/fonts";
import { cn } from "~/lib/utils";
import { useSmoothScroll } from "../../provider/SmoothScrollProvider";
import { ScrollIndicator } from "../utils/ScrollIndicator";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import { SplitText } from "gsap-trial/SplitText";
import { useIsomorphicLayoutEffect } from "~/hooks/useIsomorphicLayout";

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
];

// Pre-calculate random positions and animations to avoid recalculation on render
const generateKeywordAnimations = () =>
  TECH_KEYWORDS.map((keyword) => ({
    keyword,
    xPos: `${-10 + Math.random() * 120}%`,
    yPos: `${10 + Math.random() * 80}%`,
    rotation: Math.random() * 360,
    opacity: 0.2 + Math.random() * 0.3,
    animRotate: Math.random() > 0.5 ? 10 : -10,
    duration: 3 + Math.random() * 5,
    delay: Math.random() * 2,
  }));

export const Hero = () => {
  const { t, language } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const gsapCtxRef = useRef<gsap.Context | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(true);
  const { lenis } = useSmoothScroll();
  const displayFontClass = getDisplayFontClass(language);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // State for storing keyword animations with random values (client-side only)
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

  // Spring physics for smoother mouse following
  const springConfig = { damping: 25, stiffness: 300 };
  const followX = useSpring(mouseX, springConfig);
  const followY = useSpring(mouseY, springConfig);

  // Create transforms based on mouse position
  const moveX = useTransform(followX, [-800, 800], [-15, 15]);
  const moveY = useTransform(followY, [-800, 800], [-15, 15]);
  const rotateX = useTransform(followY, [-800, 800], [2, -2]);
  const rotateY = useTransform(followX, [-800, 800], [-2, 2]);

  // Generate keyword animations only once on mount
  useEffect(() => {
    if (keywordAnimations.length === 0) {
      setKeywordAnimations(generateKeywordAnimations());
    }
  }, [keywordAnimations.length]);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set(clientX - centerX);
      mouseY.set(clientY - centerY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Handle GSAP animations for headlines and content entry
  useIsomorphicLayoutEffect(() => {
    if (!headlineRef.current || !imagesLoaded || gsapCtxRef.current) return;

    gsap.registerPlugin(SplitText);
    const ctx = gsap.context(() => {
      // Split text into lines and chars for detailed animation
      const headlines = gsap.utils.toArray<HTMLElement>(".headline");
      headlines.forEach((headline, i) => {
        const split = new SplitText(headline, { type: "chars,lines" });
        gsap.from(split.chars, {
          opacity: 0,
          y: 50,
          rotateX: -90,
          stagger: 0.02,
          duration: 0.5,
          ease: "back.out(1.7)",
          delay: 0.2 + i * 0.1,
        });
      });

      // Animate the subheading separately
      gsap.from(".hero-subheading", {
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: 0.8,
        ease: "power3.out",
      });

      // Animate the buttons
      gsap.from(".hero-buttons button", {
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.7,
        delay: 1,
        ease: "power2.out",
      });
    }, heroRef);

    gsapCtxRef.current = ctx;

    return () => {
      ctx.revert();
      gsapCtxRef.current = null;
    };
  }, [imagesLoaded]);

  // Additional transforms for layered motion
  const x = useTransform(moveX, (v) => -v * 0.5);
  const y = useTransform(moveY, (v) => -v * 0.5);

  // Our static floating animation values
  const floatY = [0, 8, 0];
  const floatDuration = 6;

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100vh] w-full overflow-hidden bg-transparent"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Animated gradient circles following mouse */}
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
      </div>

      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Simplified motion - static values to avoid recalculation */}
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
            style={{
              rotateX,
              rotateY,
              transformPerspective: 1000,
            }}
          >
            <div ref={headlineRef} className="max-w-5xl text-center">
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
                <Button
                  href="/contact"
                  variant="primary"
                  size="xl"
                  glow
                  magnetic
                  magneticStrength={40}
                  className="hero-buttons"
                >
                  {t("hero.startProject")}
                </Button>
                <Button
                  href="/services"
                  variant="outline"
                  size="xl"
                  glow
                  magnetic
                  magneticStrength={20}
                  className="hero-buttons"
                >
                  {t("hero.exploreServices")}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Interactive scroll indicator */}
      {imagesLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <ScrollIndicator />
        </motion.div>
      )}

      {/* Tech keywords floating in 3D space */}
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
    </section>
  );
};
