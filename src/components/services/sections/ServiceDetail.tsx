"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "~/i18n/context";
import { ScrollReveal } from "~/provider/SmoothScrollProvider";
import { cn } from "~/lib/utils";
import { Button } from "../../ui/button";
import { renderServiceIcon } from "../utils/ServiceIcons";

interface ServiceDetailProps {
  services: { id: string; icon: string }[];
}

export const ServiceDetailGrid = ({ services }: ServiceDetailProps) => {
  const { t, getNestedTranslation, language } = useLanguage();
  const [activeService, setActiveService] = useState<string | null>(null);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  // Use a ref to track the previous scroll position without causing re-renders
  const scrollYRef = useRef(0);

  // Get data for all services correctly matching the translation structure
  const servicesData = services.map((service) => {
    // Get the entire service object with proper nesting
    const serviceObj = getNestedTranslation<{
      name: string;
      description: string;
      features: string;
    }>(`services.${service.id}`);

    // Split features
    const features = serviceObj.features ? serviceObj.features.split("|") : [];

    return {
      id: service.id,
      icon: service.icon,
      name: serviceObj.name || "",
      description: serviceObj.description || "",
      features,
      color: getServiceColor(service.id),
    };
  });

  useEffect(() => {
    if (activeService === null && servicesData.length > 0) {
      setActiveService(servicesData[0]!.id);
    }
  }, [servicesData.length, activeService]); // Use length instead of the whole array

  const consultButtonText = getNestedTranslation<string>(
    "services.consultButton",
  );
  const activeServiceData = servicesData.find((s) => s.id === activeService);

  return (
    <section className="relative py-16 md:py-24">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-20 mix-blend-screen">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <radialGradient
                id="gridGradient"
                cx="50%"
                cy="50%"
                r="50%"
                fx="50%"
                fy="50%"
              >
                <stop
                  offset="0%"
                  stopColor={activeServiceData?.color || "#7C3AED"}
                  stopOpacity="0.3"
                />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#gridGradient)"
            />
          </svg>
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
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
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <ScrollReveal direction="up" threshold={0.1}>
          <div className="mb-16 text-center">
            <span className="font-mono uppercase tracking-wider text-accent-500">
              {t("services.subtitle")}
            </span>
            <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
              {t("services.title")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-neutral-300">
              {t("services.description")}
            </p>
          </div>
        </ScrollReveal>

        {/* Service Grid */}
        <div
          ref={gridRef}
          className="relative mx-auto mb-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:max-w-5xl"
        >
          {servicesData.map((service, index) => (
            <motion.div
              key={service.id}
              className={cn(
                "group relative aspect-square cursor-pointer overflow-hidden rounded-2xl backdrop-blur-sm transition-all duration-300 hover:z-10",
                activeService === service.id
                  ? "bg-neutral-800/80 ring-2 ring-offset-2 ring-offset-black"
                  : "bg-neutral-900/60",
              )}
              style={{
                boxShadow:
                  activeService === service.id
                    ? `0 0 20px ${service.color}40`
                    : "none",
              }}
              onClick={() => setActiveService(service.id)}
              whileHover={{
                scale: 1.05,
                boxShadow: `0 0 30px ${service.color}30`,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
              }}
            >
              {/* Decorative corner accents */}
              <div
                className="absolute left-0 top-0 h-2 w-2 rounded-tl-xl border-l border-t transition-colors duration-300 group-hover:border-accent-400"
                style={{ borderColor: service.color }}
              />
              <div
                className="absolute right-0 top-0 h-2 w-2 rounded-tr-xl border-r border-t transition-colors duration-300 group-hover:border-accent-400"
                style={{ borderColor: service.color }}
              />
              <div
                className="absolute bottom-0 left-0 h-2 w-2 rounded-bl-xl border-b border-l transition-colors duration-300 group-hover:border-accent-400"
                style={{ borderColor: service.color }}
              />
              <div
                className="absolute bottom-0 right-0 h-2 w-2 rounded-br-xl border-b border-r transition-colors duration-300 group-hover:border-accent-400"
                style={{ borderColor: service.color }}
              />

              {/* Service Icon */}
              <div className="flex h-full w-full flex-col items-center justify-center p-4">
                <motion.div
                  className="relative h-12 w-12 md:h-16 md:w-16"
                  style={{ color: service.color }}
                  animate={{
                    scale: activeService === service.id ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 2,
                    repeat: activeService === service.id ? Infinity : 0,
                    repeatType: "reverse",
                  }}
                >
                  {renderServiceIcon(service.icon, "w-full h-full")}

                  {/* Glow effect for active service */}
                  {activeService === service.id && (
                    <motion.div
                      className="absolute inset-0 -z-10 rounded-full opacity-60 blur-lg"
                      style={{ backgroundColor: service.color }}
                      animate={{ opacity: [0.6, 0.8, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Service Name */}
                <motion.h3
                  className="mt-4 text-center text-sm font-bold md:text-base"
                  style={{
                    color:
                      activeService === service.id ? service.color : "white",
                  }}
                >
                  {service.name}
                </motion.h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Service Detail */}
        <AnimatePresence mode="wait">
          {activeServiceData && (
            <motion.div
              key={activeServiceData.id}
              className="mx-auto max-w-5xl rounded-2xl bg-neutral-900/80 p-6 backdrop-blur-sm md:p-8 lg:p-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              style={{
                boxShadow: `0 0 40px ${activeServiceData.color}20`,
                borderLeft: `2px solid ${activeServiceData.color}`,
                borderRight: `2px solid ${activeServiceData.color}`,
              }}
            >
              <div className="grid gap-8 md:grid-cols-[1fr,2fr] md:gap-12">
                {/* Left side: Icon and decoration */}
                <div className="relative flex items-center justify-center">
                  <motion.div
                    className="relative h-32 w-32 md:h-48 md:w-48 lg:h-56 lg:w-56"
                    style={{ color: activeServiceData.color }}
                    initial={{ scale: 0.9, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {renderServiceIcon(activeServiceData.icon, "w-full h-full")}

                    {/* Animated glow effect */}
                    <motion.div
                      className="absolute inset-0 -z-10 rounded-full blur-2xl"
                      style={{ backgroundColor: activeServiceData.color }}
                      animate={{
                        opacity: [0.2, 0.4, 0.2],
                        scale: [0.9, 1.1, 0.9],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        repeatType: "mirror",
                      }}
                    />
                  </motion.div>

                  {/* Decorative elements */}
                  <motion.div
                    className="absolute inset-0 -z-20"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 30,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={activeServiceData.color}
                        strokeWidth="0.5"
                        strokeDasharray="1 5"
                      />
                    </svg>
                  </motion.div>
                </div>

                {/* Right side: Content */}
                <div className="space-y-6">
                  <motion.h2
                    className="text-3xl font-bold md:text-4xl lg:text-5xl"
                    style={{ color: activeServiceData.color }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    {activeServiceData.name}
                  </motion.h2>

                  <motion.p
                    className="text-lg text-neutral-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {activeServiceData.description}
                  </motion.p>

                  <motion.div
                    className="space-y-4 pt-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <h3 className="text-xl font-semibold text-white">
                      {getNestedTranslation<string>("services.keyFeatures")}
                    </h3>

                    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {activeServiceData?.features?.length > 0 ? (
                        activeServiceData.features.map((feature, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.5,
                              delay: 0.4 + i * 0.1,
                            }}
                            className="flex items-start"
                          >
                            <svg
                              className="mr-3 mt-1.5 h-5 w-5 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              style={{ color: activeServiceData.color }}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="text-neutral-200">{feature}</span>
                          </motion.li>
                        ))
                      ) : (
                        <li className="text-neutral-400">
                          No features available
                        </li>
                      )}
                    </ul>

                    <div className="pt-6">
                      <Button
                        href="/contact"
                        variant="outline"
                        size="lg"
                        glow
                        magnetic
                        className="border-opacity-50 transition-all duration-300 hover:border-opacity-100"
                        style={{
                          borderColor: activeServiceData.color,
                          color: activeServiceData.color,
                        }}
                      >
                        {consultButtonText}
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

// Helper function to get color based on service ID
function getServiceColor(serviceId: string): string {
  const colorMap: Record<string, string> = {
    strategicPlanning: "#7C3AED", // Accent-500 (Violet)
    digitalTransformation: "#60A5FA", // Primary-400 (Blue)
    technicalArchitecture: "#2563EB", // Primary-600 (Royal Blue)
    training: "#34D399", // Secondary-400 (Emerald)
    configurations: "#A78BFA", // Accent-300 (Light Violet)
    support: "#3B82F6", // Primary-500 (Blue)
    consultations: "#8B5CF6", // Accent-400 (Violet)
  };

  return colorMap[serviceId] || "#7C3AED"; // Default to accent-500
}
