To implement the smooth scrolling provider in your project, follow these steps:

1. First, make sure to update your `src/app/layout.tsx` file to use the `SmoothScrollProvider`:

```typescript
// Import the SmoothScrollProvider
import { SmoothScrollProvider } from "~/components/providers/smooth-scroll-provider";

// In your RootLayout component, wrap your application with the SmoothScrollProvider
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* ... existing head content ... */}
      </head>
      <body className="overflow-x-hidden text-white">
        <LanguageProvider defaultLanguage="en">
          <FontManager>
            <MotionConfig reducedMotion="user">
              <SmoothScrollProvider
                options={{
                  duration: 1.2,
                  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                  wheelMultiplier: 1,
                  touchMultiplier: 2,
                  smoothWheel: true,
                  smoothTouch: false,
                }}
              >
                <BackgroundProvider>
                  <Navbar />
                  <main className="relative z-10">
                    <TRPCReactProvider>{children}</TRPCReactProvider>
                  </main>
                  <Footer />
                </BackgroundProvider>
              </SmoothScrollProvider>
            </MotionConfig>
          </FontManager>
        </LanguageProvider>
      </body>
    </html>
  );
}
```

2. In any components where you want to use the smooth scrolling features, you can:

   a. Use the `useSmoothScroll` hook to access the Lenis instance and scroll state:

   ```typescript
   import { useSmoothScroll } from "~/components/providers/smooth-scroll-provider";

   function MyComponent() {
     const { lenis, scroll, scrollTo } = useSmoothScroll();

     // You can programmatically scroll to elements
     const handleClick = () => {
       scrollTo("#section-id");
     };

     // Or use the scroll state for animations
     useEffect(() => {
       console.log("Current scroll position:", scroll.current);
       console.log("Scroll direction:", scroll.direction);
     }, [scroll]);

     return <div>...</div>;
   }
   ```

   b. Use the `Parallax` component for parallax effects:

   ```typescript
   import { Parallax } from "~/components/providers/smooth-scroll-provider";

   function MyComponent() {
     return (
       <div>
         <Parallax
           speed={0.5}
           direction="up"
           className="your-class-here"
         >
           This content will move with a parallax effect!
         </Parallax>
       </div>
     );
   }
   ```

   c. Use the `ScrollReveal` component for scroll-triggered animations:

   ```typescript
   import { ScrollReveal } from "~/components/providers/smooth-scroll-provider";

   function MyComponent() {
     return (
       <ScrollReveal
         direction="up"
         delay={0.2}
         threshold={0.3}
       >
         This content will animate in when scrolled into view!
       </ScrollReveal>
     );
   }
   ```

3. For GSAP animations that need to be synchronized with the smooth scrolling:

```typescript
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useSmoothScroll } from "~/components/providers/smooth-scroll-provider";

function MyComponent() {
  const elementRef = useRef(null);
  const { lenis } = useSmoothScroll();

  useEffect(() => {
    if (!elementRef.current || !lenis) return;

    gsap.registerPlugin(ScrollTrigger);

    // Create GSAP animations with ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: elementRef.current,
        start: "top center",
        end: "bottom center",
        scrub: true,
      }
    });

    tl.to(elementRef.current, {
      y: 100,
      opacity: 0.5,
      duration: 1
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [lenis]);

  return <div ref={elementRef}>...</div>;
}
```

The smooth scrolling provider ensures that ScrollTrigger and Lenis work together correctly to create smooth, synchronized animations.
