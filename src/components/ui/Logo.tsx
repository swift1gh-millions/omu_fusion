import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import logoBlack from "../../assets/logo_black.png";
import logoWhite from "../../assets/logo_white.png";

interface LogoProps {
  variant?: "light" | "dark" | "auto";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  animated?: boolean;
  fallbackType?: "text" | "svg";
  onError?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  variant = "auto",
  size = "md",
  className = "",
  showText = false,
  animated = true,
  fallbackType = "text",
  onError,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Size configurations
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
    xl: "h-16",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  // Determine logo variant based on context
  const getLogoVariant = () => {
    if (variant === "auto") {
      // Check if we're in dark mode or light mode context
      try {
        const isDarkMode = document.documentElement.classList.contains("dark");
        const bodyBg = window.getComputedStyle(document.body).backgroundColor;
        const isLightBackground =
          bodyBg === "rgb(255, 255, 255)" || bodyBg === "white";
        return isDarkMode || !isLightBackground ? "light" : "dark";
      } catch {
        // Fallback if we can't determine context
        return "light";
      }
    }
    return variant;
  };

  const logoVariant = getLogoVariant();
  const logoSrc = logoVariant === "light" ? logoWhite : logoBlack;
  const textColor = logoVariant === "light" ? "text-white" : "text-gray-900";

  const handleImageError = () => {
    setHasError(true);
    onError?.();
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  // SVG Logo Fallback
  const SVGLogo = () => (
    <svg
      viewBox="0 0 120 40"
      className={`${sizeClasses[size]} w-auto ${textColor}`}
      fill="currentColor">
      {/* OMU Letter Design */}
      <g>
        {/* O */}
        <circle
          cx="12"
          cy="20"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />

        {/* M */}
        <path
          d="M30 10 L30 30 M30 10 L40 20 L50 10 M50 10 L50 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* U */}
        <path
          d="M58 10 L58 22 A8 8 0 0 0 74 22 L74 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {/* FUSION text */}
      <text x="85" y="26" fontSize="14" fontWeight="bold" fill="currentColor">
        FUSION
      </text>
    </svg>
  );

  // Text Logo Fallback
  const TextLogo = () => (
    <span
      className={`font-display ${textSizeClasses[size]} font-bold ${textColor}`}>
      OMU FUSION
    </span>
  );

  // Loading placeholder
  const LoadingPlaceholder = () => (
    <div
      className={`${sizeClasses[size]} w-auto bg-gray-200 animate-pulse rounded`}>
      <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
    </div>
  );

  // Render fallback based on type
  const renderFallback = () => {
    if (fallbackType === "svg") {
      return <SVGLogo />;
    }
    return <TextLogo />;
  };

  // Animation variants
  const logoVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: { scale: 1.05, rotate: 2 },
    tap: { scale: 0.95 },
  };

  if (hasError) {
    return (
      <motion.div
        className={`flex items-center ${className}`}
        variants={animated ? logoVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
        whileHover={animated ? "hover" : undefined}
        whileTap={animated ? "tap" : undefined}
        transition={{ duration: 0.3, ease: "easeOut" }}>
        {renderFallback()}
        {showText && !hasError && (
          <span
            className={`ml-2 font-display ${textSizeClasses[size]} font-bold ${textColor}`}>
            OMU FUSION
          </span>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`flex items-center ${className}`}
      variants={animated ? logoVariants : undefined}
      initial={animated ? "initial" : undefined}
      animate={animated ? "animate" : undefined}
      whileHover={animated ? "hover" : undefined}
      whileTap={animated ? "tap" : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}>
      {/* Loading state */}
      {!isLoaded && !hasError && <LoadingPlaceholder />}

      {/* Logo Image */}
      <img
        src={logoSrc}
        alt="OMU FUSION"
        className={`${sizeClasses[size]} w-auto transition-all duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        loading="eager"
        decoding="sync"
        fetchPriority="high"
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ display: isLoaded ? "block" : "none" }}
      />

      {/* Optional text alongside logo */}
      {showText && isLoaded && !hasError && (
        <span
          className={`ml-2 font-display ${textSizeClasses[size]} font-bold ${textColor}`}>
          OMU FUSION
        </span>
      )}
    </motion.div>
  );
};
