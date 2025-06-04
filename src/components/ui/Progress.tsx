import React from "react";

interface ProgressProps {
  value: number; // 0-100
  max?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
  variant?: "default" | "circular";
  size?: "sm" | "md" | "lg";
}

export function Progress({
  value,
  max = 100,
  className = "",
  showLabel = false,
  label,
  variant = "default",
  size = "md",
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  if (variant === "circular") {
    const radius = size === "sm" ? 20 : size === "lg" ? 40 : 30;
    const strokeWidth = size === "sm" ? 3 : size === "lg" ? 6 : 4;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className={`relative ${className}`}>
        {/* Glass backdrop circle */}
        <div
          className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg"
          style={{ width: radius * 2, height: radius * 2 }}
        />
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90 relative z-10"
        >
          <circle
            stroke="rgba(255, 255, 255, 0.15)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="url(#progressGradient)"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-500 ease-in-out drop-shadow-sm"
          />
          {/* Define gradient for progress stroke */}
          <defs>
            <linearGradient
              id="progressGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="rgb(16, 185, 129)"
                stopOpacity="0.9"
              />
              <stop
                offset="100%"
                stopColor="rgb(34, 197, 94)"
                stopOpacity="0.9"
              />
            </linearGradient>
          </defs>
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <span className="text-white font-medium text-sm drop-shadow-sm">
              {label || `${Math.round(percentage)}%`}
            </span>
          </div>
        )}
      </div>
    );
  }

  const heightClass = size === "sm" ? "h-2" : size === "lg" ? "h-4" : "h-3";

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/80 text-sm">{label}</span>
          <span className="text-white text-sm font-medium">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={`w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full ${heightClass} overflow-hidden shadow-lg`}
      >
        <div
          className="bg-gradient-to-r from-emerald-500/30 to-green-400/30 border-emerald-400/50 h-full rounded-full transition-all duration-500 ease-out shadow-lg shadow-emerald-500/20"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
