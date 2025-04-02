"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useTransform,
  useScroll,
  AnimatePresence,
} from "framer-motion";
import { useLanguage } from "~/i18n/context";
import { ScrollReveal } from "~/provider/SmoothScrollProvider";
import { cn } from "~/lib/utils";

export const ServiceProcess = () => {
  const { getNestedTranslation } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Get process data from translations
  const processData = getNestedTranslation<{
    subtitle: string;
    title: string;
    description: string;
    discover: { title: string; description: string };
    analyze: { title: string; description: string };
    strategize: { title: string; description: string };
    implement: { title: string; description: string };
    optimize: { title: string; description: string };
  }>("services.process");

  // Create an array of process steps for easier iteration
  const processSteps = [
    {
      id: "discover",
      ...processData.discover,
      color: "#60A5FA" /* Primary-400 */,
    },
    {
      id: "analyze",
      ...processData.analyze,
      color: "#A78BFA" /* Accent-300 */,
    },
    {
      id: "strategize",
      ...processData.strategize,
      color: "#2563EB" /* Primary-600 */,
    },
    {
      id: "implement",
      ...processData.implement,
      color: "#7C3AED" /* Accent-500 */,
    },
    {
      id: "optimize",
      ...processData.optimize,
      color: "#34D399" /* Secondary-400 */,
    },
  ];

  // Scroll animation setup
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Calculate viewport height for animations
  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewportHeight(window.innerHeight);
      const handleResize = () => setViewportHeight(window.innerHeight);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Update active step based on scroll position
  useEffect(() => {
    if (!timelineRef.current) return;

    const steps = Array.from(timelineRef.current.children);

    const handleScroll = () => {
      const stepElements = steps.filter(
        (step) => step.nodeType === 1,
      ) as HTMLElement[];

      for (let i = 0; i < stepElements.length; i++) {
        const step = stepElements[i];
        const rect = step!.getBoundingClientRect();

        // When the step is in the middle of the viewport
        if (
          rect.top < viewportHeight * 0.6 &&
          rect.bottom > viewportHeight * 0.4
        ) {
          setActiveStep(i);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initialize on mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, [viewportHeight]);

  // Timeline progress animation
  const progressHeight = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    ["0%", "10%", "90%", "100%"],
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-transparent py-16 md:py-24"
    >
      {/* Background gradient effect */}
      <div
        className="absolute inset-0 -z-10 opacity-20"
        style={{
          background:
            "radial-gradient(circle at center, rgba(124, 58, 237, 0.2) 0%, rgba(0, 0, 0, 0) 70%)",
        }}
      />

      <div className="container mx-auto px-4">
        <ScrollReveal direction="up" threshold={0.1}>
          <div className="mb-16 text-center">
            <span className="font-mono uppercase tracking-wider text-accent-500">
              {processData.subtitle}
            </span>
            <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
              {processData.title}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-neutral-300">
              {processData.description}
            </p>
          </div>
        </ScrollReveal>

        {/* Timeline container with glowing progress line */}
        <div className="relative mx-auto max-w-5xl">
          {/* Animated progress line */}
          <div className="absolute left-4 top-0 h-full w-1 rounded-full bg-neutral-800/50 md:left-1/2 md:-ml-0.5">
            <motion.div
              className="absolute left-0 top-0 w-full rounded-full bg-gradient-to-b from-primary-400 via-accent-500 to-secondary-400"
              style={{ height: progressHeight }}
            />
          </div>

          {/* Process steps */}
          <div ref={timelineRef} className="relative">
            {processSteps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "relative mb-12 md:mb-32",
                  index % 2 === 0 ? "md:text-left" : "md:text-right",
                )}
              >
                {/* Step number and connector */}
                <div
                  className={cn(
                    "flex items-center",
                    index % 2 === 0 ? "" : "md:flex-row-reverse",
                  )}
                >
                  {/* Step indicator dot with animations */}
                  <div className="relative z-10">
                    <motion.div
                      className={cn(
                        "relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white md:h-10 md:w-10",
                      )}
                      style={{
                        backgroundColor: step.color,
                        boxShadow:
                          activeStep === index
                            ? `0 0 20px ${step.color}80`
                            : "none",
                      }}
                      animate={
                        activeStep === index
                          ? {
                              scale: [1, 1.1, 1],
                            }
                          : { scale: 1 }
                      }
                      transition={{
                        duration: 1.5,
                        repeat: activeStep === index ? Infinity : 0,
                        repeatType: "reverse",
                      }}
                    >
                      {index + 1}
                    </motion.div>

                    {/* Glow effect on active */}
                    <AnimatePresence>
                      {activeStep === index && (
                        <motion.div
                          className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 md:h-20 md:w-20"
                          style={{
                            background: `radial-gradient(circle, ${step.color}40 0%, transparent 70%)`,
                          }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.4 }}
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Step title with consistent spacing */}
                  <motion.h3
                    className="mx-4 text-xl font-bold text-white md:text-2xl"
                    animate={{
                      color: activeStep === index ? step.color : "#ffffff",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {step.title}
                  </motion.h3>
                </div>

                {/* Step content - with reveal animation */}
                <motion.div
                  className={cn(
                    "mt-3 max-w-lg rounded-lg bg-neutral-900/30 p-4 backdrop-blur-sm md:p-6",
                    index % 2 === 0
                      ? "ml-0 md:ml-14"
                      : "ml-0 md:ml-auto md:mr-14",
                  )}
                  initial={{ opacity: 0.5, y: 20 }}
                  animate={
                    activeStep === index
                      ? {
                          opacity: 1,
                          y: 0,
                          boxShadow: `0 4px 20px -5px ${step.color}40`,
                        }
                      : {
                          opacity: 0.7,
                          y: 10,
                          boxShadow: "none",
                        }
                  }
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-neutral-300">{step.description}</p>

                  {/* Decorative element */}
                  <motion.div
                    className="mt-4 h-1 rounded-full"
                    style={{
                      background: `linear-gradient(to right, ${step.color}, transparent)`,
                      width: activeStep === index ? "100%" : "30%",
                    }}
                    animate={{ width: activeStep === index ? "100%" : "30%" }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.div>

                {/* Floating decorative patterns unique to each step */}
                <AnimatePresence>
                  {activeStep === index && (
                    <motion.div
                      className={cn(
                        "pointer-events-none absolute -z-10 opacity-20",
                        index % 2 === 0 ? "-right-20 top-0" : "-left-20 top-0",
                      )}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.2 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      {getStepDecoration(index, step.color)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper function to generate unique decorative elements for each step
const getStepDecoration = (index: number, color: string) => {
  switch (index) {
    case 0: // Discover
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle
            cx="60"
            cy="60"
            r="40"
            stroke={color}
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <circle cx="60" cy="60" r="30" stroke={color} strokeWidth="1" />
          <circle
            cx="60"
            cy="60"
            r="20"
            stroke={color}
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <circle cx="60" cy="60" r="4" fill={color} />
        </svg>
      );
    case 1: // Analyze
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <rect
            x="30"
            y="30"
            width="60"
            height="60"
            stroke={color}
            strokeWidth="1"
          />
          <line
            x1="30"
            y1="50"
            x2="90"
            y2="50"
            stroke={color}
            strokeWidth="1"
          />
          <line
            x1="30"
            y1="70"
            x2="90"
            y2="70"
            stroke={color}
            strokeWidth="1"
          />
          <line
            x1="50"
            y1="30"
            x2="50"
            y2="90"
            stroke={color}
            strokeWidth="1"
          />
          <line
            x1="70"
            y1="30"
            x2="70"
            y2="90"
            stroke={color}
            strokeWidth="1"
          />
        </svg>
      );
    case 2: // Strategize
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <path
            d="M60 20 L100 60 L60 100 L20 60 Z"
            stroke={color}
            strokeWidth="1"
          />
          <path
            d="M40 40 L80 40 L80 80 L40 80 Z"
            stroke={color}
            strokeWidth="1"
          />
          <circle cx="60" cy="60" r="10" stroke={color} strokeWidth="1" />
        </svg>
      );
    case 3: // Implement
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <path d="M30 90 L60 30 L90 90" stroke={color} strokeWidth="1" />
          <rect
            x="45"
            y="60"
            width="30"
            height="30"
            stroke={color}
            strokeWidth="1"
          />
          <circle cx="60" cy="40" r="10" stroke={color} strokeWidth="1" />
        </svg>
      );
    case 4: // Optimize
      return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="40" stroke={color} strokeWidth="1" />
          <path
            d="M60 20 C90 20, 100 60, 60 100 C20 100, 30 20, 60 20"
            stroke={color}
            strokeWidth="1"
          />
          <circle cx="60" cy="40" r="4" fill={color} />
          <circle cx="60" cy="80" r="4" fill={color} />
        </svg>
      );
    default:
      return null;
  }
};
