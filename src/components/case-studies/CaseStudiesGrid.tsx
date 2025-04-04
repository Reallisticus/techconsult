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

export const CaseStudiesGrid = () => {
  const { getNestedTranslation } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Parallax scrolling effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Get case studies from translations
  const caseStudiesData = getNestedTranslation<{
    cases: Array<{
      id: string;
      title: string;
      client: string;
      description: string;
      image: string;
      tags: string[];
    }>;
    viewCaseStudy: string;
  }>("caseStudies");

  const cases = caseStudiesData?.cases || [];

  // Extract all unique tags from case studies
  const allTags = Array.from(
    new Set(cases.flatMap((caseItem) => caseItem.tags)),
  );

  // Filter case studies by tag
  const filteredCases =
    activeFilter === "all"
      ? cases
      : cases.filter((caseItem) =>
          caseItem.tags.some(
            (tag) => tag.toLowerCase() === activeFilter.toLowerCase(),
          ),
        );

  // Generate slug for URL
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-\u0400-\u04FF]+/g, "");
  };

  // Stagger animation for grid items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  // Handle filter change with smooth transitions
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setSelectedCase(null);
  };

  // Detailed case view animations
  const detailVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      id="case-studies"
      className="relative bg-transparent py-24"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-accent-900/5 to-black/30"></div>
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
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonalHatch)" />
        </svg>
      </div>

      {/* Main content container */}
      <div className="container mx-auto px-4">
        {/* Filters */}
        <ScrollReveal direction="up" threshold={0.1}>
          <div className="scrollbar-hide mb-12 overflow-x-auto">
            <div className="flex min-w-max justify-center space-x-4 pb-2">
              <motion.button
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                  activeFilter === "all"
                    ? "bg-accent-500 text-white shadow-lg shadow-accent-500/20"
                    : "bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50",
                )}
                onClick={() => handleFilterChange("all")}
                whileTap={{ scale: 0.97 }}
              >
                All Projects
              </motion.button>

              {allTags.map((tag) => (
                <motion.button
                  key={tag}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                    activeFilter === tag.toLowerCase()
                      ? "bg-accent-500 text-white shadow-lg shadow-accent-500/20"
                      : "bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50",
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
        <motion.div
          ref={gridRef}
          className="relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Main case studies grid */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCases.map((caseItem, index) => {
              const studySlug = generateSlug(caseItem.title);

              return (
                <motion.div
                  layout
                  key={caseItem.id}
                  variants={itemVariants}
                  className="group relative"
                >
                  <motion.div
                    className="relative overflow-hidden rounded-xl bg-neutral-900/60 backdrop-blur-md"
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    {/* Case study image with overlay */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent opacity-70"></div>
                      <motion.div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${caseItem.image})` }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      />

                      {/* Client badge */}
                      <div className="absolute left-4 top-4 rounded-lg bg-black/40 px-3 py-1.5 backdrop-blur-sm">
                        <span className="text-sm font-medium text-white">
                          {caseItem.client}
                        </span>
                      </div>

                      {/* Hover overlay with animated border */}
                      <motion.div
                        className="absolute inset-0 border-2 border-transparent opacity-0 transition-all duration-300 group-hover:border-accent-500/50 group-hover:opacity-100"
                        whileHover={{ opacity: 1 }}
                      >
                        <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-accent-500"></div>
                        <div className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-accent-500"></div>
                      </motion.div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="mb-2 text-xl font-bold text-white group-hover:text-accent-400">
                        {caseItem.title}
                      </h3>

                      <p className="mb-4 line-clamp-2 text-sm text-neutral-300">
                        {caseItem.description}
                      </p>

                      {/* Tags */}
                      <div className="mb-4 flex flex-wrap gap-2">
                        {caseItem.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-neutral-800 px-2 py-1 text-xs text-neutral-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* View button with animation */}
                      <Link
                        href={`/case-studies/${studySlug}`}
                        className="inline-flex items-center text-sm text-accent-400 transition-all duration-300 hover:text-accent-300"
                      >
                        {caseStudiesData?.viewCaseStudy}
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
                    <div className="pointer-events-none absolute inset-0">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-500/5 to-transparent opacity-0 group-hover:opacity-100"
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

          {/* Empty state if no results */}
          {filteredCases.length === 0 && (
            <motion.div
              className="my-12 flex flex-col items-center justify-center rounded-xl bg-neutral-900/40 py-16 text-center backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <svg
                className="mb-4 h-16 w-16 text-neutral-600"
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
              <h3 className="mb-2 text-xl font-bold text-white">
                No projects found
              </h3>
              <p className="text-neutral-400">
                Try changing your filter criteria
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setActiveFilter("all")}
              >
                View All Projects
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Decorative bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent"></div>
    </section>
  );
};
