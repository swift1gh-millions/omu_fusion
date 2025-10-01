import { useMemo } from "react";

// Hook for respecting user's motion preferences
export const useReducedMotion = () => {
  return useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
};

// Enhanced animation variants with reduced motion support
export const useAccessibleAnimations = () => {
  const prefersReducedMotion = useReducedMotion();

  return useMemo(() => {
    const baseTransition = {
      duration: prefersReducedMotion ? 0.2 : 0.6,
      ease: "easeOut" as const,
    };

    const springTransition = {
      type: "spring",
      damping: prefersReducedMotion ? 40 : 25,
      stiffness: prefersReducedMotion ? 400 : 200,
    };

    return {
      fadeIn: {
        hidden: {
          opacity: 0,
          y: prefersReducedMotion ? 0 : 20,
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: baseTransition,
        },
      },
      slideUp: {
        hidden: {
          opacity: 0,
          y: prefersReducedMotion ? 0 : 30,
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: baseTransition,
        },
      },
      scaleIn: {
        hidden: {
          opacity: 0,
          scale: prefersReducedMotion ? 1 : 0.95,
        },
        visible: {
          opacity: 1,
          scale: 1,
          transition: springTransition,
        },
      },
      staggerContainer: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: prefersReducedMotion ? 0.05 : 0.15,
            delayChildren: prefersReducedMotion ? 0.05 : 0.1,
          },
        },
      },
      button: {
        rest: { scale: 1 },
        hover: {
          scale: prefersReducedMotion ? 1 : 1.05,
          transition: {
            type: "spring" as const,
            damping: prefersReducedMotion ? 40 : 25,
            stiffness: prefersReducedMotion ? 400 : 200,
          },
        },
        tap: {
          scale: prefersReducedMotion ? 1 : 0.95,
          transition: { duration: 0.1 },
        },
      },
    };
  }, [prefersReducedMotion]);
};

// Performance optimized scroll animations
export const useScrollAnimations = () => {
  const prefersReducedMotion = useReducedMotion();

  return useMemo(
    () => ({
      viewport: {
        once: true,
        margin: "-50px",
        amount: prefersReducedMotion ? 0.1 : 0.3,
      },
      transition: {
        duration: prefersReducedMotion ? 0.2 : 0.6,
        ease: [0.23, 1, 0.32, 1],
      },
    }),
    [prefersReducedMotion]
  );
};
