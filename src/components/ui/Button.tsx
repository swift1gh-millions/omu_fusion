import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "glass" | "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  type?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps> = ({
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
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    glass: "btn-glass text-white hover:text-accent-gold",
    primary: "btn-primary text-white font-semibold",
    secondary:
      "bg-transparent border-2 border-white text-white hover:bg-white hover:text-black",
    outline:
      "bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${
        sizeClasses[size]
      } ${className} ${loading ? "opacity-75 cursor-wait" : ""}`}
      onClick={onClick}
      disabled={disabled || loading}>
      {loading && (
        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
      )}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
