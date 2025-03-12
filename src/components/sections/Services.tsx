// src/components/sections/Services.tsx
"use client";

import { useAnimationInView, animations } from "~/hooks/useAnimation";
import { Button } from "../ui/button";
import { useLanguage } from "~/i18n/context";

export const ServicesSection = () => {
  const { t } = useLanguage();
  const [servicesRef, servicesInView, servicesHidden, servicesVisible] =
    useAnimationInView("stagger");

  // Map service categories to translation keys
  const serviceTranslations = [
    {
      name: t("services.strategicPlanning"),
      description: t("services.strategicPlanning.description"),
    },
    {
      name: t("services.digitalTransformation"),
      description: t("services.digitalTransformation.description"),
    },
    {
      name: t("services.technicalArchitecture"),
      description: t("services.technicalArchitecture.description"),
    },
  ];

  return (
    <section className="relative z-10 bg-transparent py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <span className="font-mono uppercase tracking-wider text-accent-500">
            {t("services.subtitle")}
          </span>

          <h2 className="mb-6 text-4xl font-bold md:text-5xl">
            {t("services.title")}
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-neutral-300">
            {t("services.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {serviceTranslations.map((service, index) => (
            <div
              className="group relative overflow-hidden rounded-xl bg-gradient-to-b from-neutral-900 to-neutral-950"
              key={"service-" + index}
            >
              <div className="flex h-full flex-col p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-800/20">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-primary-400"
                  >
                    <path
                      d="M12 16V8M8 12h8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <h3 className="mb-2 text-2xl font-bold transition-colors group-hover:text-accent-500">
                  {service.name}
                </h3>

                <p className="mb-6 flex-grow text-neutral-400">
                  {service.description}
                </p>

                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center p-0 text-primary-400 transition-colors group-hover:text-accent-500"
                >
                  {t("services.learnMore")}
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
                </Button>
              </div>

              {/* Gradient border */}
              <div className="absolute inset-0 rounded-xl border border-transparent transition-all duration-300 group-hover:border-accent-500/50" />

              {/* Corner accents */}
              <div className="absolute left-0 top-0 h-4 w-4 rounded-tl-xl border-l border-t border-transparent transition-all duration-300 group-hover:border-accent-500" />
              <div className="absolute right-0 top-0 h-4 w-4 rounded-tr-xl border-r border-t border-transparent transition-all duration-300 group-hover:border-accent-500" />
              <div className="absolute bottom-0 left-0 h-4 w-4 rounded-bl-xl border-b border-l border-transparent transition-all duration-300 group-hover:border-accent-500" />
              <div className="absolute bottom-0 right-0 h-4 w-4 rounded-br-xl border-b border-r border-transparent transition-all duration-300 group-hover:border-accent-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
