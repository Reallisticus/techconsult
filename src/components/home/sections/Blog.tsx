"use client";
import { motion } from "framer-motion";
import { useAnimationInView } from "../../../hooks/useAnimation";
import { useLanguage } from "../../../i18n/context";
import { ScrollReveal } from "../../../provider/SmoothScrollProvider";
import { Button } from "../../ui/button";

export const BlogPreview = () => {
  const { t } = useLanguage();
  const [blogRef, inView] = useAnimationInView("slideUp", { threshold: 0.1 });

  const blogPosts = [
    {
      title: "The Future of Digital Transformation in 2024",
      excerpt:
        "Discover the emerging trends that are reshaping how businesses approach digital transformation strategies.",
      date: "March 5, 2024",
      image: "/images/blog1.webp",
      category: "Digital Transformation",
    },
    {
      title: "Building Resilient Technical Architectures",
      excerpt:
        "Learn the key principles for designing technical architectures that can withstand evolving business demands.",
      date: "February 20, 2024",
      image: "/images/blog2.webp",
      category: "Technical Architecture",
    },
    {
      title: "AI Implementation: From Strategy to Execution",
      excerpt:
        "A comprehensive guide to successfully implementing AI solutions that deliver measurable business value.",
      date: "January 15, 2024",
      image: "/images/blog3.webp",
      category: "Artificial Intelligence",
    },
  ];

  return (
    <section ref={blogRef} className="bg-transparent py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal direction="up" threshold={0.1}>
          <div className="mb-16 text-center">
            <span className="font-mono uppercase tracking-wider text-accent-500">
              Our Insights
            </span>
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              Latest From Our Blog
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-neutral-300">
              Stay updated with our latest thinking on technology trends,
              innovation strategies, and digital transformation insights.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, index) => (
            <ScrollReveal
              key={index}
              direction="up"
              delay={index * 0.1}
              threshold={0.1}
            >
              <motion.div
                className="group h-full overflow-hidden rounded-xl bg-neutral-900/30 backdrop-blur-sm"
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <div className="relative aspect-video overflow-hidden">
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${post.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent opacity-70" />
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-primary-900/40 px-3 py-1 text-xs font-medium text-primary-400">
                      {post.category}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {post.date}
                    </span>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white group-hover:text-accent-400">
                    {post.title}
                  </h3>
                  <p className="mb-6 text-neutral-300">{post.excerpt}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center p-0 text-accent-400"
                  >
                    Read More
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
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button href="/blog" variant="outline" size="lg" magnetic>
            View All Articles
          </Button>
        </div>
      </div>
    </section>
  );
};
