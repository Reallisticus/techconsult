// src/components/sections/Testimonials.tsx
"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useLanguage } from "~/i18n/context";
import {
  Parallax,
  ScrollReveal,
  useSmoothScroll,
} from "~/provider/SmoothScrollProvider";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "~/hooks/useIsomorphicLayout";
import { cn } from "~/lib/utils";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Testimonial data type
interface Testimonial {
  quote: string;
  author: string;
  position: string;
  image: string;
}

// 3D Background Animation Component
const AnimatedTorus: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;

  // Use a more performant animation approach with frame-rate independent animation
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Smooth rotation based on delta time
    meshRef.current.rotation.x += delta * 0.15;
    meshRef.current.rotation.y += delta * 0.2;

    // Subtle pulsing effect
    const t = state.clock.getElapsedTime();
    meshRef.current.scale.x = 1 + Math.sin(t * 0.5) * 0.05;
    meshRef.current.scale.y = 1 + Math.sin(t * 0.5) * 0.05;
    meshRef.current.scale.z = 1 + Math.sin(t * 0.5) * 0.05;
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#7C3AED" />

      <mesh ref={meshRef} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[3, 1, 32, 100]} />
        <meshStandardMaterial
          color="#8B5CF6"
          wireframe
          emissive="#4C1D95"
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
    </>
  );
};

