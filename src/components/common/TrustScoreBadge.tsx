"use client";

import React from "react";
import { ShieldCheck, Award } from "lucide-react";

interface TrustScoreBadgeProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({
  score,
  label,
  size = "md",
}) => {
  // Score color tiers
  const getBadgeColor = () => {
    if (score >= 90) return { bg: "bg-[#e8f5e9]", text: "text-[#1F5130]", border: "border-[#4CAF50]" };
    if (score >= 75) return { bg: "bg-[#fff3e0]", text: "text-[#d88909]", border: "border-[#F5A623]" };
    if (score >= 50) return { bg: "bg-[#e0f2f1]", text: "text-[#26A69A]", border: "border-[#26A69A]" };
    return { bg: "bg-[#ffebee]", text: "text-[#D84A3A]", border: "border-[#D84A3A]" };
  };

  const style = getBadgeColor();

  if (size === "sm") {
    return (
      <span
        suppressHydrationWarning
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text} border ${style.border}`}
        title={`Trust Score: ${score}/100`}
      >
        <ShieldCheck className="w-3 h-3" />
        <span suppressHydrationWarning>{score}</span>
      </span>
    );
  }

  if (size === "lg") {
    return (
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#1F5130]/10 shadow-xs">
        <div suppressHydrationWarning className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#1F5130] text-white font-bold text-lg">
          {score}
          <div className="absolute -top-1 -right-1 p-1 rounded-full bg-[#F5A623] text-white">
            <Award className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Trust Score
          </div>
          <div className="text-sm font-bold text-[#1F5130]">
            {score >= 90 ? "Verified High Trust" : score >= 75 ? "Consistent Partner" : "New Member"}
          </div>
          {label && <div className="text-xs text-gray-600">{label}</div>}
        </div>
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text} border ${style.border}`}
    >
      <ShieldCheck className="w-3 h-3" />
      <span suppressHydrationWarning>Trust {score}</span>
      {label && <span className="opacity-75 font-normal">• {label}</span>}
    </div>
  );
};
