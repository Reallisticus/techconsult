"use client";
import { useFrame, Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useAnimationInView } from "../../hooks/useAnimation";
import { useLanguage } from "../../i18n/context";
import { ScrollReveal } from "../../provider/SmoothScrollProvider";
import * as THREE from "three";

export const TechnologyStack = () => {
  const { t } = useLanguage();
  const [techRef, inView] = useAnimationInView("slideUp", { threshold: 0.1 });

  const technologies = [
    {
      category: "Frontend",
      items: ["React", "NextJS", "TypeScript", "TailwindCSS"],
    },
    {
      category: "Backend",
      items: ["Node.js", "Python", "Java", "Go", "PHP"],
    },
    {
      category: "Cloud",
      items: ["AWS", "Azure", "Google Cloud", "Digital Ocean"],
    },
    {
      category: "DevOps",
      items: ["Docker", "Kubernetes", "CI/CD", "Terraform"],
    },
    {
      category: "Data",
      items: ["PostgreSQL", "MongoDB", "Elasticsearch", "Redis"],
    },
    {
      category: "AI/ML",
      items: ["TensorFlow", "PyTorch", "scikit-learn", "Hugging Face"],
    },
  ];

  // Hexagon component for 3D renderer
  const Hexagon = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
      if (!meshRef.current) return;
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    });

    return (
      <mesh ref={meshRef}>
        <cylinderGeometry args={[1, 1, 0.5, 6]} />
        <meshStandardMaterial color="#7C3AED" wireframe />
      </mesh>
    );
  };

  return (
    <section ref={techRef} className="bg-transparent py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal direction="up" threshold={0.1}>
          <div className="mb-16 text-center">
            <span className="font-mono uppercase tracking-wider text-accent-500">
              Our Capabilities
            </span>
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              Technology Expertise
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-neutral-300">
              We leverage cutting-edge technologies to build scalable,
              future-proof solutions for your business needs.
            </p>
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* 3D animated background */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-20">
            <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[10, 10, 10]} intensity={0.8} />
              <Hexagon />
            </Canvas>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {technologies.map((tech, index) => (
              <ScrollReveal
                key={index}
                direction="up"
                delay={index * 0.1}
                threshold={0.1}
              >
                <motion.div
                  className="rounded-xl bg-neutral-900/30 p-6 backdrop-blur-sm"
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 20px rgba(124, 58, 237, 0.1)",
                  }}
                >
                  <div className="mb-4 inline-flex rounded-lg bg-accent-500/10 p-3">
                    <svg
                      className="h-6 w-6 text-accent-400"
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
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-white">
                    {tech.category}
                  </h3>
                  <ul className="space-y-2">
                    {tech.items.map((item, i) => (
                      <motion.li
                        key={i}
                        className="flex items-center text-neutral-300"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <svg
                          className="mr-2 h-4 w-4 text-accent-400"
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
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