// Main Testimonials Component
export const Testimonials: React.FC = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { lenis, scroll } = useSmoothScroll();

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [direction, setDirection] = useState<number>(1); // 1 for right, -1 for left

  // Animation controls for slide transitions
  const slideControls = useAnimation();

  // Testimonials data
  const testimonials: Testimonial[] = [
    {
      quote:
        "TechConsult.BG transformed our business with their strategic vision and technical expertise. They didn't just implement technology - they revolutionized our entire approach.",
      author: "Maria Ivanova",
      position: "CTO, Global Finance Ltd.",
      image: "/images/testimonial1.webp",
    },
    {
      quote:
        "Working with the team at TechConsult.BG was a game-changer for our digital transformation. Their ability to understand our unique business challenges was exceptional.",
      author: "Stefan Petrov",
      position: "CEO, NexGen Retail",
      image: "/images/testimonial2.webp",
    },
    {
      quote:
        "From strategy to implementation, the TechConsult.BG team delivered beyond our expectations. The result is a future-proof technology infrastructure that scales with our business.",
      author: "Elena Dimitrova",
      position: "Director of Operations, MedTech Solutions",
      image: "/images/testimonial3.webp",
    },
  ];

  // Initialize GSAP ScrollTrigger
  useIsomorphicLayoutEffect(() => {
    if (!sectionRef.current || !lenis) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Create timeline for the section entrance animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(
        ".testimonial-header",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.6 },
      ).fromTo(
        ".testimonial-container",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.3",
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [lenis]);

  // Handle automatic slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        goToNextSlide();
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [activeIndex, isAnimating]);

  // Navigation Functions
  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating || index === activeIndex) return;
      if (index < 0 || index >= testimonials.length) return;

      const newDirection = index > activeIndex ? 1 : -1;
      setDirection(newDirection);
      setIsAnimating(true);

      // Animate slide transition
      slideControls
        .start({
          x: newDirection * -100 + "%",
          transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] },
        })
        .then(() => {
          setActiveIndex(index);
          setIsAnimating(false);
          slideControls.set({ x: 0 });
        });
    },
    [activeIndex, isAnimating, slideControls, testimonials.length],
  );

  const goToNextSlide = useCallback(() => {
    const nextIndex = (activeIndex + 1) % testimonials.length;
    goToSlide(nextIndex);
  }, [activeIndex, goToSlide, testimonials.length]);

  const goToPrevSlide = useCallback(() => {
    const prevIndex =
      (activeIndex - 1 + testimonials.length) % testimonials.length;
    goToSlide(prevIndex);
  }, [activeIndex, goToSlide, testimonials.length]);

  // Quote animations
  const quoteVariants = {
    initial: (dir: number) => ({
      x: dir * 30,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
      },
    },
    exit: (dir: number) => ({
      x: dir * -30,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
      },
    }),
  };

  // Animate quote marks
  const quoteMarkVariants = {
    animate: {
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.05, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal direction="up" threshold={0.1} once>
          <div className="testimonial-header mb-16 text-center">
            <span className="font-mono uppercase tracking-wider text-accent-500">
              Client Feedback
            </span>
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              What Our Clients Say
            </h2>
          </div>
        </ScrollReveal>

        <div
          ref={sliderRef}
          className="testimonial-container relative mx-auto max-w-4xl"
        >
          {/* Background canvas for 3D effect - Reduced render priority for better performance */}
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
            <Canvas
              dpr={[1, 1.5]} // Lower resolution for background effects
              camera={{ position: [0, 0, 8], fov: 50 }}
              frameloop="demand" // Only render when needed
            >
              <AnimatedTorus />
            </Canvas>
          </div>

          {/* Dynamic quote marks */}
          <Parallax
            speed={0.15}
            direction="up"
            className="absolute -top-10 left-4 text-8xl font-bold text-accent-500/30"
          >
            <motion.div variants={quoteMarkVariants} animate="animate">
              "
            </motion.div>
          </Parallax>
          <Parallax
            speed={0.15}
            direction="down"
            className="absolute -bottom-10 right-4 text-8xl font-bold text-accent-500/30"
          >
            <motion.div variants={quoteMarkVariants} animate="animate">
              "
            </motion.div>
          </Parallax>

          {/* Testimonial slider */}
          <div className="relative overflow-hidden rounded-xl bg-neutral-900/60 p-8 shadow-lg backdrop-blur-lg">
            <AnimatePresence custom={direction} initial={false} mode="wait">
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={quoteVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="relative"
              >
                <p className="relative z-10 mb-8 text-xl italic text-white md:text-2xl">
                  {testimonials[activeIndex]?.quote || ""}
                </p>

                <div className="flex items-center">
                  <motion.div
                    className="h-14 w-14 overflow-hidden rounded-full border-2 border-accent-500"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${testimonials[activeIndex]?.image ?? ""})`,
                      }}
                    />
                  </motion.div>
                  <motion.div
                    className="ml-4"
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="font-bold text-white">
                      {testimonials[activeIndex]?.author || ""}
                    </p>
                    <p className="text-sm text-neutral-400">
                      {testimonials[activeIndex]?.position || ""}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress indicator */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-neutral-800">
              <motion.div
                className="h-full bg-accent-500"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 6,
                  ease: "linear",
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                key={activeIndex} // Reset animation when slide changes
              />
            </div>
          </div>

          {/* Navigation arrows with responsive positioning */}
          <div className="absolute left-0 right-0 top-1/2 flex -translate-y-1/2 justify-between px-4 md:-mx-12 md:px-0">
            <motion.button
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full bg-accent-500 text-white transition-opacity duration-300 md:h-12 md:w-12",
                activeIndex === 0
                  ? "opacity-50"
                  : "opacity-100 hover:bg-accent-600",
              )}
              onClick={goToPrevSlide}
              disabled={isAnimating || activeIndex === 0}
              aria-label="Previous testimonial"
              whileTap={{ scale: 0.9 }}
              whileHover={
                activeIndex !== 0
                  ? {
                      scale: 1.1,
                      boxShadow: "0 0 15px rgba(124, 58, 237, 0.5)",
                    }
                  : {}
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-5 w-5 md:h-6 md:w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </motion.button>

            <motion.button
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full bg-accent-500 text-white transition-opacity duration-300 md:h-12 md:w-12",
                activeIndex === testimonials.length - 1
                  ? "opacity-50"
                  : "opacity-100 hover:bg-accent-600",
              )}
              onClick={goToNextSlide}
              disabled={isAnimating || activeIndex === testimonials.length - 1}
              aria-label="Next testimonial"
              whileTap={{ scale: 0.9 }}
              whileHover={
                activeIndex !== testimonials.length - 1
                  ? {
                      scale: 1.1,
                      boxShadow: "0 0 15px rgba(124, 58, 237, 0.5)",
                    }
                  : {}
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-5 w-5 md:h-6 md:w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.button>
          </div>

          {/* Navigation dots */}
          <div className="mt-8 flex justify-center">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "mx-1 h-3 w-3 rounded-full transition-all duration-300",
                  activeIndex === index
                    ? "w-6 bg-accent-500"
                    : "bg-neutral-600 hover:bg-neutral-400",
                )}
                onClick={() => goToSlide(index)}
                disabled={isAnimating}
                aria-label={`Testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
