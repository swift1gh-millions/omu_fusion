import React from "react";
import { motion } from "framer-motion";
import { LoadingSpinner } from "./LoadingSpinner";

interface ModernLoaderProps {
  message?: string;
  submessage?: string;
  variant?: "fullscreen" | "inline" | "minimal";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const ModernLoader: React.FC<ModernLoaderProps> = ({
  message = "Loading",
  submessage = "Please wait...",
  variant = "fullscreen",
  size = "lg",
  className = "",
}) => {
  const loaderContent = (
    <div className="text-center space-y-6">
      {/* Main Spinner */}
      <div className="relative flex justify-center">
        <LoadingSpinner size={size} />
      </div>

      {/* Text Content */}
      <div className="space-y-2">
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-medium text-white">
          {message}
        </motion.h3>

        {submessage && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-sm">
            {submessage}
          </motion.p>
        )}
      </div>

      {/* Animated dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              y: [0, -8, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut",
            }}
            className="w-1 h-1 bg-accent-gold rounded-full"
          />
        ))}
      </motion.div>
    </div>
  );

  if (variant === "fullscreen") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden ${className}`}>
        {/* Background Animation */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.1),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(212,175,55,0.05),transparent_70%)]" />

          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-accent-gold/20 rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 6 + i,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut",
              }}
              style={{
                left: `${10 + i * 10}%`,
                top: `${20 + i * 8}%`,
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10">
          {loaderContent}
        </motion.div>
      </motion.div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          {loaderContent}
        </motion.div>
      </div>
    );
  }

  // Minimal variant
  return (
    <div className={`flex items-center justify-center space-x-3 ${className}`}>
      <LoadingSpinner size="sm" />
      <span className="text-gray-600 dark:text-gray-400 text-sm">
        {message}
      </span>
    </div>
  );
};

// Export a pre-configured fullscreen loader for common use
export const FullscreenLoader: React.FC<{
  message?: string;
  submessage?: string;
}> = ({ message, submessage }) => (
  <ModernLoader
    variant="fullscreen"
    message={message}
    submessage={submessage}
    size="xl"
  />
);
