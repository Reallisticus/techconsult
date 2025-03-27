"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "~/i18n/context";
import { ScrollReveal } from "~/provider/SmoothScrollProvider";

export const ServiceProcess = () => {
  const { getNestedTranslation } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);

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

  return (
    <section
      ref={sectionRef}
      className="bg-transparent py-16 md:py-24"
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(37,99,235,0.05) 50%, rgba(0,0,0,0) 100%)",
      }}
    >
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

        <div className="relative mt-20">
          {/* Timeline connector line */}
          <div className="absolute left-4 top-0 h-full w-px bg-accent-500/30 md:left-1/2 md:-ml-px" />

          {/* Step 1: Discover - Now LEFT aligned */}
          <div className="relative mb-12 md:mb-24">
            <ScrollReveal direction="left" threshold={0.1} delay={0}>
              <div className="flex items-center">
                <div className="relative mr-6 flex h-8 w-8 items-center justify-center rounded-full bg-secondary-500 text-xs font-bold text-white">
                  1
                  <div className="absolute left-full top-1/2 h-px w-6 bg-secondary-500/50" />
                </div>
                <h3 className="text-xl font-bold text-white md:text-2xl">
                  {processData.discover.title}
                </h3>
              </div>
              <div className="mt-3 md:ml-14 md:max-w-lg">
                <p className="text-neutral-300">
                  {processData.discover.description}
                </p>
              </div>
            </ScrollReveal>
            <motion.div
              className="absolute left-4 top-4 h-px w-px md:left-1/2 md:-ml-px"
              initial={{ scale: 0.5, opacity: 0.5 }}
              animate={{
                scale: [0.5, 1.5, 0.5],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity,
                delay: 0,
              }}
            >
              <div className="shadow-glow h-1 w-1 rounded-full bg-secondary-400" />
            </motion.div>
          </div>

          {/* Step 2: Analyze - Now RIGHT aligned */}
          <div className="relative mb-12 md:mb-24 md:text-right">
            <ScrollReveal direction="right" threshold={0.1} delay={0.1}>
              <div className="flex items-center md:justify-end">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white md:order-last md:ml-6">
                  2
                  <div className="absolute right-full top-1/2 h-px w-6 bg-accent-500/50" />
                </div>
                <h3 className="text-xl font-bold text-white md:text-2xl">
                  {processData.analyze.title}
                </h3>
              </div>
              <div className="mt-3 md:ml-auto md:mr-14 md:max-w-lg">
                <p className="text-neutral-300">
                  {processData.analyze.description}
                </p>
              </div>
            </ScrollReveal>
            <motion.div
              className="absolute left-4 top-4 h-px w-px md:left-1/2 md:-ml-px"
              initial={{ scale: 0.5, opacity: 0.5 }}
              animate={{
                scale: [0.5, 1.5, 0.5],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity,
                delay: 0.6,
              }}
            >
              <div className="shadow-glow h-1 w-1 rounded-full bg-accent-400" />
            </motion.div>
          </div>

          {/* Step 3: Strategize - Now LEFT aligned */}
          <div className="relative mb-12 md:mb-24">
            <ScrollReveal direction="left" threshold={0.1} delay={0.2}>
              <div className="flex items-center">
                <div className="relative mr-6 flex h-8 w-8 items-center justify-center rounded-full bg-secondary-500 text-xs font-bold text-white">
                  3
                  <div className="absolute left-full top-1/2 h-px w-6 bg-secondary-500/50" />
                </div>
                <h3 className="text-xl font-bold text-white md:text-2xl">
                  {processData.strategize.title}
                </h3>
              </div>
              <div className="mt-3 md:ml-14 md:max-w-lg">
                <p className="text-neutral-300">
                  {processData.strategize.description}
                </p>
              </div>
            </ScrollReveal>
            <motion.div
              className="absolute left-4 top-4 h-px w-px md:left-1/2 md:-ml-px"
              initial={{ scale: 0.5, opacity: 0.5 }}
              animate={{
                scale: [0.5, 1.5, 0.5],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity,
                delay: 1.2,
              }}
            >
              <div className="shadow-glow h-1 w-1 rounded-full bg-secondary-400" />
            </motion.div>
          </div>

          {/* Step 4: Implement - Now RIGHT aligned */}
          <div className="relative mb-12 md:mb-24 md:text-right">
            <ScrollReveal direction="right" threshold={0.1} delay={0.3}>
              <div className="flex items-center md:justify-end">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white md:order-last md:ml-6">
                  4
                  <div className="absolute right-full top-1/2 h-px w-6 bg-accent-500/50" />
                </div>
                <h3 className="text-xl font-bold text-white md:text-2xl">
                  {processData.implement.title}
                </h3>
              </div>
              <div className="mt-3 md:ml-auto md:mr-14 md:max-w-lg">
                <p className="text-neutral-300">
                  {processData.implement.description}
                </p>
              </div>
            </ScrollReveal>
            <motion.div
              className="absolute left-4 top-4 h-px w-px md:left-1/2 md:-ml-px"
              initial={{ scale: 0.5, opacity: 0.5 }}
              animate={{
                scale: [0.5, 1.5, 0.5],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity,
                delay: 1.8,
              }}
            >
              <div className="shadow-glow h-1 w-1 rounded-full bg-accent-400" />
            </motion.div>
          </div>

          {/* Step 5: Optimize - Now LEFT aligned */}
          <div className="relative mb-12 md:mb-24">
            <ScrollReveal direction="left" threshold={0.1} delay={0.4}>
              <div className="flex items-center">
                <div className="relative mr-6 flex h-8 w-8 items-center justify-center rounded-full bg-secondary-500 text-xs font-bold text-white">
                  5
                  <div className="absolute left-full top-1/2 h-px w-6 bg-secondary-500/50" />
                </div>
                <h3 className="text-xl font-bold text-white md:text-2xl">
                  {processData.optimize.title}
                </h3>
              </div>
              <div className="mt-3 md:ml-14 md:max-w-lg">
                <p className="text-neutral-300">
                  {processData.optimize.description}
                </p>
              </div>
            </ScrollReveal>
            <motion.div
              className="absolute left-4 top-4 h-px w-px md:left-1/2 md:-ml-px"
              initial={{ scale: 0.5, opacity: 0.5 }}
              animate={{
                scale: [0.5, 1.5, 0.5],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity,
                delay: 2.4,
              }}
            >
              <div className="shadow-glow h-1 w-1 rounded-full bg-secondary-400" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
