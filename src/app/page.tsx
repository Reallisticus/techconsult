// src/app/page.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { useAnimation } from "~/provider/AnimationProvider";
import { useSmoothScroll } from "~/provider/SmoothScrollProvider";
import { usePerformance, PerformanceGate } from "~/lib/perf";
import { CustomCursor } from "~/components/ui/custom-cursor";
import { Hero } from "~/components/sections/Hero";
import { ServicesSection } from "~/components/sections/Services";
import { CtaSection } from "~/components/sections/CTA";
import { FeaturedCaseStudies } from "~/components/sections/FeaturedCaseStudies";
import { Testimonials } from "~/components/sections/Testimonials";
import { TeamSection } from "~/components/sections/Team";
import { TechnologyStack } from "~/components/sections/TechStack";
import { ContactPreview } from "~/components/sections/Contact";
import { BlogPreview } from "~/components/sections/Blog";

export default function Home() {
  const { isReady } = useSmoothScroll();
  const { isPageLoaded, refreshAnimations } = useAnimation();
  const { level, enableAdvancedAnimations } = usePerformance();
  const pageRef = useRef<HTMLDivElement>(null);

  // Add state for client-side rendering
  const [isClient, setIsClient] = useState(false);

  // Set client state on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Refresh animations when smooth scroll is ready
  useEffect(() => {
    if (isReady && isPageLoaded) {
      // Small delay to ensure everything is rendered
      const timeout = setTimeout(() => {
        refreshAnimations();
      }, 200);

      return () => clearTimeout(timeout);
    }
  }, [isReady, isPageLoaded, refreshAnimations]);

  return (
    <div ref={pageRef} className="relative">
      {/* Custom cursor for desktop devices with high performance - only client-side */}
      {isClient && (
        <PerformanceGate minLevel="medium">
          <CustomCursor
            color="accent-500"
            size={32}
            hoverSize={48}
            enableTrail={level === "high"} // Only enable trail effect on high-performance devices
          />
        </PerformanceGate>
      )}

      {/* Main page sections */}
      <Hero />
      <ServicesSection />
      <CtaSection />
      <FeaturedCaseStudies />
      <Testimonials />
      <TeamSection />
      <TechnologyStack />
      <ContactPreview />
      <BlogPreview />

      {/* Performance indicator (development only) */}
      {isClient && process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-2 right-2 z-50 rounded-md bg-black/80 px-2 py-1 text-xs text-white opacity-60">
          Performance: {level} {enableAdvancedAnimations ? "✓" : "✗"}
        </div>
      )}
    </div>
  );
}
