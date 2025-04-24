"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useSpring, useInView } from "framer-motion";
import { Button } from "~/components/ui/button";
import { useLanguage } from "~/i18n/context";

interface ServiceDetailSidebarProps {
  service: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  translationKey: string;
  contentRef?: React.RefObject<HTMLDivElement>;
}
import { SERVICE_SLUGS } from "~/components/services/ServiceDetail"; // re-use existing map

export const ServiceDetailSidebar = ({
  service,
  translationKey,
  contentRef,
}: ServiceDetailSidebarProps) => {
  const { getNestedTranslation } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const localContentRef = useRef<HTMLDivElement>(null);
  const effectiveContentRef = contentRef || localContentRef;

  // Animation for initial fade-in
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  // For controlling sidebar offset when reaching container bottom
  const [offset, setOffset] = useState(0);

  // Smooth spring physics for offset transitions
  const smoothOffset = useSpring(offset, {
    stiffness: 60,
    damping: 15,
    restDelta: 0.001,
  });

  // Get translations for the sidebar
  const keyFeatures = getNestedTranslation<string>("services.keyFeatures");
  const consultButtonText = getNestedTranslation<string>(
    "services.consultButton",
  );

  // Service categories to show in the sidebar
  const categories = (Object.values(SERVICE_SLUGS) as string[]).map((key) => ({
    key,
    label: getNestedTranslation<string>(`services.${key}.name`),
  }));

  // Set up intersection observer to detect when content bottom enters viewport
  useEffect(() => {
    if (
      !containerRef.current ||
      !sidebarRef.current ||
      !effectiveContentRef.current
    ) {
      return;
    }

    // Function to update offset based on content position
    const updateSidebarOffset = () => {
      if (
        !containerRef.current ||
        !sidebarRef.current ||
        !effectiveContentRef.current
      ) {
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      const contentRect = effectiveContentRef.current.getBoundingClientRect();

      // Check if we're near the bottom of the content
      const viewportHeight = window.innerHeight;
      const contentBottom = contentRect.bottom;

      // If content bottom is above the bottom of viewport
      if (contentBottom <= viewportHeight) {
        // Calculate how much the sidebar needs to move up
        // to stay within the content container
        const sidebarHeight = sidebarRect.height;
        const contentBottomRelativeToViewportTop = contentBottom;
        const sidebarBottomRelativeToViewportTop =
          sidebarRect.top + sidebarHeight;

        // How much the sidebar bottom exceeds the content bottom
        const overlap = Math.max(
          0,
          sidebarBottomRelativeToViewportTop -
            contentBottomRelativeToViewportTop,
        );

        // Set the offset to move sidebar up
        setOffset(overlap);
      } else {
        // Reset offset when not at the bottom
        setOffset(0);
      }
    };

    // Update on scroll and resize
    window.addEventListener("scroll", updateSidebarOffset);
    window.addEventListener("resize", updateSidebarOffset);

    // Initial update
    updateSidebarOffset();

    return () => {
      window.removeEventListener("scroll", updateSidebarOffset);
      window.removeEventListener("resize", updateSidebarOffset);
    };
  }, [effectiveContentRef]);

  return (
    <div ref={containerRef} className="relative h-full">
      <motion.div
        ref={sidebarRef}
        initial={{ opacity: 0, y: 30 }}
        animate={
          isInView
            ? { opacity: 1, y: smoothOffset.get() < 1 ? 0 : -smoothOffset }
            : { opacity: 0, y: 30 }
        }
        transition={{
          opacity: { duration: 0.6, ease: "easeOut" },
          y: { duration: 0.6, ease: "easeOut" },
        }}
        style={{
          position: "sticky",
          top: "8rem", // 32 * 4 = 128px = 8rem
        }}
        className="rounded-xl border border-purple-900/20 bg-[#0A0A2A]/50 p-6 backdrop-blur-sm"
      >
        <h2 className="mb-6 text-2xl font-bold text-white">Service Overview</h2>

        {/* Related services */}
        <div className="mb-6 space-y-6">
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-neutral-400">
            Our Services
          </h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <a
                key={category.key}
                href={`/services/${category.key.replace(/([A-Z])/g, "-$1").toLowerCase()}`}
                className={`flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                  category.key === translationKey
                    ? `bg-[${service.color}20] font-medium text-[${service.color}]`
                    : "text-neutral-300 hover:bg-neutral-800/50 hover:text-white"
                }`}
                style={
                  category.key === translationKey
                    ? {
                        backgroundColor: `${service.color}20`,
                        color: service.color,
                      }
                    : {}
                }
              >
                <div
                  className="mr-3 h-1.5 w-1.5 rounded-full bg-purple-500"
                  style={{
                    backgroundColor:
                      category.key === translationKey
                        ? service.color
                        : "#6236FF",
                  }}
                />
                <span>{category.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Button
            href="/contact"
            variant="primary"
            size="lg"
            className="w-full"
            style={{
              backgroundColor: service.color,
              borderColor: service.color,
            }}
          >
            {consultButtonText}
          </Button>
        </div>

        {/* Decorative corner accents */}
        <div
          className="absolute left-0 top-0 h-8 w-8 rounded-tl-lg border-l-2 border-t-2"
          style={{ borderColor: `${service.color}40` }}
        />
        <div
          className="absolute right-0 top-0 h-8 w-8 rounded-tr-lg border-r-2 border-t-2"
          style={{ borderColor: `${service.color}40` }}
        />
        <div
          className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-2 border-l-2"
          style={{ borderColor: `${service.color}40` }}
        />
        <div
          className="absolute bottom-0 right-0 h-8 w-8 rounded-br-lg border-b-2 border-r-2"
          style={{ borderColor: `${service.color}40` }}
        />
      </motion.div>

      {/* Invisible div to track content height (used if no contentRef is provided) */}
      {!contentRef && (
        <div
          ref={localContentRef}
          className="pointer-events-none absolute right-0 top-0 h-0 w-0 opacity-0"
        />
      )}
    </div>
  );
};
