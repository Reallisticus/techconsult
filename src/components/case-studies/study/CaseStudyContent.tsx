// CaseStudyContent.tsx - Main content area with all sections
"use client";

import { motion } from "framer-motion";
import { ScrollReveal, Parallax } from "~/provider/SmoothScrollProvider";
import { Button } from "~/components/ui/button";
import { CaseStudyType, CaseStudyTranslations } from "./CaseStudiesDetail";
import Image from "next/image";
interface CaseStudyContentProps {
  caseStudy: CaseStudyType;
  translations: CaseStudyTranslations | undefined;
}

export const CaseStudyContent = ({
  caseStudy,
  translations,
}: CaseStudyContentProps) => {
  return (
    <div className="space-y-16">
      {/* Challenge section */}
      {caseStudy.challenge && (
        <ScrollReveal direction="up" threshold={0.1}>
          <div>
            <div className="mb-4 inline-block rounded-full bg-purple-900/50 px-4 py-1">
              <span className="text-sm font-medium text-purple-400">
                {translations?.challengeLabel || "The Challenge"}
              </span>
            </div>
            <h2 className="mb-6 text-3xl font-bold text-white">
              {translations?.understandingProblem ||
                "Understanding the Problem"}
            </h2>
            <p className="text-lg leading-relaxed text-neutral-300">
              {caseStudy.challenge}
            </p>
          </div>
        </ScrollReveal>
      )}

      {/* Solution section */}
      {caseStudy.solution && (
        <ScrollReveal direction="up" threshold={0.1} delay={0.1}>
          <div>
            <div className="mb-4 inline-block rounded-full bg-blue-900/50 px-4 py-1">
              <span className="text-sm font-medium text-blue-400">
                {translations?.approachLabel || "Our Approach"}
              </span>
            </div>
            <h2 className="mb-6 text-3xl font-bold text-white">
              {translations?.solutionLabel || "The Solution"}
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-neutral-300">
              {caseStudy.solution}
            </p>

            {/* Solution image */}
            <Parallax speed={0.15} direction="up" className="mt-8">
              <div className="overflow-hidden rounded-xl">
                <img
                  src={caseStudy.image!}
                  alt={caseStudy.title!}
                  className="w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </Parallax>
          </div>
        </ScrollReveal>
      )}

      {/* Results section */}
      {caseStudy.results && caseStudy.results.length > 0 && (
        <ScrollReveal direction="up" threshold={0.1} delay={0.2}>
          <div>
            <div className="mb-4 inline-block rounded-full bg-teal-900/50 px-4 py-1">
              <span className="text-sm font-medium text-teal-400">
                {translations?.outcomesLabel || "Key Outcomes"}
              </span>
            </div>
            <h2 className="mb-6 text-3xl font-bold text-white">
              {translations?.resultsLabel || "The Results"}
            </h2>

            <div className="mb-8 grid gap-6 sm:grid-cols-2">
              {caseStudy.results.map((result, i) => (
                <motion.div
                  key={i}
                  className="rounded-lg border border-teal-900/20 bg-[#0A0A2A]/50 p-4 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-start">
                    <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-500/20">
                      <svg
                        className="h-4 w-4 text-teal-500"
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
      )}

      {/* Testimonial section */}
      {caseStudy.testimonial && caseStudy.testimonial.quote && (
        <ScrollReveal direction="up" threshold={0.1} delay={0.3}>
          <div className="rounded-xl border border-purple-900/20 bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-8 backdrop-blur-sm">
            <svg
              className="mb-4 h-8 w-8 text-purple-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
            </svg>
            <blockquote className="mb-4 text-xl italic text-white">
              "{caseStudy.testimonial.quote}"
            </blockquote>
            <div className="flex items-center">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-700">
                {/* Avatar placeholder */}
                <div className="flex h-full w-full items-center justify-center bg-purple-800 text-white">
                  {caseStudy.testimonial.author?.charAt(0) || "A"}
                </div>
              </div>
              <div className="ml-4">
                <div className="font-medium text-white">
                  {caseStudy.testimonial.author}
                </div>
                <div className="text-sm text-neutral-400">
                  {caseStudy.testimonial.position}, {caseStudy.client}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Gallery section - show up to 4 images in a grid */}
      {caseStudy.gallery && caseStudy.gallery.length > 0 && (
        <ScrollReveal direction="up" threshold={0.1} delay={0.4}>
          <div>
            <h2 className="mb-6 text-3xl font-bold text-white">
              {translations?.projectGallery || "Project Gallery"}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {caseStudy.gallery.slice(0, 4).map((image, i) => (
                <Parallax key={i} speed={0.1} direction="up">
                  <div className="overflow-hidden rounded-xl border border-purple-900/20">
                    <img
                      src={image}
                      alt={`${caseStudy.title} - image ${i + 1}`}
                      className="w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </Parallax>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* CTA section */}
      <ScrollReveal direction="up" threshold={0.1} delay={0.5}>
        <div className="rounded-xl border border-purple-900/20 bg-[#0A0A2A]/60 p-8 backdrop-blur-sm">
          <h2 className="mb-4 text-2xl font-bold text-white">
            {translations?.readyToStart || "Ready to start your project?"}
          </h2>
          <p className="mb-6 text-neutral-300">
            {translations?.teamReady ||
              "Our team is ready to help you achieve similar results. Let's discuss how we can tailor our solutions to your specific needs."}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              href="/contact"
              variant="primary"
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {translations?.startConversation || "Start a Conversation"}
            </Button>
            <Button
              href="/case-studies"
              variant="outline"
              size="lg"
              className="border-purple-500/30 text-purple-300 hover:border-purple-500 hover:bg-purple-500/10"
            >
              {translations?.viewAllCaseStudies || "View All Case Studies"}
            </Button>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};
