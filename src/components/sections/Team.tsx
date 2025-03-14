"use client";
import { motion } from "framer-motion";
import { useAnimationInView } from "../../hooks/useAnimation";
import { useLanguage } from "../../i18n/context";
import { ScrollReveal } from "../../provider/SmoothScrollProvider";
import { Button } from "../ui/button";

export const TeamSection = () => {
  const { t } = useLanguage();
  const [teamRef, inView] = useAnimationInView("slideUp", { threshold: 0.1 });

  const teamMembers = [
    {
      name: "Alexander Ivanov",
      position: "CEO & Lead Consultant",
      image: "/images/team1.webp",
      specialization: "Strategic Planning",
      description:
        "With over 15 years of experience in technology leadership, Alexander brings strategic vision to every client engagement.",
      linkedin: "#",
    },
    {
      name: "Elena Petrova",
      position: "CTO",
      image: "/images/team2.webp",
      specialization: "Technical Architecture",
      description:
        "Elena designs scalable, resilient technical architectures that align with business objectives and future growth.",
      linkedin: "#",
    },
    {
      name: "Martin Dimitrov",
      position: "Digital Transformation Lead",
      image: "/images/team3.webp",
      specialization: "Process Optimization",
      description:
        "Martin specializes in guiding businesses through complex digital transformations with measurable results.",
      linkedin: "#",
    },
    {
      name: "Sophia Todorova",
      position: "Data & AI Specialist",
      image: "/images/team4.webp",
      specialization: "AI Implementation",
      description:
        "Sophia helps businesses harness the power of data and artificial intelligence to drive innovation.",
      linkedin: "#",
    },
  ];

  return (
    <section ref={teamRef} className="bg-transparent py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal direction="up" threshold={0.1}>
          <div className="mb-16 text-center">
            <span className="font-mono uppercase tracking-wider text-accent-500">
              Our Experts
            </span>
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              Meet Our Team
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-neutral-300">
              Our team of experienced consultants brings diverse expertise to
              solve your most complex technology challenges.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, index) => (
            <ScrollReveal
              key={index}
              direction="up"
              delay={index * 0.1}
              threshold={0.1}
            >
              <motion.div
                className="group relative overflow-hidden rounded-xl bg-neutral-900/50 backdrop-blur-sm"
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <div className="relative aspect-square overflow-hidden">
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${member.image})` }}
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-90" />
                </div>

                <div className="p-6">
                  <h3 className="mb-1 text-xl font-bold text-white">
                    {member.name}
                  </h3>
                  <p className="mb-1 text-accent-400">{member.position}</p>
                  <p className="mb-4 text-sm text-neutral-400">
                    {member.specialization}
                  </p>
                  <p className="mb-4 text-neutral-300">{member.description}</p>

                  {/* LinkedIn button with icon */}
                  <a
                    href={member.linkedin}
                    className="inline-flex items-center rounded-full bg-neutral-800 px-4 py-2 text-sm text-white transition-colors duration-300 hover:bg-accent-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    Connect
                  </a>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button href="/about" variant="outline" size="lg" magnetic>
            Learn More About Our Team
          </Button>
        </div>
      </div>
    </section>
  );
};
