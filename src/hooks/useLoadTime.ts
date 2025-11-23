// Hook to measure load times for performance monitoring

import { useState } from "react";

export const useLoadTime = () => {
  const [startTime] = useState(Date.now());
  const [loadTime, setLoadTime] = useState<number | null>(null);

  const markComplete = () => {
    if (!loadTime) {
      setLoadTime(Date.now() - startTime);
    }
  };

  return { loadTime, markComplete };
};
