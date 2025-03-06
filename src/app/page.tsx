// src/app/page.tsx
"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { RevealText } from "~/components/ui/reveal-text";
import { Magnetic } from "~/components/ui/magnetic";
import { useAnimationInView, animations } from "~/hooks/useAnimation";
import { siteConfig } from "~/lib/constants";
import {
  Parallax,
  ScrollReveal,
} from "../components/providers/scroll-provider";
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
