import React, { memo } from "react";
import { motion } from "framer-motion";

interface PageBackgroundProps {
  variant?: "dark" | "light";
  children: React.ReactNode;
  className?: string;
}

const PageBackground: React.FC<PageBackgroundProps> = memo(
  ({ variant = "dark", children, className = "" }) => {
    const backgroundClasses =
      variant === "dark"
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
        : "bg-gradient-to-br from-gray-50 to-white";

    const decorativeElements =
      variant === "dark" ? (
        <>
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-accent-gold opacity-10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.12, 0.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </>
      ) : (
        <>
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-accent-gold opacity-5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.03, 0.08, 0.03],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 opacity-5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.03, 0.06, 0.03],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </>
      );

    return (
      <div
        className={`min-h-screen ${backgroundClasses} relative overflow-hidden ${className}`}>
        {/* Background Elements */}
        <div className="absolute inset-0">{decorativeElements}</div>

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

PageBackground.displayName = "PageBackground";

export { PageBackground };
