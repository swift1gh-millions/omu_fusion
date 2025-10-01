import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "strong" | "dark";
  hover?: boolean;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  variant = "default",
  hover = false,
  style,
}) => {
  const baseClasses = "rounded-3xl";

  const variantClasses = {
    default: "glass",
    strong: "glass-strong",
    dark: "glass-dark",
  };

  const hoverClasses = hover ? "card-hover cursor-pointer" : "";

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}
      style={style}>
      {children}
    </div>
  );
};
