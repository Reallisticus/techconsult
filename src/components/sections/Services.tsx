// src/components/sections/Services.tsx
"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ScrollReveal } from "~/components/providers/scroll-provider";
import { useAnimationInView, animations } from "~/hooks/useAnimation";
import { siteConfig } from "~/lib/constants";

export const ServicesSection = () => {
  const [servicesRef, servicesInView, servicesHidden, servicesVisible] =
    useAnimationInView("stagger");

  return (
    <section className="bg-neutral-950 py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal direction="up" threshold={0.2}>
          <div className="mb-16 text-center">
            <span className="font-mono uppercase tracking-wider text-[#C026D3]">
              Our Expertise
            </span>

            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              Strategic Technology Solutions
            </h2>

            <p className="mx-auto max-w-2xl text-lg text-neutral-300">
              We combine deep technical expertise with strategic thinking to
              deliver solutions that transform businesses.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {siteConfig.serviceCategories.map((service, index) => (
            <ScrollReveal
              key={service.name}
              direction="up"
              delay={index * 0.1}
              threshold={0.2}
            >
              <div className="group relative overflow-hidden rounded-xl bg-gradient-to-b from-neutral-900 to-neutral-950">
                <div className="flex h-full flex-col p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#3730A3]/20">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-[#5B53D3]"
                    >
                      <path
                        d="M12 16V8M8 12h8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <h3 className="mb-2 text-2xl font-bold transition-colors group-hover:text-[#C026D3]">
                    {service.name}
                  </h3>

                  <p className="mb-6 flex-grow text-neutral-400">
                    {service.description}
                  </p>

                  <div className="flex items-center font-medium text-[#5B53D3] transition-colors group-hover:text-[#C026D3]">
                    <span>Learn more</span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-2 transition-transform group-hover:translate-x-1"
                    >
                      <path
                        d="M5 12h14M12 5l7 7-7 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Gradient border */}
                <div className="absolute inset-0 rounded-xl border border-transparent transition-all duration-300 group-hover:border-[#C026D3]/50" />

                {/* Corner accents */}
                <div className="absolute left-0 top-0 h-4 w-4 rounded-tl-xl border-l border-t border-transparent transition-all duration-300 group-hover:border-[#C026D3]" />
                <div className="absolute right-0 top-0 h-4 w-4 rounded-tr-xl border-r border-t border-transparent transition-all duration-300 group-hover:border-[#C026D3]" />
                <div className="absolute bottom-0 left-0 h-4 w-4 rounded-bl-xl border-b border-l border-transparent transition-all duration-300 group-hover:border-[#C026D3]" />
                <div className="absolute bottom-0 right-0 h-4 w-4 rounded-br-xl border-b border-r border-transparent transition-all duration-300 group-hover:border-[#C026D3]" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
