"use client";

import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { useLanguage } from "~/i18n/context";
import { getDisplayFontClass } from "~/lib/fonts";
import { cn } from "~/lib/utils";
import { useSmoothScroll } from "../../provider/SmoothScrollProvider";
import { useGsapAnimation } from "../../hooks/useGSAPAnimation";
import { ScrollIndicator } from "../utils/ScrollIndicator";
import { motion } from "framer-motion";

export const Hero = () => {
  const { t, language } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(true);
  const { lenis } = useSmoothScroll();
  const displayFontClass = getDisplayFontClass(language);
  const [showExtra, setShowExtra] = useState(true);

  useGsapAnimation(heroRef, contentRef, imagesLoaded, lenis);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen w-full overflow-hidden bg-transparent"
    >
      <div className="relative min-h-screen w-full overflow-hidden">
        <div
          ref={contentRef}
          className="hero-content container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-24"
        >
          <div className="max-w-5xl text-center">
            <motion.h1
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={cn(
                "animate-item mb-6 text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl",
                language === "bg" ? displayFontClass : "font-display",
              )}
            >
              <span className="block bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                {t("hero.headline1")}
              </span>
              <span className="block bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                {t("hero.headline2")}
              </span>
              <span className="block bg-gradient-to-r from-white via-accent-400/90 to-white/70 bg-clip-text text-transparent">
                {t("hero.headline3")}
              </span>
              <span className="block bg-gradient-to-r from-accent-400/90 via-white/90 to-white/70 bg-clip-text text-transparent">
                {t("hero.headline4")}
              </span>
            </motion.h1>
            <p className="animate-item mx-auto mb-10 max-w-2xl text-xl text-white/80 md:text-2xl">
              {t("hero.subheading")}
            </p>
            <div className="animate-item mb-16 flex flex-wrap justify-center gap-6">
              <Button
                href="/contact"
                variant="primary"
                size="xl"
                glow
                magnetic
                magneticStrength={40}
              >
                {t("hero.startProject")}
              </Button>
              <Button
                href="/services"
                variant="outline"
                size="xl"
                glow
                magnetic
                magneticStrength={20}
              >
                {t("hero.exploreServices")}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {imagesLoaded && <ScrollIndicator />}
    </section>
  );
};
