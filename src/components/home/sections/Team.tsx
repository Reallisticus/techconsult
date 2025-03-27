"use client";
import { motion } from "framer-motion";
import { useAnimationInView } from "../../../hooks/useAnimation";
import { useLanguage } from "../../../i18n/context";
import { ScrollReveal } from "../../../provider/SmoothScrollProvider";
import { Button } from "../../ui/button";

interface TeamMember {
  name: string;
  position: string;
  specialization: string;
  description: string;
  image?: string;
  linkedin?: string;
}

interface Team {
  "section.subtitle": string;
  "section.title": string;
  "section.description": string;
  connect: string;
  learnMore: string;
  members: TeamMember[];
}

export const TeamSection = () => {
  const { t, getNestedTranslation } = useLanguage();
  const [teamRef, inView] = useAnimationInView("slideUp", { threshold: 0.1 });

  const teamMembers: TeamMember[] =
    getNestedTranslation<TeamMember[]>("team.members");

  const Team: Team = getNestedTranslation<Team>("team");

  // Add image paths and LinkedIn profiles to team members
  const teamMembersWithImages =
    teamMembers?.map((member, index) => ({
      ...member,
      image: `/images/team/team${index + 1}.webp`,
    })) || [];

  return (
    <section ref={teamRef} className="bg-transparent py-12 md:py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal direction="up" threshold={0.1}>
          <div className="mb-8 text-center md:mb-12 lg:mb-16">
            <span className="font-mono uppercase tracking-wider text-accent-500">
              {Team?.["section.subtitle"]}
            </span>
            <h2 className="mb-4 text-3xl font-bold md:mb-6 md:text-4xl lg:text-5xl">
              {Team?.["section.title"]}{" "}
            </h2>
            <p className="mx-auto max-w-2xl text-base text-neutral-300 md:text-lg">
              {Team?.["section.description"]}{" "}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-4">
          {teamMembersWithImages.map((member, index) => (
            <ScrollReveal
              key={index}
              direction="up"
              delay={index * 0.1}
              threshold={0.1}
            >
              <motion.div
                className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-neutral-900/50 backdrop-blur-sm"
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {/* Image container with fixed aspect ratio */}
                <div className="relative aspect-square w-full overflow-hidden">
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${member.image})` }}
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-90" />
                </div>

                {/* Content container with flex layout for consistent spacing */}
                <div className="flex flex-grow flex-col p-5 sm:p-6">
                  <div className="flex-grow">
                    <h3 className="mb-1 line-clamp-1 text-lg font-bold text-white sm:text-xl">
                      {member.name}
                    </h3>
                    <p className="mb-1 line-clamp-1 text-sm text-accent-400 sm:text-base">
                      {member.position}
                    </p>
                    <p className="mb-3 line-clamp-1 text-xs text-neutral-400 sm:text-sm">
                      {member.specialization}
                    </p>

                    {/* Description with fixed height and overflow ellipsis */}
                    <div className="mb-4 h-[4.5rem] sm:h-[5rem]">
                      <p className="line-clamp-3 text-sm text-neutral-300">
                        {member.description}
                      </p>
                    </div>
                  </div>

                  {/* Button container always at the bottom */}
                  <div className="mt-auto">
                    <a
                      href={member.linkedin}
                      className="inline-flex items-center rounded-full bg-neutral-800 px-3 py-1.5 text-xs text-white transition-colors duration-300 hover:bg-accent-500 sm:px-4 sm:py-2 sm:text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        className="mr-1.5 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                      {getNestedTranslation<string>("team.connect")}
                    </a>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-10 text-center md:mt-12 lg:mt-16">
          <Button href="/about" variant="outline" size="lg" magnetic>
            {getNestedTranslation<string>("team.learnMore")}
          </Button>
        </div>
      </div>
    </section>
  );
};
