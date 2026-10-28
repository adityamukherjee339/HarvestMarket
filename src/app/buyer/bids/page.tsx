"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useMarketStore } from "@/lib/store";
import { DEMO_CROPS } from "@/lib/demo-data";
import { TimeRemaining } from "@/components/common/TimeRemaining";
import Link from "next/link";
import {
  ShoppingCart,
  TrendingUp,
  Clock,
  ArrowRight,
  Gavel,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Users,
} from "lucide-react";

function formatPaise(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}

export default function BuyerBidsPage() {
  const { language } = useI18n();
  const { pools, currentUser, placeBid } = useMarketStore();

  const [counterBidPoolId, setCounterBidPoolId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<string>("");

  // Extract all bids belonging to this buyer across all pools
  const myBidsWithPool = pools.flatMap((pool) => {
    const myBids = pool.bids.filter((b) => b.buyer_id === currentUser?.id);
    const topBid = pool.bids.filter((b) => b.status === "active").sort((a, b) => b.price_per_kg_paise - a.price_per_kg_paise)[0];
    return myBids.map((bid) => ({
      bid,
      pool,
      isTopBidder: topBid?.id === bid.id,
      topBid,
    }));
  });

  const handleUpdateBid = (poolId: string, currentTopPaise: number) => {
    const priceNum = parseFloat(newPrice);
    if (!priceNum || isNaN(priceNum)) return;
    const pricePaise = Math.round(priceNum * 100);
    if (pricePaise <= currentTopPaise) return;

    const pool = pools.find((p) => p.id === poolId);
    placeBid(poolId, pricePaise, pool?.total_kg || 1000, new Date().toISOString());
    setCounterBidPoolId(null);
    setNewPrice("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-[var(--font-poppins)] text-2xl font-bold text-[#1F5130] flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-[#F5A623]" />
            {language === "en" ? "My Live Auction Bids" : "मेरी लाइव बोलियां"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {language === "en"
              ? "Track your corporate bids against competing wholesale buyers in real-time."
              : "प्रतिस्पर्धी खरीदारों के विरुद्ध अपनी कॉर्पोरेट बोलियों को रीयल-टाइम में ट्रैक करें।"}
          </p>
        </div>

        <Link
          href="/buyer"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1F5130] text-white text-xs font-semibold shadow-xs hover:bg-[#143720] transition-colors"
        >
          <span>{language === "en" ? "Explore Marketplace" : "बाज़ार देखें"}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {myBidsWithPool.length === 0 ? (
        <div className="agro-card p-12 text-center bg-white border border-[#1F5130]/10">
          <span className="text-5xl block mb-3">🏷️</span>
          <h3 className="font-bold text-lg text-[#1F5130]">
            {language === "en" ? "No Active Bids Placed Yet" : "अभी तक कोई सक्रिय बोली नहीं"}
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-5">
            {language === "en"
              ? "Browse available farm-gate pools in the marketplace and place your first reverse auction bid."
              : "बाजार में उपलब्ध फसल पूल देखें और अपनी पहली नीलामी बोली लगाएं।"}
          </p>
          <Link
            href="/buyer"
            className="px-6 py-3 rounded-xl bg-[#F5A623] hover:bg-[#d88909] text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
          >
            <Gavel className="w-4 h-4" />
            <span>{language === "en" ? "Place Bids on Pools" : "पूल पर बोली लगाएं"}</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myBidsWithPool.map(({ bid, pool, isTopBidder, topBid }) => {
            const cropInfo = DEMO_CROPS[pool.crop];
            const isEditing = counterBidPoolId === pool.id;

            return (
              <div
                key={bid.id}
                className={`agro-card p-5 bg-white border transition-all ${
                  isTopBidder ? "border-l-4 border-l-[#4CAF50] border-[#1F5130]/15" : "border-l-4 border-l-[#D84A3A] border-[#1F5130]/15"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{cropInfo?.icon || "🌿"}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[#1F5130] text-base">
                          {language === "en" ? cropInfo?.display_name_en : cropInfo?.display_name_hi}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-[#FFF8E7] text-[#F5A623] font-bold text-xs">
                          Grade {pool.grade}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{pool.village_cluster}</p>
                    </div>
                  </div>

                  <div>
                    {isTopBidder ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#e8f5e9] text-[#1F5130] border border-[#4CAF50]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF50]" />
                        Highest Bidder
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ffebee] text-[#D84A3A] border border-[#D84A3A]">
                        <AlertCircle className="w-3.5 h-3.5 text-[#D84A3A]" />
                        Outbid
                      </span>
                    )}
                  </div>
                </div>

                {/* Price Comparisons */}
                <div className="grid grid-cols-3 gap-2 my-3 p-3 rounded-xl bg-[#FFF8E7]/60 text-center">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">{language === "en" ? "Your Bid" : "आपकी बोली"}</p>
                    <p className="text-sm font-bold text-[#1F5130] num-tabular">
                      {formatPaise(bid.price_per_kg_paise)}/kg
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">{language === "en" ? "Top Bid" : "उच्चतम बोली"}</p>
                    <p className="text-sm font-bold text-[#5D4037] num-tabular">
                      {topBid ? `${formatPaise(topBid.price_per_kg_paise)}/kg` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">{language === "en" ? "Time Left" : "समय बाकी"}</p>
                    <div className="text-xs font-bold text-[#d88909]">
                      <TimeRemaining expiresAt={pool.expires_at} />
                    </div>
                  </div>
                </div>

                {/* Counter Bid Area */}
                {!isTopBidder && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          placeholder={`Min ₹${((topBid?.price_per_kg_paise || 0) + 50) / 100}`}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-[#1F5130]"
                        />
                        <button
                          onClick={() => handleUpdateBid(pool.id, topBid?.price_per_kg_paise || 0)}
                          className="px-3 py-1.5 rounded-lg bg-[#1F5130] text-white text-xs font-bold"
                        >
                          Submit
                        </button>
                        <button
                          onClick={() => setCounterBidPoolId(null)}
                          className="px-2 py-1.5 text-xs text-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setCounterBidPoolId(pool.id);
                          setNewPrice(String(((topBid?.price_per_kg_paise || 0) + 100) / 100));
                        }}
                        className="w-full py-2 rounded-xl bg-[#F5A623] hover:bg-[#d88909] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{language === "en" ? "Outbid Competitor (Raise Bid)" : "बोली बढ़ाएं"}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
