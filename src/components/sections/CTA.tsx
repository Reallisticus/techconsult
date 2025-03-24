"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "~/i18n/context";
import { Button } from "../ui/button";

export const CtaSection = () => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });

  return (
    <section className="relative py-12 md:py-16 lg:py-24">
      {/* Glossy background effect */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Split background colors */}
        <div className="absolute inset-0 -skew-y-6 bg-gradient-to-r from-accent-900/30 to-accent-800/20" />
        <div className="absolute inset-0 skew-y-6 bg-gradient-to-l from-primary-900/30 to-primary-800/20" />

        {/* Reflection overlay */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

        {/* Glossy highlights */}
        <div className="absolute -left-1/4 top-0 h-[200px] w-[400px] rotate-45 bg-white/5 blur-3xl md:h-[300px] md:w-[600px]" />
        <div className="absolute -right-1/4 bottom-0 h-[200px] w-[400px] rotate-45 bg-white/5 blur-3xl md:h-[300px] md:w-[600px]" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          ref={containerRef}
          className="relative mx-auto overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Diagonal design with split content */}
          <div className="relative flex flex-col overflow-hidden rounded-xl md:flex-row">
            {/* Glossy card background with split effect */}
            <div className="absolute inset-0 rounded-xl bg-black/40 backdrop-blur-lg" />

            {/* Gradient overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent-900/30 via-transparent to-primary-900/30" />

            {/* Glass edge highlights */}
            <div className="absolute inset-0 rounded-xl">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-white/30 via-white/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/40 to-transparent" />
              <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-black/40 to-white/10" />
            </div>

            {/* Diagonal split */}
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <svg
                className="h-full w-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <defs>
                  <linearGradient
                    id="diagonalGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.15" />
                    <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.05" />
                    <stop offset="50%" stopColor="#2563EB" stopOpacity="0.05" />
                    <stop
                      offset="100%"
                      stopColor="#2563EB"
                      stopOpacity="0.15"
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M0,0 L100,0 L100,100 L0,100 Z"
                  fill="url(#diagonalGradient)"
                />
                <path
                  d="M0,100 L100,0 L100,100 Z"
                  fill="rgba(255, 255, 255, 0.03)"
                />
              </svg>
            </div>

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
                      opacity="0.3"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Left side (visual) - hidden on mobile, shown on tablet+ */}
            <div className="relative hidden p-6 md:block md:w-2/5 md:p-8 lg:p-12">
              <div className="relative h-full">
                {/* Decorative tech elements */}
                <svg
                  className="absolute left-0 top-0 h-full w-full"
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="100"
                    cy="100"
                    r="50"
                    fill="none"
                    stroke="#60A5FA"
                    strokeWidth="0.5"
                    strokeDasharray="10 5"
                    className="opacity-60"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#60A5FA"
                    strokeWidth="0.5"
                    strokeDasharray="10 5"
                    className="opacity-40"
                  />

                  <path
                    d="M60,80 L140,80 L140,120 L60,120 Z"
                    fill="none"
                    stroke="#7C3AED"
                    strokeWidth="1"
                    className="opacity-80"
                  />
                  <path
                    d="M70,90 L130,90 L130,110 L70,110 Z"
                    fill="none"
                    stroke="#7C3AED"
                    strokeWidth="1"
                    className="opacity-60"
                  />

                  {/* Connect dots */}
                  <circle cx="60" cy="80" r="3" fill="#7C3AED" />
                  <circle cx="140" cy="80" r="3" fill="#7C3AED" />
                  <circle cx="140" cy="120" r="3" fill="#7C3AED" />
                  <circle cx="60" cy="120" r="3" fill="#7C3AED" />

                  <line
                    x1="60"
                    y1="50"
                    x2="60"
                    y2="80"
                    stroke="#2563EB"
                    strokeWidth="0.5"
                  />
                  <line
                    x1="140"
                    y1="50"
                    x2="140"
                    y2="80"
                    stroke="#2563EB"
                    strokeWidth="0.5"
                  />
                  <line
                    x1="60"
                    y1="120"
                    x2="60"
                    y2="150"
                    stroke="#2563EB"
                    strokeWidth="0.5"
                  />
                  <line
                    x1="140"
                    y1="120"
                    x2="140"
                    y2="150"
                    stroke="#2563EB"
                    strokeWidth="0.5"
                  />

                  <circle cx="60" cy="50" r="5" fill="#2563EB" />
                  <circle cx="140" cy="50" r="5" fill="#2563EB" />
                  <circle cx="60" cy="150" r="5" fill="#2563EB" />
                  <circle cx="140" cy="150" r="5" fill="#2563EB" />
                </svg>

                {/* Central icon */}
                <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                  <motion.div
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 shadow-lg backdrop-blur md:h-20 md:w-20 lg:h-24 lg:w-24"
                    animate={{
                      boxShadow: [
                        "0 0 0 rgba(124, 58, 237, 0.3)",
                        "0 0 20px rgba(124, 58, 237, 0.6)",
                        "0 0 0 rgba(124, 58, 237, 0.3)",
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Glossy reflection effect on icon circle */}
                    <div
                      className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent"
                      style={{ height: "50%" }}
                    ></div>

                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="relative text-accent-400 md:h-10 md:w-10 lg:h-12 lg:w-12"
                    >
                      <path
                        d="M12 16V8M8 12h8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 21a9 9 0 100-18 9 9 0 000 18z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Right side (content) */}
            <div className="relative p-6 sm:p-8 md:w-3/5 md:p-8 lg:p-12">
              <div className="relative z-10 space-y-4 sm:space-y-6">
                {/* Small version of the icon for mobile only */}
                <div className="mb-4 flex justify-center md:hidden">
                  <motion.div
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 shadow-lg backdrop-blur"
                    animate={{
                      boxShadow: [
                        "0 0 0 rgba(124, 58, 237, 0.3)",
                        "0 0 20px rgba(124, 58, 237, 0.6)",
                        "0 0 0 rgba(124, 58, 237, 0.3)",
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent"
                      style={{ height: "50%" }}
                    ></div>
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="relative text-accent-400"
                    >
                      <path
                        d="M12 16V8M8 12h8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 21a9 9 0 100-18 9 9 0 000 18z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                </div>

                <motion.h2
                  className="text-center text-2xl font-bold leading-tight text-white sm:text-3xl md:text-left md:text-3xl lg:text-4xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  {t("cta.title")}
                </motion.h2>

                <motion.p
                  className="text-center text-base text-neutral-100 sm:text-lg md:text-left"
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {t("cta.description")}
                </motion.p>

                <motion.div
                  className="flex justify-center pt-2 sm:pt-4 md:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Button
                    href="/contact"
                    variant="gradient"
                    size="md"
                    glow
                    magnetic
                    magneticStrength={40}
                    className="sm:size-lg group relative overflow-hidden"
                  >
                    {/* Glass highlight on button */}
                    <span className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                      <span className="absolute inset-0 -z-10 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shine_1.5s_ease_forwards]" />
                    </span>

                    {/* Button text with icon */}
                    <span className="relative flex items-center">
                      {t("cta.button")}
                      <motion.svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-2 sm:h-5 sm:w-5"
                        animate={{ x: [0, 4, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatType: "reverse",
                          repeatDelay: 2,
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
                    </span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
