"use client";
import { useFrame, Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
import { useAnimationInView } from "../../hooks/useAnimation";
import { useLanguage } from "../../i18n/context";
import { ScrollReveal } from "../../provider/SmoothScrollProvider";
import * as THREE from "three";

interface TechCategory {
  category: string;
  items: string[];
}

interface TechStackTranslations {
  "section.subtitle": string;
  "section.title": string;
  "section.description": string;
  categories: TechCategory[];
}

export const TechnologyStack = () => {
  const { t, getNestedTranslation } = useLanguage();
  const [techRef, inView] = useAnimationInView("slideUp", { threshold: 0.1 });
  const [isMounted, setIsMounted] = useState(false);

  // Mount state for client-side rendering
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Get tech stack data from translations
  const techStackData: TechStackTranslations =
    getNestedTranslation<TechStackTranslations>("techStack");
  const technologies = techStackData?.categories || [];

  // Simple hexagon component that won't cause WebGL context issues
  const HexagonGroup = () => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
      if (!groupRef.current) return;

      // Simple rotation animation
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      groupRef.current.rotation.x =
        Math.sin(state.clock.getElapsedTime() * 0.3) * 0.2;
    });

    return (
      <group ref={groupRef}>
        {/* Main hexagon */}
        <mesh>
          <cylinderGeometry args={[1.5, 1.5, 0.3, 6]} />
          <meshBasicMaterial color="#7C3AED" wireframe={true} />
        </mesh>

        {/* Outer ring */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[2.2, 0.1, 8, 6]} />
          <meshBasicMaterial color="#60A5FA" wireframe={true} />
        </mesh>

        {/* Inner details */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.05, 8, 6]} />
          <meshBasicMaterial color="#F9A8D4" wireframe={true} />
        </mesh>
      </group>
    );
  };

  const categoryIcons = [
    // Frontend icon - computer display with brackets
    <svg
      key="frontend"
      className="h-5 w-5 text-accent-400 sm:h-6 sm:w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>,

    // Backend icon - server
    <svg
      key="backend"
      className="h-5 w-5 text-accent-400 sm:h-6 sm:w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
      />
    </svg>,

    // Cloud icon - cloud
    <svg
      key="cloud"
      className="h-5 w-5 text-accent-400 sm:h-6 sm:w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
      />
    </svg>,

    // DevOps icon - cogs
    <svg
      key="devops"
      className="h-5 w-5 text-accent-400 sm:h-6 sm:w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>,

    // Data icon - database
    <svg
      key="data"
      className="h-5 w-5 text-accent-400 sm:h-6 sm:w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
      />
    </svg>,

    // AI/ML icon - brain
    <svg
      key="ai"
      className="h-5 w-5 text-accent-400 sm:h-6 sm:w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>,
  ];

  // Memoize icons to prevent unnecessary re-renders
  const memoizedIcons = useMemo(() => categoryIcons, []);

  // Function to get the appropriate icon based on category index
  const getCategoryIcon = (index: number) => {
    if (index < memoizedIcons.length) {
      return memoizedIcons[index];
    }
    // Default icon if index is out of bounds
    return (
      <svg
        className="h-5 w-5 text-accent-400 sm:h-6 sm:w-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 16V8M8 12h8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 21a9 9 0 100-18 9 9 0 000 18z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    );
  };

  // Card hover variants for Framer Motion
  const cardVariants = {
    initial: {
      boxShadow: "0 0 0 rgba(124, 58, 237, 0)",
    },
    hover: {
      y: -8,
      boxShadow: "0 15px 30px rgba(124, 58, 237, 0.2)",
      borderColor: "rgba(124, 58, 237, 0.4)",
    },
  };

  return (
    <section
      ref={techRef}
      className="relative overflow-hidden bg-transparent py-12 md:py-16 lg:py-24"
    >
      {/* Background gradient effects */}
      <div className="absolute inset-0 -z-20 bg-gradient-radial from-accent-900/10 to-transparent opacity-40"></div>
      <div className="absolute -right-40 -top-40 -z-10 h-96 w-96 rounded-full bg-primary-900/10 blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 -z-10 h-96 w-96 rounded-full bg-accent-900/10 blur-3xl"></div>

      <div className="container mx-auto px-4">
        {/* 3D hexagon positioned at the top, behind the title */}
        {isMounted && (
          <div className="pointer-events-none absolute left-0 right-0 top-0 -z-10 flex items-start justify-center">
            <div className="h-80 w-full opacity-50 sm:h-96 md:h-[30rem]">
              <Canvas
                camera={{ position: [0, 0, 10], fov: 50 }}
                dpr={[1, 1.5]}
                gl={{ alpha: true }}
              >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.0} />
                <HexagonGroup />
              </Canvas>
            </div>
          </div>
        )}

        <ScrollReveal direction="up" threshold={0.1}>
          <div className="relative z-10 mb-16 text-center md:mb-20 lg:mb-24">
            <span className="mb-2 inline-block rounded-full bg-black/30 px-4 py-1 font-mono uppercase tracking-wider text-accent-500 backdrop-blur-sm">
              {techStackData?.["section.subtitle"]}
            </span>
            <h2 className="relative mb-4 text-3xl font-bold md:mb-6 md:text-4xl lg:text-5xl">
              {techStackData?.["section.title"]}
            </h2>
            <p className="mx-auto inline-block max-w-2xl rounded-lg bg-black/20 px-6 py-4 text-base text-neutral-300 backdrop-blur-sm md:text-lg">
              {techStackData?.["section.description"]}
            </p>
          </div>
        </ScrollReveal>

        <div className="relative z-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {technologies.map((tech, index) => (
              <ScrollReveal
                key={index}
                direction="up"
                delay={index * 0.1}
                threshold={0.1}
              >
                {/* Use a containerized approach with margin for hover space */}
                <div className="-m-2 h-full overflow-visible p-8">
                  <motion.div
                    className="flex h-full flex-col rounded-xl border border-neutral-800/50 bg-neutral-900/40 p-5 backdrop-blur-sm sm:p-6"
                    variants={cardVariants}
                    initial="initial"
                    whileHover="hover"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 10,
                    }}
                  >
                    <div className="mb-4 inline-flex rounded-lg bg-accent-500/10 p-3">
                      {getCategoryIcon(index)}
                    </div>
                    <h3 className="mb-3 text-lg font-bold text-white sm:mb-4 sm:text-xl">
                      {tech.category}
                    </h3>

                    {/* Fixed height container for the items list */}
                    <div className="min-h-[180px] flex-grow">
                      <ul className="space-y-1.5 sm:space-y-2">
                        {tech.items.map((item, i) => (
                          <motion.li
                            key={i}
                            className="flex items-center text-sm text-neutral-300 sm:text-base"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <svg
                              className="mr-2 h-3.5 w-3.5 flex-shrink-0 text-accent-400 sm:h-4 sm:w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M5 12l5 5L20 7"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className="line-clamp-1">{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
