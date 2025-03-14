"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import { Parallax, ScrollReveal } from "~/provider/SmoothScrollProvider";
import { useAnimationInView } from "~/hooks/useAnimation";
import { useLanguage } from "~/i18n/context";
import gsap from "gsap";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Button } from "../ui/button";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

// 3D Particle system component
const ParticleSystem = () => {
  const { size, viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  // Create particles
  const particleCount = 50;
  const particles = useRef<THREE.Vector3[]>([]);
  const speeds = useRef<number[]>([]);

  // Initialize particles
  useEffect(() => {
    particles.current = [];
    speeds.current = [];
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * viewport.width * 1.5;
      const y = (Math.random() - 0.5) * viewport.height * 1.5;
      const z = (Math.random() - 0.5) * 2;

      particles.current.push(new THREE.Vector3(x, y, z));
      speeds.current.push(0.01 + Math.random() * 0.03);
    }
  }, [viewport]);

  // Animate particles
  useFrame((state) => {
    if (!groupRef.current) return;

    groupRef.current.rotation.z += 0.001;

    particles.current.forEach((particle, i) => {
      // Move particle toward center
      particle.x += (0 - particle.x) * speeds.current[i]!;
      particle.y += (0 - particle.y) * speeds.current[i]!;

      // Reset particle if too close to center
      if (Math.abs(particle.x) < 0.1 && Math.abs(particle.y) < 0.1) {
        particle.x = (Math.random() - 0.5) * viewport.width;
        particle.y = (Math.random() - 0.5) * viewport.height;
        speeds.current[i] = 0.01 + Math.random() * 0.03;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {particles.current.map((particle, i) => (
        <mesh key={i} position={[particle.x, particle.y, particle.z]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? "#7C3AED" : "#2563EB"}
            transparent
            opacity={0.6 + Math.random() * 0.4}
          />
        </mesh>
      ))}
    </group>
  );
};

export const CtaSection = () => {
  const { t } = useLanguage();
  const [ctaRef, ctaInView] = useAnimationInView("slideUp", { threshold: 0.3 });
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 300 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Track mouse position
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!contentRef.current) return;
      const rect = contentRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };

    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [mouseX, mouseY]);

  // GSAP animations for text elements
  useEffect(() => {
    if (!contentRef.current) return;

    const ctx = gsap.context(() => {
      const title = contentRef.current!.querySelector("h2");
      const desc = contentRef.current!.querySelector("p");
      const button = contentRef.current!.querySelector("a");

      gsap.from([title, desc, button], {
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
        y: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "power2.out",
      });
    }, contentRef);

    return () => ctx.revert();
  }, []);

  // Create transform values correctly
  const transformedX = useTransform(x, (value) => value * -0.03);
  const transformedY = useTransform(y, (value) => value * -0.03);

  return (
    <section className="relative bg-transparent py-24" ref={ctaRef}>
      <div className="container relative mx-auto px-4">
        <ScrollReveal direction="up" threshold={0.3}>
          <div
            ref={contentRef}
            className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl p-8 md:p-12"
          >
            {/* 3D background with react-three-fiber */}
            <div
              ref={canvasRef}
              className="absolute inset-0 -z-10 overflow-hidden rounded-2xl"
            >
              <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
              >
                <ambientLight intensity={0.3} />
                <ParticleSystem />
              </Canvas>
            </div>

            {/* Background gradient with parallax effect */}
            <div className="absolute inset-0 z-0 rounded-2xl bg-gradient-to-br from-primary-900/60 to-primary-800/40 backdrop-blur-md" />

            <Parallax
              speed={0.15}
              direction="down"
              className="z-1 pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
            >
              <motion.div
                className="relative h-full w-full"
                style={{
                  x: transformedX,
                  y: transformedY,
                }}
              >
                <motion.div
                  className="absolute right-1/4 top-0 h-32 w-32 rounded-full bg-accent-500/20 blur-xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute bottom-1/4 left-1/4 h-48 w-48 rounded-full bg-primary-500/20 blur-xl"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </Parallax>

            {/* Animated border */}
            <div className="absolute inset-0 z-0 rounded-2xl">
              <div className="absolute inset-0 rounded-2xl border border-primary-700/40" />
              <motion.div
                className="absolute right-0 top-0 h-1 w-1/3 bg-gradient-to-r from-transparent to-accent-500"
                animate={{ x: [100, -400] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear",
                }}
              />
              <motion.div
                className="absolute bottom-0 left-0 h-1 w-1/3 bg-gradient-to-r from-accent-500 to-transparent"
                animate={{ x: [-100, 400] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear",
                }}
              />
              <motion.div
                className="absolute bottom-0 left-0 h-1/3 w-1 bg-gradient-to-b from-transparent to-accent-500"
                animate={{ y: [100, -400] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear",
                }}
              />
              <motion.div
                className="absolute right-0 top-0 h-1/3 w-1 bg-gradient-to-b from-accent-500 to-transparent"
                animate={{ y: [-100, 400] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear",
                }}
              />
            </div>

            <div className="relative z-10 space-y-6 text-center">
              <motion.h2
                className="text-3xl font-bold leading-tight md:text-4xl"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                {t("cta.title")}
              </motion.h2>

              <motion.p
                className="mx-auto max-w-2xl text-lg text-neutral-300"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                {t("cta.description")}
              </motion.p>

              <div className="pt-4">
                <Button
                  href="/contact"
                  variant="primary" // Uses your accent-500 color
                  size="lg"
                  glow
                  magnetic
                  magneticStrength={40}
                  className="group relative overflow-hidden"
                >
                  {/* Animated button shine effect */}
                  <motion.span
                    className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    style={{ left: "-50%" }}
                    animate={{ x: ["0%", "500%"] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  />

                  {/* Button text with icon */}
                  <span className="relative flex items-center">
                    {t("cta.button")}
                    <motion.svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-2"
                      animate={{ x: [0, 4, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse",
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
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
