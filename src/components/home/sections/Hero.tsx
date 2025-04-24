"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { useLanguage } from "~/i18n/context";
import { getDisplayFontClass } from "~/lib/fonts";
import { cn } from "~/lib/utils";
import {
  motion,
  useAnimation,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useIsomorphicLayoutEffect } from "~/hooks/useIsomorphicLayout";

export const Hero = () => {
  const { t, language } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const gsapCtxRef = useRef<gsap.Context | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(true);
  const displayFontClass = getDisplayFontClass(language);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const floatAnimationControls = useAnimation();

  // Spring physics for smoother mouse following
  const springConfig = { damping: 25, stiffness: 300 };
  const followX = useSpring(mouseX, springConfig);
  const followY = useSpring(mouseY, springConfig);

  // Create transforms based on mouse position
  const moveX = useTransform(followX, [-800, 800], [-15, 15]);
  const moveY = useTransform(followY, [-800, 800], [-15, 15]);
  const rotateX = useTransform(followY, [-800, 800], [2, -2]);
  const rotateY = useTransform(followX, [-800, 800], [-2, 2]);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set(clientX - centerX);
      mouseY.set(clientY - centerY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  useIsomorphicLayoutEffect(() => {
    if (!headlineRef.current || !imagesLoaded || gsapCtxRef.current) return;

    // Safe import of GSAP
    import("gsap").then(({ gsap }) => {
      // Try to import SplitText - it's optional
      let SplitText;
      try {
        import("gsap-trial/SplitText")
          .then((module) => {
            SplitText = module.SplitText;
            gsap.registerPlugin(SplitText);
            animateText(gsap, SplitText);
          })
          .catch(() => {
            // Fallback animation without SplitText
            animateTextFallback(gsap);
          });
      } catch (e) {
        // Fallback animation without SplitText
        animateTextFallback(gsap);
      }
    });

    const animateText = (gsap: any, SplitText: any) => {
      const ctx = gsap.context(() => {
        // Split text into lines and chars for detailed animation
        const headlines = gsap.utils.toArray(".headline");
        headlines.forEach((headline: any, i: number) => {
          if (!headline) return; // Skip if element not found

          const split = new SplitText(headline, { type: "chars,lines" });
          gsap.from(split.chars, {
            opacity: 0,
            y: 50,
            rotateX: -90,
            stagger: 0.02,
            duration: 0.5,
            ease: "back.out(1.7)",
            delay: 0.2 + i * 0.1,
          });
        });

        // Animate the subheading separately
        const subheading = document.querySelector(".hero-subheading");
        if (subheading) {
          gsap.from(subheading, {
            opacity: 0,
            y: 30,
            duration: 0.6,
            delay: 0.8,
            ease: "power3.out",
          });
        }

        // Animate the buttons with safety check
        const buttons = document.querySelectorAll(".hero-buttons button");
        if (buttons.length > 0) {
          gsap.from(buttons, {
            opacity: 0,
            y: 40,
            stagger: 0.15,
            duration: 0.7,
            delay: 1,
            ease: "power2.out",
          });
        }
      }, heroRef);

      gsapCtxRef.current = ctx;
    };

    const animateTextFallback = (gsap: any) => {
      const ctx = gsap.context(() => {
        // Simple animation without SplitText
        const headlines = document.querySelectorAll(".headline");
        headlines.forEach((headline: Element, i: number) => {
          gsap.from(headline, {
            opacity: 0,
            y: 30,
            duration: 0.6,
            delay: 0.2 + i * 0.15,
            ease: "power2.out",
          });
        });

        // Animate the subheading
        const subheading = document.querySelector(".hero-subheading");
        if (subheading) {
          gsap.from(subheading, {
            opacity: 0,
            y: 30,
            duration: 0.6,
            delay: 0.8,
            ease: "power3.out",
          });
        }

        // Animate the buttons with safety check
        const buttons = document.querySelectorAll(".hero-buttons button");
        if (buttons.length > 0) {
          gsap.from(buttons, {
            opacity: 0,
            y: 40,
            stagger: 0.15,
            duration: 0.7,
            delay: 1,
            ease: "power2.out",
          });
        }
      }, heroRef);

      gsapCtxRef.current = ctx;
    };

    return () => {
      if (gsapCtxRef.current) {
        gsapCtxRef.current.revert();
        gsapCtxRef.current = null;
      }
    };
  }, [imagesLoaded]);

  useEffect(() => {
    // Start the animation when component mounts
    floatAnimationControls.start({
      y: [0, 8, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        repeatType: "reverse",
      },
    });

    // Clean up the animation when component unmounts
    return () => {
      floatAnimationControls.stop();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100vh] w-full overflow-hidden bg-transparent"
    >
      <div className="relative min-h-screen w-full overflow-hidden">
        <motion.div className="relative" animate={floatAnimationControls}>
          <motion.div
            ref={contentRef}
            className="hero-content container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-24"
            style={{
              rotateX,
              rotateY,
              transformPerspective: 1000,
            }}
          >
            <div ref={headlineRef} className="max-w-5xl text-center">
              <div className="mb-6 overflow-hidden">
                <h1
                  className={cn(
                    "mb-6 text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl",
                    language === "bg" ? displayFontClass : "font-display",
                  )}
                >
                  {/* Explicit white text avoids transparent fill */}
                  <span className="headline block text-white">
                    {t("hero.headline1")}
                  </span>
                  <span className="headline block text-white">
                    {t("hero.headline2")}
                  </span>
                  <span className="headline block text-accent-400">
                    {t("hero.headline3")}
                  </span>
                  <span className="headline block text-accent-400">
                    {t("hero.headline4")}
                  </span>
                </h1>
              </div>

              <p className="hero-subheading mx-auto mb-10 max-w-2xl text-xl text-white md:text-2xl">
                {t("hero.subheading")}
              </p>

              <div className="mb-16 flex flex-wrap justify-center gap-6">
                <Button
                  href="/contact"
                  variant="primary"
                  size="xl"
                  glow
                  magnetic
                  magneticStrength={40}
                  className="hero-buttons"
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
                  className="hero-buttons"
                >
                  {t("hero.exploreServices")}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
