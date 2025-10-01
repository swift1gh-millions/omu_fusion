import { useEffect, useState, useCallback } from "react";

interface UseThrottledScrollOptions {
  delay?: number;
  passive?: boolean;
}

export const useThrottledScroll = (options: UseThrottledScrollOptions = {}) => {
  const { delay = 16, passive = true } = options; // 16ms ≈ 60fps
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  useEffect(() => {
    let ticking = false;

    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive });

    return () => {
      window.removeEventListener("scroll", throttledScroll);
    };
  }, [handleScroll, passive]);

  return scrollY;
};

// Hook for debounced values (useful for search inputs)
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
