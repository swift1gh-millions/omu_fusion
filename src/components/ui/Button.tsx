import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useAccessibleAnimations } from "../../hooks/useAccessibleAnimations";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "glass" | "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  type?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps> = memo(
  ({
    children,
    variant = "glass",
    size = "md",
    className = "",
    onClick,
    disabled = false,
    loading = false,
    icon,
    type = "button",
  }) => {
    const { button } = useAccessibleAnimations();

    const baseClasses = useMemo(
      () =>
        "inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed touch-target",
      []
    );

    const variantClasses = {
      glass:
        "btn-glass text-white hover:text-black backdrop-blur-md font-semibold shadow-lg",
      primary: "btn-primary text-white font-semibold shadow-lg hover:shadow-xl",
      secondary:
        "bg-gray-800 border-2 border-gray-800 text-white hover:bg-white hover:text-gray-800 shadow-md hover:shadow-lg font-semibold transition-all duration-300",
      outline:
        "bg-white backdrop-blur-md border-2 border-gray-200 text-gray-800 hover:bg-gray-800 hover:text-white hover:border-gray-800 shadow-md hover:shadow-lg hover:scale-105 font-semibold",
      danger:
        "bg-red-600 border-2 border-red-600 text-white hover:bg-red-700 hover:border-red-700 shadow-md hover:shadow-lg font-semibold transition-all duration-300",
    };

    const sizeClasses = {
      sm: "px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm min-h-[44px]",
      md: "px-4 sm:px-6 py-3 text-sm sm:text-base min-h-[44px]",
      lg: "px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg min-h-[48px]",
    };

    return (
      <motion.button
        type={type}
        className={`${baseClasses} ${variantClasses[variant]} ${
          sizeClasses[size]
        } ${className} ${loading ? "opacity-75 cursor-wait" : ""}`}
        onClick={onClick}
        disabled={disabled || loading}
        variants={button}
        initial="rest"
        whileHover="hover"
        whileTap="tap">
        {loading && (
          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
        )}
        {!loading && icon && <span className="mr-2">{icon}</span>}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
