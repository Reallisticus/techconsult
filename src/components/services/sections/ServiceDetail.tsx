"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "~/i18n/context";
import { ScrollReveal, Parallax } from "~/provider/SmoothScrollProvider";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { renderServiceIcon } from "../utils/ServiceIcons";

interface ServiceDetailProps {
  serviceId: string;
  icon: string;
  index: number;
  isEven: boolean;
}

export const ServiceDetail = ({
  serviceId,
  icon,
  index,
  isEven,
}: ServiceDetailProps) => {
  const { t, getNestedTranslation } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Get service data from translations
  const serviceData = getNestedTranslation<any>(`services.${serviceId}`);

  // Each service has a different feature list, which we pull from translations
  const features = serviceData.features?.split("|") ?? [];

  // Get the service's name and description directly from the translations
  const serviceName = t(`services.${serviceId}` as any);
  const serviceDescription = t(`services.${serviceId}.description` as any);
  const consultButtonText = getNestedTranslation<string>(
    "services.consultButton",
  );

  return (
    <section
      ref={sectionRef}
      id={serviceId}
      className={cn(
        "py-16 md:py-24",
        index !== 0 &&
          "relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-accent-500/30 before:to-transparent",
      )}
    >
      <div className="container mx-auto px-4">
        <div
          className={cn(
            "grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16",
            isEven ? "md:grid-flow-col" : "md:grid-flow-col-dense",
          )}
        >
          {/* Image/Illustration Side */}
          <ScrollReveal
            direction={isEven ? "left" : "right"}
            threshold={0.1}
            delay={0.2}
          >
            <div className="relative aspect-square">
              {/* Decorative background element */}
              <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-primary-900/30 to-accent-900/20 backdrop-blur-sm" />

              {/* Service icon */}
              <motion.div
                className="flex h-full items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.7,
                  delay: 0.3,
                  ease: [0.165, 0.84, 0.44, 1],
                }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="h-40 w-40 text-accent-400 md:h-56 md:w-56 lg:h-64 lg:w-64">
                  {renderServiceIcon(icon, "w-full h-full")}
                </div>
              </motion.div>

              {/* Animated corners */}
              <motion.div
                className="absolute left-0 top-0 h-4 w-4 rounded-tl-xl border-l border-t border-accent-500/50"
                animate={{
                  borderColor: [
                    "rgba(124, 58, 237, 0.5)",
                    "rgba(124, 58, 237, 0.8)",
                    "rgba(124, 58, 237, 0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute right-0 top-0 h-4 w-4 rounded-tr-xl border-r border-t border-accent-500/50"
                animate={{
                  borderColor: [
                    "rgba(124, 58, 237, 0.5)",
                    "rgba(124, 58, 237, 0.8)",
                    "rgba(124, 58, 237, 0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              <motion.div
                className="absolute bottom-0 left-0 h-4 w-4 rounded-bl-xl border-b border-l border-accent-500/50"
                animate={{
                  borderColor: [
                    "rgba(124, 58, 237, 0.5)",
                    "rgba(124, 58, 237, 0.8)",
                    "rgba(124, 58, 237, 0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
              <motion.div
                className="absolute bottom-0 right-0 h-4 w-4 rounded-br-xl border-b border-r border-accent-500/50"
                animate={{
                  borderColor: [
                    "rgba(124, 58, 237, 0.5)",
                    "rgba(124, 58, 237, 0.8)",
                    "rgba(124, 58, 237, 0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              />
            </div>
          </ScrollReveal>

          {/* Content Side */}
          <ScrollReveal direction={isEven ? "right" : "left"} threshold={0.1}>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                {serviceName}
              </h2>

              <p className="text-lg text-neutral-300">{serviceDescription}</p>

              <div className="space-y-4 pt-2">
                <h3 className="text-xl font-semibold text-white">
                  {getNestedTranslation<string>("services.keyFeatures")}
                </h3>

                <ul className="space-y-3">
                  {features.map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.2 + i * 0.1,
                      }}
                      viewport={{ once: true }}
                      className="flex items-start"
                    >
                      <svg
                        className="mr-3 mt-1.5 h-5 w-5 shrink-0 text-accent-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
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
                  ))}
                </ul>

                <div className="pt-4">
                  <Button
                    href="/contact"
                    variant="outline"
                    size="lg"
                    glow
                    magnetic
                  >
                    {consultButtonText}
                  </Button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
