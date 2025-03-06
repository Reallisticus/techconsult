"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Magnetic } from "~/components/ui/magnetic";

export const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const transitionRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // GSAP ScrollTrigger for animations
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Only run animations once images are loaded
    if (!imagesLoaded) return;

    const ctx = gsap.context(() => {
      // Image parallax and reveal effect
      gsap.fromTo(
        imageContainerRef.current,
        { scale: 1.2, filter: "brightness(0.5)" },
        {
          scale: 1,
          filter: "brightness(1)",
          duration: 1.5,
          ease: "power2.out",
        },
      );

      // Content reveal using gsap.utils.toArray for proper element typing
      const animateItems = gsap.utils.toArray(
        contentRef.current?.querySelectorAll(".animate-item") || [],
      );
      gsap.fromTo(
        animateItems,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.3,
        },
      );

      // Scroll-based transition animation
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "80% center",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          // Clip-path transition effect
          if (transitionRef.current) {
            const progress = self.progress;
            const clipValue = `polygon(0% 0%, 100% 0%, 100% ${100 - progress * 100}%, 0% ${100 - progress * 100 + 5}%)`;
            transitionRef.current.style.clipPath = clipValue;
          }

          // Parallax content movement
          if (contentRef.current) {
            contentRef.current.style.transform = `translateY(${self.progress * -50}px)`;
            contentRef.current.style.opacity = `${1 - self.progress * 1.5}`;
          }
        },
      });
    });

    return () => ctx.revert();
  }, [imagesLoaded]);

  // Handle image loading using the native Image via window.Image
  useEffect(() => {
    const img: HTMLImageElement = new window.Image();
    img.src = "/images/heroHome.jpg";
    img.onload = () => setImagesLoaded(true);
  }, []);

  return (
    <div ref={heroRef} className="relative">
      {/* Main Hero Section */}
      <section
        ref={transitionRef}
        className="relative min-h-screen w-full overflow-hidden"
      >
        {/* Background Image */}
        <div
          ref={imageContainerRef}
          className="absolute inset-0 z-0 h-full w-full transition-transform duration-700"
        >
          <Image
            src="/images/heroHome.jpg"
            alt="Hero Background"
            fill
            priority
            quality={95}
            className="object-cover"
          />
          {/* Overlay gradient */}
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-neutral-950"
          />
        </div>

        {/* Content Container */}
        <div
          ref={contentRef}
          className="container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-24"
        >
          <div className="max-w-5xl text-center">
            {/* Hero Headline */}
            <h1 className="animate-item font-display mb-6 text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
              <span className="block bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                TECHNOLOGY
              </span>
              <span className="block bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                SOLUTIONS FOR
              </span>
              <span className="block bg-gradient-to-r from-white via-[#DB4AEE]/90 to-white/70 bg-clip-text text-transparent">
                TOMORROW'S
              </span>
              <span className="block bg-gradient-to-r from-[#DB4AEE]/90 via-white/90 to-white/70 bg-clip-text text-transparent">
                CHALLENGES
              </span>
            </h1>

            {/* Subheading */}
            <p className="animate-item mx-auto mb-10 max-w-2xl text-xl text-white/80 md:text-2xl">
              We turn complex business problems into elegant technology
              solutions that drive growth and innovation.
            </p>

            {/* CTA Buttons */}
            <div className="animate-item mb-16 flex flex-wrap justify-center gap-6">
              <Magnetic strength={40}>
                <Link
                  href="/contact"
                  className="group relative rounded-full bg-[#C026D3] px-8 py-4 text-lg font-medium transition-all duration-300 hover:bg-[#DB4AEE] hover:shadow-[0_0_20px_rgba(192,38,211,0.4)]"
                >
                  <span className="relative z-[2]">Start a Project</span>
                  <span className="absolute inset-0 z-[1] rounded-full bg-white/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"></span>
                </Link>
              </Magnetic>

              <Magnetic strength={20}>
                <Link
                  href="/services"
                  className="group relative rounded-full border border-white/30 px-8 py-4 text-lg font-medium backdrop-blur-sm transition-all duration-300 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <span className="relative z-[2]">Explore Services</span>
                  <span className="absolute inset-0 z-[1] rounded-full bg-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                </Link>
              </Magnetic>
            </div>

            {/* Scroll Indicator */}
            {/* <motion.div
              className="animate-item absolute bottom-72 left-1/2 -translate-x-1/2 transform cursor-pointer"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5V19M12 19L19 12M12 19L5 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div> */}
          </div>
        </div>

        {/* Custom transition element to next section */}
        <div className="absolute bottom-0 left-0 z-20 h-[250px] w-full">
          <svg
            className="h-full w-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,100 L0,50 Q50,0 100,50 L100,100 L0,100 Z"
              fill="#0a0a0a"
              className="transition-all duration-1000"
            />
            <path
              d="M0,100 L0,60 Q50,20 100,60 L100,100 L0,100 Z"
              fill="#0a0a0a"
              opacity="0.7"
              className="transition-all duration-1000"
            />
          </svg>

          {/* Animated particles at the transition boundary */}
          <div className="absolute bottom-[30%] left-0 h-[1px] w-full overflow-hidden">
            <div className="absolute inset-0 flex">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="relative h-[1px] flex-1">
                  <motion.div
                    className="absolute h-1 w-1 rounded-full bg-[#C026D3]"
                    style={{ left: `${5 + i * 5}%` }}
                    animate={{ opacity: [0, 1, 0], y: [-10, 10], x: [-20, 20] }}
                    transition={{
                      duration: 3,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
