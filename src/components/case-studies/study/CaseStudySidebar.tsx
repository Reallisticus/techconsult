"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useSpring, useInView } from "framer-motion";
import { Button } from "~/components/ui/button";
import { CaseStudyType, CaseStudyTranslations } from "./CaseStudiesDetail";

interface CaseStudySidebarProps {
  caseStudy: CaseStudyType;
  translations: CaseStudyTranslations | undefined;
  contentRef?: React.RefObject<HTMLDivElement>;
}

export const CaseStudySidebar = ({
  caseStudy,
  translations,
  contentRef,
}: CaseStudySidebarProps) => {
  // Create container ref to track position
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
        <h2 className="mb-6 text-2xl font-bold text-white">
          {translations?.projectOverview || "Project Overview"}
        </h2>

        {/* Project details */}
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-neutral-400">
              {translations?.clientLabel || "Client"}
            </h3>
            <p className="text-white">{caseStudy.client}</p>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-neutral-400">
              {translations?.industryLabel || "Industry"}
            </h3>
            <p className="text-white">{caseStudy.tags?.[0]}</p>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-neutral-400">
              {translations?.servicesLabel || "Services"}
            </h3>
            <div className="flex flex-col space-y-1">
              {caseStudy.tags?.map((tag, i) => (
                <span key={i} className="text-white">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Quick stats if available */}
          {caseStudy.results && caseStudy.results.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-neutral-400">
                Highlights
              </h3>
              <div className="space-y-2">
                {caseStudy.results.slice(0, 2).map((result, i) => (
                  <div key={i} className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-purple-100">{result}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button
              href="/contact"
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {translations?.startSimilarProject || "Start a Similar Project"}
            </Button>
          </div>
        </div>
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
