import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { SplitText } from "../ui/SplitText";
import { useImagePreloader } from "../ui/ProgressiveImage";

// Import background images
import bg1 from "../../assets/bg1.jpg";
import bg2 from "../../assets/bg2.jpg";
import bg3 from "../../assets/bg3.jpg";

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { preloadImages } = useImagePreloader();
  const [scrollY, setScrollY] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([
    false,
    false,
    false,
  ]);
  const [slideshowStarted, setSlideshowStarted] = useState(false);
  const [titleAnimationComplete, setTitleAnimationComplete] = useState(false);
  const [preloadComplete, setPreloadComplete] = useState(false);

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

  // Immediate hero image display and background preloading
  useEffect(() => {
    // Start slideshow immediately - don't wait for preloading
    setSlideshowStarted(true);
    setImagesLoaded([true, true, true]);
    setPreloadComplete(true);

    // Preload remaining images in background (non-blocking)
    const preloadRemainingImages = async () => {
      try {
        const remainingImages = backgroundImages.slice(1).map((img) => img.src);
        await preloadImages(remainingImages);
        console.log("Hero images preloaded successfully");
      } catch (error) {
        console.warn("Background preloading failed (non-critical):", error);
      }
    };

    // Use setTimeout to ensure this doesn't block initial render
    const timer = setTimeout(() => {
      preloadRemainingImages();
    }, 100);

    return () => clearTimeout(timer);
  }, [backgroundImages, preloadImages]);
  return (
    <section className="hero-container relative min-h-screen bg-gradient-to-br from-gray-900 to-black overflow-hidden">
      {/* Immediate Background - shows instantly */}
      <div
        className="hero-background-immediate absolute inset-0"
        style={{
          filter: "grayscale(20%) contrast(1.2) brightness(0.9)",
        }}
      />

      {/* Slideshow Background - animated layers */}
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

      {/* Content Overlay - Positioned at bottom */}
      <div className="relative z-10 min-h-screen flex items-end justify-center px-4 sm:px-6 lg:px-8 pb-28 sm:pb-32 lg:pb-36">
        <motion.div
          className="text-center text-white max-w-xs sm:max-w-lg lg:max-w-2xl w-full"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}>
          {/* Main Title */}
          <SplitText
            text="Omu Fusion"
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-wide mb-8 leading-tight font-handwritten cursor-default select-none"
            delay={80}
            duration={0.8}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            textAlign="center"
            onLetterAnimationComplete={() => {
              setTitleAnimationComplete(true);
            }}
          />

          {/* CTA Button */}
          <motion.button
            className="btn-glass text-white px-8 py-4 text-sm font-medium tracking-wider hover:bg-white hover:text-black transition-all duration-300 rounded-2xl backdrop-blur-md touch-manipulation min-h-[48px]"
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onClick={() => navigate("/shop")}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
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
