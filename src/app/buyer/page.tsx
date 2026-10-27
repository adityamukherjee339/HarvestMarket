"use client";

import React, { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { useMarketStore } from "@/lib/store";
import { DEMO_CROPS, DEMO_BUYERS } from "@/lib/demo-data";
import Link from "next/link";
import {
  Search,
  Filter,
  TrendingUp,
  Clock,
  Users,
  ArrowRight,
  Gavel,
  MapPin,
  IndianRupee,
  Eye,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";

import { TimeRemaining } from "@/components/common/TimeRemaining";

function formatPaise(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}

export default function BuyerMarketplace() {
  const { language } = useI18n();
  const { pools, currentUser, switchDemoUser, placeBid } = useMarketStore();

  const [filterCrop, setFilterCrop] = useState("all");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterFreshness, setFilterFreshness] = useState("all");
  const [bidPoolId, setBidPoolId] = useState<string | null>(null);
  const [bidPrice, setBidPrice] = useState("");
  const [bidQty, setBidQty] = useState("");
  const [showBidSuccess, setShowBidSuccess] = useState(false);

  const activePools = useMemo(() => {
    return pools
      .filter((p) => p.status === "active")
      .filter((p) => filterCrop === "all" || p.crop === filterCrop)
      .filter((p) => filterGrade === "all" || p.grade === filterGrade)
      .filter((p) => filterFreshness === "all" || p.urgency_state === filterFreshness)
      .sort((a, b) => {
        // Priority: urgent first, then by total_kg descending
        const urgencyOrder = { urgent: 0, moderate: 1, fresh: 2, expired: 3 };
        return (urgencyOrder[a.urgency_state] || 3) - (urgencyOrder[b.urgency_state] || 3);
      });
  }, [pools, filterCrop, filterGrade, filterFreshness]);

  // Ensure we're a buyer
  React.useEffect(() => {
    if (!currentUser || currentUser.role !== "buyer") {
      switchDemoUser("buyer-1");
    }
  }, [currentUser, switchDemoUser]);

  const handlePlaceBid = (poolId: string) => {
    const pricePerKg = parseFloat(bidPrice);
    const qty = parseFloat(bidQty);
    if (!pricePerKg || !qty) return;

    const pricePaise = Math.round(pricePerKg * 100);
    const success = placeBid(poolId, pricePaise, qty, new Date(Date.now() + 24 * 3600 * 1000).toISOString());
    if (success) {
      setShowBidSuccess(true);
      setBidPoolId(null);
      setBidPrice("");
      setBidQty("");
      setTimeout(() => setShowBidSuccess(false), 3000);
    }
  };

  const cropsList = Object.values(DEMO_CROPS);

  return (
    <div className="space-y-5">
      {/* Bid Success Toast */}
      {showBidSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1F5130] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <Gavel className="w-5 h-5 text-[#F5A623]" />
          <span className="text-sm font-semibold">
            {language === "en" ? "Bid placed successfully!" : "बोली सफलतापूर्वक लगी!"}
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-[var(--font-poppins)] text-2xl font-bold text-[#1F5130]">
            {language === "en" ? "Marketplace" : "बाज़ार"}
          </h1>
          <p className="text-sm text-gray-500">
            {language === "en"
              ? `${activePools.length} verified harvest pools available for bidding`
              : `${activePools.length} सत्यापित फसल पूल बोली के लिए उपलब्ध`}
          </p>
        </div>
        <Link href="/map" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1F5130] text-white text-sm font-semibold touch-target">
          <MapPin className="w-4 h-4" />
          {language === "en" ? "Map View" : "मैप"}
        </Link>
      </div>

      {/* Filters */}
      <div className="agro-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal className="w-4 h-4 text-[#F5A623]" />
          <span className="text-sm font-semibold text-[#1F5130]">
            {language === "en" ? "Filters" : "फ़िल्टर"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Crop filter */}
          <select
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white text-[#1F5130] font-medium focus:border-[#1F5130] outline-none"
          >
            <option value="all">{language === "en" ? "All Crops" : "सभी फसल"}</option>
            {cropsList.map((c) => (
              <option key={c.crop} value={c.crop}>
                {c.icon} {language === "en" ? c.display_name_en : c.display_name_hi}
              </option>
            ))}
          </select>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white text-[#1F5130] font-medium focus:border-[#1F5130] outline-none"
          >
            <option value="all">{language === "en" ? "All Grades" : "सभी ग्रेड"}</option>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
          </select>
          <select
            value={filterFreshness}
            onChange={(e) => setFilterFreshness(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white text-[#1F5130] font-medium focus:border-[#1F5130] outline-none"
          >
            <option value="all">{language === "en" ? "All Freshness" : "सभी ताज़गी"}</option>
            <option value="fresh">{language === "en" ? "🟢 Fresh" : "🟢 ताज़ा"}</option>
            <option value="moderate">{language === "en" ? "🟡 Moderate" : "🟡 मध्यम"}</option>
            <option value="urgent">{language === "en" ? "🔴 Urgent" : "🔴 तत्काल"}</option>
          </select>
        </div>
      </div>

      {/* Pool Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activePools.map((pool) => {
          const cropInfo = DEMO_CROPS[pool.crop];
          const topBid = pool.bids.filter((b) => b.status === "active").sort((a, b) => b.price_per_kg_paise - a.price_per_kg_paise)[0];
          const aboveMandiPct = topBid
            ? Math.round(((topBid.price_per_kg_paise - pool.gov_mandi_price_paise) / pool.gov_mandi_price_paise) * 100)
            : 0;
          const isBidding = bidPoolId === pool.id;

          return (
            <div key={pool.id} className="agro-card agro-card-interactive p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{cropInfo?.icon || "🌿"}</span>
                  <div>
                    <h3 className="font-semibold text-[#1F5130] text-sm">
                      {language === "en" ? cropInfo?.display_name_en : cropInfo?.display_name_hi}
                    </h3>
                    <p className="text-[11px] text-gray-500">{pool.village_cluster}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  pool.urgency_state === "fresh" ? "bg-[#e8f5e9] text-[#1F5130] border-[#4CAF50]" :
                  pool.urgency_state === "moderate" ? "bg-[#fff3e0] text-[#d88909] border-[#F5A623]" :
                  "bg-[#ffebee] text-[#D84A3A] border-[#D84A3A]"
                }`}>
                  Grade {pool.grade} • {pool.urgency_state}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 my-3">
                <div className="text-center p-2 rounded-lg bg-[#FFF8E7]">
                  <p className="text-[9px] text-gray-400 uppercase">{language === "en" ? "Volume" : "मात्रा"}</p>
                  <p className="text-sm font-bold text-[#1F5130] num-tabular">{(pool.total_kg / 100).toFixed(1)}q</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-[#e8f5e9]">
                  <p className="text-[9px] text-gray-400 uppercase">{language === "en" ? "Govt Rate" : "मंडी"}</p>
                  <p className="text-sm font-bold text-[#5D4037] num-tabular">{formatPaise(pool.gov_mandi_price_paise)}/kg</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-[#e8f5e9]">
                  <p className="text-[9px] text-gray-400 uppercase">{language === "en" ? "Top Bid" : "उच्चतम"}</p>
                  <p className="text-sm font-bold text-[#1F5130] num-tabular">{topBid ? `${formatPaise(topBid.price_per_kg_paise)}` : "—"}/kg</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {pool.farmers_count} {language === "en" ? "farmers" : "किसान"}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> <TimeRemaining expiresAt={pool.expires_at} /></span>
                <span className="flex items-center gap-1"><Gavel className="w-3 h-3" /> {pool.bids.length} {language === "en" ? "bids" : "बोली"}</span>
              </div>

              {/* Quick Bid Drawer */}
              {isBidding ? (
                <div className="space-y-2 border-t border-gray-100 pt-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase">{language === "en" ? "Your Price (₹/kg)" : "आपकी दर (₹/kg)"}</label>
                      <input
                        type="number"
                        value={bidPrice}
                        onChange={(e) => setBidPrice(e.target.value)}
                        placeholder={topBid ? `Min ${((topBid.price_per_kg_paise + 50) / 100).toFixed(0)}` : "e.g. 35"}
                        className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-sm font-semibold num-tabular bg-[#FFF8E7] focus:border-[#1F5130] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase">{language === "en" ? "Quantity (kg)" : "मात्रा (kg)"}</label>
                      <input
                        type="number"
                        value={bidQty}
                        onChange={(e) => setBidQty(e.target.value)}
                        placeholder={`Max ${pool.total_kg}`}
                        className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-sm font-semibold num-tabular bg-[#FFF8E7] focus:border-[#1F5130] outline-none"
                      />
                    </div>
                  </div>
                  {bidPrice && bidQty && (
                    <p className="text-xs text-gray-500 text-center">
                      {language === "en" ? "Total:" : "कुल:"}{" "}
                      <span className="font-bold text-[#1F5130] num-tabular">
                        ₹{(parseFloat(bidPrice) * parseFloat(bidQty)).toLocaleString("en-IN")}
                      </span>
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBidPoolId(null)}
                      className="flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-600 font-semibold text-sm"
                    >
                      {language === "en" ? "Cancel" : "रद्द"}
                    </button>
                    <button
                      onClick={() => handlePlaceBid(pool.id)}
                      disabled={!bidPrice || !bidQty}
                      className="flex-1 py-2.5 rounded-lg bg-[#F5A623] text-white font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Gavel className="w-4 h-4" />
                      {language === "en" ? "Place Bid" : "बोली लगाएं"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setBidPoolId(pool.id)}
                  className="w-full py-3 rounded-xl bg-[#1F5130] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#143720] transition-colors touch-target"
                >
                  <Gavel className="w-4 h-4" />
                  {language === "en" ? "Place Bid" : "बोली लगाएं"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {activePools.length === 0 && (
        <div className="agro-card p-10 text-center">
          <span className="text-4xl block mb-3">🔍</span>
          <p className="text-gray-500">
            {language === "en" ? "No pools match your filters" : "कोई पूल आपके फ़िल्टर से मेल नहीं खाता"}
          </p>
        </div>
      )}

      {/* Demo Buyer Switcher */}
      <div className="agro-card p-3 bg-[#fff3e0] border-[#F5A623]/20">
        <p className="text-[10px] font-bold text-[#d88909] uppercase tracking-wider mb-2">
          🧪 Demo Buyer Accounts
        </p>
        <div className="flex gap-2 flex-wrap">
          {DEMO_BUYERS.map((b) => (
            <button
              key={b.id}
              onClick={() => switchDemoUser(b.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                currentUser?.id === b.id
                  ? "bg-[#1F5130] text-white border-[#1F5130]"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#1F5130]"
              }`}
            >
              {b.company_name}
            </button>
          ))}
          <Link href="/farmer" className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#e8f5e9] text-[#1F5130] border border-[#4CAF50]/30">
            → Farmer Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
