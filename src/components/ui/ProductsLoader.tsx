import React from "react";
import { motion } from "framer-motion";

interface ProductsLoaderProps {
  viewMode?: "grid" | "list";
}

export const ProductsLoader: React.FC<ProductsLoaderProps> = ({
  viewMode = "grid",
}) => {
  const gridClasses =
    viewMode === "grid"
      ? "grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "grid gap-4 sm:gap-6 grid-cols-1";

  return (
    <div className={gridClasses}>
      {/* Create skeleton cards - more for grid view, fewer for list view */}
      {Array.from({ length: viewMode === "grid" ? 8 : 4 }, (_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group">
          <div
            className={`bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/20 h-full ${
              viewMode === "list" ? "flex" : ""
            }`}>
            {/* Image skeleton */}
            <div
              className={`relative bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 animate-pulse ${
                viewMode === "grid" ? "h-48 sm:h-56 lg:h-64" : "w-48 h-32"
              }`}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent transform translate-x-[-100%] animate-shimmer"></div>
              {/* Floating product icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-16 h-16 bg-white/30 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                  <motion.svg
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 9h6v6H9z"
                    />
                  </motion.svg>
                </motion.div>
              </div>
            </div>

            {/* Content skeleton */}
            <div
              className={`space-y-3 ${
                viewMode === "grid" ? "p-3 sm:p-4 lg:p-6" : "flex-1 p-4"
              }`}>
              {/* Title skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-3/4 animate-pulse"></div>
              </div>

              {/* Rating skeleton */}
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                      className="w-3 h-3 bg-yellow-300 rounded-sm"></motion.div>
                  ))}
                </div>
                <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Price and button skeleton */}
              <div
                className={`pt-2 ${
                  viewMode === "list"
                    ? "flex items-center justify-between"
                    : "flex items-center justify-between"
                }`}>
                <div className="space-y-1">
                  <div className="h-5 w-16 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-lg animate-pulse"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-20 bg-gradient-to-r from-accent-gold/30 via-accent-orange/30 to-accent-gold/30 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Alternative modern loader for when we want a centered loader
export const ModernProductsLoader: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20">
      {/* Modern animated loader */}
      <div className="relative mb-8">
        {/* Outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-transparent border-t-accent-gold border-r-accent-orange rounded-full"></motion.div>

        {/* Inner pulsing circle */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-2 bg-gradient-to-br from-accent-gold to-accent-orange rounded-full opacity-20"></motion.div>

        {/* Central icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.svg
            animate={{
              y: [0, -3, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-8 h-8 text-accent-gold"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </motion.svg>
        </div>
      </div>

      {/* Loading text with typing animation */}
      <motion.div className="text-center">
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl font-semibold text-gray-800 mb-2">
          Discovering amazing products
        </motion.h3>

        <motion.div className="flex items-center justify-center space-x-1">
          {["L", "o", "a", "d", "i", "n", "g"].map((letter, index) => (
            <motion.span
              key={index}
              animate={{
                y: [0, -10, 0],
                color: ["#6B7280", "#F59E0B", "#6B7280"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.1,
              }}
              className="text-lg font-medium">
              {letter}
            </motion.span>
          ))}

          {/* Animated dots */}
          {Array.from({ length: 3 }, (_, i) => (
            <motion.span
              key={i}
              animate={{
                opacity: [0, 1, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 0.7 + i * 0.2,
              }}
              className="text-lg font-bold text-accent-gold">
              .
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      {/* Progress indicator */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="mt-6 h-1 bg-gradient-to-r from-accent-gold to-accent-orange rounded-full w-48 overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-1/2 bg-white/60 rounded-full"></motion.div>
      </motion.div>
    </motion.div>
  );
};
