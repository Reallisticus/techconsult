// src/hooks/useAnimation.ts
import { useInView } from "framer-motion";
import { useRef, RefObject } from "react";

type AnimationVariants = {
  hidden: object;
  visible: object;
};

type AnimationOptions = {
  threshold?: number;
  once?: boolean;
  delay?: number;
};

export const animations = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 75 },
    visible: { opacity: 1, y: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -75 },
    visible: { opacity: 1, x: 0 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 75 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  bounce: {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  },
  stagger: (delay: number = 0.1) => ({
    visible: {
      transition: {
        staggerChildren: delay,
      },
    },
  }),
};

export function useAnimationInView<T extends HTMLElement = HTMLDivElement>(
  animation: keyof typeof animations | AnimationVariants,
  options: AnimationOptions = {},
): [RefObject<T>, boolean, object, object] {
  const { threshold = 0.1, once = true, delay = 0 } = options;
  const ref = useRef<T>(null);
  const isInView = useInView(ref, { amount: threshold, once });

  const selectedAnimation =
    typeof animation === "string" ? animations[animation] : animation;

  const transitions = {
    transition: {
      duration: 0.5,
      delay,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  };

  const isFunction = (
    anim: any,
  ): anim is (delay?: number) => { visible: object } =>
    typeof anim === "function";

  const hiddenState = isFunction(selectedAnimation)
    ? {}
    : selectedAnimation.hidden;

  const visibleState = isFunction(selectedAnimation)
    ? selectedAnimation(delay).visible
    : { ...selectedAnimation.visible, ...transitions };

  return [ref, isInView, hiddenState, visibleState];
}
