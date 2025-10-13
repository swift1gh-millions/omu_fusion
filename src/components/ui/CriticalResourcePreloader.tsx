import React, { useEffect } from "react";
import bg1 from "../../assets/bg1.jpg";
import logoWhite from "../../assets/logo_white.png";
import logoBlack from "../../assets/logo_black.png";

// Critical Resource Preloader - runs before React hydration
export const CriticalResourcePreloader: React.FC = () => {
  useEffect(() => {
    // This runs immediately when the component mounts
    // Create immediate preload links in the document head
    const criticalImages = [
      { href: bg1, as: "image", type: "image/jpeg" },
      { href: logoWhite, as: "image", type: "image/png" },
      { href: logoBlack, as: "image", type: "image/png" },
    ];

    criticalImages.forEach(({ href, as, type }) => {
      // Check if preload link already exists
      const existingLink = document.querySelector(`link[href="${href}"]`);
      if (!existingLink) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = as;
        link.href = href;
        link.type = type;
        link.crossOrigin = "anonymous";
        // @ts-ignore - fetchPriority is not in TypeScript yet
        link.fetchPriority = "high";

        // Insert at the beginning of head for highest priority
        document.head.insertBefore(link, document.head.firstChild);
      }
    });

    // Also start loading the images immediately in JavaScript
    const imagePromises = criticalImages.map(({ href }) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Resolve even on error to not block
        img.crossOrigin = "anonymous";
        img.src = href;
      });
    });

    // Log when critical images are loaded
    Promise.all(imagePromises).then(() => {
      console.log("✅ Critical images preloaded");
    });
  }, []);

  return null; // This component doesn't render anything
};

// CSS to ensure hero section has immediate background
export const CriticalCSS = () => {
  const criticalStyles = `
    /* Critical styles for immediate hero display */
    .hero-background-immediate {
      background-image: url(${bg1});
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    
    /* Logo immediate loading */
    .logo-preload {
      content: url(${logoWhite}) url(${logoBlack});
      display: none;
    }
    
    /* Prevent layout shift during image loading */
    .hero-container {
      min-height: 100vh;
      position: relative;
    }
  `;

  return (
    <style
      dangerouslySetInnerHTML={{ __html: criticalStyles }}
      data-critical="true"
    />
  );
};
