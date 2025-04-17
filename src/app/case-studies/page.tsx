"use client";

import { CaseStudiesGrid } from "../../components/case-studies/CaseStudiesGrid";
import CaseStudiesHero from "../../components/case-studies/CaseStudiesHero";
import { CtaSection } from "../../components/home/sections/CTA";

export default function CaseStudiesPage() {
  return (
    <>
      <CaseStudiesHero />
      <CaseStudiesGrid />
      <CtaSection />
    </>
  );
}
