"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useMarketStore, SplitPayoutItem } from "@/lib/store";
import { DEMO_CROPS } from "@/lib/demo-data";
import { TrustScoreBadge } from "@/components/common/TrustScoreBadge";
import {
  TrendingUp,
  Clock,
  Lock,
  Check,
  ArrowRight,
  Users,
  IndianRupee,
  Gavel,
  BarChart3,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  PartyPopper,
  Truck,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

import { TimeRemaining } from "@/components/common/TimeRemaining";

function formatPaise(paise: number): string {
  return `₹${(paise / 100).toFixed(2)}`;
}

function formatPaiseShort(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}

export default function PoolDetailPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Loading auction pool...</div>}>
      <PoolDetailPageContent />
    </React.Suspense>
  );
}

function PoolDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const { language } = useI18n();
  const { pools, acceptBid, currentUser } = useMarketStore();

  const poolId = params.id as string;
  const pool = pools.find((p) => p.id === poolId);

  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [selectedBidId, setSelectedBidId] = useState<string | null>(null);
  const [lockResult, setLockResult] = useState<{ payouts: SplitPayoutItem[]; totalAmountPaise: number } | null>(null);
  const [isLocking, setIsLocking] = useState(false);
  const [payoutStage, setPayoutStage] = useState<"locked" | "escrow_funded" | "processing" | "credited">("locked");

  const [sortBy, setSortBy] = useState<"price" | "pickup" | "trust">("price");

  const sortedBids = useMemo(() => {
    if (!pool) return [];
    const active = pool.bids.filter((b) => b.status === "active");
    switch (sortBy) {
      case "price": return [...active].sort((a, b) => b.price_per_kg_paise - a.price_per_kg_paise);
      case "pickup": return [...active].sort((a, b) => new Date(a.pickup_at).getTime() - new Date(b.pickup_at).getTime());
      case "trust": return [...active].sort((a, b) => b.buyer_trust - a.buyer_trust);
      default: return active;
    }
  }, [pool, sortBy]);

  if (!pool) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-4xl mb-3">🔍</span>
        <p className="text-gray-500">Pool not found</p>
        <button onClick={() => router.back()} className="mt-3 text-sm text-[#26A69A] font-semibold">Go Back</button>
      </div>
    );
  }

  const cropInfo = DEMO_CROPS[pool.crop];
  const topBid = sortedBids[0];
  const aboveMandiPct = topBid
    ? Math.round(((topBid.price_per_kg_paise - pool.gov_mandi_price_paise) / pool.gov_mandi_price_paise) * 100)
    : 0;

  const handleLockDeal = () => {
    if (!selectedBidId) return;
    setIsLocking(true);
    setTimeout(() => {
      const result = acceptBid(pool.id, selectedBidId);
      if (result.success) {
        setLockResult(result);
        setPayoutStage("locked");
        // Simulate payout stages
        setTimeout(() => setPayoutStage("escrow_funded"), 2000);
        setTimeout(() => setPayoutStage("processing"), 5000);
        setTimeout(() => setPayoutStage("credited"), 8000);
      }
      setIsLocking(false);
      setShowLockConfirm(false);
    }, 1500);
  };

  // Lock result / payout view
  if (lockResult) {
    const myPayout = lockResult.payouts.find((p) => p.farmer_id === currentUser?.id);
    return (
      <div className="space-y-5">
        {/* Success Header */}
        <div className="agro-card p-6 bg-gradient-to-br from-[#1F5130] to-[#2d6e43] text-white text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {payoutStage === "credited" ? (
              <PartyPopper className="w-8 h-8 text-[#F5A623]" />
            ) : (
              <Lock className="w-8 h-8 text-[#F5A623]" />
            )}
          </div>
          <h2 className="font-[var(--font-poppins)] text-xl font-bold mb-1">
            {payoutStage === "credited"
              ? (language === "en" ? "Payout Credited! 🎉" : "भुगतान जमा! 🎉")
              : (language === "en" ? "Deal Locked! 🔒" : "सौदा पक्का! 🔒")}
          </h2>
          <p className="text-sm text-white/80">
            {language === "en"
              ? "You can close the app. Payout continues in background."
              : "ऐप बंद कर सकते हैं। भुगतान पृष्ठभूमि में जारी रहेगा।"}
          </p>
        </div>

        {/* Payout Status Timeline */}
        <div className="agro-card p-4">
          <h3 className="font-semibold text-[#1F5130] text-sm mb-3">
            {language === "en" ? "Payment Timeline" : "भुगतान टाइमलाइन"}
          </h3>
          <div className="space-y-3">
            {[
              { key: "locked", label: language === "en" ? "Deal Locked" : "सौदा पक्का", icon: Lock },
              { key: "escrow_funded", label: language === "en" ? "Buyer Paid to Escrow" : "खरीदार ने एस्क्रो में भुगतान किया", icon: ShieldCheck },
              { key: "processing", label: language === "en" ? "Payout Processing" : "भुगतान प्रक्रिया में", icon: Loader2 },
              { key: "credited", label: language === "en" ? "Credited to Farmers" : "किसानों को जमा", icon: CheckCircle2 },
            ].map((step, idx) => {
              const stages = ["locked", "escrow_funded", "processing", "credited"];
              const currentIdx = stages.indexOf(payoutStage);
              const stepIdx = stages.indexOf(step.key);
              const isDone = stepIdx <= currentIdx;
              const isCurrent = stepIdx === currentIdx;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isDone ? "bg-[#4CAF50] text-white" : "bg-gray-100 text-gray-400"
                  } ${isCurrent && stepIdx < 3 ? "animate-pulse" : ""}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-sm ${isDone ? "text-[#1F5130] font-semibold" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                  {isDone && <Check className="w-4 h-4 text-[#4CAF50] ml-auto" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Split Payout Table */}
        <div className="agro-card p-4">
          <h3 className="font-semibold text-[#1F5130] text-sm mb-3 flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-[#F5A623]" />
            {language === "en" ? "Split Payout Breakdown" : "बंटवारा विवरण"}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-gray-400 uppercase border-b border-gray-100">
                  <th className="text-left py-2 font-semibold">{language === "en" ? "Farmer" : "किसान"}</th>
                  <th className="text-right py-2 font-semibold">{language === "en" ? "Qty" : "मात्रा"}</th>
                  <th className="text-right py-2 font-semibold">{language === "en" ? "Share" : "हिस्सा"}</th>
                  <th className="text-right py-2 font-semibold">{language === "en" ? "Amount" : "राशि"}</th>
                </tr>
              </thead>
              <tbody>
                {lockResult.payouts.map((payout) => (
                  <tr
                    key={payout.farmer_id}
                    className={`border-b border-gray-50 ${payout.farmer_id === currentUser?.id ? "bg-[#e8f5e9]" : ""}`}
                  >
                    <td className="py-2.5 font-medium text-[#1F5130]">
                      {payout.farmer_name}
                      {payout.farmer_id === currentUser?.id && (
                        <span className="text-[10px] text-[#4CAF50] ml-1">(You)</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right text-gray-600 num-tabular">{payout.quantity_kg}kg</td>
                    <td className="py-2.5 text-right text-gray-600 num-tabular">{payout.share_pct}%</td>
                    <td className="py-2.5 text-right font-bold text-[#1F5130] num-tabular">{formatPaise(payout.amount_paise)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#1F5130]/20">
                  <td className="py-2.5 font-bold text-[#1F5130]">{language === "en" ? "Total" : "कुल"}</td>
                  <td className="py-2.5 text-right font-bold num-tabular">{pool.total_kg}kg</td>
                  <td className="py-2.5 text-right font-bold num-tabular">100%</td>
                  <td className="py-2.5 text-right font-bold text-[#1F5130] num-tabular">{formatPaise(lockResult.totalAmountPaise)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {myPayout && (
            <div className="mt-3 p-3 rounded-xl bg-[#1F5130] text-white text-center">
              <p className="text-xs text-white/70">{language === "en" ? "Your Payout" : "आपका भुगतान"}</p>
              <p className="font-[var(--font-poppins)] text-2xl font-bold num-tabular">{formatPaise(myPayout.amount_paise)}</p>
            </div>
          )}
        </div>

        <button
          onClick={() => router.push("/farmer/earnings")}
          className="w-full py-3.5 rounded-xl bg-[#1F5130] text-white font-semibold text-sm flex items-center justify-center gap-2 touch-target"
        >
          {language === "en" ? "View Earnings History" : "कमाई का इतिहास"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pool Header */}
      <div className="agro-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{cropInfo?.icon || "🌿"}</span>
          <div className="flex-1">
            <h1 className="font-[var(--font-poppins)] text-lg font-bold text-[#1F5130]">
              {language === "en" ? cropInfo?.display_name_en : cropInfo?.display_name_hi}{" "}
              <span className="text-[#F5A623]">Grade {pool.grade}</span>
            </h1>
            <p className="text-xs text-gray-500">{pool.village_cluster}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
            pool.urgency_state === "fresh" ? "bg-[#e8f5e9] text-[#1F5130] border-[#4CAF50]" :
            pool.urgency_state === "moderate" ? "bg-[#fff3e0] text-[#d88909] border-[#F5A623]" :
            "bg-[#ffebee] text-[#D84A3A] border-[#D84A3A]"
          }`}>
            {pool.urgency_state === "fresh" ? "🟢" : pool.urgency_state === "moderate" ? "🟡" : "🔴"} {pool.urgency_state}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Stat label={language === "en" ? "Total Qty" : "कुल मात्रा"} value={`${(pool.total_kg / 100).toFixed(1)}q`} />
          <Stat label={language === "en" ? "Farmers" : "किसान"} value={String(pool.farmers_count)} />
          <Stat label={language === "en" ? "Govt Rate" : "मंडी भाव"} value={formatPaiseShort(pool.gov_mandi_price_paise)} highlight="soil" />
          <Stat label={language === "en" ? "Reserve" : "न्यूनतम"} value={formatPaiseShort(pool.reserve_price_paise)} />
        </div>

        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> <TimeRemaining expiresAt={pool.expires_at} /></span>
          <span className="flex items-center gap-1"><Gavel className="w-3 h-3" /> {pool.bids.length} {language === "en" ? "bids" : "बोलियां"}</span>
        </div>
      </div>

      {/* Live Bid Feed */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-[var(--font-poppins)] font-bold text-[#1F5130] text-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4CAF50] pulse-live-dot" />
            {language === "en" ? "Live Bids" : "लाइव बोलियां"}
          </h2>
        </div>

        {/* Sort Chips */}
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
          {[
            { id: "price" as const, label: language === "en" ? "💰 Highest Price" : "💰 सबसे ऊंची", icon: ArrowUp },
            { id: "pickup" as const, label: language === "en" ? "🚚 Earliest Pickup" : "🚚 जल्दी पिकअप", icon: Truck },
            { id: "trust" as const, label: language === "en" ? "🛡️ Most Trusted" : "🛡️ सबसे विश्वसनीय", icon: ShieldCheck },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors ${
                sortBy === s.id
                  ? "bg-[#1F5130] text-white border-[#1F5130]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#1F5130]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {sortedBids.length === 0 ? (
          <div className="agro-card p-6 text-center">
            <Gavel className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {language === "en" ? "No bids yet. Waiting for buyers..." : "अभी तक कोई बोली नहीं..."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedBids.map((bid, idx) => (
              <div
                key={bid.id}
                className={`agro-card p-4 cursor-pointer transition-all ${
                  selectedBidId === bid.id ? "border-2 border-[#4CAF50] shadow-md" : ""
                } ${idx === 0 && sortBy === "price" ? "border-l-4 border-l-[#F5A623]" : ""}`}
                onClick={() => setSelectedBidId(bid.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-[#1F5130] text-sm">{bid.buyer_name}</p>
                    <p className="text-[11px] text-gray-500 capitalize">{bid.buyer_type}</p>
                  </div>
                  <TrustScoreBadge score={bid.buyer_trust} size="sm" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-1.5 rounded-lg bg-[#e8f5e9]">
                    <p className="text-[9px] text-gray-400">{language === "en" ? "BID" : "बोली"}</p>
                    <p className="text-base font-bold text-[#1F5130] num-tabular">{formatPaiseShort(bid.price_per_kg_paise)}<span className="text-[10px] font-normal">/kg</span></p>
                  </div>
                  <div className="text-center p-1.5 rounded-lg bg-[#FFF8E7]">
                    <p className="text-[9px] text-gray-400">{language === "en" ? "TOTAL" : "कुल"}</p>
                    <p className="text-sm font-bold text-[#1F5130] num-tabular">
                      {formatPaise(Math.round(bid.price_per_kg_paise * bid.quantity_kg))}
                    </p>
                  </div>
                  <div className="text-center p-1.5 rounded-lg bg-[#FFF8E7]">
                    <p className="text-[9px] text-gray-400">{language === "en" ? "PICKUP" : "पिकअप"}</p>
                    <p className="text-xs font-bold text-[#5D4037]">
                      {new Date(bid.pickup_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>

                {aboveMandiPct > 0 && idx === 0 && sortBy === "price" && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#4CAF50]">
                    <TrendingUp className="w-3 h-3" />
                    {aboveMandiPct}% {language === "en" ? "above govt mandi rate" : "सरकारी भाव से ज़्यादा"} 🏷️
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Farmers in Pool */}
      <div className="agro-card p-4">
        <h3 className="text-sm font-semibold text-[#1F5130] mb-2 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-[#26A69A]" />
          {language === "en" ? "Farmers in this Pool" : "इस पूल के किसान"}
        </h3>
        <div className="space-y-2">
          {pool.listings.map((listing) => (
            <div key={listing.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-[#1F5130]">{listing.farmer_name}</p>
                <p className="text-[11px] text-gray-500">{listing.village}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold num-tabular">{listing.quantity_kg}kg</p>
                <p className="text-[10px] text-gray-400">Grade {listing.ai_grade} ({(listing.ai_confidence * 100).toFixed(0)}%)</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lock Deal Button */}
      {selectedBidId && pool.status === "active" && (
        <div className="sticky bottom-20 z-30">
          <button
            onClick={() => setShowLockConfirm(true)}
            className="w-full py-4 rounded-2xl bg-[#F5A623] text-white font-bold text-base flex items-center justify-center gap-2 shadow-2xl hover:bg-[#d88909] active:scale-[0.98] transition-all touch-target"
          >
            <Lock className="w-5 h-5" />
            {language === "en" ? "Lock This Deal" : "सौदा पक्का करें"}
          </button>
        </div>
      )}

      {/* Lock Confirmation Modal */}
      {showLockConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={() => setShowLockConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <Lock className="w-12 h-12 text-[#F5A623] mx-auto mb-2" />
              <h3 className="font-[var(--font-poppins)] text-lg font-bold text-[#1F5130]">
                {language === "en" ? "Confirm Lock Deal?" : "सौदा पक्का करें?"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {language === "en"
                  ? "This action cannot be undone. Other bids will be rejected."
                  : "यह कार्य वापस नहीं किया जा सकता। अन्य बोलियां अस्वीकृत होंगी।"}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLockConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm touch-target"
              >
                {language === "en" ? "Cancel" : "रद्द करें"}
              </button>
              <button
                onClick={handleLockDeal}
                disabled={isLocking}
                className="flex-1 py-3 rounded-xl bg-[#1F5130] text-white font-semibold text-sm flex items-center justify-center gap-2 touch-target"
              >
                {isLocking ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    {language === "en" ? "Lock Deal" : "पक्का करें"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
  return (
    <div className="text-center p-1.5 rounded-lg bg-[#FFF8E7]">
      <p className="text-[9px] text-gray-400 uppercase">{label}</p>
      <p className={`text-sm font-bold num-tabular ${highlight === "soil" ? "text-[#5D4037]" : "text-[#1F5130]"}`}>{value}</p>
    </div>
  );
}
