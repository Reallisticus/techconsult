// src/components/layout/footer.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Magnetic } from "~/components/ui/magnetic";
import { useAnimationInView } from "~/hooks/useAnimation";
import { useLanguage } from "~/i18n/context";

// Define service slugs as constants to ensure they remain in English
const SERVICE_SLUGS = {
  strategicPlanning: "strategic-planning",
  digitalTransformation: "digital-transformation",
  technicalArchitecture: "technical-architecture",
  training: "training",
  configurations: "configurations",
  support: "support",
  consultations: "consultations",
};

export const Footer = () => {
  const { t } = useLanguage();
  const [footerRef, footerInView] = useAnimationInView("slideUp", {
    threshold: 0.1,
  });

  const navItems = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.services"), href: "/services" },
    { name: t("nav.caseStudies"), href: "/case-studies" },
    { name: t("nav.about"), href: "/about" },
    { name: t("nav.contact"), href: "/contact" },
    { name: t("nav.blog"), href: "/blog" },
  ];

  const socialLinks = [
    { name: "LinkedIn", href: "#", icon: "linkedin" },
    { name: "Twitter", href: "#", icon: "twitter" },
    { name: "GitHub", href: "#", icon: "github" },
  ];

  // Get service categories with translated names but fixed English slugs
  const serviceCategories = [
    {
      name: t("services.strategicPlanning"),
      href: `/services/${SERVICE_SLUGS.strategicPlanning}`,
    },
    {
      name: t("services.digitalTransformation"),
      href: `/services/${SERVICE_SLUGS.digitalTransformation}`,
    },
    {
      name: t("services.technicalArchitecture"),
      href: `/services/${SERVICE_SLUGS.technicalArchitecture}`,
    },
    {
      name: t("services.training"),
      href: `/services/${SERVICE_SLUGS.training}`,
    },
    {
      name: t("services.configurations"),
      href: `/services/${SERVICE_SLUGS.configurations}`,
    },
    {
      name: t("services.support"),
      href: `/services/${SERVICE_SLUGS.support}`,
    },
    {
      name: t("services.consultations"),
      href: `/services/${SERVICE_SLUGS.consultations}`,
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      ref={footerRef}
      initial="hidden"
      animate={footerInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
          },
        },
      }}
      className="relative overflow-hidden bg-neutral-950 pt-16"
    >
      {/* Animated gradient lines */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-primary-500/30 to-transparent"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute left-0 right-0 top-0 h-24 bg-gradient-to-b from-primary-900/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        <div className="relative z-10 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Information */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
            className="space-y-6"
          >
            <Link href="/" className="inline-block">
              <h2 className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-2xl font-bold text-transparent">
                TechConsult.BG
              </h2>
            </Link>

            <p className="max-w-xs text-neutral-400">{t("footer.paragraph")}</p>

            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <Magnetic key={link.name}>
                  <Link
                    href={link.href}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 transition-colors duration-300 hover:bg-primary-900"
                    aria-label={link.name}
                  >
                    <SocialIcon name={link.icon} />
                  </Link>
                </Magnetic>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
            className="space-y-6"
          >
            <h3 className="text-lg font-bold text-white">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-3">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="group flex items-center text-neutral-400 transition-colors duration-300 hover:text-accent-400"
                  >
                    <span className="mr-0 h-px w-0 bg-accent-400 transition-all duration-300 group-hover:mr-2 group-hover:w-4"></span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
            className="space-y-6"
          >
            <h3 className="text-lg font-bold text-white">
              {t("footer.services")}
            </h3>
            <ul className="space-y-3">
              {serviceCategories.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="group flex items-center text-neutral-400 transition-colors duration-300 hover:text-accent-400"
                  >
                    <span className="mr-0 h-px w-0 bg-accent-400 transition-all duration-300 group-hover:mr-2 group-hover:w-4"></span>
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
            className="space-y-6"
          >
            <h3 className="text-lg font-bold text-white">
              {t("footer.contact")}
            </h3>
            <ul className="space-y-4 text-neutral-400">
              <li className="flex items-start">
                <svg
                  className="mr-3 mt-0.5 h-5 w-5 text-accent-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{t("footer.location")}</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="mr-3 mt-0.5 h-5 w-5 text-accent-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>{t("footer.email")}</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="mr-3 mt-0.5 h-5 w-5 text-accent-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>{t("footer.phone")}</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Divider with gradient */}
        <motion.div
          variants={{
            hidden: { opacity: 0, scaleX: 0 },
            visible: {
              opacity: 1,
              scaleX: 1,
              transition: { duration: 0.8, delay: 0.4 },
            },
          }}
          className="my-10 h-px w-full bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"
        />

        {/* Bottom Section */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.6, delay: 0.6 } },
          }}
          className="flex flex-col items-center justify-between py-8 text-sm text-neutral-500 md:flex-row"
        >
          <p>{t("footer.rights", { year: currentYear })}</p>

          <div className="mt-4 flex space-x-6 md:mt-0">
            <Link
              href="/privacy-policy"
              className="transition-colors duration-300 hover:text-accent-400"
            >
              {t("footer.privacyPolicy")}
            </Link>
            <Link
              href="/terms-of-service"
              className="transition-colors duration-300 hover:text-accent-400"
            >
              {t("footer.termsOfService")}
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Bottom animated gradient */}
      <div className="mt-6 h-1 w-full bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600">
        <motion.div
          className="h-full w-1/2 bg-accent-400"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </motion.footer>
  );
};

// Helper component for social icons
const SocialIcon = ({ name }: { name: string }) => {
  switch (name) {
    case "linkedin":
      return (
        <svg
          className="h-5 w-5 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      );
    case "twitter":
      return (
        <svg
          className="h-5 w-5 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
        </svg>
      );
    case "github":
      return (
        <svg
          className="h-5 w-5 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      );
    default:
      return null;
  }
};
