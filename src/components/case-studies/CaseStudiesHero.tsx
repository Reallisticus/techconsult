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

// Define tech keywords related to case studies
const CASE_STUDY_KEYWORDS = [
  "Innovation",
  "Success",
  "ROI",
  "Transformation",
  "Results",
  "Strategy",
  "Solutions",
  "Implementation",
  "Integration",
  "Analytics",
  "Growth",
  "Efficiency",
];

export const CaseStudiesHero = () => {
  const { getNestedTranslation, language } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const gsapCtxRef = useRef<gsap.Context | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const displayFontClass = getDisplayFontClass(language);
  const [typedTitle, setTypedTitle] = useState("");
  const [titleComplete, setTitleComplete] = useState(false);
  const [typedDescription, setTypedDescription] = useState("");
  const [descriptionComplete, setDescriptionComplete] = useState(false);
  const [activeStatIndex, setActiveStatIndex] = useState(-1); // Start with no stats visible
  const [typedStats, setTypedStats] = useState(["", "", ""]);
  const [showButton, setShowButton] = useState(false);

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

  // For the animated showcase dots
  const [activeDot, setActiveDot] = useState(0);
  const totalDots = caseStudiesData?.cases?.length || 3;

  // Stats for case studies - matching the image
  const stats = [
    { value: "100+", label: "Completed Projects" },
    { value: "95%", label: "Client Satisfaction" },
    { value: "40%", label: "Avg. Efficiency Gain" },
  ];

  // For terminal animation
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalText, setTerminalText] = useState("");
  const terminalCommands = [
    "> loading_case_studies.sh",
    "> analyzing_results.exe",
    "> rendering_showcase.py",
  ];
  const [currentCommand, setCurrentCommand] = useState(0);

  // For floating background elements
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

  // Enhanced typewriter effect with synchronized sequence
  useEffect(() => {
    if (!isMounted) return;

    const titleText = "FEATURED CASE STUDIES";
    const descriptionText =
      caseStudiesData?.description ||
      "Discover how we've helped businesses transform their operations and achieve remarkable results through strategic technology implementations.";

    // Step 1: Type title first
    if (typedTitle.length < titleText.length) {
      const timeout = setTimeout(() => {
        setTypedTitle(titleText.substring(0, typedTitle.length + 1));
      }, 50); // Speed of typing

      return () => clearTimeout(timeout);
    }
    // Step 2: Set title as complete & pause
    else if (!titleComplete) {
      const timeout = setTimeout(() => {
        setTitleComplete(true);
      }, 300); // Pause after title completes

      return () => clearTimeout(timeout);
    }
    // Step 3: Type description
    else if (typedDescription.length < descriptionText.length) {
      const timeout = setTimeout(() => {
        setTypedDescription(
          descriptionText.substring(0, typedDescription.length + 1),
        );
      }, 10); // Faster typing for description

      return () => clearTimeout(timeout);
    }
    // Step 4: Set description as complete & pause
    else if (!descriptionComplete) {
      const timeout = setTimeout(() => {
        setDescriptionComplete(true);
      }, 300); // Pause after description completes

      return () => clearTimeout(timeout);
    }
    // Step 5: Animate stats boxes sequentially
    else if (activeStatIndex < 2) {
      const nextStatIndex = activeStatIndex + 1;
      const currentStat = stats[nextStatIndex];

      if (!currentStat) return;

      // Show next stat box
      const timeout = setTimeout(() => {
        setActiveStatIndex(nextStatIndex);
      }, 300);

      return () => clearTimeout(timeout);
    }
    // Step 6: Type content in stat boxes sequentially
    else if (activeStatIndex === 2) {
      // Check if all stats are fully typed
      let allStatsComplete = true;

      for (let i = 0; i < 3; i++) {
        const currentStat = stats[i];
        const fullText = `${currentStat.value} ${currentStat.label}`;

        if (typedStats[i]!.length < fullText.length) {
          allStatsComplete = false;

          // Only type one stat at a time in sequence
          if (
            i === 0 ||
            (i === 1 &&
              typedStats[0] === `${stats[0].value} ${stats[0].label}`) ||
            (i === 2 && typedStats[1] === `${stats[1].value} ${stats[1].label}`)
          ) {
            const timeout = setTimeout(() => {
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
          setShowButton(true);
        }, 300);

        return () => clearTimeout(timeout);
      }
    }
  }, [
    isMounted,
    typedTitle,
    titleComplete,
    typedDescription,
    descriptionComplete,
    activeStatIndex,
    typedStats,
    stats,
    showButton,
    caseStudiesData?.description,
  ]);

  // Generate keyword animations on client-side only
  useEffect(() => {
    if (!isMounted || keywordAnimations.length > 0) return;

    // Only run this once client-side to prevent hydration mismatch
    const generatedAnimations = CASE_STUDY_KEYWORDS.map((keyword, index) => {
      // For the first 5 keywords, place them in the upper left corner (red circle area)
      if (index < 5) {
        return {
          keyword,
          xPos: `${5 + Math.random() * 25}%`, // Concentrated in the left side
          yPos: `${5 + Math.random() * 15}%`, // Concentrated in the upper portion
          rotation: Math.random() * 20 - 10, // Less extreme rotation
          opacity: 0.6 + Math.random() * 0.4, // Higher opacity
          animRotate: Math.random() > 0.5 ? 5 : -5, // Less rotation for better readability
          duration: 3 + Math.random() * 5,
          delay: Math.random() * 2,
        };
      }

      // Distribute the rest normally
      return {
        keyword,
        xPos: `${-10 + Math.random() * 120}%`,
        yPos: `${10 + Math.random() * 80}%`,
        rotation: Math.random() * 20 - 10,
        opacity: 0.4 + Math.random() * 0.3,
        animRotate: Math.random() > 0.5 ? 5 : -5,
        duration: 3 + Math.random() * 5,
        delay: Math.random() * 2,
      };
    });

    setKeywordAnimations(generatedAnimations);
  }, [isMounted, keywordAnimations.length]);

  useEffect(() => {
    setIsMounted(true);

    // Show terminal after a delay
    const terminalTimer = setTimeout(() => {
      setShowTerminal(true);
    }, 500);

    // Automatically cycle through dots
    const interval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % totalDots);
    }, 3000);

    return () => {
      clearTimeout(terminalTimer);
      clearInterval(interval);
    };
  }, [totalDots]);

  // Terminal typing effects
  useEffect(() => {
    if (!isMounted || !showTerminal) return;

    let timeout: NodeJS.Timeout;

    if (currentCommand < terminalCommands.length) {
      const command = terminalCommands[currentCommand];
      if (terminalText.length < command.length) {
        timeout = setTimeout(() => {
          setTerminalText(command.substring(0, terminalText.length + 1));
        }, 40);
      } else {
        timeout = setTimeout(() => {
          setCurrentCommand((prev) => prev + 1);
          setTerminalText("");
        }, 1000);
      }
    }

    return () => clearTimeout(timeout);
  }, [terminalText, currentCommand, terminalCommands, isMounted, showTerminal]);

  // Set up mouse tracking
  useEffect(() => {
    if (!isMounted) return;

    const handleMouseMove = (e: MouseEvent) => {
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
    if (isInView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [isInView, controls]);

  // GSAP animation for the hero section
  useIsomorphicLayoutEffect(() => {
    if (!headlineRef.current || !isMounted || gsapCtxRef.current) return;

    // Safe import of GSAP
    import("gsap")
      .then(({ gsap }) => {
        try {
          // Direct import of SplitText from gsap-trial since we know we're using trial
          import("gsap-trial/SplitText")
            .then((module) => {
              const SplitText = module.SplitText;
              gsap.registerPlugin(SplitText);

              const ctx = gsap.context(() => {
                // Split text into chars for detailed animation
                if (headlineRef.current) {
                  try {
                    const split = new SplitText(headlineRef.current, {
                      type: "chars",
                      charsClass: "char",
                    });

                    gsap.from(split.chars, {
                      opacity: 0,
                      y: 30,
                      stagger: 0.02,
                      duration: 0.7,
                      ease: "back.out(1.7)",
                      delay: 0.3,
                    });
                  } catch (e) {
                    console.error("SplitText error:", e);
                    // Fallback animation if SplitText fails
                    gsap.from(headlineRef.current, {
                      opacity: 0,
                      y: 30,
                      duration: 0.8,
                      delay: 0.3,
                      ease: "power2.out",
                    });
                  }
                }

                // Animate description
                const description = document.querySelector(
                  ".case-studies-description",
                );
                if (description) {
                  gsap.from(description, {
                    opacity: 0,
                    y: 30,
                    duration: 0.8,
                    delay: 0.7,
                    ease: "power3.out",
                  });
                }

                // Animate stats boxes
                const statsBoxes = document.querySelectorAll(".stats-box");
                if (statsBoxes.length) {
                  gsap.from(statsBoxes, {
                    opacity: 0,
                    y: 20,
                    stagger: 0.15,
                    duration: 0.8,
                    delay: 1,
                    ease: "back.out(1.5)",
                  });
                }

                // Animate button
                const button = document.querySelector(".cta-button");
                if (button) {
                  gsap.from(button, {
                    opacity: 0,
                    y: 20,
                    duration: 0.8,
                    delay: 1.5,
                    ease: "back.out(1.5)",
                  });
                }

                // Animate the showcase dots
                const dots = document.querySelectorAll(".showcase-dot");
                if (dots.length) {
                  gsap.from(dots, {
                    scale: 0,
                    opacity: 0,
                    stagger: 0.1,
                    duration: 0.5,
                    delay: 1.3,
                    ease: "back.out(2)",
                  });
                }
              }, heroRef);

              gsapCtxRef.current = ctx;
            })
            .catch((e) => {
              console.error("SplitText import error:", e);
              // Fallback animation without SplitText
              const ctx = gsap.context(() => {
                if (headlineRef.current) {
                  gsap.from(headlineRef.current, {
                    opacity: 0,
                    y: 30,
                    duration: 0.8,
                    delay: 0.3,
                    ease: "power2.out",
                  });
                }

                // Animate description
                const description = document.querySelector(
                  ".case-studies-description",
                );
                if (description) {
                  gsap.from(description, {
                    opacity: 0,
                    y: 30,
                    duration: 0.8,
                    delay: 0.7,
                    ease: "power3.out",
                  });
                }

                // Animate stats boxes
                const statsBoxes = document.querySelectorAll(".stats-box");
                if (statsBoxes.length) {
                  gsap.from(statsBoxes, {
                    opacity: 0,
                    y: 20,
                    stagger: 0.15,
                    duration: 0.8,
                    delay: 1,
                    ease: "back.out(1.5)",
                  });
                }

                // Animate button
                const button = document.querySelector(".cta-button");
                if (button) {
                  gsap.from(button, {
                    opacity: 0,
                    y: 20,
                    duration: 0.8,
                    delay: 1.5,
                    ease: "back.out(1.5)",
                  });
                }

                // Animate the showcase dots
                const dots = document.querySelectorAll(".showcase-dot");
                if (dots.length) {
                  gsap.from(dots, {
                    scale: 0,
                    opacity: 0,
                    stagger: 0.1,
                    duration: 0.5,
                    delay: 1.3,
                    ease: "back.out(2)",
                  });
                }
              }, heroRef);

              gsapCtxRef.current = ctx;
            });
        } catch (e) {
          console.error("GSAP error:", e);
        }
      })
      .catch((e) => console.error("GSAP import error:", e));

    return () => {
      if (gsapCtxRef.current) {
        gsapCtxRef.current.revert();
        gsapCtxRef.current = null;
      }
    };
  }, [isMounted, language]);

  // 3D text animations
  const textVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  // Pre-built 3D cubes (client-side only)
  const cubePositions = [
    { id: "cube-1", x: "15%", y: "20%", scale: 1.2, delay: 0 },
    { id: "cube-2", x: "75%", y: "15%", scale: 1.5, delay: 0.3 },
    { id: "cube-3", x: "35%", y: "75%", scale: 0.8, delay: 0.6 },
    { id: "cube-4", x: "85%", y: "65%", scale: 1.3, delay: 0.9 },
    { id: "cube-5", x: "25%", y: "35%", scale: 1.0, delay: 1.2 },
    { id: "cube-6", x: "65%", y: "50%", scale: 1.4, delay: 1.5 },
    { id: "cube-7", x: "10%", y: "60%", scale: 0.9, delay: 1.8 },
    { id: "cube-8", x: "50%", y: "80%", scale: 1.1, delay: 2.1 },
  ];

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

          {/* Tech keywords floating in background - enhanced visibility */}
          {isMounted && keywordAnimations.length > 0 && (
            <div className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden">
              {keywordAnimations.map((item) => (
                <motion.div
                  key={item.keyword}
                  className="absolute font-mono text-sm md:text-base"
                  style={{
                    x: item.xPos,
                    y: item.yPos,
                    rotateZ: item.rotation,
                    opacity: item.opacity,
                    color: "#a78bfa", // Light purple color
                    textShadow: "0 0 8px rgba(124, 58, 237, 0.8)", // Enhanced glow effect
                    fontWeight: "bold", // Make it bold for better visibility
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

          {/* Connection lines between cubes - matching image */}
          {isMounted && (
            <svg
              className="absolute inset-0 h-full w-full opacity-50"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="20%"
                y1="20%"
                x2="50%"
                y2="40%"
                stroke="#6236FF"
                strokeWidth="0.5"
              />
              <line
                x1="50%"
                y1="40%"
                x2="80%"
                y2="30%"
                stroke="#6236FF"
                strokeWidth="0.5"
              />
              <line
                x1="20%"
                y1="70%"
                x2="50%"
                y2="40%"
                stroke="#6236FF"
                strokeWidth="0.5"
              />
              <line
                x1="80%"
                y1="60%"
                x2="50%"
                y2="40%"
                stroke="#6236FF"
                strokeWidth="0.5"
              />
              <line
                x1="50%"
                y1="80%"
                x2="20%"
                y2="70%"
                stroke="#6236FF"
                strokeWidth="0.5"
              />
              <line
                x1="80%"
                y1="60%"
                x2="50%"
                y2="80%"
                stroke="#6236FF"
                strokeWidth="0.5"
              />
            </svg>
          )}

          {/* Animated 3D cubes - matching image style */}
          {isMounted && (
            <div className="absolute inset-0 overflow-hidden">
              {cubePositions.map((cube) => (
                <motion.div
                  key={cube.id}
                  className="absolute h-24 w-24 opacity-90"
                  style={{
                    left: cube.x,
                    top: cube.y,
                    scale: cube.scale,
                  }}
                  initial={{ opacity: 0, rotateX: 0, rotateY: 0, rotateZ: 0 }}
                  animate={{
                    opacity: 1,
                    rotateX: [0, 360],
                    rotateY: [0, 360],
                    rotateZ: [0, 360],
                  }}
                  transition={{
                    opacity: { duration: 1, delay: cube.delay },
                    rotateX: { duration: 30, repeat: Infinity, ease: "linear" },
                    rotateY: { duration: 40, repeat: Infinity, ease: "linear" },
                    rotateZ: { duration: 50, repeat: Infinity, ease: "linear" },
                  }}
                >
                  {/* 3D cube/hexagon matching the image */}
                  <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-full w-full"
                  >
                    <path
                      d="M50 5L90 30V70L50 95L10 70V30L50 5Z"
                      fill="#0F0F2D"
                      stroke="#6236FF"
                      strokeWidth="1"
                    />
                    <path
                      d="M50 5V50M50 50V95M50 50L10 30M50 50L90 30"
                      stroke="#6236FF"
                      strokeWidth="0.5"
                      opacity="0.8"
                    />
                    <rect
                      x="45"
                      y="45"
                      width="10"
                      height="10"
                      fill="#6236FF"
                      opacity="0.4"
                    />
                  </svg>
                </motion.div>
              ))}
            </div>
          )}

          {/* Tech circuit lines - with higher contrast/visibility */}
          <motion.div
            className="absolute left-4 top-0 h-full w-px bg-purple-500/50"
            animate={{
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              className="absolute -right-1 top-1/4 h-2 w-2 rounded-full bg-purple-400"
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -right-1 top-2/3 h-2 w-2 rounded-full bg-purple-400"
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </motion.div>

          <motion.div
            className="absolute right-4 top-0 h-full w-px bg-purple-500/50"
            animate={{
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              className="absolute -left-1 top-1/3 h-2 w-2 rounded-full bg-purple-400"
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
            <motion.div
              className="absolute -left-1 top-3/4 h-2 w-2 rounded-full bg-purple-400"
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
            />
          </motion.div>
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
                RECENT WORK
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
                variants={textVariants}
                initial="hidden"
                animate={controls}
                style={{
                  transformStyle: "preserve-3d",
                  color: "white",
                  letterSpacing: "0.05em",
                  lineHeight: 1.1,
                  whiteSpace: "nowrap", // Prevents line breaks
                }}
              >
                {typedTitle}
                {typedTitle.length < "FEATURED CASE STUDIES".length && (
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
                    onClick={() => setActiveDot(index)}
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
                  {caseStudiesData?.viewAllCaseStudies ||
                    "View All Case Studies"}
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
