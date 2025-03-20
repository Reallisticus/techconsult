// src/lib/gsap-utils.ts
import { useEffect, useRef } from "react";

/**
 * Safely registers GSAP plugins on the client side
 */
export const initGSAP = () => {
  if (typeof window !== "undefined") {
    // Using dynamic imports to prevent server-side errors
    import("gsap").then(({ gsap }) => {
      import("gsap/dist/ScrollTrigger").then(({ ScrollTrigger }) => {
        // Register the plugin
        gsap.registerPlugin(ScrollTrigger);
      });

      // Register any other plugins here
      try {
        import("gsap-trial/SplitText")
          .then(({ SplitText }) => {
            gsap.registerPlugin(SplitText);
          })
          .catch(() => {
            // SplitText might not be available if using standard GSAP
            console.info(
              "SplitText plugin not available, using standard animations",
            );
          });
      } catch (e) {
        console.info(
          "SplitText plugin not available, using standard animations",
        );
      }
    });
  }
};

/**
 * Hook to safely use GSAP in components
 */
export function useGSAP(
  callback: (gsap: any) => void | (() => void),
  deps: any[] = [],
) {
  // Keep track of cleanup function
  const cleanup = useRef<(() => void) | void>();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Use dynamic import to get GSAP
    const execute = async () => {
      try {
        const { gsap } = await import("gsap");

        // Execute callback with GSAP instance
        cleanup.current = callback(gsap);
      } catch (err) {
        console.error("Failed to load GSAP:", err);
      }
    };

    execute();

    // Cleanup function
    return () => {
      if (cleanup.current) {
        cleanup.current();
      }
    };
  }, deps);
}

/**
 * Ensures elements are available before running GSAP animations
 * @param selector CSS selector or element
 * @param maxAttempts Maximum number of attempts to find the element
 * @param interval Interval between attempts in ms
 */
export function waitForElement(
  selector: string | Element,
  maxAttempts: number = 10,
  interval: number = 50,
): Promise<Element | null> {
  return new Promise((resolve) => {
    if (typeof selector !== "string") {
      resolve(selector); // Already an element
      return;
    }

    let attempts = 0;

    const check = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      attempts++;
      if (attempts >= maxAttempts) {
        console.warn(
          `Element "${selector}" not found after ${maxAttempts} attempts`,
        );
        resolve(null);
        return;
      }

      setTimeout(check, interval);
    };

    check();
  });
}
