"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";
import { useMarketStore } from "@/lib/store";
import { TrustScoreBadge } from "@/components/common/TrustScoreBadge";
import { User, ShieldCheck, Star, Clock, Package, Ban } from "lucide-react";
import Link from "next/link";

export default function FarmerProfilePage() {
  const { language } = useI18n();
  const { currentUser, switchDemoUser, resetToDemo } = useMarketStore();

  const trustBreakdown = [
    { label: language === "en" ? "Grade Accuracy at Delivery" : "डिलीवरी पर ग्रेड सटीकता", value: 95, icon: Star },
    { label: language === "en" ? "On-Time Handover" : "समय पर हस्तांतरण", value: 98, icon: Clock },
    { label: language === "en" ? "Quantity Fulfilled" : "पूर्ण मात्रा", value: 100, icon: Package },
    { label: language === "en" ? "Cancellation Rate" : "रद्दीकरण दर", value: 2, icon: Ban },
  ];

  return (
    <div className="space-y-5">
      <h1 className="font-[var(--font-poppins)] text-xl font-bold text-[#1F5130]">
        {language === "en" ? "My Profile" : "मेरी प्रोफ़ाइल"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {currentUser && (
          <div className="agro-card p-6 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#1F5130] text-white flex items-center justify-center text-3xl mx-auto mb-3 shadow-md">
              🧑‍🌾
            </div>
            <h2 className="font-[var(--font-poppins)] text-xl font-bold text-[#1F5130]">{currentUser.full_name}</h2>
            <p className="text-sm text-gray-600 font-medium">{currentUser.village}</p>
            <p className="text-xs text-gray-400 mt-1">{currentUser.phone}</p>
            <div className="mt-4 w-full">
              <TrustScoreBadge score={currentUser.trust_score} label={currentUser.trust_label} size="lg" />
            </div>
          </div>
        )}

        <div className="agro-card p-6">
        <h3 className="font-semibold text-[#1F5130] text-sm mb-3 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
          {language === "en" ? "Trust Score Breakdown" : "विश्वास स्कोर विवरण"}
        </h3>
        <div className="space-y-3">
          {trustBreakdown.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700 flex items-center gap-1.5">
                  <item.icon className="w-3.5 h-3.5 text-gray-400" />
                  {item.label}
                </span>
                <span className="text-sm font-bold text-[#1F5130]">{item.value}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100">
                <div
                  className={`h-2 rounded-full transition-all ${
                    item.value >= 90 ? "bg-[#4CAF50]" : item.value >= 70 ? "bg-[#F5A623]" : "bg-[#D84A3A]"
                  }`}
                  style={{ width: `${Math.min(item.value, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

      <div className="flex gap-2 max-w-md">
        <Link href="/" className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm text-center touch-target">
          {language === "en" ? "Switch Portal" : "पोर्टल बदलें"}
        </Link>
        <button
          onClick={resetToDemo}
          className="flex-1 py-3 rounded-xl bg-[#D84A3A]/10 text-[#D84A3A] font-semibold text-sm touch-target"
        >
          {language === "en" ? "Reset Demo" : "डेमो रीसेट"}
        </button>
      </div>
    </div>
  );
}
