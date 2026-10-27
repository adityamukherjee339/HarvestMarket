"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";
import { Languages } from "lucide-react";

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useI18n();

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "hi" : "en")}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 hover:bg-white text-[#1F5130] border border-[#1F5130]/20 shadow-xs touch-target transition-colors"
      aria-label="Toggle Language (English / हिंदी)"
    >
      <Languages className="w-4 h-4 text-[#F5A623]" />
      <span>{language === "en" ? "हिंदी" : "English"}</span>
    </button>
  );
};
