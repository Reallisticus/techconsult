// src/app/page.tsx
"use client";

import { CtaSection } from "../components/sections/CTA";
import { Hero } from "../components/sections/Hero";
import { ServicesSection } from "../components/sections/Services";

export default function Home() {
  return (
    <>
      <Hero />
      <ServicesSection />
      <CtaSection />
    </>
  );
}
