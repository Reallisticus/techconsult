"use client";

import { useState, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useLanguage } from "~/i18n/context";
import { ScrollReveal } from "~/provider/SmoothScrollProvider";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import Image from "next/image";

// Define interface for case study data
interface CaseStudyTranslations {
  cases?: Array<{
    id?: string;
    title?: string;
    client?: string;
    description?: string;
    image?: string;
    tags?: string[];
  }>;
  viewCaseStudy?: string;
  allProjects?: string;
  noProjectsFound?: string;
  tryChangingFilter?: string;
  viewAllProjects?: string;
  ndaDisclaimer?: string;
}

export const CaseStudiesGrid = () => {
  const { getNestedTranslation, language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get case studies from translations
  const caseStudiesData =
    getNestedTranslation<CaseStudyTranslations>("caseStudies");

  const cases = caseStudiesData?.cases || [];

  // Extract all unique tags from case studies
  const allTags = Array.from(
    new Set(cases.flatMap((caseItem) => caseItem.tags || [])),
  );

  // Filter case studies by tag
  const filteredCases =
    activeFilter === "all"
      ? cases
      : cases.filter((caseItem) =>
          caseItem.tags?.some(
            (tag) => tag.toLowerCase() === activeFilter.toLowerCase(),
          ),
        );

  // Generate slug for URL - matches the one in CaseStudiesHero
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

  // Stagger animation for grid items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  // Parallax scrolling effects
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.3, 1, 1, 0.3],
  );

  // Handle filter change with smooth transitions
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  // Set component as loaded after render
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Reset active filter on language change
  useEffect(() => {
    setActiveFilter("all");
  }, [language]);

  return (
    <section
      ref={sectionRef}
      id="case-studies"
      className="relative overflow-hidden bg-transparent py-24"
    >
      {/* Parallax decorative background elements */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 -z-10 opacity-40"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-purple-900/5 to-black/30"></div>
        <svg
          className="h-full w-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="diagonalHatch"
              width="10"
              height="10"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="10"
                stroke="#6236FF"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonalHatch)" />
        </svg>
      </motion.div>

      {/* Grid pattern overlay - matches hero */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <svg
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="grid-pattern"
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
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* Main content container */}
      <div className="container mx-auto px-4">
        {/* Section heading */}
        <ScrollReveal direction="up" threshold={0.1}>
          <div className="mb-6 text-center">
            <div className="mb-4 flex items-center justify-center">
              <span className="mr-3 font-mono uppercase tracking-widest text-purple-500">
                {caseStudiesData?.allProjects || "All Projects"}
              </span>
              <div className="h-px w-16 bg-purple-500"></div>
            </div>
            <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              {caseStudiesData?.viewAllProjects || "Explore Our Work"}
            </h2>

            {/* NDA Disclaimer */}
            <div className="mx-auto mt-4 max-w-xl">
              <p className="flex items-center justify-center text-xs italic text-purple-300/50">
                <svg
                  className="mr-1.5 h-3 w-3 text-purple-400/60"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                {caseStudiesData?.ndaDisclaimer ||
                  "Not all completed projects are displayed due to confidentiality agreements and NDAs."}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal direction="up" threshold={0.1}>
          <div className="scrollbar-hide mb-12 overflow-x-auto">
            <div className="flex min-w-max justify-center space-x-4 pb-2">
              <motion.button
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                  activeFilter === "all"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "bg-[#0A0A2A]/70 text-neutral-300 hover:bg-[#0A0A2A] hover:text-white",
                )}
                onClick={() => handleFilterChange("all")}
                whileTap={{ scale: 0.97 }}
              >
                {caseStudiesData?.allProjects || "All Projects"}
              </motion.button>

              {allTags.map((tag) => (
                <motion.button
                  key={tag}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                    activeFilter === tag.toLowerCase()
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                      : "bg-[#0A0A2A]/70 text-neutral-300 hover:bg-[#0A0A2A] hover:text-white",
                  )}
                  onClick={() => handleFilterChange(tag.toLowerCase())}
                  whileTap={{ scale: 0.97 }}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Grid of case studies with staggered animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              ref={gridRef}
              className="relative"
              variants={containerVariants}
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
              viewport={{ once: true, amount: 0.1 }}
            >
              {/* Main case studies grid */}
              {filteredCases.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCases.map((caseItem, index) => {
                    const studySlug = caseItem.id
                      ? caseItem.id
                      : createSlug(caseItem.title);

                    return (
                      <motion.div
                        layout
                        key={caseItem.id || index}
                        variants={itemVariants}
                        className="group relative"
                      >
                        <motion.div
                          className="relative overflow-hidden rounded-xl border border-purple-500/10 bg-[#0A0A2A]/70 backdrop-blur-md"
                          whileHover={{ y: -10 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 15,
                          }}
                        >
                          {/* Case study image with overlay */}
                          <div className="relative aspect-[4/3] overflow-hidden">
                            <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0A0A2A] via-[#0A0A2A]/50 to-transparent opacity-70"></div>
                            {caseItem.image ? (
                              <motion.div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                  backgroundImage: `url(${caseItem.image})`,
                                }}
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.6 }}
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-blue-900/30" />
                            )}

                            {/* Client badge */}
                            {caseItem.client && (
                              <div className="absolute left-4 top-4 z-10 rounded-lg bg-black/40 px-3 py-1.5 backdrop-blur-sm">
                                <span className="text-sm font-medium text-white">
                                  {caseItem.client}
                                </span>
                              </div>
                            )}

                            {/* Hover overlay with animated border */}
                            <motion.div
                              className="absolute inset-0 z-10 border-2 border-transparent opacity-0 transition-all duration-300 group-hover:border-purple-500/50 group-hover:opacity-100"
                              whileHover={{ opacity: 1 }}
                            >
                              <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-purple-500"></div>
                              <div className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-purple-500"></div>
                            </motion.div>
                          </div>

                          {/* Content */}
                          <div className="p-6">
                            <h3 className="mb-2 text-xl font-bold text-white group-hover:text-purple-400">
                              {caseItem.title}
                            </h3>

                            <p className="mb-4 line-clamp-2 text-sm text-neutral-300">
                              {caseItem.description}
                            </p>

                            {/* Tags */}
                            {caseItem.tags && caseItem.tags.length > 0 && (
                              <div className="mb-4 flex flex-wrap gap-2">
                                {caseItem.tags.map((tag, i) => (
                                  <span
                                    key={i}
                                    className="rounded-full bg-purple-900/20 px-2 py-1 text-xs text-purple-300"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* View button with animation */}
                            <Link
                              href={`/case-studies/${studySlug}`}
                              className="inline-flex items-center text-sm text-purple-400 transition-all duration-300 hover:text-purple-300"
                            >
                              {caseStudiesData?.viewCaseStudy ||
                                "View Case Study"}
                              <motion.svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="ml-2"
                                animate={{
                                  x: [0, 5, 0],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  repeatType: "reverse",
                                  repeatDelay: 1,
                                  ease: "easeInOut",
                                }}
                              >
                                <path
                                  d="M5 12h14M12 5l7 7-7 7"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </motion.svg>
                            </Link>
                          </div>

                          {/* Light effect on hover */}
                          <div className="pointer-events-none absolute inset-0 z-10">
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100"
                              initial={{ x: "-100%" }}
                              whileHover={{ x: "200%" }}
                              transition={{ duration: 1.5, ease: "linear" }}
                            />
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <motion.div
                  className="my-12 flex flex-col items-center justify-center rounded-xl border border-purple-500/10 bg-[#0A0A2A]/70 py-16 text-center backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-900/20">
                    <svg
                      className="h-8 w-8 text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white">
                    {caseStudiesData?.noProjectsFound || "No projects found"}
                  </h3>
                  <p className="text-neutral-400">
                    {caseStudiesData?.tryChangingFilter ||
                      "Try changing your filter criteria"}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 border-purple-500/30 text-purple-400 hover:border-purple-500 hover:bg-purple-500/10 hover:text-purple-300"
                    onClick={() => setActiveFilter("all")}
                  >
                    {caseStudiesData?.viewAllProjects || "View All Projects"}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Decorative bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent"></div>
    </section>
  );
};
