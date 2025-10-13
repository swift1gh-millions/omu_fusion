import { useEffect } from "react";
import { usePreloadLinks } from "../hooks/useImagePreloading";

// Import hero images directly to get the resolved URLs
import bg1 from "../assets/bg1.jpg";
import logoWhite from "../assets/logo_white.png";
import logoBlack from "../assets/logo_black.png";

// Critical resources that should be preloaded
const CRITICAL_RESOURCES = {
  // Hero section backgrounds (first image is critical)
  heroImages: [bg1], // Only preload the first hero image for immediate display

  // Logo images
  logos: [logoWhite, logoBlack],

  // Critical CSS for above-the-fold content
  criticalStyles: [
    // Add any critical CSS files if they're separate
  ],
};

export const PerformanceOptimizer: React.FC = () => {
  const { addPreloadLinks } = usePreloadLinks();

  useEffect(() => {
    // Preload critical resources immediately with highest priority
    const preloadLinks = [
      // Preload hero background images with highest priority
      ...CRITICAL_RESOURCES.heroImages.map((href) => ({
        href,
        as: "image" as const,
        type: "image/jpeg",
        crossOrigin: "anonymous" as const,
      })),

      // Preload logo images with highest priority
      ...CRITICAL_RESOURCES.logos.map((href) => ({
        href,
        as: "image" as const,
        type: "image/png",
        crossOrigin: "anonymous" as const,
      })),
    ];

    // Add preload links immediately
    addPreloadLinks(preloadLinks);

    // Also preload images programmatically for immediate availability
    [...CRITICAL_RESOURCES.heroImages, ...CRITICAL_RESOURCES.logos].forEach(
      (src) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
      }
    );

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
