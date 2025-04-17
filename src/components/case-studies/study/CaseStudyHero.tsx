// CaseStudyHero.tsx - Enhanced hero with 3D flip effect and showcase dots
"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { CaseStudyType, CaseStudyTranslations } from "./CaseStudiesDetail";
import { getDisplayFontClass, silkscreen } from "~/lib/fonts";
import { cn } from "~/lib/utils";
import { useLanguage } from "../../../i18n/context";

interface CaseStudyHeroProps {
  caseStudy: CaseStudyType;
  translations: CaseStudyTranslations | undefined;
}

export const CaseStudyHero = ({
  caseStudy,
  translations,
}: CaseStudyHeroProps) => {
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const displayFontClass = getDisplayFontClass(language);

  // Track which side of the card is active (0 = content, 1 = image)
  const [activeView, setActiveView] = useState(0);
  // Track flip animation direction
  const [flipDirection, setFlipDirection] = useState(0);

  // For mouse interaction and 3D effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 300 };
  const followX = useSpring(mouseX, springConfig);
  const followY = useSpring(mouseY, springConfig);

  // Create transforms based on mouse position
  const rotateX = useTransform(followY, [-300, 300], [5, -5]);
  const rotateY = useTransform(followX, [-300, 300], [-5, 5]);
  const translateX = useTransform(followX, [-300, 300], [-15, 15]);
  const translateY = useTransform(followY, [-300, 300], [-15, 15]);

  const containsCyrillic = (text?: string) => {
    if (!text) return false;
    return /[а-яА-Я]/.test(text);
  };

  // Mouse-driven rotation with fixed maximum values to prevent excessive rotation
  const clampedRotateX = useTransform(rotateX, (value) =>
    Math.min(Math.max(value, -5), 5),
  );
  const clampedRotateY = useTransform(rotateY, (value) =>
    Math.min(Math.max(value, -5), 5),
  );

  // Content container styles
  const containerStyle = {
    perspective: 2000,
    transformStyle: "preserve-3d" as const,
  };

  // Main card styles with 3D properties
  const cardStyle = {
    transformStyle: "preserve-3d" as const,
    transformOrigin: "center center" as const,
  };

  // Set up mouse tracking for 3D effect
  useEffect(() => {
    setIsMounted(true);

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

  // Parallax scrolling effect (for abstract elements)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.9, 0.8]);

  // Handle dot click to flip the card
  const handleDotClick = (index: number) => {
    if (index === activeView) return;

    // Set direction for proper animation
    setFlipDirection(index > activeView ? 1 : -1);
    setActiveView(index);
  };

  // Card flip variants
  const cardVariants = {
    content: (direction: number) => ({
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 70, // Reduced stiffness for smoother animation
        damping: 20, // Better damping
        duration: 0.8,
      },
    }),
    image: (direction: number) => ({
      rotateY: 180,
      transition: {
        type: "spring",
        stiffness: 70, // Reduced stiffness
        damping: 20, // Better damping
        duration: 0.8,
      },
    }),
  };

  // Inner card content variants
  const contentVariants = {
    content: {
      opacity: 1,
      rotateY: 0,
      transition: {
        duration: 0.4,
        delay: 0.2,
      },
    },
    image: {
      opacity: 0,
      rotateY: -180,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Inner card image variants
  const imageVariants = {
    content: {
      opacity: 0,
      rotateY: 180,
      transition: {
        duration: 0.2,
      },
    },
    image: {
      opacity: 1,
      rotateY: 0,
      transition: {
        duration: 0.4,
        delay: 0.2,
      },
    },
  };

  return (
    <motion.section
      ref={sectionRef}
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden md:min-h-[100vh]"
    >
      {/* Grid pattern with better visibility */}
      <div className="absolute inset-0 -z-10 opacity-[0.1]">
        <div
          className="absolute inset-0"
          style={{
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
                id="hero-grid"
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
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>
      </div>

      {/* Dynamic floating elements - abstract shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Circle shape */}
        <motion.div
          className="absolute -right-20 top-1/4 h-60 w-60 rounded-full border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5"
          style={{
            x: translateX,
            y: translateY,
            scale: 0.8,
          }}
          animate={{
            y: ["0%", "5%", "0%"],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Rectangle shape */}
        <motion.div
          className="absolute -left-10 bottom-1/3 h-40 w-40 rounded-lg border border-blue-500/20 bg-gradient-to-tr from-blue-500/5 to-purple-500/5"
          style={{
            x: useTransform(followX, [-300, 300], [10, -10]),
            y: useTransform(followY, [-300, 300], [10, -10]),
            rotate: useTransform(followX, [-300, 300], [-5, 5]),
          }}
          animate={{
            y: ["0%", "-5%", "0%"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Triangle shape */}
        <motion.div
          className="top-1/6 absolute right-1/4 h-32 w-32"
          style={{
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            border: "1px solid rgba(124, 58, 237, 0.1)",
            background:
              "linear-gradient(to bottom, rgba(124, 58, 237, 0.05), rgba(59, 130, 246, 0.05))",
            x: useTransform(followX, [-300, 300], [-5, 5]),
            y: useTransform(followY, [-300, 300], [-10, 10]),
          }}
          animate={{
            rotate: [0, 10, 0],
            y: ["0%", "3%", "0%"],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content with 3D effect */}
      <div className="container relative z-10 mx-auto px-4">
        {/* Main content that responds to mouse movement */}
        <motion.div
          className="relative mx-auto max-w-4xl"
          style={containerStyle}
        >
          {/* 3D card that flips */}
          <motion.div
            className="relative h-[480px] w-full transform-gpu"
            style={containerStyle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Card - main container */}
            <motion.div
              className="relative h-full w-full"
              style={cardStyle}
              custom={flipDirection}
              variants={cardVariants}
              initial="content"
              animate={activeView === 0 ? "content" : "image"}
            >
              {/* Front side - Content */}
              <motion.div
                className="absolute inset-0 rounded-2xl border border-purple-500/30 bg-[rgba(10,10,42,0.7)] p-8 shadow-2xl backdrop-blur-md md:p-12"
                style={{
                  rotateX: clampedRotateX,
                  rotateY: clampedRotateY,
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                  transformOrigin: "center center",
                  willChange: "transform",
                }}
                variants={contentVariants}
                initial="content"
                animate={activeView === 0 ? "content" : "image"}
              >
                {/* Client name with enhanced styling */}
                <div className="mb-5 flex items-center justify-center sm:justify-start">
                  <motion.div
                    className="flex items-center rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 backdrop-blur-sm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-purple-400"></span>
                    <span className="text-sm font-medium tracking-wide text-purple-300">
                      {caseStudy.client}
                    </span>
                  </motion.div>
                </div>

                {/* Title with bitmap font styling */}
                <h1
                  className={cn(
                    "mb-6 bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-center font-bold tracking-wider text-transparent sm:text-left",
                    // Adjust font size for Cyrillic text
                    containsCyrillic(caseStudy.title)
                      ? "text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                      : "text-4xl sm:text-5xl md:text-6xl",
                    // Use proper font based on language
                    language === "bg" ? displayFontClass : silkscreen.className,
                  )}
                >
                  {caseStudy.title}
                </h1>

                {/* Description with better typography */}
                <motion.p
                  className="case-studies-description mb-8 text-center text-lg text-gray-300 sm:text-left md:text-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {caseStudy.description}
                </motion.p>

                {/* Tags with improved styling */}
                <div className="mb-2 flex flex-wrap justify-center gap-3 sm:justify-start">
                  {caseStudy.tags?.map((tag, i) => (
                    <motion.span
                      key={i}
                      className="rounded-full border border-purple-500/20 bg-[#0A0A2A]/70 px-4 py-1.5 text-sm font-medium text-purple-300 backdrop-blur-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                      whileHover={{
                        scale: 1.05,
                        backgroundColor: "rgba(124, 58, 237, 0.2)",
                        transition: { duration: 0.2 },
                      }}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Back side - Image */}
              <motion.div
                className="absolute inset-0 overflow-hidden rounded-2xl border border-purple-500/30 shadow-2xl"
                style={{
                  rotateX: clampedRotateX,
                  rotateY: useTransform(clampedRotateY, (value) => value + 180),
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                  transformOrigin: "center center",
                  willChange: "transform",
                }}
                variants={imageVariants}
                initial="image"
                animate={activeView === 1 ? "image" : "content"}
              >
                {/* Image showcase */}
                <div className="relative h-full w-full">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${caseStudy.image})` }}
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A2A]/70 via-transparent to-[#0A0A2A]/30"></div>

                  {/* Title on image */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center">
                      <div className="mr-3 h-px w-8 bg-purple-500"></div>
                      <span
                        className={`font-mono text-sm uppercase tracking-widest text-purple-300`}
                      >
                        {caseStudy.client}
                      </span>
                    </div>
                    <h2
                      className={cn(
                        "mt-2 font-bold text-white",
                        // Adjust font size for Cyrillic text
                        containsCyrillic(caseStudy.title)
                          ? "text-xl md:text-2xl"
                          : "text-2xl md:text-3xl",
                        // Use proper font based on language
                        language === "bg"
                          ? displayFontClass
                          : silkscreen.className,
                      )}
                    >
                      {caseStudy.title}
                    </h2>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Interactive showcase dots */}
          <div className="mt-8 flex justify-center gap-4">
            {[0, 1].map((index) => (
              <motion.div
                key={index}
                className={cn(
                  "showcase-dot relative h-3 w-3 cursor-pointer rounded-full transition-all duration-300",
                  index === activeView
                    ? "bg-purple-500"
                    : "bg-gray-600 hover:bg-gray-400",
                )}
                onClick={() => handleDotClick(index)}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: 1 + index * 0.1,
                }}
              >
                <AnimatePresence>
                  {index === activeView && (
                    <motion.div
                      className="absolute -inset-1.5 rounded-full border border-purple-500"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      layoutId="activeCardDot"
                      key={`active-dot-${index}`}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Enhanced scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <span className="mb-2 text-sm font-light tracking-wider text-purple-300/80">
          {translations?.scrollToExplore || "Scroll to explore"}
        </span>
        <motion.div
          className="h-7 w-7 rounded-full border-2 border-purple-500/30 backdrop-blur-sm"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <motion.div
            className="mx-auto mt-1 h-2 w-0.5 bg-purple-400"
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        </motion.div>
      </motion.div>

      {/* Animated line at bottom */}
      <motion.div
        className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.section>
  );
};
