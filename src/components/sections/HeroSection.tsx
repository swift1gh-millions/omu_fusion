import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import background images
import bg1 from "../../assets/bg1.jpg";
import bg2 from "../../assets/bg2.jpg";
import bg3 from "../../assets/bg3.jpg";

export const HeroSection: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([
    false,
    false,
    false,
  ]);
  const [slideshowStarted, setSlideshowStarted] = useState(false);

  // Memoized background images array
  const backgroundImages = useMemo(
    () => [
      { src: bg1, alt: "Collection 1" },
      { src: bg2, alt: "Collection 2" },
      { src: bg3, alt: "Collection 3" },
    ],
    []
  );

  // Initialize slideshow immediately
  useEffect(() => {
    const initTimer = setTimeout(() => {
      setSlideshowStarted(true);
    }, 500);

    return () => clearTimeout(initTimer);
  }, []);

  // Throttled scroll handler for better performance
  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
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

    // Use passive listener for better performance
    window.addEventListener("scroll", throttledScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", throttledScroll);
    };
  }, [handleScroll]);

  // Continuous slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % backgroundImages.length
      );
      setProgressKey((prev) => prev + 1);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Preload images for smooth transitions
  useEffect(() => {
    // Start slideshow immediately, don't wait for preloading
    const startTimer = setTimeout(() => {
      setImagesLoaded([true, true, true]); // Force enable slideshow
    }, 1000);

    backgroundImages.forEach((image, index) => {
      const img = new Image();
      img.onload = () => {
        setImagesLoaded((prev) => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
      };
      img.onerror = (error) => {
        // Even if image fails to load, mark as loaded to continue slideshow
        setImagesLoaded((prev) => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
      };
      img.src = image.src;
    });

    return () => clearTimeout(startTimer);
  }, [backgroundImages]);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-900 to-black overflow-hidden">
      {/* Slideshow Background */}
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{
              opacity: index === currentImageIndex ? 1 : 0,
              scale: index === currentImageIndex ? 1 : 1.02,
            }}
            transition={{
              opacity: { duration: 2.0, ease: "easeInOut" },
              scale: { duration: 20, ease: "linear" },
            }}>
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${image.src})`,
                transform: `translate3d(0, ${scrollY * 0.05}px, 0)`,
                filter: "grayscale(20%) contrast(1.2) brightness(0.9)",
                willChange: "transform",
              }}
            />
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10"></div>
      </div>

      {/* Content Overlay - Better mobile positioning */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center text-white max-w-xs sm:max-w-lg lg:max-w-2xl w-full"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}>
          {/* Main Title */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-wide mb-6 sm:mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}>
            PEAK SUMMER '25
          </motion.h1>

          {/* CTA Button */}
          <motion.button
            className="liquid-glass border border-white/30 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm font-medium tracking-wide hover:bg-white hover:text-black transition-all duration-300 rounded-full backdrop-blur-md touch-manipulation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}>
            SHOP NOW →
          </motion.button>
        </motion.div>
      </div>

      {/* Slideshow Navigation Indicators - Mobile optimized */}
      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 right-4 sm:right-6 lg:right-8 z-20">
        <motion.div
          className="flex flex-col space-y-1.5 sm:space-y-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1 }}>
          {backgroundImages.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setCurrentImageIndex(index);
                setProgressKey((prev) => prev + 1); // Reset progress bar
              }}
              className={`w-1.5 sm:w-2 h-6 sm:h-8 rounded-full transition-all duration-300 touch-manipulation ${
                index === currentImageIndex
                  ? "bg-white shadow-lg"
                  : "bg-white/40 hover:bg-white/60"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
