"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useLanguage } from "~/i18n/context";
import { getDisplayFontClass } from "~/lib/fonts";
import { useIsomorphicLayoutEffect } from "~/hooks/useIsomorphicLayout";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { CaseStudyTranslations } from "~/i18n/translations/case-studies";

export const CaseStudiesHero = () => {
  const { getNestedTranslation, language } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const gsapCtxRef = useRef<gsap.Context | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const displayFontClass = getDisplayFontClass(language);

  // For the 3D text effect
  const textRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(textRef, { once: false });
  const controls = useAnimation();

  // Get case studies content from translations
  const caseStudiesData =
    getNestedTranslation<CaseStudyTranslations>("caseStudies");

  // For the animated showcase dots
  const [activeDot, setActiveDot] = useState(0);
  const totalDots = caseStudiesData?.cases?.length || 3;

  useEffect(() => {
    setIsMounted(true);

    // Automatically cycle through dots
    const interval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % totalDots);
    }, 3000);

    return () => clearInterval(interval);
  }, [totalDots]);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  // GSAP animation for the hero section
  useIsomorphicLayoutEffect(() => {
    if (!headlineRef.current || !isMounted || gsapCtxRef.current) return;

    // Safe import of GSAP
    import("gsap").then(({ gsap }) => {
      // Try to import SplitText - it's optional
      try {
        import("gsap-trial/SplitText")
          .then((module) => {
            const SplitText = module.SplitText;
            gsap.registerPlugin(SplitText);
            animateText(gsap, SplitText);
          })
          .catch(() => {
            // Fallback animation without SplitText
            animateTextFallback(gsap);
          });
      } catch (e) {
        // Fallback animation without SplitText
        animateTextFallback(gsap);
      }
    });

    const animateText = (gsap: any, SplitText: any) => {
      const ctx = gsap.context(() => {
        // Split text into chars for detailed animation
        if (headlineRef.current) {
          const split = new SplitText(headlineRef.current, {
            type: "chars,words",
            charsClass: "char",
          });

          gsap.from(split.chars, {
            opacity: 0,
            y: 50,
            rotateX: -90,
            stagger: 0.02,
            duration: 0.7,
            ease: "back.out(1.7)",
            delay: 0.3,
          });
        }

        // Animate description
        const description = document.querySelector(".case-studies-description");
        if (description) {
          gsap.from(description, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            delay: 0.7,
            ease: "power3.out",
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
            delay: 1,
            ease: "back.out(2)",
          });
        }
      }, heroRef);

      gsapCtxRef.current = ctx;
    };

    const animateTextFallback = (gsap: any) => {
      const ctx = gsap.context(() => {
        // Simple animation without SplitText
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
        const description = document.querySelector(".case-studies-description");
        if (description) {
          gsap.from(description, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            delay: 0.6,
            ease: "power3.out",
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
            delay: 0.9,
            ease: "back.out(2)",
          });
        }
      }, heroRef);

      gsapCtxRef.current = ctx;
    };

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

  return (
    <>
      {" "}
      <section
        ref={heroRef}
        className="relative min-h-[80vh] overflow-hidden bg-transparent pt-40"
      >
        <div className="absolute inset-0 -z-10">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-10">
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
                    stroke="white"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Radial gradient */}
          <div className="absolute inset-0 bg-gradient-radial from-accent-900/30 to-transparent opacity-60"></div>

          {/* Floating elements */}
          <motion.div
            className="absolute left-1/4 top-1/4 h-32 w-32 rounded-full bg-primary-800/10 blur-2xl"
            animate={{
              x: [0, -20, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-accent-700/10 blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Main content */}
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 flex items-center justify-center sm:justify-start"
            >
              <div className="mr-3 h-px w-8 bg-accent-500"></div>
              <span className="font-mono uppercase tracking-wider text-accent-500">
                {caseStudiesData?.subtitle}
              </span>
              <div className="ml-3 h-px w-8 bg-accent-500"></div>
            </motion.div>

            {/* Main headline with 3D perspective */}
            <div ref={textRef} className="perspective mb-8">
              <motion.div
                ref={headlineRef}
                className={cn(
                  "text-center text-4xl font-bold sm:text-left sm:text-5xl md:text-6xl lg:text-7xl",
                  language === "bg" ? displayFontClass : "font-display",
                )}
                variants={textVariants}
                initial="hidden"
                animate={controls}
                style={{
                  transformStyle: "preserve-3d",
                }}
              >
                <span className="gradient-text block bg-gradient-to-r from-white via-primary-300 to-white bg-clip-text pb-2 text-transparent">
                  {caseStudiesData?.title}
                </span>
              </motion.div>
            </div>

            {/* Description */}
            <motion.p
              className="case-studies-description mb-10 text-center text-lg text-neutral-300 sm:text-left md:text-xl lg:max-w-3xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {caseStudiesData?.description}
            </motion.p>

            {/* Interactive showcase dots */}
            <div className="mb-12 flex justify-center gap-3 sm:justify-start">
              {Array(totalDots)
                .fill(0)
                .map((_, index) => (
                  <motion.div
                    key={index}
                    className={cn(
                      "showcase-dot relative h-3 w-3 cursor-pointer rounded-full transition-all duration-300",
                      index === activeDot
                        ? "bg-accent-500"
                        : "bg-neutral-600 hover:bg-neutral-400",
                    )}
                    onClick={() => setActiveDot(index)}
                    whileTap={{ scale: 0.9 }}
                  >
                    {index === activeDot && (
                      <motion.div
                        className="absolute -inset-1.5 rounded-full border border-accent-500"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        layoutId="activeDot"
                      />
                    )}
                  </motion.div>
                ))}
            </div>

            {/* Button with hover effect */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex justify-center sm:justify-start"
            >
              <Button
                href="#case-studies"
                variant="primaryGradient"
                size="lg"
                magnetic
                magneticStrength={40}
                glow
              >
                <span className="group relative inline-flex items-center">
                  {caseStudiesData?.viewAllCaseStudies}
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
          </div>
        </div>

        {/* Decorative elements */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>

        {/* Animated line */}
        <motion.div
          className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-accent-500/30 to-transparent"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </section>
      <style jsx>{`
        .perspective {
          perspective: 200px;
        }
      `}</style>
    </>
  );
};
