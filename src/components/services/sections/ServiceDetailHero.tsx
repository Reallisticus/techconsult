"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { silkscreen } from "~/lib/fonts";
import { cn } from "~/lib/utils";
import { useLanguage } from "~/i18n/context";
import { renderServiceIcon } from "../utils/ServiceIcons";

interface ServiceDetailHeroProps {
  service: {
    id: string;
    name: string;
    description: string;
    slug: string;
    color: string;
    icon: string;
  };
}

export const ServiceDetailHero = ({ service }: ServiceDetailHeroProps) => {
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

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

  // Mouse-driven rotation with fixed maximum values to prevent excessive rotation
  const clampedRotateX = useTransform(rotateX, (value) =>
    Math.min(Math.max(value, -5), 5),
  );
  const clampedRotateY = useTransform(rotateY, (value) =>
    Math.min(Math.max(value, -5), 5),
  );

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

      {/* Radial gradient background based on service color */}
      <div
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          background: `radial-gradient(circle at center, ${service.color}20 0%, rgba(0, 0, 0, 0) 70%)`,
        }}
      />

      {/* Dynamic floating elements - abstract shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Circle shape */}
        <motion.div
          className="absolute -right-20 top-1/4 h-60 w-60 rounded-full border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5"
          style={{
            x: translateX,
            y: translateY,
            scale: 0.8,
            borderColor: `${service.color}20`,
            background: `linear-gradient(to bottom right, ${service.color}05, #60A5FA10)`,
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
            borderColor: `${service.color}30`,
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
      </div>

      {/* Content with 3D effect */}
      <div className="container relative z-10 mx-auto px-4">
        {/* Main content that responds to mouse movement */}
        <motion.div
          className="relative mx-auto max-w-4xl"
          style={{
            perspective: 2000,
            transformStyle: "preserve-3d" as const,
          }}
        >
          {/* 3D card container */}
          <motion.div
            className="relative h-full w-full"
            style={{
              perspective: 2000,
              transformStyle: "preserve-3d" as const,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Content card with 3D effect */}
            <motion.div
              className="rounded-2xl border border-purple-500/30 bg-[rgba(10,10,42,0.7)] p-8 shadow-2xl backdrop-blur-md md:p-12"
              style={{
                rotateX: clampedRotateX,
                rotateY: clampedRotateY,
                transformStyle: "preserve-3d",
                transformOrigin: "center center",
                willChange: "transform",
                borderColor: `${service.color}30`,
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Service icon with motion effects */}
              <motion.div
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-full md:h-24 md:w-24"
                style={{
                  color: service.color,
                  background: `${service.color}15`,
                  border: `2px solid ${service.color}30`,
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: `0 0 20px ${service.color}40`,
                }}
              >
                <div className="h-10 w-10 md:h-12 md:w-12">
                  {renderServiceIcon(service.icon, "w-full h-full")}
                </div>

                {/* Pulse effect behind icon */}
                <motion.div
                  className="absolute inset-0 -z-10 rounded-full"
                  style={{ backgroundColor: `${service.color}10` }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 0.3, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>

              {/* Title with styled font */}
              <h1
                className={cn(
                  "mb-6 bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-center text-4xl font-bold tracking-wider text-transparent sm:text-left sm:text-5xl md:text-6xl",
                  language === "bg" ? "font-roboto" : silkscreen.className,
                )}
              >
                {service.name}
              </h1>

              {/* Description */}
              <motion.p
                className="mb-8 text-center text-lg text-gray-300 sm:text-left md:text-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {service.description}
              </motion.p>
            </motion.div>
          </motion.div>
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
          Scroll to explore
        </span>
        <motion.div
          className="h-7 w-7 rounded-full border-2 border-purple-500/30 backdrop-blur-sm"
          style={{ borderColor: `${service.color}30` }}
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <motion.div
            className="mx-auto mt-1 h-2 w-0.5 bg-purple-400"
            style={{ backgroundColor: service.color }}
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        </motion.div>
      </motion.div>

      {/* Animated line at bottom */}
      <motion.div
        className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
        style={{
          background: `linear-gradient(to right, transparent, ${service.color}50, transparent)`,
        }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.section>
  );
};
