import { useCallback, useMemo, useRef, useState, useEffect } from "react";

// Performance-optimized debounce hook
export const useDebounce = (
  callback: (...args: any[]) => void,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );
};

// Debounce hook for values
export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for performance-critical operations
export const useThrottle = (
  callback: (...args: any[]) => void,
  delay: number
) => {
  const lastRan = useRef<number>(0);

  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      if (now - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = now;
      }
    },
    [callback, delay]
  );
};

// Memoized animation variants to prevent re-creation
export const useAnimationVariants = () => {
  return useMemo(
    () => ({
      containerVariants: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
          },
        },
      },
      itemVariants: {
        hidden: {
          y: 20,
          opacity: 0,
          scale: 0.95,
        },
        visible: {
          y: 0,
          opacity: 1,
          scale: 1,
          transition: {
            duration: 0.4,
            ease: "easeOut" as const,
          },
        },
      },
      fadeInUp: {
        hidden: { y: 30, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: {
            duration: 0.6,
            ease: "easeOut" as const,
          },
        },
      },
      staggerContainer: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.15,
          },
        },
      },
    }),
    []
  );
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  const targetRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const observe = useCallback(() => {
    if (targetRef.current && !observerRef.current) {
      observerRef.current = new IntersectionObserver(callback, {
        threshold: 0.1,
        rootMargin: "50px",
        ...options,
      });
      observerRef.current.observe(targetRef.current);
    }
  }, [callback, options]);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  return { targetRef, observe, disconnect };
};

// Optimized scroll handler
export const useOptimizedScroll = (callback: (scrollY: number) => void) => {
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        callback(window.scrollY);
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, [callback]);

  return handleScroll;
};
