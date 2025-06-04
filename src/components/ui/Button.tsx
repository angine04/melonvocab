import React from "react";
import { ArrowLeft } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: "default" | "primary" | "profile" | "back";
  className?: string;
  icon?: React.ReactNode; // For profile button or other icon buttons
}

export function Button({
  children,
  variant = "default",
  className = "",
  icon,
  ...props
}: ButtonProps) {
  const baseStyle =
    "relative text-sm font-medium text-white rounded-full border transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/60 backdrop-blur-sm";

  let variantStyle = "";

  switch (variant) {
    case "back":
      variantStyle =
        "w-12 h-12 bg-white/10 hover:bg-white/20 border-white/30 flex items-center justify-center text-lg";
      break;
    case "profile":
      variantStyle = "w-full h-12 bg-white/5 hover:bg-white/10 border-white/20";
      break;
    case "primary": // For "Start learning"
      variantStyle =
        "w-full h-12 bg-sky-600/70 hover:bg-sky-500/70 border-sky-500/50";
      break;
    default: // For "Settings", "Current Course", "Review"
      variantStyle =
        "w-full h-12 bg-slate-700/30 hover:bg-slate-600/40 border-white/20";
  }

  if (variant === "back") {
    return (
      <button
        className={`${baseStyle} ${variantStyle} ${className}`}
        {...props}
      >
        <ArrowLeft size={20} />
      </button>
    );
  }

  return (
    <button className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
      {icon ? (
        <div className="absolute inset-0 flex items-center">
          <div className="flex items-center ml-0.25 w-full pr-4">
            <span className="flex-shrink-0 w-11 h-11 flex items-center justify-center">
              {icon}
            </span>
            <span className="ml-2 flex-1 text-left">{children}</span>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center px-6">
          {children}
        </div>
      )}
    </button>
  );
}
