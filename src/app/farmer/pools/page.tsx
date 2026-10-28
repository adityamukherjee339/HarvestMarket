"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";
import { useMarketStore } from "@/lib/store";
import { DEMO_CROPS } from "@/lib/demo-data";
import Link from "next/link";
import {
  TrendingUp,
  Clock,
  Users,
  ArrowRight,
  Gavel,
  Eye,
} from "lucide-react";

import { TimeRemaining } from "@/components/common/TimeRemaining";

function formatPaise(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}

function UrgencyBadge({ state }: { state: string }) {
  const colors: Record<string, string> = {
    fresh: "bg-[#e8f5e9] text-[#1F5130] border-[#4CAF50]",
    moderate: "bg-[#fff3e0] text-[#d88909] border-[#F5A623]",
    urgent: "bg-[#ffebee] text-[#D84A3A] border-[#D84A3A]",
    expired: "bg-gray-100 text-gray-400 border-gray-300",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${colors[state] || colors.fresh}`}>
      {state === "fresh" ? "🟢 Fresh" : state === "moderate" ? "🟡 Moderate" : state === "urgent" ? "🔴 Urgent" : "⚫ Expired"}
    </span>
  );
}

export default function FarmerPoolsPage() {
  const { language } = useI18n();
  const { pools, currentUser } = useMarketStore();

  const activePools = pools.filter((p) => p.status === "active");
  const myPools = activePools.filter((p) => p.listings.some((l) => l.farmer_id === currentUser?.id));
  const otherPools = activePools.filter((p) => !p.listings.some((l) => l.farmer_id === currentUser?.id));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-[var(--font-poppins)] text-xl font-bold text-[#1F5130]">
          {language === "en" ? "Harvest Pools" : "फसल पूल"}
        </h1>
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1F5130]/50 text-white text-xs font-semibold cursor-default" title="Coming Soon">
          <Eye className="w-3.5 h-3.5" />
          {language === "en" ? "Map View" : "मैप"}
        </span>
      </div>

      {/* My Pools */}
      {myPools.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#5D4037] mb-2 flex items-center gap-1.5">
            <Gavel className="w-4 h-4 text-[#F5A623]" />
            {language === "en" ? "My Active Pools" : "मेरे सक्रिय पूल"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myPools.map((pool) => (
              <PoolCard key={pool.id} pool={pool} language={language} isMine />
            ))}
          </div>
        </div>
      )}

      {/* Other Pools */}
      {otherPools.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">
            {language === "en" ? "Nearby Active Pools" : "पास के सक्रिय पूल"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherPools.map((pool) => (
              <PoolCard key={pool.id} pool={pool} language={language} />
            ))}
          </div>
        </div>
      )}

      {activePools.length === 0 && (
        <div className="agro-card p-8 text-center">
          <span className="text-4xl block mb-3">🌾</span>
          <p className="text-sm text-gray-500">
            {language === "en" ? "No active pools at the moment." : "फिलहाल कोई सक्रिय पूल नहीं।"}
          </p>
        </div>
      )}
    </div>
  );
}

function PoolCard({ pool, language, isMine }: { pool: ReturnType<typeof useMarketStore>["pools"][0]; language: string; isMine?: boolean }) {
  const cropInfo = DEMO_CROPS[pool.crop];
  const topBid = pool.bids.filter((b) => b.status === "active").sort((a, b) => b.price_per_kg_paise - a.price_per_kg_paise)[0];
  const aboveMandiPct = topBid
    ? Math.round(((topBid.price_per_kg_paise - pool.gov_mandi_price_paise) / pool.gov_mandi_price_paise) * 100)
    : 0;

  return (
    <Link href={`/farmer/pools/${pool.id}`}>
      <div className={`agro-card agro-card-interactive p-4 ${isMine ? "border-l-4 border-l-[#4CAF50]" : ""}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{cropInfo?.icon || "🌿"}</span>
            <div>
              <h3 className="font-semibold text-[#1F5130] text-sm">
                {language === "en" ? cropInfo?.display_name_en : cropInfo?.display_name_hi}{" "}
                <span className="text-xs font-bold text-[#F5A623]">Grade {pool.grade}</span>
              </h3>
              <p className="text-[11px] text-gray-500">{pool.village_cluster}</p>
            </div>
          </div>
          <UrgencyBadge state={pool.urgency_state} />
        </div>

        <div className="grid grid-cols-4 gap-2 mt-2">
          <div className="text-center p-1.5 rounded-lg bg-[#FFF8E7]">
            <p className="text-[9px] text-gray-400">{language === "en" ? "QTY" : "मात्रा"}</p>
            <p className="text-sm font-bold text-[#1F5130] num-tabular">{(pool.total_kg / 100).toFixed(1)}q</p>
          </div>
          <div className="text-center p-1.5 rounded-lg bg-[#FFF8E7]">
            <p className="text-[9px] text-gray-400 flex items-center justify-center gap-0.5">
              <Users className="w-2.5 h-2.5" /> {language === "en" ? "Pool" : "किसान"}
            </p>
            <p className="text-sm font-bold text-[#1F5130]">{pool.farmers_count}</p>
          </div>
          <div className="text-center p-1.5 rounded-lg bg-[#e8f5e9]">
            <p className="text-[9px] text-gray-400">{language === "en" ? "GOVT" : "मंडी"}</p>
            <p className="text-sm font-bold text-[#5D4037] num-tabular">{formatPaise(pool.gov_mandi_price_paise)}</p>
          </div>
          <div className="text-center p-1.5 rounded-lg bg-[#e8f5e9]">
            <p className="text-[9px] text-gray-400">{language === "en" ? "TOP BID" : "उच्चतम"}</p>
            <p className="text-sm font-bold text-[#1F5130] num-tabular">{topBid ? formatPaise(topBid.price_per_kg_paise) : "—"}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          {topBid && aboveMandiPct > 0 && (
            <span className="text-[11px] font-semibold text-[#4CAF50] flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {aboveMandiPct}% {language === "en" ? "above mandi" : "मंडी से ऊपर"}
            </span>
          )}
          <span className="text-[11px] text-gray-400 flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" />
            <TimeRemaining expiresAt={pool.expires_at} />
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-[#26A69A]">
          {language === "en" ? "View Live Auction" : "लाइव नीलामी देखें"}
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}
