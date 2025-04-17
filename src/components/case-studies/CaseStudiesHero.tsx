// main page hero dots
"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useAnimation,
  useInView,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useLanguage } from "~/i18n/context";
import { getDisplayFontClass, silkscreen } from "~/lib/fonts";
import { useIsomorphicLayoutEffect } from "~/hooks/useIsomorphicLayout";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { CaseStudyTranslations } from "~/i18n/translations/case-studies";

const CaseStudiesHero = () => {
  const { getNestedTranslation, language } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const gsapCtxRef = useRef<gsap.Context | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [typedTitle, setTypedTitle] = useState("");
  const [titleComplete, setTitleComplete] = useState(false);
  const [typedDescription, setTypedDescription] = useState("");
  const [descriptionComplete, setDescriptionComplete] = useState(false);
  const [activeStatIndex, setActiveStatIndex] = useState(-1);
  const [typedStats, setTypedStats] = useState(["", "", ""]);
  const [showButton, setShowButton] = useState(false);
  const unmountedRef = useRef(false);
  const [isTitleTyping, setIsTitleTyping] = useState(true);
  // Track swipe direction for animations
  const [direction, setDirection] = useState(0);
  // For the animated showcase dots
  const [activeDot, setActiveDot] = useState(0);
  // Track when slider content is ready to display
  const [showSliderContent, setShowSliderContent] = useState(false);
  // For the 3D text effect
  const textRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(textRef, { once: false, amount: 0.3 });
  const controls = useAnimation();

  // For mouse interaction
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 300 };
  const followX = useSpring(mouseX, springConfig);
  const followY = useSpring(mouseY, springConfig);

  // Create transforms based on mouse position
  const rotateX = useTransform(followY, [-800, 800], [2, -2]);
  const rotateY = useTransform(followX, [-800, 800], [-2, 2]);

  // Get case studies content from translations
  const caseStudiesData =
    getNestedTranslation<CaseStudyTranslations>("caseStudies");

  const totalDots = caseStudiesData?.cases?.length || 3;

  // Stats - use translations or fallback to defaults
  const stats = caseStudiesData?.stats || [
    { value: "100+", label: "Completed Projects" },
    { value: "95%", label: "Client Satisfaction" },
    { value: "40%", label: "Avg. Efficiency Gain" },
  ];

  // Restart animations when language changes
  useEffect(() => {
    if (isMounted) {
      // On language change, reset everything
      setIsTitleTyping(true);
      setTypedTitle("");
      setTitleComplete(false);
      setTypedDescription("");
      setDescriptionComplete(false);
      setActiveStatIndex(-1);
      setTypedStats(["", "", ""]);
      setShowButton(false);
      setShowSliderContent(false);

      // Kill any GSAP animations
      if (gsapCtxRef.current) {
        gsapCtxRef.current.revert();
        gsapCtxRef.current = null;
      }
    }
  }, [language, isMounted]);

  // For terminal animation
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalText, setTerminalText] = useState("");
  const terminalCommands = [
    "> loading_case_studies.sh",
    "> analyzing_results.exe",
    "> rendering_showcase.py",
  ];
  const [currentCommand, setCurrentCommand] = useState(0);

  // Reset the typewriter effect when language changes
  useEffect(() => {
    if (!isMounted) return;

    // Kill any running animations/timers before resetting
    const killAnimations = setTimeout(() => {
      // Reset the typewriter states
      setIsTitleTyping(true);
      setTypedTitle("");
      setTitleComplete(false);
      setTypedDescription("");
      setDescriptionComplete(false);
      setActiveStatIndex(-1);
      setTypedStats(["", "", ""]);
      setShowButton(false);
      setShowSliderContent(false);
    }, 50); // Small delay to ensure proper cleanup

    return () => clearTimeout(killAnimations);
  }, [language, isMounted]);

  useEffect(() => {
    if (!isMounted || unmountedRef.current || !caseStudiesData?.title) return;

    const titleText = caseStudiesData.title.toUpperCase();
    let timeoutId: NodeJS.Timeout;

    // Only run this if we're still typing and haven't completed
    if (isTitleTyping && typedTitle.length < titleText.length) {
      timeoutId = setTimeout(() => {
        if (unmountedRef.current) return;

        // Add the next character
        const nextChar = titleText.charAt(typedTitle.length);
        const newText = typedTitle + nextChar;

        // Update state with the new text
        setTypedTitle(newText);

        // Check if we're done
        if (newText.length >= titleText.length) {
          setIsTitleTyping(false);
          setTitleComplete(true);
        }
      }, 50);
    }

    return () => {
      // Clean up timeout if component unmounts or effect re-runs
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isMounted, typedTitle, isTitleTyping]); // Only depend on these three states

  // Enhanced typewriter effect with synchronized sequence
  useEffect(() => {
    if (!isMounted || unmountedRef.current) return;

    const descriptionText =
      caseStudiesData?.description ||
      "Discover how we've helped businesses transform their operations and achieve remarkable results through strategic technology implementations.";

    if (titleComplete && !descriptionComplete) {
      // Type description
      if (typedDescription.length < descriptionText.length) {
        const timeout = setTimeout(() => {
          if (unmountedRef.current) return;
          setTypedDescription(
            descriptionText.substring(0, typedDescription.length + 1),
          );
        }, 10); // Faster typing for description

        return () => clearTimeout(timeout);
      } else {
        // Set description as complete & pause
        const timeout = setTimeout(() => {
          if (unmountedRef.current) return;
          setDescriptionComplete(true);
        }, 300); // Pause after description completes

        return () => clearTimeout(timeout);
      }
    }
    // Step 3: Animate stats boxes sequentially
    else if (descriptionComplete && activeStatIndex < 2) {
      const nextStatIndex = activeStatIndex + 1;
      const currentStat = stats[nextStatIndex];

      if (!currentStat) return;

      // Show next stat box
      const timeout = setTimeout(() => {
        if (unmountedRef.current) return;
        setActiveStatIndex(nextStatIndex);
      }, 300);

      return () => clearTimeout(timeout);
    }
    // Step 4: Type content in stat boxes sequentially
    else if (descriptionComplete && activeStatIndex === 2) {
      // Check if all stats are fully typed
      let allStatsComplete = true;

      for (let i = 0; i < 3; i++) {
        const currentStat = stats[i];
        if (!currentStat) continue;
        const fullText = `${currentStat.value} ${currentStat.label}`;

        if (typedStats[i]!.length < fullText.length) {
          allStatsComplete = false;

          // Only type one stat at a time in sequence
          if (
            i === 0 ||
            (i === 1 &&
              typedStats[0] === `${stats[0]?.value} ${stats[0]?.label}`) ||
            (i === 2 &&
              typedStats[1] === `${stats[1]?.value} ${stats[1]?.label}`)
          ) {
            const timeout = setTimeout(() => {
              if (unmountedRef.current) return;
              const newTypedStats = [...typedStats];
              newTypedStats[i] = fullText.substring(
                0,
                typedStats[i]!.length + 1,
              );
              setTypedStats(newTypedStats);
            }, 30); // Typing speed

            return () => clearTimeout(timeout);
          }
        }
      }

      // All stats are typed, show button after a delay
      if (allStatsComplete && !showButton) {
        const timeout = setTimeout(() => {
          if (unmountedRef.current) return;
          setShowButton(true);

          // Show slider content after the animation sequence
          setTimeout(() => {
            if (unmountedRef.current) return;
            setShowSliderContent(true);
          }, 500);
        }, 300);

        return () => clearTimeout(timeout);
      }
    }
  }, [
    isMounted,
    titleComplete,
    typedDescription,
    descriptionComplete,
    activeStatIndex,
    typedStats,
    stats,
    showButton,
    caseStudiesData?.description,
  ]);

  // Component initialization
  useEffect(() => {
    setIsMounted(true);
    unmountedRef.current = false;

    // Show terminal after a delay
    const terminalTimer = setTimeout(() => {
      if (unmountedRef.current) return;
      setShowTerminal(true);
    }, 500);

    return () => {
      // Mark component as unmounted first
      unmountedRef.current = true;

      // Clean up timers
      clearTimeout(terminalTimer);

      // Clean up GSAP context if it exists
      if (gsapCtxRef.current) {
        try {
          gsapCtxRef.current.revert();
        } catch (e) {
          // Silently fail - the component is being unmounted anyway
        }
        gsapCtxRef.current = null;
      }
    };
  }, []);

  // Separate effect for dot cycling
  useEffect(() => {
    if (!isMounted || unmountedRef.current) return;

    // Automatically cycle through dots
    const interval = setInterval(() => {
      if (unmountedRef.current) return;
      setActiveDot((prev) => (prev + 1) % totalDots);
    }, 6000); // Increased from 3000ms to 6000ms for slower cycling

    return () => {
      clearInterval(interval);
    };
  }, [totalDots, isMounted]);

  // Terminal typing effects
  useEffect(() => {
    if (!isMounted || !showTerminal || unmountedRef.current) return;

    let timeout: NodeJS.Timeout;

    if (currentCommand < terminalCommands.length) {
      const command = terminalCommands[currentCommand];
      if (!command) return; // Ensure command is defined
      if (terminalText.length < command.length) {
        timeout = setTimeout(() => {
          if (unmountedRef.current) return;
          setTerminalText(command.substring(0, terminalText.length + 1));
        }, 40);
      } else {
        timeout = setTimeout(() => {
          if (unmountedRef.current) return;
          setCurrentCommand((prev) => prev + 1);
          setTerminalText("");
        }, 1000);
      }
    }

    return () => clearTimeout(timeout);
  }, [terminalText, currentCommand, terminalCommands, isMounted, showTerminal]);

  // Set up mouse tracking
  useEffect(() => {
    if (!isMounted || unmountedRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (unmountedRef.current) return;
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set(clientX - centerX);
      mouseY.set(clientY - centerY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, isMounted]);

  useEffect(() => {
    if (isInView && !unmountedRef.current) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [isInView, controls]);

  // GSAP animation for the hero section
  useIsomorphicLayoutEffect(() => {
    // Only run GSAP initialization after title is complete
    if (
      !headlineRef.current ||
      !isMounted ||
      unmountedRef.current ||
      !titleComplete
    )
      return;

    // Safe import of GSAP
    const initGSAP = async () => {
      try {
        // Only apply GSAP animations to non-typewriter elements
        const { gsap } = await import("gsap");

        // Create animation context
        const ctx = gsap.context(() => {
          // Animate stats boxes
          const statsBoxes = document.querySelectorAll(".stats-box");
          if (statsBoxes.length && !unmountedRef.current) {
            gsap.from(statsBoxes, {
              opacity: 0,
              y: 20,
              stagger: 0.15,
              duration: 0.8,
              delay: 0.2,
              ease: "back.out(1.5)",
            });
          }

          // Animate button
          const button = document.querySelector(".cta-button");
          if (button && !unmountedRef.current) {
            gsap.from(button, {
              opacity: 0,
              y: 20,
              duration: 0.8,
              delay: 0.5,
              ease: "back.out(1.5)",
            });
          }

          // Animate the showcase dots
          const dots = document.querySelectorAll(".showcase-dot");
          if (dots.length && !unmountedRef.current) {
            gsap.from(dots, {
              scale: 0,
              opacity: 0,
              stagger: 0.1,
              duration: 0.5,
              delay: 0.3,
              ease: "back.out(2)",
            });
          }

          // Animate case study slider section
          const sliderContent = document.querySelector(".case-slider-content");
          if (sliderContent && !unmountedRef.current) {
            gsap.from(sliderContent, {
              opacity: 0,
              y: 30,
              duration: 0.8,
              delay: 0.8,
              ease: "power3.out",
            });
          }
        }, heroRef);

        gsapCtxRef.current = ctx;
      } catch (error) {
        console.error("GSAP initialization error:", error);
      }
    };

    initGSAP();

    return () => {
      if (gsapCtxRef.current) {
        gsapCtxRef.current.revert();
        gsapCtxRef.current = null;
      }
    };
  }, [isMounted, titleComplete]);

  // Update direction when active dot changes
  useEffect(() => {
    if (!isMounted) return;
    setDirection((prev) => {
      // Determine if we went forward or backward
      if (prev === activeDot) return 0;

      // Handle wrap-around cases
      if (prev === totalDots - 1 && activeDot === 0) return 1;
      if (prev === 0 && activeDot === totalDots - 1) return -1;

      return activeDot > prev ? 1 : -1;
    });
  }, [activeDot, totalDots, isMounted]);

  // Current active case study
  const activeCaseStudy = caseStudiesData?.cases?.[activeDot];

  // Slider animation variants
  const sliderVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 200, damping: 30, duration: 0.8 },
        opacity: { duration: 0.7 },
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 200, damping: 30, duration: 0.8 },
        opacity: { duration: 0.7 },
      },
    }),
  };

  // Helper function to create URL-friendly slugs
  const createSlug = (text?: string): string => {
    if (!text) return "";
    return text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  return (
    <>
      <section
        ref={heroRef}
        className="relative min-h-[90vh] overflow-hidden pt-40"
        style={{
          background: "transparent", // Ensure no background on the hero section
        }}
      >
        {/* Background - Deep blue matching the image */}
        <div className="absolute inset-0 -z-20"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          {/* Grid pattern */}
          <div
            className="absolute inset-0"
            style={{
              opacity: "0.7",
              mask: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)",
              WebkitMask:
                "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)",
            }}
          >
            <svg
              className="h-full w-full"
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
                    stroke="#6236FF"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        {/* Main content */}
        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            className="mx-auto max-w-5xl"
            style={{
              rotateX,
              rotateY,
              transformPerspective: 1000,
            }}
          >
            {/* Terminal-like header - fixed visibility issues */}
            {isMounted && showTerminal && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-4 flex items-center justify-start"
              >
                <div className="flex h-8 w-auto max-w-xs items-center rounded-lg bg-purple-900/40 px-4 backdrop-blur-sm">
                  <span className="mr-2 font-mono text-lg text-purple-400">
                    &gt;
                  </span>
                  <motion.span
                    className="font-mono text-sm text-purple-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {terminalText}
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="inline-block h-4 w-2 bg-purple-400"
                    />
                  </motion.span>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 flex items-center justify-center sm:justify-start"
            >
              <span
                className={`font-mono uppercase tracking-widest text-purple-500 ${silkscreen.className}`}
              >
                {caseStudiesData?.subtitle || ""}
              </span>
              <div className="ml-3 h-px w-16 bg-purple-500"></div>
            </motion.div>

            {/* Main headline with bitmap/pixel font effect and typewriter */}
            <div ref={textRef} className="perspective mb-8">
              <motion.h1
                ref={headlineRef}
                className={cn(
                  "text-center text-4xl font-bold tracking-wider sm:text-left sm:text-5xl md:text-6xl lg:text-6xl",
                  silkscreen.className,
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  color: "white",
                  letterSpacing: "0.05em",
                  lineHeight: 1.1,
                  whiteSpace: "nowrap", // Prevents line breaks
                }}
              >
                {typedTitle}
                {caseStudiesData?.title &&
                  typedTitle.length < caseStudiesData.title.length && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="ml-1 inline-block h-10 w-2 bg-purple-500"
                    />
                  )}
              </motion.h1>
            </div>

            {/* Description with typewriter effect */}
            <motion.p
              className="case-studies-description mb-16 text-center text-lg text-gray-300 sm:text-left md:text-xl lg:max-w-3xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: titleComplete ? 1 : 0,
                y: titleComplete ? 0 : 30,
              }}
              transition={{ duration: 0.8 }}
            >
              {typedDescription}
              {typedDescription.length <
                (caseStudiesData?.description || "").length &&
                titleComplete && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="ml-1 inline-block h-4 w-2 bg-purple-400"
                  />
                )}
            </motion.p>

            {/* Stats Section with sequential typing animation */}
            <div className="mb-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  className="stats-box relative overflow-hidden rounded-lg border border-purple-500/20 bg-[#0A0A2A]/70 px-6 py-4 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: idx <= activeStatIndex ? 1 : 0,
                    y: idx <= activeStatIndex ? 0 : 20,
                  }}
                  transition={{ duration: 0.6 }}
                  whileHover={{
                    y: -5,
                    borderColor: "rgba(124, 58, 237, 0.5)",
                    boxShadow: "0 8px 30px rgba(124, 58, 237, 0.2)",
                  }}
                >
                  <div className="py-1">
                    <div className="text-2xl font-bold text-white">
                      {typedStats[idx]}
                      {idx <= activeStatIndex &&
                        typedStats[idx]!.length <
                          `${stat.value} ${stat.label}`.length && (
                          <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="ml-1 inline-block h-5 w-2 bg-purple-400"
                          />
                        )}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                </motion.div>
              ))}
            </div>

            {/* Case Study Content Slider */}
            {showSliderContent && (
              <div className="case-slider-content relative mb-12 overflow-hidden">
                <div className="h-80 w-full">
                  <AnimatePresence
                    initial={false}
                    custom={direction}
                    mode="wait"
                  >
                    <motion.div
                      key={activeDot}
                      custom={direction}
                      variants={sliderVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="absolute inset-0 flex flex-col justify-between rounded-xl border border-purple-500/30 bg-[#0A0A2A]/70 p-6 backdrop-blur-sm"
                    >
                      {activeCaseStudy ? (
                        <>
                          <div>
                            <div className="mb-2 flex items-center">
                              <div className="h-2 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                              <span className="ml-2 font-mono text-xs uppercase tracking-wider text-purple-400">
                                {activeCaseStudy.tags?.[0] || ""}
                              </span>
                            </div>
                            <h3 className="mb-3 text-2xl font-bold text-white">
                              {activeCaseStudy.title || ""}
                            </h3>
                            <p className="mb-4 text-gray-300">
                              {activeCaseStudy.description || ""}
                            </p>

                            {/* Display tags as metrics */}
                            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                              {(activeCaseStudy.tags || [])
                                .slice(0, 3)
                                .map((tag, idx) => (
                                  <div
                                    key={idx}
                                    className="rounded-lg bg-purple-900/20 p-3"
                                  >
                                    <div className="text-xs text-purple-300">
                                      {tag}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>

                          <div className="flex justify-between">
                            <div className="font-mono text-xs text-purple-400">
                              {activeCaseStudy.client || ""}
                            </div>
                            <Button
                              className="px-3 py-1 text-sm"
                              variant="outline"
                              href={`/case-studies/${activeCaseStudy.id ? activeCaseStudy.id : createSlug(activeCaseStudy.title)}`}
                            >
                              {caseStudiesData?.viewCaseStudy || ""}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-gray-400">
                            No case study information available.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Interactive showcase dots */}
            <div className="mb-10 flex justify-center gap-4 sm:justify-start">
              {Array(totalDots)
                .fill(0)
                .map((_, index) => (
                  <motion.div
                    key={index}
                    className={cn(
                      "showcase-dot relative h-3 w-3 cursor-pointer rounded-full transition-all duration-300",
                      index === activeDot
                        ? "bg-purple-500"
                        : "bg-gray-600 hover:bg-gray-400",
                    )}
                    onClick={() => {
                      // Set direction based on clicked dot compared to current
                      const newDirection = index > activeDot ? 1 : -1;
                      setDirection(newDirection);
                      setActiveDot(index);
                    }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: 1 + index * 0.1,
                    }}
                  >
                    <AnimatePresence>
                      {index === activeDot && (
                        <motion.div
                          className="absolute -inset-1.5 rounded-full border border-purple-500"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.2 }}
                          layoutId="activeDot"
                          key={`active-dot-${index}`}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
            </div>

            {/* Button with hover effect - delayed appearance */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: showButton ? 1 : 0, y: showButton ? 0 : 30 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center sm:justify-start"
            >
              <Button
                href="#case-studies"
                variant="primaryGradient"
                size="lg"
                className="cta-button relative z-30"
                style={{
                  color: "white",
                  opacity: 1,
                }}
                {...({
                  magnetic: true,
                  magneticStrength: 40,
                  glow: true,
                } as any)}
              >
                <span className="group relative inline-flex items-center">
                  {caseStudiesData?.viewAllCaseStudies || ""}
                  <svg
                    className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Animated line */}
        <motion.div
          className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </section>
      <style jsx global>{`
        .perspective {
          perspective: 1000px;
        }

        .char {
          display: inline-block;
          transform-style: preserve-3d;
        }
      `}</style>
    </>
  );
};

export default CaseStudiesHero;
