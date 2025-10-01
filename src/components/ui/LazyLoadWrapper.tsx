import React, { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useIntersectionObserver } from "../../hooks/usePerformance";

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = memo(
  ({
    children,
    fallback = (
      <div className="min-h-[200px] animate-pulse bg-gray-200 rounded-lg" />
    ),
    className = "",
    threshold = 0.1,
    rootMargin = "50px",
    once = true,
  }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    const { targetRef, observe, disconnect } = useIntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              setHasLoaded(true);
              disconnect();
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    useEffect(() => {
      observe();
      return () => disconnect();
    }, [observe, disconnect]);

    const shouldRender = isVisible || hasLoaded;

    return (
      <div
        ref={targetRef as React.RefObject<HTMLDivElement>}
        className={className}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: shouldRender ? 1 : 0,
            y: shouldRender ? 0 : 20,
          }}
          transition={{
            duration: 0.4,
            ease: [0.23, 1, 0.32, 1],
          }}>
          {shouldRender ? children : fallback}
        </motion.div>
      </div>
    );
  }
);

LazyLoadWrapper.displayName = "LazyLoadWrapper";

export { LazyLoadWrapper };
