import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "default" | "minimal" | "dots" | "pulse";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
  variant = "default",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const renderSpinner = () => {
    switch (variant) {
      case "minimal":
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700"></div>
            <div className="absolute inset-0 rounded-full border-2 border-accent-gold border-t-transparent animate-spin"></div>
          </div>
        );

      case "dots":
        return (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-accent-gold rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-accent-gold rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}></div>
            <div
              className="w-2 h-2 bg-accent-gold rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}></div>
          </div>
        );

      case "pulse":
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 rounded-full bg-accent-gold/20 animate-ping"></div>
            <div
              className="absolute inset-2 rounded-full bg-accent-gold/40 animate-ping"
              style={{ animationDelay: "0.2s" }}></div>
            <div className="absolute inset-4 rounded-full bg-accent-gold animate-pulse"></div>
          </div>
        );

      default:
        return (
          <div className={`${sizeClasses[size]} relative`}>
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700/50"></div>

            {/* Spinning gradient ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent, #D4AF37, transparent)",
                mask: "radial-gradient(circle at center, transparent 60%, black 60%)",
                WebkitMask:
                  "radial-gradient(circle at center, transparent 60%, black 60%)",
              }}></div>

            {/* Inner glow */}
            <div className="absolute inset-1 rounded-full bg-gradient-to-r from-accent-gold/20 to-transparent animate-pulse"></div>
          </div>
        );
    }
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      {renderSpinner()}
    </div>
  );
};
