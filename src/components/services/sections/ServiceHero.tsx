"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useLanguage } from "~/i18n/context";
import { silkscreen } from "~/lib/fonts";
import { useIsomorphicLayoutEffect } from "~/hooks/useIsomorphicLayout";

export const ServicesHero = () => {
  const { getNestedTranslation } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const gsapCtxRef = useRef<gsap.Context | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const glitchControls = useAnimation();

  // Simulated typing effect for each letter
  const [typedIndex, setTypedIndex] = useState(0);
  const [secondLineTypedIndex, setSecondLineTypedIndex] = useState(0);
  const [descriptionTypedIndex, setDescriptionTypedIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [showSecondLine, setShowSecondLine] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [statsPhase, setStatsPhase] = useState(0);
  const [statsTypedIndices, setStatsTypedIndices] = useState([0, 0, 0]);

  // Get hero content from translations
  const heroContent = getNestedTranslation<{
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
  }>("services");

  const title = heroContent?.heroTitle?.toUpperCase() || "OUR STRATEGIC";
  const subtitle =
    heroContent?.heroSubtitle?.toUpperCase() || "TECHNOLOGY SOLUTIONS";
  const description =
    heroContent?.heroDescription ||
    "We deliver comprehensive technology services designed to transform your business, optimize operations, and drive sustainable growth.";

  // Stats data
  const stats = [
    { value: "10+", label: "Years Experience" },
    { value: "200+", label: "Projects Delivered" },
    { value: "95%", label: "Client Satisfaction" },
  ];

  // Initialize particles only after component mounts to prevent hydration errors
  useEffect(() => {
    setIsMounted(true);

    // Cursor blink effect
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    // Glitch animation
    const runGlitchAnim = async () => {
      while (true) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 5000 + 2000),
        );
        if (!isMounted) break;
        await glitchControls.start({
          x: [0, -2, 3, -1, 0, 2, -2, 0],
          opacity: [1, 0.8, 1, 0.9, 1, 0.9, 1],
          filter: [
            "none",
            "brightness(1.2) contrast(1.5)",
            "none",
            "brightness(0.9) contrast(1.2)",
            "none",
          ],
          transition: { duration: 0.4 },
        });
      }
    };

    runGlitchAnim();

    return () => {
      clearInterval(cursorInterval);
    };
  }, [isMounted]);

  // Typing animation for the first line
  useEffect(() => {
    if (!isMounted) return;

    // First line typing effect
    if (typedIndex < title.length) {
      const timeoutId = setTimeout(() => {
        setTypedIndex((prev) => prev + 1);
      }, 80);
      return () => clearTimeout(timeoutId);
    } else if (typedIndex === title.length && !showSecondLine) {
      // After first line is complete, start second line
      const timeoutId = setTimeout(() => {
        setShowSecondLine(true);
      }, 400);
      return () => clearTimeout(timeoutId);
    }
  }, [typedIndex, title.length, isMounted, showSecondLine]);

  // Typing animation for the second line
  useEffect(() => {
    if (!showSecondLine) return;

    if (secondLineTypedIndex < subtitle.length) {
      const timeoutId = setTimeout(() => {
        setSecondLineTypedIndex((prev) => prev + 1);
      }, 80);
      return () => clearTimeout(timeoutId);
    } else if (secondLineTypedIndex === subtitle.length && !showDescription) {
      // After second line is complete, start description
      const timeoutId = setTimeout(() => {
        setShowDescription(true);
      }, 400);
      return () => clearTimeout(timeoutId);
    }
  }, [secondLineTypedIndex, subtitle.length, showSecondLine, showDescription]);

  // Typing animation for the description
  useEffect(() => {
    if (!showDescription) return;

    if (descriptionTypedIndex < description.length) {
      const timeoutId = setTimeout(() => {
        setDescriptionTypedIndex((prev) => prev + 1);
      }, 10); // Faster typing for description
      return () => clearTimeout(timeoutId);
    } else if (descriptionTypedIndex === description.length && !showStats) {
      // After description is complete, show stats
      const timeoutId = setTimeout(() => {
        setShowStats(true);
      }, 400);
      return () => clearTimeout(timeoutId);
    }
  }, [descriptionTypedIndex, description.length, showDescription, showStats]);

  // Sequential animation for stats boxes
  useEffect(() => {
    if (!showStats) return;

    if (statsPhase < 3) {
      // Handle each stat box sequentially
      const currentIdx = statsPhase;
      const statValue = stats[currentIdx]?.value || "";
      const statLabel = stats[currentIdx]?.label || "";
      const fullText = statValue + " " + statLabel;

      if (statsTypedIndices[currentIdx]! < fullText.length) {
        const timeoutId = setTimeout(() => {
          setStatsTypedIndices((prev) => {
            const newIndices = [...prev];
            newIndices[currentIdx] = prev[currentIdx]! + 1;
            return newIndices;
          });
        }, 40);
        return () => clearTimeout(timeoutId);
      } else if (statsPhase < 2) {
        // Move to next stat box after short delay
        const timeoutId = setTimeout(() => {
          setStatsPhase((prev) => prev + 1);
        }, 300);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [showStats, statsPhase, statsTypedIndices, stats]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[85vh] w-full overflow-hidden bg-transparent pb-20 pt-40 md:pb-24 md:pt-72"
    >
      {/* Tech grid pattern background */}
      <div className="absolute inset-0 z-0">
        <svg
          className="absolute left-0 top-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(124, 58, 237, 0.1)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Gradient overlay at the top */}
      <div className="absolute inset-x-0 top-0 z-10 h-32" />

      {/* Main content container */}
      <div className="container relative z-20 mx-auto px-4">
        <div className="relative mx-auto max-w-5xl">
          {/* Decorative tech circuit line */}
          <div className="absolute -left-20 top-0 h-full w-px bg-accent-500/50 md:-left-32">
            <div className="absolute -left-1 top-[20%] h-2 w-2 rounded-full bg-accent-500/90" />
            <div className="absolute -left-2 top-[20%] h-4 w-4 animate-pulse rounded-full bg-accent-500/20" />
            <div className="absolute -left-1 top-[50%] h-2 w-2 rounded-full bg-accent-500/90" />
            <div className="absolute -left-2 top-[50%] h-4 w-4 animate-pulse rounded-full bg-accent-500/20" />
            <div className="absolute -left-1 top-[80%] h-2 w-2 rounded-full bg-accent-500/90" />
            <div className="absolute -left-2 top-[80%] h-4 w-4 animate-pulse rounded-full bg-accent-500/20" />
          </div>

          {/* Headline container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative mb-16 text-center sm:text-left"
          >
            {/* Glitch effect container */}
            <motion.div
              animate={glitchControls}
              ref={headlineRef}
              className="relative mb-8"
            >
              {/* Terminal-like prefix */}
              <div className="mb-2 hidden items-center text-secondary-500 sm:flex">
                <span className="mr-2 font-mono text-lg">&gt;</span>
                <span className="mr-1 h-3 w-3 animate-pulse rounded-full bg-secondary-500/80"></span>
                <span className="font-mono text-sm text-secondary-500">
                  loading_services.exe
                </span>
              </div>

              {/* Main heading with typing effect */}
              <h1 className="relative text-4xl md:text-5xl lg:text-6xl">
                {/* First line with typing effect */}
                <div className="heading-container relative mb-3 inline-flex">
                  <div
                    className={`inline-block ${silkscreen.className} uppercase tracking-wide text-white`}
                  >
                    {title.substring(0, typedIndex)}
                  </div>
                  {typedIndex < title.length && showCursor && (
                    <span className="inline-block h-10 w-3 animate-pulse bg-secondary-400"></span>
                  )}
                </div>

                {/* Second line with typing effect */}
                <div className="heading-container relative block">
                  {showSecondLine && (
                    <div
                      className={`inline-block ${silkscreen.className} uppercase tracking-wide text-accent-400`}
                    >
                      {subtitle.substring(0, secondLineTypedIndex)}
                      {secondLineTypedIndex < subtitle.length && showCursor && (
                        <span className="inline-block h-10 w-3 animate-pulse bg-accent-400"></span>
                      )}
                    </div>
                  )}
                </div>
              </h1>

              {/* Decorative circuit elements */}
              <div className="absolute -right-4 top-0 h-full w-1 md:-right-8">
                <div className="absolute left-0 top-0 h-full w-px bg-secondary-500/30"></div>
                <div className="absolute -left-1 top-[10%] h-2 w-2 rounded-full bg-secondary-500/50"></div>
                <div className="absolute -left-1 top-[70%] h-2 w-2 rounded-full bg-secondary-500/50"></div>
              </div>

              {/* Futuristic code lines */}
            </motion.div>

            {/* Animated description reveal with typing effect */}
            {showDescription && (
              <div className="relative">
                <div className="mb-2 mt-8 hidden items-center text-secondary-500 sm:flex">
                  <span className="mr-2 font-mono text-lg">&gt;</span>
                  <span className="mr-1 h-3 w-3 animate-pulse rounded-full bg-secondary-500/80"></span>
                  <span className="font-mono text-sm">
                    description.parse();
                  </span>
                </div>
                <div className="relative">
                  <p className="hero-description relative mx-auto max-w-2xl text-lg text-neutral-300 md:mx-0 md:text-xl">
                    {description.substring(0, descriptionTypedIndex)}
                    {descriptionTypedIndex < description.length &&
                      showCursor && (
                        <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-accent-400"></span>
                      )}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Animated stats boxes */}
          {showStats && (
            <div className="relative">
              <div className="mb-2 hidden items-center text-secondary-500 sm:flex">
                <span className="mr-2 font-mono text-lg">&gt;</span>
                <span className="mr-1 h-3 w-3 animate-pulse rounded-full bg-secondary-500/80"></span>
                <span className="font-mono text-sm">stats.display();</span>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((stat, index) => {
                  const fullText = stat.value + " " + stat.label;
                  const displayedText = fullText.substring(
                    0,
                    statsTypedIndices[index],
                  );
                  const showThisCursor =
                    index === statsPhase &&
                    statsTypedIndices[index]! < fullText.length;

                  return (
                    <motion.div
                      key={index}
                      className="relative overflow-hidden rounded-lg border border-accent-500/20 bg-black/30 p-4 backdrop-blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: statsPhase >= index ? 1 : 0,
                        y: statsPhase >= index ? 0 : 20,
                      }}
                      transition={{ duration: 0.3 }}
                      whileHover={
                        statsPhase > index ||
                        (index === statsPhase &&
                          statsTypedIndices[index] === fullText.length)
                          ? {
                              y: -5,
                              boxShadow:
                                "0 10px 25px -5px rgba(124, 58, 237, 0.2)",
                              borderColor: "rgba(124, 58, 237, 0.5)",
                            }
                          : {}
                      }
                    >
                      {displayedText}
                      {showThisCursor && showCursor && (
                        <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-accent-400"></span>
                      )}
                      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary-600 to-accent-600"></div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
