"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
  const [activeTab, setActiveTab] = useState(0);

  // Set up scroll-triggered effects
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Create parallax effects
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  // Set mounted state for client-side animations
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Service benefits/features for the tabs
  const serviceTabs = [
    { label: "Overview", icon: "overview" },
    { label: "Benefits", icon: "benefits" },
    { label: "Approach", icon: "approach" },
  ];

  // Tab animation variants
  const tabVariants = {
    inactive: {
      opacity: 0.7,
      y: 0,
      scale: 0.95,
    },
    active: {
      opacity: 1,
      y: -5,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  return (
    <motion.section
      ref={sectionRef}
      className="relative flex min-h-[85vh] items-center overflow-hidden bg-transparent pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated background */}

      {/* Animated border lines */}
      <div className="absolute left-0 top-0 h-16 w-px bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-50" />
      <div className="absolute right-0 top-0 h-16 w-px bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-50" />

      {/* Main content */}
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          className="relative mx-auto max-w-6xl"
          style={{ opacity: contentOpacity, y: contentY }}
        >
          <div className="grid gap-12 md:grid-cols-12">
            {/* Left column: Service Icon and Visual */}
            <div className="md:col-span-5">
              <div className="flex flex-col items-center justify-center md:h-full">
                <motion.div
                  className="relative flex h-56 w-56 items-center justify-center md:h-72 md:w-72"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7 }}
                >
                  {/* Circular icon container with hexagon backdrop */}
                  <div className="relative">
                    {/* Hexagon backdrop */}
                    <svg
                      className="absolute left-1/2 top-1/2 -z-10 h-full w-full -translate-x-1/2 -translate-y-1/2 opacity-20"
                      viewBox="0 0 100 100"
                    >
                      <motion.polygon
                        points="50,3 95,25 95,75 50,97 5,75 5,25"
                        fill="none"
                        stroke={service.color}
                        strokeWidth="1"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 120,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </svg>

                    {/* Outer circle with gradient */}
                    <div
                      className="-z-5 absolute left-1/2 top-1/2 h-[95%] w-[95%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
                      style={{
                        background: `radial-gradient(circle, ${service.color}30 0%, transparent 70%)`,
                      }}
                    />

                    {/* Main circle with icon */}
                    <div
                      className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full md:h-52 md:w-52"
                      style={{
                        background: `radial-gradient(circle, ${service.color}15 0%, ${service.color}05 100%)`,
                        boxShadow: `0 0 40px ${service.color}20`,
                      }}
                    >
                      {/* Primary icon */}
                      <motion.div
                        className="relative z-20 h-24 w-24 md:h-28 md:w-28"
                        style={{ color: service.color }}
                        animate={{
                          scale: [1, 1.05, 1],
                          rotateZ: [0, 2, 0, -2, 0],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        {renderServiceIcon(service.icon, "w-full h-full")}
                      </motion.div>

                      {/* Decorative elements */}
                      <div className="absolute inset-0 z-10 overflow-hidden">
                        {/* Animated circles */}
                        <motion.div
                          className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed opacity-20"
                          style={{ borderColor: service.color }}
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 40,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        <motion.div
                          className="absolute left-1/2 top-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dotted opacity-20"
                          style={{ borderColor: service.color }}
                          animate={{ rotate: -360 }}
                          transition={{
                            duration: 30,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />

                        {/* Subtle ring pulse */}
                        <motion.div
                          className="absolute left-1/2 top-1/2 -z-10 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full"
                          style={{ border: `1px solid ${service.color}` }}
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.1, 0.3, 0.1],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      </div>

                      {/* Glow effect */}
                      <motion.div
                        className="-z-5 absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-xl"
                        style={{ backgroundColor: service.color }}
                        animate={{
                          opacity: [0.2, 0.4, 0.2],
                          scale: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "easeInOut",
                        }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Animated connector line */}
                <motion.div
                  className="mt-4 h-16 w-px bg-gradient-to-b from-transparent via-purple-500 to-transparent"
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 0.5 }}
                  transition={{ duration: 0.8, delay: 1 }}
                />
              </div>
            </div>

            {/* Right column: Content */}
            <div className="md:col-span-7">
              <div className="flex flex-col items-start">
                {/* Service type label */}
                <motion.div
                  className="mb-4 inline-flex items-center rounded-full px-4 py-1.5"
                  style={{ backgroundColor: `${service.color}20` }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div
                    className="mr-2 h-2 w-2 rounded-full"
                    style={{ backgroundColor: service.color }}
                  />
                  <span
                    className="text-sm font-medium uppercase tracking-wider"
                    style={{ color: service.color }}
                  >
                    Service
                  </span>
                </motion.div>

                {/* Service name */}
                <motion.h1
                  className={cn(
                    "mb-6 bg-gradient-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl lg:text-6xl",
                    language === "bg" ? "font-roboto" : silkscreen.className,
                  )}
                  style={{
                    backgroundImage: `linear-gradient(to right, ${service.color}, white)`,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  {service.name}
                </motion.h1>

                {/* Description */}
                <motion.p
                  className="mb-10 text-lg text-gray-300 md:text-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  {service.description}
                </motion.p>

                {/* Service feature tabs */}
                <motion.div
                  className="mb-6 flex space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  {serviceTabs.map((tab, index) => (
                    <motion.button
                      key={tab.label}
                      className={cn(
                        "rounded-lg border border-white/10 px-5 py-3 text-sm font-medium backdrop-blur-sm",
                        activeTab === index ? "border-white/20 bg-white/5" : "",
                      )}
                      onClick={() => setActiveTab(index)}
                      variants={tabVariants}
                      initial="inactive"
                      animate={activeTab === index ? "active" : "inactive"}
                      whileHover="active"
                    >
                      {tab.label}
                    </motion.button>
                  ))}
                </motion.div>

                {/* Quick service stats or highlights */}
                <motion.div
                  className="grid grid-cols-3 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                >
                  {[
                    { label: "Expertise", value: "10+ Years" },
                    { label: "Clients", value: "95% Satisfied" },
                    { label: "Approach", value: "Custom" },
                  ].map((stat, index) => (
                    <div
                      key={stat.label}
                      className="rounded-lg border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm"
                    >
                      <div
                        className="text-sm font-medium"
                        style={{ color: service.color }}
                      >
                        {stat.label}
                      </div>
                      <div className="text-xl font-bold text-white">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
        </motion.div>
      </div>

      {/* Bottom border */}
      <motion.div
        className="absolute bottom-0 left-0 h-px w-full"
        style={{
          background: `linear-gradient(to right, transparent, ${service.color}50, transparent)`,
        }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.section>
  );
};
