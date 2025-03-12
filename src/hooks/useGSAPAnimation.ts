// useGsapAnimation.ts
import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

export const useGsapAnimation = (
  heroRef: React.RefObject<HTMLDivElement>,
  contentRef: React.RefObject<HTMLDivElement>,
  imagesLoaded: boolean,
  lenis: any,
) => {
  useLayoutEffect(() => {
    if (!imagesLoaded) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
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

      if (heroRef.current && lenis) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          })
          .to(contentRef.current, {
            y: 200,
            opacity: 0.5,
            ease: "none",
          });
      }
    }, heroRef);

    return () => ctx.revert();
  }, [imagesLoaded, lenis, heroRef, contentRef]);
};
