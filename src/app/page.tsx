// src/app/page.tsx
"use client";

import { Hero } from "../components/home/sections/Hero";
import { ServicesSection } from "../components/home/sections/Services";
import { CtaSection } from "../components/home/sections/CTA";
import { FeaturedCaseStudies } from "../components/home/sections/FeaturedCaseStudies";
import { Testimonials } from "../components/home/sections/Testimonials";
import { TeamSection } from "../components/home/sections/Team";
import { TechnologyStack } from "../components/home/sections/TechStack";
import { ContactPreview } from "../components/home/sections/Contact";
import { BlogPreview } from "../components/home/sections/Blog";

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
