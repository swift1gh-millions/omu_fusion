import { useEffect } from "react";
import { usePreloadLinks } from "../hooks/useImagePreloading";

// Critical resources that should be preloaded
const CRITICAL_RESOURCES = {
  // Hero section backgrounds (first image is critical)
  heroImages: [
    // These will be dynamically imported from the hero component
  ],

  // Logo images
  logos: ["/src/assets/logo_white.png", "/src/assets/logo_black.png"],

  // Critical CSS for above-the-fold content
  criticalStyles: [
    // Add any critical CSS files if they're separate
  ],
};

export const PerformanceOptimizer: React.FC = () => {
  const { addPreloadLinks } = usePreloadLinks();

  useEffect(() => {
    // Preload critical resources
    const preloadLinks = [
      // Preload hero background images
      ...CRITICAL_RESOURCES.heroImages.map((href) => ({
        href,
        as: "image" as const,
        type: "image/jpeg",
      })),

      // Preload logo images
      ...CRITICAL_RESOURCES.logos.map((href) => ({
        href,
        as: "image" as const,
        type: "image/png",
      })),
    ];

    addPreloadLinks(preloadLinks);

    // Add performance observer for monitoring
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (
            entry.entryType === "resource" &&
            (entry.name.includes(".jpg") ||
              entry.name.includes(".png") ||
              entry.name.includes(".webp"))
          ) {
            console.log(
              `Image loaded: ${entry.name} in ${entry.duration.toFixed(2)}ms`
            );
          }
        });
      });

      observer.observe({ entryTypes: ["resource"] });

      return () => observer.disconnect();
    }
  }, [addPreloadLinks]);

  return null;
};

// Service Worker registration for caching
export const registerServiceWorker = () => {
  if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    });
  }
};

// Preconnect to external domains for faster loading
export const addPreconnects = () => {
  const preconnectDomains = [
    "https://images.unsplash.com",
    "https://api.dicebear.com",
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
  ];

  preconnectDomains.forEach((domain) => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = domain;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });
};
