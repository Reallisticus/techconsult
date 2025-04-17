"use client";

import { useRef } from "react";
import { useLanguage } from "~/i18n/context";
import { CaseStudyHero } from "./CaseStudyHero";
import { CaseStudySidebar } from "./CaseStudySidebar";
import { CaseStudyContent } from "./CaseStudyContent";
import { Button } from "~/components/ui/button";

// Enhanced translation interface
export interface CaseStudyTranslations {
  cases?: Array<{
    id?: string;
    title?: string;
    client?: string;
    description?: string;
    image?: string;
    tags?: string[];
    challenge?: string;
    solution?: string;
    results?: string[];
    testimonial?: {
      quote?: string;
      author?: string;
      position?: string;
    };
    gallery?: string[];
  }>;
  viewCaseStudy?: string;
  viewAllCaseStudies?: string;
  projectOverview?: string;
  clientLabel?: string;
  industryLabel?: string;
  servicesLabel?: string;
  startSimilarProject?: string;
  challengeLabel?: string;
  understandingProblem?: string;
  approachLabel?: string;
  solutionLabel?: string;
  outcomesLabel?: string;
  resultsLabel?: string;
  readyToStart?: string;
  teamReady?: string;
  startConversation?: string;
  projectGallery?: string;
  scrollToExplore?: string;
  notFound?: {
    title?: string;
    description?: string;
  };
}

export interface CaseStudyType {
  id?: string;
  title?: string;
  client?: string;
  description?: string;
  image?: string;
  tags?: string[];
  challenge?: string;
  solution?: string;
  results?: string[];
  testimonial?: {
    quote?: string;
    author?: string;
    position?: string;
  };
  gallery?: string[];
}

interface CaseStudyDetailProps {
  slug: string;
}

export const CaseStudyDetail = ({ slug }: CaseStudyDetailProps) => {
  const { getNestedTranslation } = useLanguage();

  // Reference to the content area to ensure proper sidebar boundary calculation
  const contentRef = useRef<HTMLDivElement>(null);

  // Get case studies from translations
  const caseStudiesData =
    getNestedTranslation<CaseStudyTranslations>("caseStudies");

  // Helper function to create slug - same as in CaseStudiesHero
  const createSlug = (text?: string): string => {
    if (!text) return "";
    return text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  // Find the current case study by slug or id
  const caseStudy = caseStudiesData?.cases?.find(
    (caseItem) => caseItem.id === slug || createSlug(caseItem.title) === slug,
  );

  // If case study not found, show error state
  if (!caseStudy) {
    return (
      <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-24">
        <div className="rounded-xl bg-[#0A0A2A]/70 p-8 text-center backdrop-blur-sm">
          <h1 className="mb-4 text-3xl font-bold text-white">
            {caseStudiesData?.notFound?.title || "Case Study Not Found"}
          </h1>
          <p className="mb-6 text-neutral-300">
            {caseStudiesData?.notFound?.description ||
              "The case study you're looking for doesn't exist or has been removed."}
          </p>
          <Button href="/case-studies" variant="primary">
            {caseStudiesData?.viewAllCaseStudies || "View All Case Studies"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <CaseStudyHero caseStudy={caseStudy} translations={caseStudiesData} />

      {/* Main content */}
      <section className="relative bg-transparent py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12">
            {/* Sidebar */}
            <div className="md:col-span-4">
              <CaseStudySidebar
                caseStudy={caseStudy}
                translations={caseStudiesData}
                contentRef={contentRef} // Pass content ref to enhance scrolling boundaries
              />
            </div>

            {/* Main content area with ref for sidebar to calculate boundaries */}
            <div className="md:col-span-8" ref={contentRef}>
              <CaseStudyContent
                caseStudy={caseStudy}
                translations={caseStudiesData}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
