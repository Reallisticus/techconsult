"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { useLanguage } from "~/i18n/context";
import { ScrollReveal, Parallax } from "../../provider/SmoothScrollProvider";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

export const ServicesSection = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Map service categories to translation keys
  const serviceTranslations = [
    {
      name: t("services.strategicPlanning"),
      description: t("services.strategicPlanning.description"),
      icon: "strategy",
    },
    {
      name: t("services.digitalTransformation"),
      description: t("services.digitalTransformation.description"),
      icon: "transform",
    },
    {
      name: t("services.technicalArchitecture"),
      description: t("services.technicalArchitecture.description"),
      icon: "architecture",
    },
  ];

  // Service icons
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "strategy":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
          >
            <path
              d="M12 3L17 8L12 13L7 8L12 3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 13V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17 16H7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "transform":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
          >
            <path
              d="M21 3L14 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 14L3 21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.5 8.5L15.5 15.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17 3H21V7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 17V21H7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "architecture":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
          >
            <path
              d="M3 21H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 21V7L12 3L19 7V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 10.5C9 9.67157 9.67157 9 10.5 9H13.5C14.3284 9 15 9.67157 15 10.5V21H9V10.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  // Card hover effect
  const handleCardHover = (index: number | null) => {
    setActiveIndex(index);
  };

  return (
    <section ref={sectionRef} className="relative z-10 bg-transparent py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal direction="up" threshold={0.1}>
          <div className="mb-16 text-center">
            <motion.span
              className="font-mono uppercase tracking-wider text-accent-500"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              {t("services.subtitle")}
            </motion.span>

            <motion.h2
              className="mb-6 text-4xl font-bold md:text-5xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              {t("services.title")}
            </motion.h2>

            <motion.p
              className="mx-auto max-w-2xl text-lg text-neutral-300"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              {t("services.description")}
            </motion.p>
          </div>
        </ScrollReveal>

        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            className="absolute left-10 top-20 h-64 w-64 rounded-full bg-primary-900/20 blur-3xl"
            animate={{
              x: [0, 10, -10, 0],
              y: [0, -30, 30, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute bottom-40 right-20 h-72 w-72 rounded-full bg-accent-700/10 blur-3xl"
            animate={{
              x: [0, -30, 30, 0],
              y: [0, 20, -20, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        <div
          ref={cardsRef}
          className="relative grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {serviceTranslations.map((service, index) => (
            <Parallax key={`service-${index}`} speed={0.1} direction="up">
              <motion.div
                className="service-card group relative h-full overflow-hidden rounded-xl bg-gradient-to-b from-neutral-900/80 to-neutral-950/80 backdrop-blur-sm"
                onHoverStart={() => handleCardHover(index)}
                onHoverEnd={() => handleCardHover(null)}
                whileHover={{
                  y: -10,
                  transition: { type: "spring", stiffness: 300, damping: 15 },
                }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <div className="flex h-full flex-col p-8">
                  <motion.div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-800/20"
                    whileHover={{
                      rotate: 360,
                      scale: 1.1,
                      backgroundColor: "rgba(124, 58, 237, 0.3)", // accent color with opacity
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      className="text-primary-400"
                      animate={{
                        scale: activeIndex === index ? [1, 1.1, 1] : 1,
                      }}
                      transition={{
                        duration: 1,
                        repeat: activeIndex === index ? Infinity : 0,
                        repeatType: "reverse",
                      }}
                    >
                      {renderIcon(service.icon)}
                    </motion.div>
                  </motion.div>

                  <motion.h3
                    className="service-title mb-2 text-2xl font-bold transition-colors group-hover:text-accent-500"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {service.name}
                  </motion.h3>

                  <motion.p
                    className="mb-6 flex-grow text-neutral-400"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {service.description}
                  </motion.p>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center p-0 text-primary-400 transition-colors group-hover:text-accent-500"
                  >
                    {t("services.learnMore")}
                    <motion.svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-2"
                      animate={{
                        x: activeIndex === index ? [0, 5, 0] : 0,
                      }}
                      transition={{
                        duration: 1,
                        repeat: activeIndex === index ? Infinity : 0,
                        repeatType: "reverse",
                        ease: "easeInOut",
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
                  </Button>
                </div>

                {/* Animated gradient border */}
                <div className="absolute inset-0 rounded-xl border border-transparent transition-all duration-300 group-hover:border-accent-500/50" />

                {/* Animated corner accents */}
                <motion.div
                  className="absolute left-0 top-0 h-4 w-4 rounded-tl-xl border-l border-t border-transparent transition-all duration-300 group-hover:border-accent-500"
                  animate={
                    activeIndex === index
                      ? {
                          borderColor: [
                            "rgba(124, 58, 237, 0.5)",
                            "rgba(124, 58, 237, 0.8)",
                            "rgba(124, 58, 237, 0.5)",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute right-0 top-0 h-4 w-4 rounded-tr-xl border-r border-t border-transparent transition-all duration-300 group-hover:border-accent-500"
                  animate={
                    activeIndex === index
                      ? {
                          borderColor: [
                            "rgba(124, 58, 237, 0.5)",
                            "rgba(124, 58, 237, 0.8)",
                            "rgba(124, 58, 237, 0.5)",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 h-4 w-4 rounded-bl-xl border-b border-l border-transparent transition-all duration-300 group-hover:border-accent-500"
                  animate={
                    activeIndex === index
                      ? {
                          borderColor: [
                            "rgba(124, 58, 237, 0.5)",
                            "rgba(124, 58, 237, 0.8)",
                            "rgba(124, 58, 237, 0.5)",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
                <motion.div
                  className="absolute bottom-0 right-0 h-4 w-4 rounded-br-xl border-b border-r border-transparent transition-all duration-300 group-hover:border-accent-500"
                  animate={
                    activeIndex === index
                      ? {
                          borderColor: [
                            "rgba(124, 58, 237, 0.5)",
                            "rgba(124, 58, 237, 0.8)",
                            "rgba(124, 58, 237, 0.5)",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                />

                {/* Light effect on hover */}
                <motion.div
                  className="absolute inset-0 z-[-1] rounded-xl bg-gradient-to-r from-transparent via-accent-500/5 to-transparent opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.05), transparent)",
                  }}
                  animate={
                    activeIndex === index
                      ? {
                          x: ["-100%", "200%"],
                        }
                      : {}
                  }
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </motion.div>
            </Parallax>
          ))}
        </div>
      </div>
    </section>
  );
};
