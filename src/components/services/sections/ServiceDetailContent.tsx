"use client";

import { motion } from "framer-motion";
import { ScrollReveal, Parallax } from "~/provider/SmoothScrollProvider";
import { Button } from "~/components/ui/button";
import { useLanguage } from "~/i18n/context";
import { renderServiceIcon } from "../utils/ServiceIcons";

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

  return (
    <div className="space-y-16">
      {/* Description section */}
      <ScrollReveal direction="up" threshold={0.1}>
        <div className="mb-10">
          <div
            className="mb-4 inline-block rounded-full px-4 py-1"
            style={{ backgroundColor: `${service.color}20` }}
          >
            <span
              className="text-sm font-medium"
              style={{ color: service.color }}
            >
              Overview
            </span>
          </div>
          <h2 className="mb-6 text-3xl font-bold text-white">
            About {service.name}
          </h2>
          <p className="text-lg leading-relaxed text-neutral-300">
            {service.description}
          </p>
        </div>

        {/* Image or illustration */}
        <Parallax speed={0.15} direction="up" className="mb-16 mt-8">
          <div className="relative overflow-hidden rounded-xl border border-purple-500/10">
            <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-[#0A0A2A] to-[#1A1A4A] p-12">
              <div
                className="relative h-48 w-48"
                style={{ color: service.color }}
              >
                {renderServiceIcon(service.icon, "w-full h-full")}

                {/* Animating rings */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 opacity-80"
                  style={{ borderColor: service.color }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.8, 0.2, 0.8],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <motion.div
                  className="absolute inset-0 rounded-full border border-dashed"
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

            {/* Service name overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <h3 className="text-xl font-bold text-white">{service.name}</h3>
            </div>
          </div>
        </Parallax>
      </ScrollReveal>

      {/* Features section */}
      {service.features && service.features.length > 0 && (
        <ScrollReveal direction="up" threshold={0.1} delay={0.2}>
          <div>
            <div
              className="mb-4 inline-block rounded-full px-4 py-1"
              style={{ backgroundColor: `${service.color}20` }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: service.color }}
              >
                {keyFeatures}
              </span>
            </div>
            <h2 className="mb-6 text-3xl font-bold text-white">
              What We Offer
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {service.features.map((feature, i) => (
                <motion.div
                  key={i}
                  className="rounded-lg border bg-[#0A0A2A]/50 p-5 backdrop-blur-sm"
                  style={{ borderColor: `${service.color}30` }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  whileHover={{
                    y: -5,
                    boxShadow: `0 8px 30px -5px ${service.color}20`,
                    borderColor: `${service.color}50`,
                  }}
                >
                  <div className="flex items-start">
                    <div
                      className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${service.color}20` }}
                    >
                      <svg
                        className="h-4 w-4"
                        style={{ color: service.color }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-white">{feature}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Process visualization */}
      <ScrollReveal direction="up" threshold={0.1} delay={0.3}>
        <div>
          <div
            className="mb-4 inline-block rounded-full px-4 py-1"
            style={{ backgroundColor: `${service.color}20` }}
          >
            <span
              className="text-sm font-medium"
              style={{ color: service.color }}
            >
              Our Process
            </span>
          </div>
          <h2 className="mb-6 text-3xl font-bold text-white">How We Deliver</h2>

          <div className="relative pb-8">
            {/* Timeline line */}
            <div
              className="absolute left-8 top-0 h-full w-0.5"
              style={{ backgroundColor: `${service.color}40` }}
            ></div>

            {[
              { key: "discover", fallback: "Discovery" },
              { key: "analyze", fallback: "Analysis" },
              { key: "strategize", fallback: "Strategy" },
              { key: "implement", fallback: "Implementation" },
              { key: "optimize", fallback: "Optimization" },
            ].map(({ key, fallback }, i) => {
              const { title, description } = getNestedTranslation<{
                title: string;
                description: string;
              }>(`services.process.${key}`) ?? {
                title: fallback,
                description: "",
              };

              return (
                <div key={key} className="relative mb-12">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div
                        className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: `${service.color}20`,
                          boxShadow: `0 0 0 4px ${service.color}10`,
                        }}
                      >
                        <span
                          className="text-xl font-bold"
                          style={{ color: service.color }}
                        >
                          {i + 1}
                        </span>
                      </div>
                    </div>
                    <div className="ml-6 pt-3">
                      <h3 className="text-xl font-bold text-white">{title}</h3>
                      <div className="mt-3 rounded-lg bg-[#0A0A2A]/30 p-4">
                        <p className="text-neutral-300">{description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
          <h2 className="mb-4 text-2xl font-bold text-white">
            Ready to improve your business with {service.name}?
          </h2>
          <p className="mb-6 text-neutral-300">
            Our team is ready to help you implement this service efficiently and
            tailor it to your specific business needs. Let's discuss how we can
            make it work for you.
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
      </ScrollReveal>
    </div>
  );
};
