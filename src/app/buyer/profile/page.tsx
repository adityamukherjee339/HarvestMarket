"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";
import { useMarketStore } from "@/lib/store";
import { TrustScoreBadge } from "@/components/common/TrustScoreBadge";
import { DEMO_BUYERS } from "@/lib/demo-data";
import { Building2, ShieldCheck, Clock, CheckCircle2, ArrowLeftRight, FileText, Award } from "lucide-react";
import Link from "next/link";

export default function BuyerProfilePage() {
  const { language } = useI18n();
  const { currentUser, switchDemoUser, resetToDemo } = useMarketStore();

  const buyerMetrics = [
    { label: language === "en" ? "Instant Escrow Funding" : "तत्काल एस्क्रो जमा", value: 100, icon: CheckCircle2 },
    { label: language === "en" ? "On-Time Cold Chain Pickup" : "समय पर कोल्ड चेन उठाव", value: 98, icon: Clock },
    { label: language === "en" ? "Zero Payment Default Record" : "शून्य भुगतान चूक रिकॉर्ड", value: 100, icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-[var(--font-poppins)] text-2xl font-bold text-[#1F5130] flex items-center gap-2">
        <Building2 className="w-6 h-6 text-[#1F5130]" />
        {language === "en" ? "Corporate Buyer Profile" : "कॉर्पोरेट खरीदार प्रोफ़ाइल"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="agro-card p-6 bg-white border border-[#1F5130]/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1F5130] text-white flex items-center justify-center text-2xl font-bold shadow-md">
                🏨
              </div>
              <div>
                <h2 className="font-[var(--font-poppins)] text-xl font-bold text-[#1F5130]">
                  {currentUser?.company_name || "Taj Gateway Hospitality"}
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Contact Person: {currentUser?.full_name || "Vikram Mehta"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  GSTIN: {currentUser?.gst_number || "27AABCT3518Q1ZP"} • {currentUser?.business_type?.toUpperCase() || "HOTEL"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF8E7] border border-[#1F5130]/10 my-4">
              <p className="text-xs font-bold text-[#5D4037] uppercase tracking-wider mb-2">Verified Direct Procurement Account</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Authorized for bulk farm-gate reverse auction settlement under APMC Direct Procurement License (Maharashtra).
              </p>
            </div>
          </div>

          <div className="pt-2">
            <TrustScoreBadge
              score={currentUser?.trust_score || 96}
              label={currentUser?.trust_label || "Instant Escrow & 24h Payout"}
              size="lg"
            />
          </div>
        </div>

        {/* Trust Metrics Breakdown */}
        <div className="agro-card p-6 bg-white border border-[#1F5130]/15">
          <h3 className="font-[var(--font-poppins)] font-bold text-sm text-[#1F5130] mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#F5A623]" />
            {language === "en" ? "Buyer Trust Score Breakdown" : "विश्वास स्कोर विवरण"}
          </h3>

          <div className="space-y-4">
            {buyerMetrics.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                    <item.icon className="w-3.5 h-3.5 text-[#4CAF50]" />
                    {item.label}
                  </span>
                  <span className="font-bold text-[#1F5130] font-mono">{item.value}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#1F5130] to-[#4CAF50]"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
            <Link
              href="/farmer"
              className="flex-1 py-2.5 px-4 rounded-xl border border-[#1F5130]/20 bg-[#FFF8E7] text-[#1F5130] hover:bg-[#1F5130] hover:text-white transition-all text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#F5A623]" />
              <span>{language === "en" ? "Switch to Farmer Portal" : "किसान पोर्टल पर जाएं"}</span>
            </Link>

            <button
              onClick={resetToDemo}
              className="py-2.5 px-4 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-xs font-semibold"
            >
              {language === "en" ? "Reset Demo" : "रीसेट"}
            </button>
          </div>
        </div>
      </div>

      {/* Switch Buyer Demo Account */}
      <div className="agro-card p-4 bg-[#fff3e0] border-[#F5A623]/30">
        <p className="text-[10px] font-bold text-[#d88909] uppercase tracking-wider mb-2">
          🧪 Switch Corporate Buyer Demo Accounts:
        </p>
        <div className="flex gap-2 flex-wrap">
          {DEMO_BUYERS.map((buyer) => (
            <button
              key={buyer.id}
              onClick={() => switchDemoUser(buyer.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                currentUser?.id === buyer.id
                  ? "bg-[#1F5130] text-white border-[#1F5130] shadow-xs"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#1F5130]"
              }`}
            >
              {buyer.company_name} ({buyer.trust_score} Trust)
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
