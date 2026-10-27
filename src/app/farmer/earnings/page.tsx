"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";
import { IndianRupee, ArrowRight } from "lucide-react";

function formatPaise(paise: number): string {
  return `₹${(paise / 100).toFixed(2)}`;
}

export default function EarningsPage() {
  const { language } = useI18n();

  const demoDeals = [
    { id: 1, crop: "🍅 Tomato A", date: "Oct 25", qty: 800, amount: 292000, buyer: "Taj Hotels", status: "credited" },
    { id: 2, crop: "🧅 Onion B", date: "Oct 20", qty: 1200, amount: 312000, buyer: "Nature's Fresh", status: "credited" },
    { id: 3, crop: "🥬 Spinach A", date: "Oct 18", qty: 250, amount: 105000, buyer: "Hyperpure", status: "credited" },
  ];

  return (
    <div className="space-y-5">
      <h1 className="font-[var(--font-poppins)] text-xl font-bold text-[#1F5130]">
        {language === "en" ? "Earnings & History" : "कमाई और इतिहास"}
      </h1>

      <div className="rounded-2xl p-6 bg-gradient-to-br from-[#1F5130] via-[#27643b] to-[#12361e] text-white shadow-lg border border-[#1F5130]/30">
        <p className="text-sm text-white/80">{language === "en" ? "Total Earnings (Demo)" : "कुल कमाई (डेमो)"}</p>
        <p className="font-[var(--font-poppins)] text-3xl font-extrabold num-tabular mt-1 text-white">
          {formatPaise(709000)}
        </p>
        <p className="text-xs text-white/70 mt-1">3 {language === "en" ? "completed deals direct to corporate buyers" : "सौदे पूरे सीधे कॉर्पोरेट खरीदारों को"}</p>
      </div>

      <div>
        <h2 className="font-semibold text-[#1F5130] text-sm mb-3">
          {language === "en" ? "Past Deals & Payout Receipts" : "पिछले सौदे व रसीदें"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {demoDeals.map((deal) => (
            <div key={deal.id} className="agro-card p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#1F5130] text-sm">{deal.crop}</p>
                <p className="text-[11px] text-gray-500">{deal.date} • {deal.qty}kg • {deal.buyer}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#1F5130] num-tabular">{formatPaise(deal.amount)}</p>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#e8f5e9] text-[#4CAF50]">
                  ✓ {language === "en" ? "Credited" : "जमा"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
