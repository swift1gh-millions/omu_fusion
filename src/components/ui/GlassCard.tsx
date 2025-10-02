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
  const baseClasses = "rounded-3xl transition-all duration-300";

  const variantClasses = {
    default:
      "glass shadow-xl border border-white/20 hover:shadow-2xl hover:scale-[1.02]",
    strong:
      "glass-strong shadow-2xl border border-white/30 hover:shadow-3xl hover:scale-[1.02]",
    dark: "glass-dark shadow-2xl border border-gray-700/30 hover:shadow-3xl hover:scale-[1.02]",
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
