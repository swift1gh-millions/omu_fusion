import { useEffect } from "react";

interface PreloadLinkOptions {
  href: string;
  as?: string;
  type?: string;
  media?: string;
  crossOrigin?: string;
}

// Hook to add preload links to document head
export const usePreloadLinks = () => {
  const addPreloadLink = (options: PreloadLinkOptions) => {
    // Check if link already exists
    const existingLink = document.querySelector(`link[href="${options.href}"]`);
    if (existingLink) return;

    const link = document.createElement("link");
    link.rel = "preload";
    link.href = options.href;

    if (options.as) link.as = options.as;
    if (options.type) link.type = options.type;
    if (options.media) link.media = options.media;
    if (options.crossOrigin) link.crossOrigin = options.crossOrigin;

    document.head.appendChild(link);
  };

  const addPreloadLinks = (links: PreloadLinkOptions[]) => {
    links.forEach(addPreloadLink);
  };

  return { addPreloadLink, addPreloadLinks };
};

// Hook to preload critical resources
export const useCriticalResourcePreloader = () => {
  const { addPreloadLinks } = usePreloadLinks();

  useEffect(() => {
    // Preload critical CSS and fonts
    const criticalResources: PreloadLinkOptions[] = [
      // Web fonts (if you're using any)
      // { href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
      // Critical images that appear above the fold
      // These will be added dynamically based on the specific page/component
    ];

    addPreloadLinks(criticalResources);
  }, [addPreloadLinks]);
};

// Utility to generate different image sizes for responsive loading
export const generateResponsiveImageUrls = (
  baseUrl: string,
  sizes: number[] = [400, 800, 1200, 1600]
) => {
  // For external URLs (like Unsplash), we can add size parameters
  if (baseUrl.includes("unsplash.com")) {
    return sizes.map((size) => `${baseUrl}&w=${size}&q=80`);
  }

  // For other external URLs, return as-is (you might want to use a service like Cloudinary)
  return [baseUrl];
};

// Intersection Observer based image preloader
export const useIntersectionPreloader = () => {
  const preloadOnIntersection = (
    element: HTMLElement,
    imageUrls: string[],
    options: IntersectionObserverInit = { rootMargin: "100px" }
  ) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          imageUrls.forEach((url) => {
            const img = new Image();
            img.src = url;
          });
          observer.unobserve(element);
        }
      });
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  };

  return { preloadOnIntersection };
};

// Performance monitoring for image loading
export const useImagePerformanceMonitor = () => {
  const measureImageLoadTime = (imageUrl: string) => {
    const startTime = performance.now();

    return new Promise<number>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const loadTime = performance.now() - startTime;
        console.log(`Image loaded in ${loadTime.toFixed(2)}ms:`, imageUrl);
        resolve(loadTime);
      };
      img.onerror = () => {
        const errorTime = performance.now() - startTime;
        console.warn(
          `Image failed to load after ${errorTime.toFixed(2)}ms:`,
          imageUrl
        );
        resolve(errorTime);
      };
      img.src = imageUrl;
    });
  };

  return { measureImageLoadTime };
};
