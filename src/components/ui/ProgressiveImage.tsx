import React, { useState, useEffect, useRef, memo } from "react";
import { motion } from "framer-motion";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  lowQualitySrc?: string;
  blurAmount?: number;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
}

// Generate a tiny blur placeholder
const generateBlurPlaceholder = (width: number = 40, height: number = 40) => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect x="0" y="0" width="100%" height="40%" fill="#e5e7eb" opacity="0.5"/>
      <rect x="0" y="60%" width="100%" height="40%" fill="#d1d5db" opacity="0.3"/>
    </svg>
  `)}`;
};

export const ProgressiveImage: React.FC<ProgressiveImageProps> = memo(
  ({
    src,
    alt,
    className = "",
    placeholderSrc,
    lowQualitySrc,
    blurAmount = 10,
    onLoad,
    onError,
    priority = false,
    sizes,
    width,
    height,
  }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLowQualityLoaded, setIsLowQualityLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
      if (priority) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        {
          rootMargin: "50px 0px", // Start loading 50px before entering viewport
          threshold: 0.1,
        }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => observer.disconnect();
    }, [priority]);

    const handleMainImageLoad = () => {
      setIsLoaded(true);
      onLoad?.();
    };

    const handleError = () => {
      setHasError(true);
      onError?.();
    };

    const handleLowQualityLoad = () => {
      setIsLowQualityLoaded(true);
    };

    // Generate responsive srcSet if width/height provided
    const generateSrcSet = (baseSrc: string) => {
      if (!width || !height) return undefined;

      const sizes = [0.5, 0.75, 1, 1.5, 2];
      return sizes
        .map((size) => {
          const scaledWidth = Math.round(width * size);
          const scaledHeight = Math.round(height * size);
          // For external URLs, we can't generate responsive versions easily
          // but for local assets, this could be enhanced with different sizes
          return `${baseSrc} ${scaledWidth}w`;
        })
        .join(", ");
    };

    const placeholder =
      placeholderSrc || generateBlurPlaceholder(width, height);

    return (
      <div
        ref={containerRef}
        className={`relative overflow-hidden ${className}`}>
        {/* Placeholder/Low Quality Image */}
        <motion.img
          src={placeholder}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover ${
            isLoaded || hasError ? "opacity-0" : "opacity-100"
          }`}
          style={{
            filter: `blur(${blurAmount}px)`,
            transform: "scale(1.1)", // Slight scale to hide blur edges
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoaded || hasError ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          loading="eager"
          decoding="async"
        />

        {/* Low Quality Image (if provided) */}
        {lowQualitySrc && isInView && (
          <motion.img
            src={lowQualitySrc}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover ${
              isLoaded || hasError ? "opacity-0" : "opacity-100"
            }`}
            style={{
              filter: isLowQualityLoaded
                ? `blur(${blurAmount / 2}px)`
                : `blur(${blurAmount}px)`,
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: isLowQualityLoaded && !isLoaded && !hasError ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            onLoad={handleLowQualityLoad}
            loading="lazy"
            decoding="async"
          />
        )}

        {/* Main High Quality Image */}
        {isInView && (
          <motion.img
            ref={imgRef}
            src={src}
            srcSet={generateSrcSet(src)}
            sizes={sizes}
            alt={alt}
            className="relative w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded && !hasError ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            onLoad={handleMainImageLoad}
            onError={handleError}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            width={width}
            height={height}
          />
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
            <div className="text-center">
              <svg
                className="w-8 h-8 mx-auto mb-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs">Failed to load image</span>
            </div>
          </div>
        )}

        {/* Loading indicator for high priority images */}
        {priority && !isLoaded && !hasError && (
          <div className="absolute top-2 right-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    );
  }
);

ProgressiveImage.displayName = "ProgressiveImage";

// Hook for preloading images
export const useImagePreloader = () => {
  const preloadedImages = useRef(new Set<string>());

  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (preloadedImages.current.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        preloadedImages.current.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  };

  const preloadImages = async (srcs: string[]) => {
    try {
      await Promise.all(srcs.map(preloadImage));
    } catch (error) {
      console.warn("Some images failed to preload:", error);
    }
  };

  return { preloadImage, preloadImages };
};
