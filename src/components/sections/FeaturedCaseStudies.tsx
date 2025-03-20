import { motion } from "framer-motion";
import { useAnimationInView } from "../../hooks/useAnimation";
import { useLanguage } from "../../i18n/context";
import { ScrollReveal } from "../../provider/SmoothScrollProvider";
import { Button } from "../ui/button";
import { type CaseStudyTranslations } from "~/i18n/translations/case-studies";

export const FeaturedCaseStudies = () => {
  const { t } = useLanguage();
  const [studiesRef, inView] = useAnimationInView("slideUp", {
    threshold: 0.1,
  });

  // Get case studies from translations
  const caseStudies = t("caseStudies.cases") as CaseStudyTranslations["cases"];

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
            {caseStudies.map((study) => (
              <motion.div
                key={study.id} // Using id as key instead of index
                className="group relative overflow-hidden rounded-xl bg-neutral-900/50 backdrop-blur-sm"
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <div className="relative aspect-video overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent opacity-70" />
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${study.image})` }}
                  />

                  {/* Overlay on hover */}
                  <motion.div className="absolute inset-0 bg-accent-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                <div className="p-6">
                  <div className="mb-2 flex items-center text-sm text-neutral-400">
                    <span>{study.client}</span>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white group-hover:text-accent-400">
                    {study.title}
                  </h3>
                  <p className="mb-4 text-neutral-300">{study.description}</p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {study.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center p-0 text-accent-400"
                  >
                    {t("caseStudies.viewCaseStudy")}
                    <motion.svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-2"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <path
                        d="M5 12h14M12 5l7 7-7 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  </Button>
                </div>
              </motion.div>
            ))}
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
