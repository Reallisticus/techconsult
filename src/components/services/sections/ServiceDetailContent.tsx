"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { ScrollReveal, Parallax } from "~/provider/SmoothScrollProvider";
import { Button } from "~/components/ui/button";
import { useLanguage } from "~/i18n/context";
import { renderServiceIcon } from "../utils/ServiceIcons";
import { cn } from "~/lib/utils";

interface ServiceDetailContentProps {
  service: {
    id: string;
    name: string;
    description: string;
    features: string[];
    color: string;
    icon: string;
  };
  buttonText: string;
}

export const ServiceDetailContent = ({
  service,
  buttonText,
}: ServiceDetailContentProps) => {
  const { getNestedTranslation } = useLanguage();
  const keyFeatures = getNestedTranslation<string>("services.keyFeatures");
  const [activeFeature, setActiveFeature] = useState(0);
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Timeline steps
  const timelineSteps = [
    { title: "Discovery", description: "We analyze your needs and challenges" },
    {
      title: "Planning",
      description: "We design a tailored strategy and approach",
    },
    {
      title: "Implementation",
      description: "We execute the solution with precision",
    },
    { title: "Optimization", description: "We continuously improve and adapt" },
  ];

  // Toggle feature expansion
  const toggleExpansion = (feature: string) => {
    setIsExpanded((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  // Scroll to feature when clicked
  useEffect(() => {
    if (featureRefs.current[activeFeature]) {
      featureRefs.current[activeFeature]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeFeature]);

  return (
    <div className="space-y-24">
      {/* Overview Section with Visual Diagram */}
      <ScrollReveal direction="up" threshold={0.1}>
        <div className="mb-16">
          <div
            className="mb-6 inline-block rounded-full px-4 py-1"
            style={{ backgroundColor: `${service.color}20` }}
          >
            <span
              className="text-sm font-medium"
              style={{ color: service.color }}
            >
              Service Overview
            </span>
          </div>
          <h2 className="mb-8 text-3xl font-bold text-white">What We Offer</h2>

          {/* Process Diagram - Circular Flow */}
          <div className="mb-12 flex justify-center">
            <div className="relative h-64 w-64 md:h-80 md:w-80">
              {/* Center circle */}
              <div
                className="absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `${service.color}30`,
                  color: "white",
                }}
              >
                <div className="text-center">
                  <div className="mx-auto mb-1 h-10 w-10">
                    {renderServiceIcon(service.icon, "w-full h-full")}
                  </div>
                  <span>{service.name.split(" ")[0]}</span>
                </div>
              </div>

              {/* Outer circle */}
              <motion.div
                className="absolute left-0 top-0 h-full w-full rounded-full border-2 border-dashed opacity-50"
                style={{ borderColor: service.color }}
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
              />

              {/* Stages around the circle */}
              {timelineSteps.map((step, index) => {
                const angle = (index * 90 * Math.PI) / 180;
                const x = Math.cos(angle) * 110 + 120; // Adjusted for center position
                const y = Math.sin(angle) * 110 + 120;

                return (
                  <motion.div
                    key={step.title}
                    className={cn(
                      "absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white",
                      activeFeature === index ? "ring-2 ring-white" : "",
                    )}
                    style={{
                      left: x,
                      top: y,
                      backgroundColor: `${service.color}40`,
                    }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setActiveFeature(index)}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      boxShadow:
                        activeFeature === index
                          ? `0 0 15px ${service.color}`
                          : "none",
                    }}
                    transition={{
                      delay: index * 0.1 + 0.5,
                      duration: 0.5,
                    }}
                  >
                    <div className="pointer-events-none absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-center text-sm">
                      <div
                        className="font-medium"
                        style={{ color: service.color }}
                      >
                        {step.title}
                      </div>
                      <div className="mt-1 max-w-[120px] text-xs text-gray-400">
                        {step.description}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Connecting lines */}
              {timelineSteps.map((_, index) => {
                const startAngle = (index * 90 * Math.PI) / 180;
                const endAngle = (((index + 1) % 4) * 90 * Math.PI) / 180;

                // Calculate control points for curved path
                const startX = Math.cos(startAngle) * 110 + 120;
                const startY = Math.sin(startAngle) * 110 + 120;
                const endX = Math.cos(endAngle) * 110 + 120;
                const endY = Math.sin(endAngle) * 110 + 120;

                // Control point radius is 1.5x the circle radius to get a nice curve
                const controlRadius = 165;
                const controlAngle = (((index + 0.5) % 4) * 90 * Math.PI) / 180;
                const controlX = Math.cos(controlAngle) * controlRadius + 120;
                const controlY = Math.sin(controlAngle) * controlRadius + 120;

                return (
                  <svg
                    key={`line-${index}`}
                    className="absolute left-0 top-0 h-full w-full"
                    style={{ zIndex: -1 }}
                  >
                    <path
                      d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
                      fill="none"
                      stroke={service.color}
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      className="opacity-50"
                    />
                    <motion.circle
                      cx="0"
                      cy="0"
                      r="4"
                      fill={service.color}
                      initial={{ opacity: 0.8 }}
                      animate={{
                        cx: [startX, endX],
                        cy: [startY, endY],
                      }}
                      transition={{
                        duration: 4,
                        delay: index * 1,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </svg>
                );
              })}
            </div>
          </div>

          <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-neutral-300">
            {service.description}
          </p>
        </div>
      </ScrollReveal>

      {/* Features cards with expanded details */}
      {service.features && service.features.length > 0 && (
        <ScrollReveal direction="up" threshold={0.1} delay={0.2}>
          <div>
            <div
              className="mb-6 inline-block rounded-full px-4 py-1"
              style={{ backgroundColor: `${service.color}20` }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: service.color }}
              >
                {keyFeatures}
              </span>
            </div>
            <h2 className="mb-8 text-3xl font-bold text-white">
              Key Capabilities
            </h2>

            {/* Feature navigation */}
            <div className="mb-10 flex flex-wrap justify-center gap-4">
              {service.features.map((feature, i) => {
                // Extract just the first part of the feature before the pipe
                const featureTitle = feature.split("|")[0];

                return (
                  <motion.button
                    key={i}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-all",
                      activeFeature === i
                        ? "bg-white text-black"
                        : `bg-white/10 text-white hover:bg-white/20`,
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveFeature(i)}
                  >
                    {featureTitle}
                  </motion.button>
                );
              })}
            </div>

            {/* Feature details */}
            <div className="space-y-8">
              {service.features.map((feature, i) => {
                // Split feature into title and detail parts
                const parts = feature.split("|");
                const featureTitle = parts[0] || "";
                const featureDetail =
                  parts.length > 1
                    ? parts[1]
                    : "No additional details available.";

                // Generate a unique key for this feature
                const featureKey = `${service.id}-feature-${i}`;
                const isOpen = isExpanded[featureKey] || false;

                return (
                  <motion.div
                    key={i}
                    ref={(el) => (featureRefs.current[i] = el)}
                    className={cn(
                      "rounded-xl border-2 transition-all duration-300",
                      activeFeature === i
                        ? "border-white/30 bg-white/5"
                        : "border-white/10 bg-black/20",
                    )}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <div
                      className={cn(
                        "flex cursor-pointer items-center justify-between p-5",
                        isOpen ? "border-b border-white/10" : "",
                      )}
                      onClick={() => toggleExpansion(featureKey)}
                    >
                      <div className="flex items-center">
                        <div
                          className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${service.color}20` }}
                        >
                          <span
                            className="text-xl font-bold"
                            style={{ color: service.color }}
                          >
                            {i + 1}
                          </span>
                        </div>
                        <h3 className="text-xl font-medium text-white">
                          {featureTitle}
                        </h3>
                      </div>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-white"
                        >
                          <path
                            d="M19 9l-7 7-7-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.div>
                    </div>

                    {/* Expandable content */}
                    <motion.div
                      className="overflow-hidden"
                      initial={{ height: 0 }}
                      animate={{ height: isOpen ? "auto" : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-5 pt-4">
                        <p className="text-gray-300">{featureDetail}</p>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Benefits Grid with Icons */}
      <ScrollReveal direction="up" threshold={0.1} delay={0.3}>
        <div>
          <div
            className="mb-6 inline-block rounded-full px-4 py-1"
            style={{ backgroundColor: `${service.color}20` }}
          >
            <span
              className="text-sm font-medium"
              style={{ color: service.color }}
            >
              Benefits
            </span>
          </div>
          <h2 className="mb-8 text-3xl font-bold text-white">
            Why Choose Our {service.name}
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Expert Guidance",
                description:
                  "Our team brings years of specialized experience to ensure optimal results.",
                icon: "sparkles",
              },
              {
                title: "Tailored Approach",
                description:
                  "We customize our solutions to meet your specific business needs and goals.",
                icon: "customize",
              },
              {
                title: "Ongoing Support",
                description:
                  "We provide continuous support and optimization throughout the process.",
                icon: "support",
              },
              {
                title: "Proven Results",
                description:
                  "Our track record demonstrates consistent success across diverse industries.",
                icon: "chart",
              },
              {
                title: "Innovative Solutions",
                description:
                  "We leverage cutting-edge technologies and methodologies for maximum impact.",
                icon: "lightbulb",
              },
              {
                title: "Scalable Growth",
                description:
                  "Our solutions are designed to grow and evolve with your business.",
                icon: "expand",
              },
            ].map((benefit, i) => (
              <motion.div
                key={i}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -5,
                  boxShadow: `0 10px 30px -5px ${service.color}30`,
                  borderColor: `${service.color}50`,
                }}
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${service.color}20` }}
                >
                  <svg
                    className="h-6 w-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ color: service.color }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {getBenefitIcon(benefit.icon)}
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {benefit.title}
                </h3>
                <p className="text-gray-300">{benefit.description}</p>

                {/* Decorative corner */}
                <div className="absolute right-0 top-0 h-8 w-8 overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute right-0 top-0 h-16 w-16 origin-top-right rotate-45 transform bg-gradient-to-r from-transparent to-white opacity-20"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* CTA section */}
      <ScrollReveal direction="up" threshold={0.1} delay={0.4}>
        <div
          className="rounded-xl border p-8 backdrop-blur-sm"
          style={{
            borderColor: `${service.color}30`,
            background: `linear-gradient(to bottom right, ${service.color}10, #0A0A2A90)`,
          }}
        >
          <div className="grid gap-8 md:grid-cols-5">
            <div className="md:col-span-3">
              <h2 className="mb-4 text-2xl font-bold text-white">
                Ready to transform your business with {service.name}?
              </h2>
              <p className="mb-6 text-neutral-300">
                Our team is ready to help you implement this service efficiently
                and tailor it to your specific business needs. Let's discuss how
                we can make it work for you.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  href="/contact"
                  variant="primary"
                  size="lg"
                  style={{
                    backgroundColor: service.color,
                    borderColor: service.color,
                  }}
                >
                  {buttonText}
                </Button>
                <Button
                  href="/services"
                  variant="outline"
                  size="lg"
                  className="border-purple-500/30 text-purple-300 hover:border-purple-500 hover:bg-purple-500/10"
                  style={{
                    borderColor: `${service.color}30`,
                    color: service.color,
                  }}
                >
                  Explore All Services
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center md:col-span-2">
              <div className="relative h-48 w-48">
                <motion.div
                  className="absolute inset-0 z-10 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                >
                  <div className="h-32 w-32" style={{ color: service.color }}>
                    {renderServiceIcon(service.icon, "w-full h-full")}
                  </div>
                </motion.div>

                {/* Background effects */}
                <motion.div
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{
                    background: `radial-gradient(circle, ${service.color}50 0%, transparent 70%)`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                />

                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-dashed opacity-40"
                  style={{ borderColor: service.color }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

// Helper function for benefit icons
function getBenefitIcon(icon: string) {
  switch (icon) {
    case "sparkles":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      );
    case "customize":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
        />
      );
    case "support":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
        />
      );
    case "chart":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      );
    case "lightbulb":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      );
    case "expand":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
        />
      );
    default:
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      );
  }
}
