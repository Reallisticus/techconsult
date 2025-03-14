"use client";
import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import * as THREE from "three";
import { useRef, useState, useEffect, Suspense } from "react";
import { useLanguage } from "../../i18n/context";
import gsap from "gsap";

// Separate component for the 3D element
const TorusBackground = () => {
  const torusRef = useRef<THREE.Mesh>(null);

  // Use a one-time setup effect
  useEffect(() => {
    if (!torusRef.current) return;

    // Set initial rotation once only
    torusRef.current.rotation.x = 0.5;
    torusRef.current.rotation.y = 0.5;

    // Manual animation instead of using OrbitControls
    let animationId: number;
    const animate = () => {
      if (torusRef.current) {
        torusRef.current.rotation.y += 0.003;
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Clean up animation frame on unmount
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <mesh ref={torusRef}>
        <torusGeometry args={[2.5, 0.8, 32, 100]} />
        <meshStandardMaterial
          color="#8B5CF6"
          wireframe
          emissive="#4C1D95"
          emissiveIntensity={0.2}
        />
      </mesh>
    </>
  );
};

export const Testimonials = () => {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isAnimatingRef = useRef(false);
  const slidesRef = useRef([]);

  const testimonials = [
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

  // Initialize the slider once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    // Instead of using gsap.utils.toArray which can cause issues, use refs
    slidesRef.current = Array.from(
      containerRef.current.querySelectorAll(".testimonial-slide"),
    );

    // Set initial positions
    gsap.set(slidesRef.current, {
      xPercent: (i) => i * 100, // Position slides side by side
    });

    // No need for a cleanup as this is just initial positioning
  }, []);

  const goToSlide = (index: number): void => {
    if (isAnimatingRef.current || index === currentIndex) return;
    if (index < 0 || index >= testimonials.length) return;

    isAnimatingRef.current = true;

    // Animate to the target slide
    gsap.to(slidesRef.current, {
      xPercent: (i: number) => 100 * (i - index),
      duration: 0.8,
      ease: "power2.out",
      onComplete: () => {
        isAnimatingRef.current = false;
        setCurrentIndex(index);
      },
    });
  };

  // Quote mark animation
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
    <section ref={sectionRef} className="bg-transparent py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <span className="font-mono uppercase tracking-wider text-accent-500">
            Client Feedback
          </span>
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">
            What Our Clients Say
          </h2>
        </div>

        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-xl">
          {/* Animated quote mark */}
          <motion.div
            className="absolute -top-10 left-4 text-8xl font-bold text-accent-500/30"
            variants={quoteMarkVariants}
            animate="animate"
          >
            "
          </motion.div>

          {/* Testimonial container */}
          <div
            ref={containerRef}
            className="relative h-full w-full overflow-hidden"
          >
            <div className="flex">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="testimonial-slide relative min-w-full shrink-0 p-8"
                >
                  <div className="relative rounded-xl bg-neutral-900/50 p-8 backdrop-blur-lg">
                    <div className="relative mb-8 overflow-hidden rounded-lg p-4">
                      <div className="absolute inset-0 -z-10 opacity-50">
                        <Canvas
                          camera={{ position: [0, 0, 5], fov: 50 }}
                          gl={{ antialias: true }}
                        >
                          <Suspense fallback={null}>
                            <TorusBackground />
                          </Suspense>
                        </Canvas>
                      </div>

                      <p className="relative z-10 text-xl italic text-white md:text-2xl">
                        {testimonial.quote}
                      </p>
                    </div>

                    <div className="flex items-center">
                      <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-accent-500">
                        <div
                          className="h-full w-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${testimonial.image})`,
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <p className="font-bold text-white">
                          {testimonial.author}
                        </p>
                        <p className="text-sm text-neutral-400">
                          {testimonial.position}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          <div className="absolute left-0 right-0 top-1/2 flex -translate-y-1/2 justify-between px-4">
            <button
              className={`rounded-full bg-accent-500 p-2 text-white transition-opacity duration-300 ${
                currentIndex === 0
                  ? "opacity-50"
                  : "opacity-100 hover:bg-accent-600"
              }`}
              onClick={() => goToSlide(currentIndex - 1)}
              disabled={currentIndex === 0}
              aria-label="Previous testimonial"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              className={`rounded-full bg-accent-500 p-2 text-white transition-opacity duration-300 ${
                currentIndex === testimonials.length - 1
                  ? "opacity-50"
                  : "opacity-100 hover:bg-accent-600"
              }`}
              onClick={() => goToSlide(currentIndex + 1)}
              disabled={currentIndex === testimonials.length - 1}
              aria-label="Next testimonial"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Navigation dots */}
          <div className="mt-8 flex justify-center">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`mx-1 h-3 w-3 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? "bg-accent-500"
                    : "bg-neutral-600 hover:bg-neutral-400"
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
