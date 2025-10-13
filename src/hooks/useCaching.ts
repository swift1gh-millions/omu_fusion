import { useEffect, useState } from "react";
import CacheService, {
  CookieService,
  UserPreferencesService,
} from "../utils/cacheService";

// Hook for managing cached images
export const useCachedImage = (
  src: string,
  priority: "low" | "medium" | "high" = "medium"
) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedSrc, setCachedSrc] = useState<string>(src);

  useEffect(() => {
    const cacheKey = `image_${src}`;

    // Check if image is already cached
    const cached = CacheService.get<{ url: string; loaded: boolean }>(cacheKey);
    if (cached && cached.loaded) {
      setCachedSrc(cached.url || src);
      setIsLoaded(true);
      return;
    }

    // Preload and cache the image
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // Cache successful load
      CacheService.cacheImage(src, priority);
      CacheService.set(
        cacheKey,
        { url: src, loaded: true },
        CacheService.CACHE_EXPIRY.IMAGES
      );

      setCachedSrc(src);
      setIsLoaded(true);
      setError(null);
    };

    img.onerror = (e) => {
      console.warn(`Failed to load image: ${src}`, e);
      setError(`Failed to load image: ${src}`);
      setIsLoaded(false);
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, priority]);

  return { isLoaded, error, cachedSrc };
};

// Hook for user preferences with caching
export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState(
    UserPreferencesService.getAllPreferences()
  );

  const updateImageQuality = (quality: "low" | "medium" | "high") => {
    UserPreferencesService.setImageQuality(quality);
    setPreferences((prev) => ({ ...prev, imageQuality: quality }));
  };

  const updateDataSaver = (enabled: boolean) => {
    UserPreferencesService.setDataSaver(enabled);
    setPreferences((prev) => ({ ...prev, dataSaver: enabled }));
  };

  const updateTheme = (theme: "light" | "dark" | "auto") => {
    UserPreferencesService.setTheme(theme);
    setPreferences((prev) => ({ ...prev, theme }));
  };

  return {
    preferences,
    updateImageQuality,
    updateDataSaver,
    updateTheme,
  };
};

// Hook for cookie consent management
export const useCookieConsent = () => {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if cookies are enabled and if user has given consent
    const cookiesEnabled = CookieService.isEnabled();
    const consent = CookieService.get("cookie_consent");

    if (consent) {
      setHasConsent(consent === "accepted");
    } else {
      setHasConsent(null); // No consent given yet
    }

    setIsLoading(false);
  }, []);

  const acceptCookies = () => {
    CookieService.set("cookie_consent", "accepted", { days: 365 });
    setHasConsent(true);
  };

  const declineCookies = () => {
    CookieService.set("cookie_consent", "declined", { days: 365 });
    setHasConsent(false);
  };

  const resetConsent = () => {
    CookieService.remove("cookie_consent");
    setHasConsent(null);
  };

  return {
    hasConsent,
    isLoading,
    acceptCookies,
    declineCookies,
    resetConsent,
  };
};

// Hook for cache management and statistics
export const useCacheManagement = () => {
  const [cacheStats, setCacheStats] = useState(CacheService.getStats());

  const updateStats = () => {
    setCacheStats(CacheService.getStats());
  };

  const clearCache = () => {
    CacheService.clear();
    // Also clear localStorage
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("omufusion_")) {
        localStorage.removeItem(key);
      }
    });
    updateStats();
  };

  const clearExpiredCache = () => {
    CacheService.cleanup();
    updateStats();
  };

  useEffect(() => {
    // Update stats on mount
    updateStats();

    // Set up periodic cache cleanup
    CacheService.startCleanup();

    // Update stats every 30 seconds
    const interval = setInterval(updateStats, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    cacheStats,
    clearCache,
    clearExpiredCache,
    updateStats,
  };
};

// Hook for performance monitoring
export const usePerformanceTracking = () => {
  const [metrics, setMetrics] = useState<{
    imageLoadTime?: number;
    cacheHitRate?: number;
    totalRequests: number;
    cachedRequests: number;
  }>({
    totalRequests: 0,
    cachedRequests: 0,
  });

  const trackImageLoad = (
    url: string,
    loadTime: number,
    fromCache: boolean
  ) => {
    setMetrics((prev) => ({
      ...prev,
      totalRequests: prev.totalRequests + 1,
      cachedRequests: fromCache ? prev.cachedRequests + 1 : prev.cachedRequests,
      imageLoadTime: loadTime,
      cacheHitRate:
        ((fromCache ? prev.cachedRequests + 1 : prev.cachedRequests) /
          (prev.totalRequests + 1)) *
        100,
    }));

    // Store metrics in cache for persistence
    CacheService.setPersistent(
      "performance_metrics",
      metrics,
      CacheService.CACHE_EXPIRY.DATA
    );
  };

  const resetMetrics = () => {
    const initialMetrics = {
      totalRequests: 0,
      cachedRequests: 0,
    };
    setMetrics(initialMetrics);
    CacheService.setPersistent(
      "performance_metrics",
      initialMetrics,
      CacheService.CACHE_EXPIRY.DATA
    );
  };

  useEffect(() => {
    // Load persisted metrics on mount
    const savedMetrics = CacheService.getPersistent("performance_metrics");
    if (savedMetrics) {
      setMetrics(savedMetrics);
    }
  }, []);

  return {
    metrics,
    trackImageLoad,
    resetMetrics,
  };
};
