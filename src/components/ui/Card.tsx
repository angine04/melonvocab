import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "word" | "stats";
  onClick?: () => void;
}

export function Card({
  children,
  className = "",
  variant = "default",
  onClick,
}: CardProps) {
  const baseStyle =
    "rounded-2xl backdrop-blur-sm transition-all duration-200 ease-in-out";

  let variantStyle = "";

  switch (variant) {
    case "word":
      variantStyle =
        "bg-white/10 border border-white/20 p-8 hover:bg-white/15 hover:scale-105 cursor-pointer shadow-lg";
      break;
    case "stats":
      variantStyle =
        "bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-6 shadow-lg";
      break;
    default:
      variantStyle = "bg-white/5 border border-white/10 p-6 hover:bg-white/10";
  }

  const Component = onClick ? "button" : "div";

  return (
    <Component
      className={`${baseStyle} ${variantStyle} ${className}`}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}
