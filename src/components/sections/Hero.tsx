"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Magnetic } from "~/components/ui/magnetic";
import { HeroBackground } from "~/components/utils/HeroBackground";
import { Button } from "../ui/button";
import { useLanguage } from "~/i18n/context";
import { getDisplayFontClass } from "~/lib/fonts";
import { cn } from "~/lib/utils";

export const Hero = () => {
  const { t, language } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(true);

  // Get the appropriate display font class based on language
  const displayFontClass = getDisplayFontClass(language);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Only run animations once images are loaded
    if (!imagesLoaded) return;

    const ctx = gsap.context(() => {
      // Content reveal using gsap.utils.toArray for proper element typing
      const animateItems = gsap.utils.toArray(
        contentRef.current?.querySelectorAll(".animate-item") || [],
      );
      gsap.fromTo(
        animateItems,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.3,
        },
      );
    });

    return () => ctx.revert();
  }, [imagesLoaded]);

  return (
    <div ref={heroRef} className="hero-section relative">
      {/* Main Hero Section */}
      <section className="relative min-h-screen w-full overflow-hidden">
        {/* Background - Adding the hero-background class for zoom targeting */}

        <div
          ref={contentRef}
          className="hero-content container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-24"
        >
          <div className="max-w-5xl text-center">
            {/* Hero Headline - Dynamic font class based on language */}
            <h1
              className={cn(
                "animate-item mb-6 text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl",
                // For Bulgarian, we use a different font class as Silkscreen doesn't support Cyrillic
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
            </h1>

            {/* Subheading */}
            <p className="animate-item mx-auto mb-10 max-w-2xl text-xl text-white/80 md:text-2xl">
              {t("hero.subheading")}
            </p>

            {/* CTA Buttons */}
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
      </section>
    </div>
  );
};
