"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "~/i18n/context";
import { ScrollReveal, Parallax } from "~/provider/SmoothScrollProvider";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { useAnimationInView } from "~/hooks/useAnimation";
import Link from "next/link";

interface CaseStudyDetailProps {
  slug: string;
}

export const CaseStudyDetail = ({ slug }: CaseStudyDetailProps) => {
  const { getNestedTranslation } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [detailRef, inView] = useAnimationInView("slideUp", { threshold: 0.1 });

  // Parallax scrolling effect for hero image
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  // Get case studies from translations
  const caseStudiesData = getNestedTranslation<{
    cases: Array<{
      id: string;
      title: string;
      client: string;
      description: string;
      image: string;
      tags: string[];
    }>;
    viewCaseStudy: string;
    viewAllCaseStudies: string;
  }>("caseStudies");

  // Find the current case study by slug
  const caseStudy = caseStudiesData?.cases.find(
    (caseItem) => generateSlug(caseItem.title) === slug,
  );

  // Generate slug for URL
  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-\u0400-\u04FF]+/g, "");
  }

  // If case study not found, show error state
  if (!caseStudy) {
    return (
      <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-24">
        <div className="rounded-xl bg-neutral-900/60 p-8 text-center backdrop-blur-sm">
          <h1 className="mb-4 text-3xl font-bold text-white">
            Case Study Not Found
          </h1>
          <p className="mb-6 text-neutral-300">
            The case study you're looking for doesn't exist or has been removed.
          </p>
          <Button href="/case-studies" variant="primary">
            View All Case Studies
          </Button>
        </div>
      </div>
    );
  }

  // Mock data for full case study (in a real app, this would come from the CMS)
  const caseMockData = {
    challenge:
      "The client faced significant challenges with their legacy systems that were hindering business growth and operational efficiency. Their existing infrastructure was unable to scale with increasing customer demands and new market opportunities.",
    solution:
      "We implemented a comprehensive digital transformation strategy, modernizing their core systems while ensuring business continuity. Our approach involved a phased migration to cloud infrastructure, custom software development, and integration of AI-powered analytics.",
    results: [
      "40% improvement in operational efficiency",
      "60% reduction in system maintenance costs",
      "28% increase in customer satisfaction scores",
      "Successful expansion into 3 new market segments",
    ],
    testimonial: {
      quote:
        "The team exceeded our expectations at every stage of the project. Their technical expertise and strategic guidance helped us not only solve our immediate challenges but position ourselves for future growth.",
      author: "John Smith",
      position: "CTO",
    },
    gallery: ["/images/case1.webp", "/images/case2.webp", "/images/case3.webp"],
  };

  return (
    <>
      {/* Hero section with parallax effect */}
      <motion.section
        ref={sectionRef}
        className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-neutral-900 md:min-h-[80vh]"
      >
        {/* Background image with parallax */}
        <motion.div
          ref={imageRef}
          className="absolute inset-0 z-0"
          style={{
            y,
            opacity,
            scale,
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center blur-[2px]"
            style={{ backgroundImage: `url(${caseStudy.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30"></div>
        </motion.div>

        {/* Content */}
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl"
          >
            {/* Client name */}
            <div className="mb-4 inline-block rounded-full bg-accent-500/20 px-4 py-1 backdrop-blur-sm">
              <span className="text-sm font-medium text-accent-300">
                {caseStudy.client}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              {caseStudy.title}
            </h1>

            {/* Description */}
            <p className="mb-8 text-lg text-neutral-300 md:text-xl">
              {caseStudy.description}
            </p>

            {/* Tags */}
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {caseStudy.tags.map((tag, i) => (
                <span
                  key={i}
                  className="rounded-full bg-neutral-800/70 px-3 py-1 text-sm text-neutral-200 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <span className="mb-2 text-sm text-neutral-400">
            Scroll to explore
          </span>
          <motion.div
            className="h-6 w-6 rounded-full border-2 border-neutral-400"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <motion.div
              className="mx-auto mt-1 h-2 w-0.5 bg-neutral-400"
              animate={{ scaleY: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Main content */}
      <section className="relative bg-transparent py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12">
            {/* Sidebar */}
            <div className="md:col-span-4">
              <ScrollReveal direction="left" threshold={0.1}>
                <div className="sticky top-32 rounded-xl bg-neutral-900/50 p-6 backdrop-blur-sm">
                  <h2 className="mb-6 text-2xl font-bold text-white">
                    Project Overview
                  </h2>

                  {/* Project details */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-neutral-400">
                        Client
                      </h3>
                      <p className="text-white">{caseStudy.client}</p>
                    </div>

                    <div>
                      <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-neutral-400">
                        Industry
                      </h3>
                      <p className="text-white">{caseStudy.tags[0]}</p>
                    </div>

                    <div>
                      <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-neutral-400">
                        Services
                      </h3>
                      <div className="flex flex-col space-y-1">
                        {caseStudy.tags.map((tag, i) => (
                          <span key={i} className="text-white">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        href="/contact"
                        variant="primary"
                        size="lg"
                        className="w-full"
                      >
                        Start a Similar Project
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Main content */}
            <div className="md:col-span-8">
              <div className="space-y-16">
                {/* Challenge section */}
                <ScrollReveal direction="up" threshold={0.1}>
                  <div>
                    <div className="mb-4 inline-block rounded-full bg-primary-900/50 px-4 py-1">
                      <span className="text-sm font-medium text-primary-400">
                        The Challenge
                      </span>
                    </div>
                    <h2 className="mb-6 text-3xl font-bold text-white">
                      Understanding the Problem
                    </h2>
                    <p className="text-lg text-neutral-300">
                      {caseMockData.challenge}
                    </p>
                  </div>
                </ScrollReveal>

                {/* Solution section */}
                <ScrollReveal direction="up" threshold={0.1} delay={0.1}>
                  <div>
                    <div className="mb-4 inline-block rounded-full bg-accent-900/50 px-4 py-1">
                      <span className="text-sm font-medium text-accent-400">
                        Our Approach
                      </span>
                    </div>
                    <h2 className="mb-6 text-3xl font-bold text-white">
                      The Solution
                    </h2>
                    <p className="text-lg text-neutral-300">
                      {caseMockData.solution}
                    </p>

                    {/* Solution image */}
                    <Parallax speed={0.15} direction="up" className="mt-8">
                      <div className="overflow-hidden rounded-xl">
                        <img
                          src={caseStudy.image}
                          alt={caseStudy.title}
                          className="w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    </Parallax>
                  </div>
                </ScrollReveal>

                {/* Results section */}
                <ScrollReveal direction="up" threshold={0.1} delay={0.2}>
                  <div>
                    <div className="mb-4 inline-block rounded-full bg-secondary-900/50 px-4 py-1">
                      <span className="text-sm font-medium text-secondary-400">
                        Key Outcomes
                      </span>
                    </div>
                    <h2 className="mb-6 text-3xl font-bold text-white">
                      The Results
                    </h2>

                    <div className="mb-8 grid gap-6 sm:grid-cols-2">
                      {caseMockData.results.map((result, i) => (
                        <motion.div
                          key={i}
                          className="rounded-lg bg-neutral-800/50 p-4 backdrop-blur-sm"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                          viewport={{ once: true }}
                        >
                          <div className="flex items-start">
                            <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary-500/20">
                              <svg
                                className="h-4 w-4 text-secondary-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <p className="text-white">{result}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>

                {/* Testimonial section */}
                <ScrollReveal direction="up" threshold={0.1} delay={0.3}>
                  <div className="rounded-xl bg-gradient-to-br from-accent-900/30 to-primary-900/30 p-8 backdrop-blur-sm">
                    <svg
                      className="mb-4 h-8 w-8 text-accent-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                    </svg>
                    <blockquote className="mb-4 text-xl italic text-white">
                      "{caseMockData.testimonial.quote}"
                    </blockquote>
                    <div className="flex items-center">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-700">
                        {/* Avatar placeholder */}
                        <div className="flex h-full w-full items-center justify-center bg-accent-800 text-white">
                          {caseMockData.testimonial.author.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-white">
                          {caseMockData.testimonial.author}
                        </div>
                        <div className="text-sm text-neutral-400">
                          {caseMockData.testimonial.position},{" "}
                          {caseStudy.client}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                {/* Gallery section */}
                <ScrollReveal direction="up" threshold={0.1} delay={0.4}>
                  <div>
                    <h2 className="mb-6 text-3xl font-bold text-white">
                      Project Gallery
                    </h2>
                    <div className="grid gap-6 sm:grid-cols-2">
                      {caseMockData.gallery.map((image, i) => (
                        <Parallax key={i} speed={0.1} direction="up">
                          <div className="overflow-hidden rounded-xl">
                            <img
                              src={image}
                              alt={`Project image ${i + 1}`}
                              className="w-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </div>
                        </Parallax>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>

                {/* CTA section */}
                <ScrollReveal direction="up" threshold={0.1} delay={0.5}>
                  <div className="rounded-xl bg-neutral-900/60 p-8 backdrop-blur-sm">
                    <h2 className="mb-4 text-2xl font-bold text-white">
                      Ready to start your project?
                    </h2>
                    <p className="mb-6 text-neutral-300">
                      Our team is ready to help you achieve similar results.
                      Let's discuss how we can tailor our solutions to your
                      specific needs.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button href="/contact" variant="primary" size="lg">
                        Start a Conversation
                      </Button>
                      <Button href="/case-studies" variant="outline" size="lg">
                        {caseStudiesData?.viewAllCaseStudies}
                      </Button>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
