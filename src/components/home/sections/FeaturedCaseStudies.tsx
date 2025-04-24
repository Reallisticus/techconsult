// src/components/home/sections/FeaturedCaseStudies.tsx
import { motion } from "framer-motion";
import { useAnimationInView } from "../../../hooks/useAnimation";
import { useLanguage } from "~/i18n/context";
import { ScrollReveal } from "../../../provider/SmoothScrollProvider";
import { Button } from "../../ui/button";
import { CaseStudyTranslations } from "../../../i18n/translations/case-studies";
import Link from "next/link";

export const FeaturedCaseStudies = () => {
  const { t, getNestedTranslation } = useLanguage();
  const [studiesRef, inView] = useAnimationInView("slideUp", {
    threshold: 0.1,
  });

  // Retrieve the entire caseStudies object (which includes labels and the cases array)
  const caseStudiesTranslation =
    getNestedTranslation<CaseStudyTranslations>("caseStudies");

  // Extract the cases array and limit to 3 featured case studies
  const allCases = caseStudiesTranslation.cases || [];
  const featuredCases = allCases.slice(3, 6); // Show only the first 3 case studies

  return (
    <section ref={studiesRef} className="bg-transparent py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <span className="font-mono uppercase tracking-wider text-accent-500">
            {t("caseStudies.subtitle")}
          </span>
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">
            {t("caseStudies.title")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-neutral-300">
            {t("caseStudies.description")}
          </p>
        </div>

        <ScrollReveal direction="up" threshold={0.1}>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredCases.map((study) => {
              // Use the id directly for the slug, or fallback to a stable slug if id is missing
              const studySlug = study.id || createStableSlug(study.title || "");

              return (
                <Link
                  href={`/case-studies/${studySlug}`}
                  key={study.id}
                  className="group block h-full"
                >
                  <motion.div
                    className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-neutral-900/50 backdrop-blur-sm"
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent opacity-70" />
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(${study.image})` }}
                      />

                      {/* Overlay on hover */}
                      <motion.div className="absolute inset-0 bg-accent-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>

                    <div className="flex flex-grow flex-col p-5 sm:p-6">
                      <div className="mb-2 flex items-center text-sm text-neutral-400">
                        <span className="line-clamp-1">{study.client}</span>
                      </div>
                      <h3 className="mb-3 line-clamp-2 text-lg font-bold text-white group-hover:text-accent-400 sm:text-xl">
                        {study.title}
                      </h3>
                      <p className="mb-4 line-clamp-3 text-sm text-neutral-300 sm:text-base">
                        {study.description}
                      </p>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {study.tags?.map((tag, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-neutral-800 px-2 py-1 text-xs text-neutral-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-auto">
                        <div className="flex items-center text-sm text-accent-400">
                          {t("caseStudies.viewCaseStudy")}
                          <motion.svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="ml-2"
                            animate={{
                              x: [0, 5, 0],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              repeatType: "reverse",
                              repeatDelay: 1,
                              ease: "easeInOut",
                            }}
                          >
                            <path
                              d="M5 12h14M12 5l7 7-7 7"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </motion.svg>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </ScrollReveal>

        <div className="mt-12 text-center">
          <Button href="/case-studies" variant="outline" size="lg" magnetic>
            {t("caseStudies.viewAllCaseStudies")}
          </Button>
        </div>
      </div>
    </section>
  );
};

/**
 * Create a language-independent, stable URL slug from a title
 * This should only be used as a fallback if ID is not available
 */
function createStableSlug(title: string): string {
  // For non-Latin characters (like Cyrillic), transliterate to Latin or remove them
  return title
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w-]+/g, "") // Remove any non-word chars except hyphens
    .replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+/, "") // Trim hyphens from start
    .replace(/-+$/, ""); // Trim hyphens from end
}
