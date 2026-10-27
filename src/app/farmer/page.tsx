"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";
import { useMarketStore } from "@/lib/store";
import { DEMO_CROPS } from "@/lib/demo-data";
import Link from "next/link";
import {
  TrendingUp,
  Clock,
  ArrowRight,
  Mic,
  ShieldCheck,
  Eye,
  Layers,
  IndianRupee,
  Sparkles,
  Users,
  CheckCircle2,
  FileText,
  BadgePercent,
} from "lucide-react";

import { TimeRemaining } from "@/components/common/TimeRemaining";

function formatPaise(paise: number): string {
  return `₹${(paise / 100).toFixed(2)}`;
}

function formatPaiseShort(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}

function UrgencyBadge({ state }: { state: string }) {
  const colors: Record<string, string> = {
    fresh: "bg-[#e8f5e9] text-[#1F5130] border-[#4CAF50]",
    moderate: "bg-[#fff3e0] text-[#d88909] border-[#F5A623]",
    urgent: "bg-[#ffebee] text-[#D84A3A] border-[#D84A3A]",
    expired: "bg-gray-100 text-gray-400 border-gray-300",
  };
  const labels: Record<string, string> = {
    fresh: "🟢 Fresh",
    moderate: "🟡 Moderate",
    urgent: "🔴 Expiring",
    expired: "⚫ Expired",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[state] || colors.fresh}`}>
      {labels[state] || state}
    </span>
  );
}

export default function FarmerHome() {
  const { t, language } = useI18n();
  const { currentUser, pools } = useMarketStore();

  const activePools = pools.filter((p) => p.status === "active");
  const myPools = activePools.filter((p) =>
    p.listings.some((l) => l.farmer_id === currentUser?.id)
  );

  const cropsList = Object.values(DEMO_CROPS);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner (Full width on Web) */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#1F5130] via-[#27643b] to-[#12361e] text-white shadow-xl relative overflow-hidden border border-[#1F5130]/30">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-[#F5A623]/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-[#FFF8E7]">
              <span>📍 {currentUser?.village || "Nashik District Cluster, MH"}</span>
              <span className="w-1 h-1 rounded-full bg-[#4CAF50]" />
              <span className="text-[#4CAF50] font-semibold">APMC Live</span>
            </div>
            <h1 className="font-[var(--font-poppins)] text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {language === "en" ? "Welcome back," : "स्वागत है,"} {currentUser?.full_name || "Ramesh Patel"} 🧑‍🌾
            </h1>
            <p className="text-white/80 text-sm max-w-xl">
              {language === "en"
                ? "Pool your crops with neighboring farmers, skip middlemen commissions, and sell directly to verified corporate buyers."
                : "पड़ोसी किसानों के साथ फसल पूल बनाएं, बिचौलियों का कमीशन बचाएं, और सीधे सत्यापित खरीदारों को बेचें।"}
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
                <span className="font-medium text-white/90">
                  {language === "en" ? "Trust Score:" : "विश्वास स्कोर:"} <strong className="text-white font-bold" suppressHydrationWarning>{currentUser?.trust_score ?? 92}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl">
                <Layers className="w-4 h-4 text-[#4CAF50]" />
                <span className="font-medium text-white/90">
                  {language === "en" ? "Active Pools:" : "सक्रिय पूल:"} <strong className="text-white font-bold">{activePools.length}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl">
                <BadgePercent className="w-4 h-4 text-[#F5A623]" />
                <span className="font-medium text-white/90">
                  {language === "en" ? "Avg Rate Markup:" : "औसत अधिक दर:"} <strong className="text-[#4CAF50] font-bold">+18% vs Mandi</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs on Hero */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Link
              href="/farmer/log-harvest"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#F5A623] hover:bg-[#d88909] text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Mic className="w-5 h-5" />
              <span>{language === "en" ? "Speak Your Harvest" : "आवाज से फसल दर्ज करें"}</span>
            </Link>
            <Link
              href="/farmer/pools"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm backdrop-blur-md transition-all border border-white/20"
            >
              <Eye className="w-4 h-4 text-[#FFF8E7]" />
              <span>{language === "en" ? "Explore Live Auctions" : "लाइव नीलामी देखें"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 2 Cols (Prices & Pools), Right 1 Col (Voice Logger & Insights) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Govt Mandi Benchmark Rates Section */}
          <div className="agro-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-[var(--font-poppins)] font-bold text-[#1F5130] text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#F5A623]" />
                  {t.todaysMandiPrices}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {language === "en"
                    ? "Official APMC benchmark floor prices (Nashik & nearby mandis)"
                    : "आधिकारिक एपीएमसी न्यूनतम बेंचमार्क भाव (नासिक व नजदीकी मंडियां)"}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#1F5130] bg-[#e8f5e9] px-2.5 py-1 rounded-full border border-[#4CAF50]/30">
                Govt Verified
              </span>
            </div>

            {/* Responsive Grid of Benchmark Prices */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {cropsList.map((crop) => (
                <div
                  key={crop.crop}
                  className="rounded-2xl p-4 bg-[#FFF8E7]/60 hover:bg-[#FFF8E7] border border-[#1F5130]/10 hover:border-[#1F5130]/30 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{crop.icon}</span>
                    <span className="text-[10px] font-bold text-[#4CAF50] bg-white px-2 py-0.5 rounded-full border border-[#4CAF50]/20 shadow-xs">
                      +2.4%
                    </span>
                  </div>
                  <div className="mt-3">
                    <h3 className="font-bold text-[#1F5130] text-sm leading-tight">
                      {language === "en" ? crop.display_name_en : crop.display_name_hi}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Govt APMC: <strong className="text-[#1F5130] font-bold text-sm">{formatPaiseShort(crop.mandi_gov_price_paise)}</strong>/kg
                    </p>
                  </div>
                  <Link
                    href={`/farmer/log-harvest?crop=${crop.crop}`}
                    className="mt-3 inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-white hover:bg-[#1F5130] text-[#1F5130] hover:text-white border border-[#1F5130]/20 text-xs font-semibold transition-colors"
                  >
                    <span>{language === "en" ? "Sell Now" : "बेचें"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Active Harvest Pools & Live Reverse Auction */}
          <div className="agro-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-[var(--font-poppins)] font-bold text-[#1F5130] text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#4CAF50]" />
                  {language === "en" ? "Active Harvest Pools & Live Bids" : "सक्रिय पूल और लाइव बोलियां"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {language === "en"
                    ? "Combined farmer lots reaching corporate buyer minimum order quantities"
                    : "कॉर्पोरेट खरीदारों के लिए संयुक्त किसान समूह"}
                </p>
              </div>
              <Link
                href="/farmer/pools"
                className="text-xs font-bold text-[#26A69A] hover:underline flex items-center gap-1"
              >
                <span>{language === "en" ? "View All" : "सभी देखें"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activePools.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#FFF8E7]/50 border border-[#1F5130]/10">
                <span className="text-4xl block mb-2">🌱</span>
                <p className="text-sm font-semibold text-[#1F5130]">
                  {language === "en" ? "No active harvest pools right now" : "अभी कोई सक्रिय पूल नहीं है"}
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  {language === "en"
                    ? "Log your crop harvest to automatically create or join a cluster pool."
                    : "अपनी फसल दर्ज करें और स्वचालित रूप से पूल में शामिल हों।"}
                </p>
                <Link
                  href="/farmer/log-harvest"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#d88909] text-white text-xs font-bold shadow-md transition-all"
                >
                  <Mic className="w-4 h-4" />
                  {language === "en" ? "Log Harvest Now" : "अभी फसल दर्ज करें"}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activePools.slice(0, 3).map((pool) => {
                  const cropInfo = DEMO_CROPS[pool.crop];
                  const topBid = pool.bids
                    .filter((b) => b.status === "active")
                    .sort((a, b) => b.price_per_kg_paise - a.price_per_kg_paise)[0];
                  const aboveMandiPct = topBid
                    ? Math.round(((topBid.price_per_kg_paise - pool.gov_mandi_price_paise) / pool.gov_mandi_price_paise) * 100)
                    : 0;

                  return (
                    <Link key={pool.id} href={`/farmer/pools/${pool.id}`}>
                      <div className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-[#FFF8E7]/40 border border-[#1F5130]/12 hover:border-[#1F5130]/30 shadow-xs hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{cropInfo?.icon || "🌿"}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-[#1F5130] text-base">
                                  {language === "en" ? cropInfo?.display_name_en : cropInfo?.display_name_hi}
                                </h3>
                                <span className="px-2 py-0.5 rounded-md bg-[#FFF8E7] text-[#F5A623] font-bold text-xs border border-[#F5A623]/30">
                                  Grade {pool.grade}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                📍 {pool.village_cluster} • {pool.farmers_count} {language === "en" ? "farmers pooled" : "किसान जुड़े"}
                              </p>
                            </div>
                          </div>
                          <UrgencyBadge state={pool.urgency_state} />
                        </div>

                        {/* Metrics Bar */}
                        <div className="grid grid-cols-4 gap-2 sm:gap-3 py-2 px-3 rounded-xl bg-[#FFF8E7]/60 border border-[#1F5130]/10 text-center">
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-medium">{language === "en" ? "Total Qty" : "कुल मात्रा"}</p>
                            <p className="text-sm font-extrabold text-[#1F5130] num-tabular">
                              {(pool.total_kg / 100).toFixed(1)} <span className="text-[10px] font-normal">q</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-medium">{language === "en" ? "Govt Rate" : "मंडी भाव"}</p>
                            <p className="text-sm font-bold text-[#5D4037] num-tabular">
                              {formatPaiseShort(pool.gov_mandi_price_paise)}<span className="text-[10px] font-normal">/kg</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-medium">{language === "en" ? "Top Bid" : "उच्चतम बोली"}</p>
                            <p className="text-sm font-extrabold text-[#1F5130] num-tabular">
                              {topBid ? formatPaiseShort(topBid.price_per_kg_paise) : "—"}
                              <span className="text-[10px] font-normal">/kg</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-medium">{language === "en" ? "Expires In" : "समय बाकी"}</p>
                            <div className="text-xs font-bold text-[#d88909]">
                              <TimeRemaining expiresAt={pool.expires_at} />
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row */}
                        <div className="mt-3 flex items-center justify-between text-xs">
                          {topBid && aboveMandiPct > 0 ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-[#4CAF50]">
                              <TrendingUp className="w-3.5 h-3.5" />
                              {aboveMandiPct}% {language === "en" ? "higher than government mandi rate" : "सरकारी मंडी भाव से अधिक"}
                            </span>
                          ) : (
                            <span className="text-gray-400">
                              {language === "en" ? "Waiting for buyer bids..." : "खरीदार बोली की प्रतीक्षा..."}
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1 text-[#26A69A] font-bold">
                            {language === "en" ? "View Auction & Lock Deal" : "नीलामी देखें और सौदा पक्का करें"}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Column (Voice Assistant, Benefits, Switcher) */}
        <div className="space-y-6">
          {/* Gemini AI Voice-to-Text Logger Card */}
          <div className="agro-card p-5 sm:p-6 bg-gradient-to-br from-[#FFF8E7] to-white border-[#F5A623]/30 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#F5A623]/20 flex items-center justify-center text-[#d88909]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-[var(--font-poppins)] font-bold text-[#1F5130] text-sm">
                  Gemini Voice-to-Text
                </h3>
                <p className="text-[11px] text-gray-500">
                  {language === "en" ? "Rural Audio & Regional Dialects" : "ग्रामीण भाषा और बोलियों की समझ"}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              {language === "en"
                ? "No need to type! Simply speak your crop, quantity, and expected price in Hindi, Marathi, or Hinglish. AI extracts it into structured data."
                : "टाइप करने की जरूरत नहीं! बस अपनी भाषा में बोलें — एआई अपने आप फसल, वजन और कीमत पहचान लेगा।"}
            </p>

            <Link
              href="/farmer/log-harvest"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1F5130] hover:bg-[#143720] text-white font-semibold text-xs shadow-md transition-all group"
            >
              <Mic className="w-4 h-4 text-[#F5A623] group-hover:scale-110 transition-transform" />
              <span>{language === "en" ? "Tap to Speak Harvest" : "बोलकर फसल दर्ज करें"}</span>
            </Link>
          </div>

          {/* Benefits Comparison: HarvestMarket vs Middlemen */}
          <div className="agro-card p-5 sm:p-6">
            <h3 className="font-[var(--font-poppins)] font-bold text-[#1F5130] text-sm mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
              {language === "en" ? "Why Sell on HarvestMarket?" : "हार्मार्केट के फायदे"}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-red-50 border border-red-200/60">
                <p className="font-bold text-red-800">❌ {language === "en" ? "Traditional Mandi Middlemen" : "पारंपरिक आढ़तिया"}</p>
                <ul className="mt-1 space-y-1 text-red-700 text-[11px]">
                  <li>• 30% - 40% income lost in commissions & weighing fees</li>
                  <li>• 4-7 days delayed payments with cash risk</li>
                  <li>• Small individual quantity rejected at gate</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-green-50 border border-green-200/60">
                <p className="font-bold text-[#1F5130]">✅ {language === "en" ? "HarvestMarket Collective Pooling" : "हार्वेस्टमार्केट कलेक्टिव पूल"}</p>
                <ul className="mt-1 space-y-1 text-[#1F5130] text-[11px]">
                  <li>• 0% middlemen commission straight to farmer</li>
                  <li>• Instant transparent escrow payout upon deal lock</li>
                  <li>• Smallholder lots combined to fulfill bulk hotel orders</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Demo Switcher */}
          <div className="agro-card p-4 bg-[#fff3e0] border-[#F5A623]/30">
            <p className="text-[10px] font-bold text-[#d88909] uppercase tracking-wider mb-2">
              🧪 {t.demoAccountNotice}
            </p>
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "farmer-1", name: "Ramesh Patel (F)" },
                { id: "farmer-2", name: "Suresh Patil (F)" },
                { id: "farmer-3", name: "Ganesh Shinde (F)" },
                { id: "buyer-1", name: "Taj Hotels (B)", link: "/buyer" },
                { id: "buyer-2", name: "Nature's Fresh (B)", link: "/buyer" },
              ].map((u) => (
                <DemoSwitchButton key={u.id} id={u.id} name={u.name} link={u.link} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoSwitchButton({ id, name, link }: { id: string; name: string; link?: string }) {
  const { switchDemoUser, currentUser } = useMarketStore();
  const isActive = currentUser?.id === id;

  return (
    <button
      onClick={() => {
        switchDemoUser(id);
        if (link) window.location.href = link;
      }}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
        isActive
          ? "bg-[#1F5130] text-white border-[#1F5130] shadow-xs"
          : "bg-white text-gray-700 border-gray-200 hover:border-[#1F5130] hover:bg-gray-50"
      }`}
    >
      {name}
    </button>
  );
}
