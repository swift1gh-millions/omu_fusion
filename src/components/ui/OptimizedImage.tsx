import React, {
  useState,
  useCallback,
  memo,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { motion } from "framer-motion";
import { useAccessibleAnimations } from "../../hooks/useAccessibleAnimations";
import { useIntersectionPreloader } from "../../hooks/useImagePreloading";
import EnhancedImageService from "../../utils/enhancedImageService";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  width?: number;
  height?: number;
  placeholder?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
  responsive?: boolean;
  sizes?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = memo(
  ({
    src,
    alt,
    className = "",
    loading = "lazy",
    width,
    height,
    placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAzMEM5LjUwNjYgMzAgMCAyMC40OTM0IDAgMTBDMCAwLjUwNjU5NSA5LjUwNjYgMCAyMCAwQzMwLjQ5MzQgMCA0MCA5LjUwNjU5IDQwIDIwQzQwIDMwLjQ5MzQgMzAuNDkzNCA0MCAyMCA0MFoiIGZpbGw9IiNFNUU3RUIiLz4KPC9zdmc+Cg==",
    fallbackSrc,
    onLoad,
    onError,
    priority = false,
    quality = 80,
    format = "webp",
    responsive = true,
    sizes,
  }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(src);
    const [optimizedSrc, setOptimizedSrc] = useState<string>(src);
    const [responsiveSrcs, setResponsiveSrcs] = useState<
      Record<string, string>
    >({});
    const [isInView, setIsInView] = useState(priority);

    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { fadeIn } = useAccessibleAnimations();
    const { preloadOnIntersection } = useIntersectionPreloader();

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

    // Generate optimized and responsive URLs
    useEffect(() => {
      if (!isInView) return;

      // Generate optimized URL
      const optimizedUrl = EnhancedImageService.buildCDNUrl(src, {
        width,
        height,
        quality,
        format,
      });
      setOptimizedSrc(optimizedUrl);

      // Generate responsive URLs if needed
      if (responsive) {
        const responsiveUrls = EnhancedImageService.generateResponsiveUrls(src);
        setResponsiveSrcs(responsiveUrls);
      }
    }, [src, width, height, quality, format, responsive, isInView]);

    const handleLoad = useCallback(() => {
      setIsLoaded(true);
      onLoad?.();
    }, [onLoad]);

    const handleError = useCallback(() => {
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        setHasError(false);
        setIsLoaded(false);
      } else {
        setHasError(true);
      }
      onError?.();
    }, [onError, fallbackSrc, currentSrc]);

    if (hasError) {
      return (
        <div
          className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg ${className}`}
          style={{ width, height }}>
          <div className="text-center">
            <svg
              className="w-8 h-8 text-gray-400 mx-auto mb-2"
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
            <p className="text-xs text-gray-500">Image unavailable</p>
          </div>
        </div>
      );
    }

    return (
      <div ref={containerRef} className="relative">
        {/* Placeholder */}
        {!isLoaded && (
          <img
            src={placeholder}
            alt=""
            className={`absolute inset-0 ${className}`}
            style={{ width, height }}
            loading="eager"
            decoding="async"
          />
        )}

        {/* Main Image - Only render when in view */}
        {isInView && (
          <motion.img
            ref={imgRef}
            src={currentSrc}
            alt={alt}
            className={`${className}`}
            loading={priority ? "eager" : loading}
            decoding="async"
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            variants={fadeIn}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
          />
        )}

        {/* Loading indicator for priority images */}
        {priority && !isLoaded && !hasError && (
          <div className="absolute top-2 right-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";
