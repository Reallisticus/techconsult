// src/components/sections/CtaSection.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Magnetic } from "~/components/ui/magnetic";
import { Parallax, ScrollReveal } from "~/components/providers/scroll-provider";
import { useAnimationInView } from "~/hooks/useAnimation";

export const CtaSection = () => {
  const [ctaRef, ctaInView, ctaHidden, ctaVisible] = useAnimationInView(
    "slideUp",
    { threshold: 0.3 },
  );

  return (
    <section className="to-primary-900/20 bg-gradient-to-b from-neutral-950 py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal direction="up" threshold={0.3}>
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl p-8 md:p-12">
            {/* Background gradient with parallax effect */}
            <div className="from-primary-900/30 to-primary-800/10 absolute inset-0 z-0 rounded-2xl bg-gradient-to-br" />

            <Parallax
              speed={0.15}
              direction="down"
              className="z-1 pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
            >
              <div className="relative h-full w-full">
                <div className="bg-accent-500/10 absolute right-1/4 top-0 h-32 w-32 rounded-full blur-xl"></div>
                <div className="bg-primary-500/10 absolute bottom-1/4 left-1/4 h-48 w-48 rounded-full blur-xl"></div>
              </div>
            </Parallax>

            {/* Animated border */}
            <div className="absolute inset-0 z-0 rounded-2xl">
              <div className="border-primary-700/30 absolute inset-0 rounded-2xl border" />
              <motion.div
                className="to-accent-500 absolute right-0 top-0 h-1 w-1/3 bg-gradient-to-r from-transparent"
                animate={{ x: [100, -400] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear",
                }}
              />
              <motion.div
                className="from-accent-500 absolute bottom-0 left-0 h-1 w-1/3 bg-gradient-to-r to-transparent"
                animate={{ x: [-100, 400] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear",
                }}
              />
              <motion.div
                className="to-accent-500 absolute bottom-0 left-0 h-1/3 w-1 bg-gradient-to-b from-transparent"
                animate={{ y: [100, -400] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear",
                }}
              />
              <motion.div
                className="from-accent-500 absolute right-0 top-0 h-1/3 w-1 bg-gradient-to-b to-transparent"
                animate={{ y: [-100, 400] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear",
                }}
              />
            </div>

            <div className="relative z-10 space-y-6 text-center">
              <h2 className="text-3xl font-bold leading-tight md:text-4xl">
                Ready to transform your business with technology?
              </h2>

              <p className="mx-auto max-w-2xl text-lg text-neutral-300">
                Let's discuss how our strategic IT consulting services can help
                you overcome challenges and seize opportunities.
              </p>

              <div className="pt-4">
                <Magnetic strength={40}>
                  <Link
                    href="/contact"
                    className="from-accent-500 to-accent-400 inline-block rounded-full bg-gradient-to-r px-8 py-4 text-lg font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                  >
                    Schedule a Consultation
                  </Link>
                </Magnetic>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
