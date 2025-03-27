"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "~/i18n/context";
import { ScrollReveal } from "~/provider/SmoothScrollProvider";

export const ServicesBenefits = () => {
  const { t, getNestedTranslation } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Get benefits data from translations
  const benefitsData = getNestedTranslation<{
    subtitle: string;
    title: string;
    description: string;
    expertise: { title: string; description: string };
    tailored: { title: string; description: string };
    innovation: { title: string; description: string };
    results: { title: string; description: string };
  }>("services.benefits");

  return (
    <section ref={sectionRef} className="bg-transparent py-16 md:py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal direction="up" threshold={0.1}>
          <div className="mb-12 text-center md:mb-16">
            <span className="font-mono uppercase tracking-wider text-accent-500">
              {benefitsData.subtitle}
            </span>
            <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
              {benefitsData.title}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-neutral-300">
              {benefitsData.description}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Expertise */}
          <ScrollReveal direction="up" delay={0} threshold={0.1}>
            <motion.div
              className="group relative h-full overflow-hidden rounded-xl bg-neutral-900/30 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-neutral-900/50"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-600 to-accent-600 opacity-70" />

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500/10">
                <svg
                  className="h-6 w-6 text-accent-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>

              <h3 className="mb-3 text-xl font-bold text-white group-hover:text-accent-400">
                {benefitsData.expertise.title}
              </h3>

              <p className="text-neutral-300">
                {benefitsData.expertise.description}
              </p>

              <motion.div
                className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary-900/0 via-accent-900/0 to-primary-900/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                animate={{
                  background: [
                    "radial-gradient(circle at center, rgba(124, 58, 237, 0.1) 0%, rgba(0, 0, 0, 0) 70%)",
                    "radial-gradient(circle at center, rgba(124, 58, 237, 0.2) 0%, rgba(0, 0, 0, 0) 70%)",
                    "radial-gradient(circle at center, rgba(124, 58, 237, 0.1) 0%, rgba(0, 0, 0, 0) 70%)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </ScrollReveal>

          {/* Tailored */}
          <ScrollReveal direction="up" delay={0.1} threshold={0.1}>
            <motion.div
              className="group relative h-full overflow-hidden rounded-xl bg-neutral-900/30 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-neutral-900/50"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-600 to-accent-600 opacity-70" />

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500/10">
                <svg
                  className="h-6 w-6 text-accent-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                  />
                </svg>
              </div>

              <h3 className="mb-3 text-xl font-bold text-white group-hover:text-accent-400">
                {benefitsData.tailored.title}
              </h3>

              <p className="text-neutral-300">
                {benefitsData.tailored.description}
              </p>

              <motion.div
                className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary-900/0 via-accent-900/0 to-primary-900/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                animate={{
                  background: [
                    "radial-gradient(circle at center, rgba(124, 58, 237, 0.1) 0%, rgba(0, 0, 0, 0) 70%)",
                    "radial-gradient(circle at center, rgba(124, 58, 237, 0.2) 0%, rgba(0, 0, 0, 0) 70%)",
                    "radial-gradient(circle at center, rgba(124, 58, 237, 0.1) 0%, rgba(0, 0, 0, 0) 70%)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </ScrollReveal>

          {/* Innovation */}
          <ScrollReveal direction="up" delay={0.2} threshold={0.1}>
            <motion.div
              className="group relative h-full overflow-hidden rounded-xl bg-neutral-900/30 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-neutral-900/50"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-600 to-accent-600 opacity-70" />

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500/10">
                <svg
                  className="h-6 w-6 text-accent-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>

              <h3 className="mb-3 text-xl font-bold text-white group-hover:text-accent-400">
                {benefitsData.innovation.title}
              </h3>

              <p className="text-neutral-300">
                {benefitsData.innovation.description}
              </p>

              <motion.div
                className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary-900/0 via-accent-900/0 to-primary-900/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                animate={{
                  background: [
                    "radial-gradient(circle at center, rgba(124, 58, 237, 0.1) 0%, rgba(0, 0, 0, 0) 70%)",
                    "radial-gradient(circle at center, rgba(124, 58, 237, 0.2) 0%, rgba(0, 0, 0, 0) 70%)",
                    "radial-gradient(circle at center, rgba(124, 58, 237, 0.1) 0%, rgba(0, 0, 0, 0) 70%)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </ScrollReveal>

          {/* Results */}
          <ScrollReveal direction="up" delay={0.3} threshold={0.1}>
            <motion.div
              className="group relative h-full overflow-hidden rounded-xl bg-neutral-900/30 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-neutral-900/50"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-600 to-accent-600 opacity-70" />

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500/10">
                <svg
                  className="h-6 w-6 text-accent-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>

              <h3 className="mb-3 text-xl font-bold text-white group-hover:text-accent-400">
                {benefitsData.results.title}
              </h3>

              <p className="text-neutral-300">
                {benefitsData.results.description}
              </p>

              <motion.div
                className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary-900/0 via-accent-900/0 to-primary-900/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                animate={{
                  background: [
                    "radial-gradient(circle at center, rgba(124, 58, 237, 0.1) 0%, rgba(0, 0, 0, 0) 70%)",
                    "radial-gradient(circle at center, rgba(124, 58, 237, 0.2) 0%, rgba(0, 0, 0, 0) 70%)",
                    "radial-gradient(circle at center, rgba(124, 58, 237, 0.1) 0%, rgba(0, 0, 0, 0) 70%)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
