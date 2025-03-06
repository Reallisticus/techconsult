// src/components/ui/reveal-text.tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

type RevealTextProps = {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
};

export const RevealText = ({
  text,
  className,
  delay = 0,
  duration = 0.5,
}: RevealTextProps) => {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay * i },
    }),
  };

  const child = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration,
      },
    },
  };

  return (
    <motion.span
      className={cn("inline-block", className)}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, idx) => (
        <motion.span key={idx} className="mr-1 inline-block" variants={child}>
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};
