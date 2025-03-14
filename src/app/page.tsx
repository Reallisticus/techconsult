// src/app/page.tsx
"use client";

import { Hero } from "../components/sections/Hero";
import { ServicesSection } from "../components/sections/Services";
import { CtaSection } from "../components/sections/CTA";
import { FeaturedCaseStudies } from "../components/sections/FeaturedCaseStudies";
import { Testimonials } from "../components/sections/Testimonials";
import { TeamSection } from "../components/sections/Team";
import { TechnologyStack } from "../components/sections/TechStack";
import { ContactPreview } from "../components/sections/Contact";
import { BlogPreview } from "../components/sections/Blog";

export default function Home() {
  return (
    <>
      <Hero />
      <ServicesSection />
      <CtaSection />
      <FeaturedCaseStudies />
      <Testimonials />
      <TeamSection />
      <TechnologyStack />
      <ContactPreview />
      <BlogPreview />
    </>
  );
}
