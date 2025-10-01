import React from "react";
import { motion, Variants } from "framer-motion";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: "chars" | "words";
  from?: { opacity: number; y: number };
  to?: { opacity: number; y: number };
  threshold?: number;
  rootMargin?: string;
  textAlign?: "left" | "center" | "right";
  onLetterAnimationComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = "",
  delay = 100,
  duration = 0.6,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  onLetterAnimationComplete,
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delay / 1000,
        delayChildren: 0.5, // Start after hero background loads
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: from.opacity,
      y: from.y,
      scale: 0.8,
      rotateX: -90,
    },
    visible: {
      opacity: to.opacity,
      y: to.y,
      scale: 1,
      rotateX: 0,
      transition: {
        duration,
        ease: [0.215, 0.61, 0.355, 1.0], // Power3.out cubic-bezier
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const getTextElements = () => {
    if (splitType === "words") {
      return text.split(" ").map((word, wordIndex) => (
        <motion.span
          key={`word-${wordIndex}`}
          variants={itemVariants}
          className="inline-block"
          style={{ marginRight: "0.25em" }}
          onAnimationComplete={
            wordIndex === text.split(" ").length - 1
              ? onLetterAnimationComplete
              : undefined
          }>
          {word}
        </motion.span>
      ));
    }

    // Split by characters
    return text.split("").map((char, charIndex) => (
      <motion.span
        key={`char-${charIndex}`}
        variants={itemVariants}
        className="inline-block origin-bottom"
        style={{
          marginRight: char === " " ? "0.25em" : "0",
          transformStyle: "preserve-3d",
        }}
        whileHover={{
          scale: 1.1,
          y: -5,
          transition: { duration: 0.2 },
        }}
        onAnimationComplete={
          charIndex === text.length - 1 ? onLetterAnimationComplete : undefined
        }>
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ));
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ textAlign: textAlign as any }}>
      {getTextElements()}
    </motion.div>
  );
};
