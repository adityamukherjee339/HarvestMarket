"use client";

import React, { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { useMarketStore } from "@/lib/store";
import { DEMO_CROPS } from "@/lib/demo-data";
import Link from "next/link";
import {
  Handshake,
  CheckCircle,
  Truck,
  QrCode,
  FileText,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  Users,
  Layers,
  ArrowRight,
  Sparkles,
  Building2,
  X,
  Phone,
  MapPin,
} from "lucide-react";
import confetti from "canvas-confetti";

function formatPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function formatPaiseShort(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}

interface DealItem {
  id: string;
  contractNumber: string;
  crop: string;
  grade: "A" | "B" | "C";
  villageCluster: string;
  totalKg: number;
  pricePerKgPaise: number;
  govMandiPricePaise: number;
  totalEscrowPaise: number;
  pickupTime: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  status: "pickup_ready" | "in_transit" | "delivered" | "settled";
  farmers: {
    name: string;
    village: string;
    quantityKg: number;
    sharePct: number;
    amountPaise: number;
    utr: string;
    status: "escrow_locked" | "credited";
  }[];
}

const SEEDED_DEALS: DealItem[] = [
  {
    id: "deal-hm-8921",
    contractNumber: "HM-NAS-2026-8921",
    crop: "tomato",
    grade: "A",
    villageCluster: "Pimpalgaon Cluster (Nashik APMC Bay 4)",
    totalKg: 1800,
    pricePerKgPaise: 3650, // ₹36.50/kg
    govMandiPricePaise: 2750,
    totalEscrowPaise: 6570000, // ₹65,700
    pickupTime: "Today at 04:30 PM",
    vehicleNumber: "MH-15-EG-4412 (Reefer 4°C)",
    driverName: "Kishore More",
    driverPhone: "+91 98223 99812",
    status: "pickup_ready",
    farmers: [
      {
        name: "Ramesh Patel",
        village: "Pimpalgaon",
        quantityKg: 800,
        sharePct: 44.44,
        amountPaise: 2920000,
        utr: "UTR-SBIN-261027-88124",
        status: "escrow_locked",
      },
      {
        name: "Suresh Shinde",
        village: "Niphad",
        quantityKg: 600,
        sharePct: 33.33,
        amountPaise: 2190000,
        utr: "UTR-HDFC-261027-44912",
        status: "escrow_locked",
      },
      {
        name: "Kavita Patil",
        village: "Sinnar",
        quantityKg: 400,
        sharePct: 22.23,
        amountPaise: 1460000,
        utr: "UTR-MAHB-261027-11029",
        status: "escrow_locked",
      },
    ],
  },
  {
    id: "deal-hm-8740",
    contractNumber: "HM-DIN-2026-8740",
    crop: "greens",
    grade: "A",
    villageCluster: "Dindori Organic Farm Collection Centre",
    totalKg: 650,
    pricePerKgPaise: 4200, // ₹42.00/kg
    govMandiPricePaise: 2900,
    totalEscrowPaise: 2730000, // ₹27,300
    pickupTime: "Yesterday 06:00 PM",
    vehicleNumber: "MH-15-BH-7729 (Insulated Van)",
    driverName: "Sachin Kadam",
    driverPhone: "+91 98220 54110",
    status: "in_transit",
    farmers: [
      {
        name: "Ganesh Jadhav",
        village: "Dindori",
        quantityKg: 400,
        sharePct: 61.54,
        amountPaise: 1680000,
        utr: "UTR-BARB-261026-90412",
        status: "escrow_locked",
      },
      {
        name: "Ramesh Patel",
        village: "Dindori",
        quantityKg: 250,
        sharePct: 38.46,
        amountPaise: 1050000,
        utr: "UTR-SBIN-261026-77190",
        status: "escrow_locked",
      },
    ],
  },
  {
    id: "deal-hm-8105",
    contractNumber: "HM-NIP-2026-8105",
    crop: "onion",
    grade: "B",
    villageCluster: "Niphad Onion Mandi Direct Hub",
    totalKg: 4200,
    pricePerKgPaise: 2750, // ₹27.50/kg
    govMandiPricePaise: 2280,
    totalEscrowPaise: 11550000, // ₹1,15,500
    pickupTime: "Oct 24, 2026",
    vehicleNumber: "MH-15-AK-9901 (10-Ton Truck)",
    driverName: "Baban Gaikwad",
    driverPhone: "+91 98221 88321",
    status: "settled",
    farmers: [
      {
        name: "Suresh Shinde",
        village: "Niphad",
        quantityKg: 2000,
        sharePct: 47.62,
        amountPaise: 5500000,
        utr: "UTR-MAHB-261024-33120",
        status: "credited",
      },
      {
        name: "Anand Deshmukh",
        village: "Yeola",
        quantityKg: 2200,
        sharePct: 52.38,
        amountPaise: 6050000,
        utr: "UTR-ICIC-261024-88410",
        status: "credited",
      },
    ],
  },
];

export default function BuyerDealsPage() {
  const { language } = useI18n();
  const { currentUser, pools } = useMarketStore();

  const [activeFilter, setActiveFilter] = useState<"all" | "pickup_ready" | "in_transit" | "settled">("all");
  const [expandedDealId, setExpandedDealId] = useState<string | null>("deal-hm-8921");
  const [selectedGatePass, setSelectedGatePass] = useState<DealItem | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<DealItem | null>(null);
  const [dealsList, setDealsList] = useState<DealItem[]>(SEEDED_DEALS);
  const [confirmToast, setConfirmToast] = useState<string | null>(null);

  // Filter deals
  const filteredDeals = useMemo(() => {
    if (activeFilter === "all") return dealsList;
    return dealsList.filter((d) => d.status === activeFilter);
  }, [activeFilter, dealsList]);

  // Total summary metrics
  const totalVolumeKg = useMemo(() => dealsList.reduce((acc, d) => acc + d.totalKg, 0), [dealsList]);
  const totalEscrowPaise = useMemo(() => dealsList.reduce((acc, d) => acc + d.totalEscrowPaise, 0), [dealsList]);

  const handleConfirmReceipt = (dealId: string) => {
    setDealsList((prev) =>
      prev.map((d) => {
        if (d.id !== dealId) return d;
        return {
          ...d,
          status: "settled",
          farmers: d.farmers.map((f) => ({ ...f, status: "credited" })),
        };
      })
    );

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    setConfirmToast(language === "en" ? "Handover confirmed! Farmer escrow split payouts credited instantly." : "सत्यापन सफल! किसानों के खाते में तत्काल भुगतान जमा हुआ।");
    setTimeout(() => setConfirmToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {confirmToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1F5130] text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#4CAF50] animate-bounce">
          <CheckCircle className="w-5 h-5 text-[#4CAF50]" />
          <span className="text-sm font-semibold">{confirmToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#1F5130] via-[#26623a] to-[#143720] text-white shadow-xl relative overflow-hidden border border-[#1F5130]/30">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-[#F5A623]/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-[#FFF8E7]">
              <Handshake className="w-3.5 h-3.5 text-[#F5A623]" />
              <span>{currentUser?.company_name || "Corporate Procurement"}</span>
              <span className="w-1 h-1 rounded-full bg-[#4CAF50]" />
              <span className="text-[#4CAF50] font-semibold">Live Escrow Active</span>
            </div>
            <h1 className="font-[var(--font-poppins)] text-2xl sm:text-3xl font-extrabold text-white">
              {language === "en" ? "Contracts & Locked Deals" : "सौदा और अनुबंध"}
            </h1>
            <p className="text-white/80 text-sm max-w-2xl leading-relaxed">
              {language === "en"
                ? "Manage locked reverse auction contracts, verify digital gate passes, track cold chain transport, and audit transparent split payouts directly to smallholder farmer accounts."
                : "नीलामी अनुबंध प्रबंधित करें, डिजिटल गेट पास जांचें, कोल्ड चेन वाहन ट्रैक करें, और किसानों के खातों में पारदर्शी भुगतान सत्यापित करें।"}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/buyer"
              className="px-5 py-3 rounded-2xl bg-[#F5A623] hover:bg-[#d88909] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <span>{language === "en" ? "Bid on Active Pools" : "नए पूल पर बोली लगाएं"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
            <p className="text-white/70 text-xs">{language === "en" ? "Total Procured" : "कुल खरीदी"}</p>
            <p className="text-lg sm:text-xl font-bold text-white mt-0.5 num-tabular">
              {(totalVolumeKg / 100).toFixed(1)} <span className="text-xs font-normal">q ({(totalVolumeKg / 1000).toFixed(2)} MT)</span>
            </p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
            <p className="text-white/70 text-xs">{language === "en" ? "Committed Escrow" : "एस्क्रो मूल्य"}</p>
            <p className="text-lg sm:text-xl font-bold text-white mt-0.5 num-tabular">
              {formatPaiseShort(totalEscrowPaise)}
            </p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
            <p className="text-white/70 text-xs">{language === "en" ? "Middleman Fees" : "बिचौलिया शुल्क"}</p>
            <p className="text-lg sm:text-xl font-bold text-[#4CAF50] mt-0.5">
              ₹0 (0% Cut)
            </p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
            <p className="text-white/70 text-xs">{language === "en" ? "Farmer Payout Rate" : "किसान भुगतान दर"}</p>
            <p className="text-lg sm:text-xl font-bold text-white mt-0.5">
              100% Direct
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-[#1F5130]/10 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "all", label: language === "en" ? "All Contracts" : "सभी अनुबंध", count: dealsList.length },
            { id: "pickup_ready", label: language === "en" ? "Ready for Pickup" : "उठाव हेतु तैयार", count: dealsList.filter((d) => d.status === "pickup_ready").length },
            { id: "in_transit", label: language === "en" ? "In Transit" : "मार्ग में", count: dealsList.filter((d) => d.status === "in_transit").length },
            { id: "settled", label: language === "en" ? "Completed & Settled" : "पूर्ण व चुकता", count: dealsList.filter((d) => d.status === "settled").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeFilter === tab.id
                  ? "bg-[#1F5130] text-white shadow-xs"
                  : "text-gray-600 hover:text-[#1F5130] hover:bg-[#FFF8E7]"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilter === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-500 hidden sm:inline-block pr-3">
          Showing {filteredDeals.length} active corporate orders
        </span>
      </div>

      {/* Deals List */}
      <div className="space-y-4">
        {filteredDeals.map((deal) => {
          const cropInfo = DEMO_CROPS[deal.crop];
          const isExpanded = expandedDealId === deal.id;

          return (
            <div
              key={deal.id}
              className="agro-card p-5 sm:p-6 bg-white hover:border-[#1F5130]/30 transition-all border border-[#1F5130]/12"
            >
              {/* Top Row: Crop info + Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{cropInfo?.icon || "🌿"}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-[var(--font-poppins)] font-bold text-[#1F5130] text-lg">
                        {language === "en" ? cropInfo?.display_name_en : cropInfo?.display_name_hi}
                      </h2>
                      <span className="px-2 py-0.5 rounded-md bg-[#FFF8E7] text-[#F5A623] font-bold text-xs border border-[#F5A623]/30">
                        Grade {deal.grade}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        #{deal.contractNumber}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#1F5130]" />
                      <span>{deal.villageCluster}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {deal.status === "pickup_ready" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e8f5e9] text-[#1F5130] border border-[#4CAF50]">
                      <span className="w-2 h-2 rounded-full bg-[#4CAF50] pulse-live-dot" />
                      {language === "en" ? "Ready for Farm Gate Pickup" : "उठाव के लिए तैयार"}
                    </span>
                  )}
                  {deal.status === "in_transit" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e0f2f1] text-[#26A69A] border border-[#26A69A]">
                      <Truck className="w-3.5 h-3.5 animate-bounce" />
                      {language === "en" ? "In Transit (Cold Chain)" : "मार्ग में (कोल्ड चेन)"}
                    </span>
                  )}
                  {deal.status === "settled" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                      <CheckCircle className="w-3.5 h-3.5 text-[#4CAF50]" />
                      {language === "en" ? "Delivered & Escrow Settled" : "प्राप्त व भुगतान पूर्ण"}
                    </span>
                  )}
                </div>
              </div>

              {/* Middle Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3.5 rounded-2xl bg-[#FFF8E7]/50 border border-[#1F5130]/10 text-center">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-medium">{language === "en" ? "Contract Quantity" : "अनुबंधित मात्रा"}</p>
                  <p className="text-sm sm:text-base font-extrabold text-[#1F5130] num-tabular">
                    {deal.totalKg.toLocaleString()} kg <span className="text-xs font-normal">({(deal.totalKg / 100).toFixed(1)}q)</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-medium">{language === "en" ? "Winning Rate" : "सौदा दर"}</p>
                  <p className="text-sm sm:text-base font-bold text-[#1F5130] num-tabular">
                    {formatPaiseShort(deal.pricePerKgPaise)}<span className="text-xs font-normal">/kg</span>
                  </p>
                  <p className="text-[10px] text-[#4CAF50] font-semibold">
                    +{Math.round(((deal.pricePerKgPaise - deal.govMandiPricePaise) / deal.govMandiPricePaise) * 100)}% over Mandi
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-medium">{language === "en" ? "Total Escrow Value" : "कुल एस्क्रो मूल्य"}</p>
                  <p className="text-sm sm:text-base font-extrabold text-[#1F5130] num-tabular">
                    {formatPaise(deal.totalEscrowPaise)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-medium">{language === "en" ? "Pickup Schedule" : "उठाव समय"}</p>
                  <p className="text-xs sm:text-sm font-semibold text-[#5D4037] mt-0.5">
                    {deal.pickupTime}
                  </p>
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="py-2">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-[#1F5130] text-white flex items-center justify-center font-bold text-xs mb-1">
                      ✓
                    </div>
                    <span className="font-semibold text-[#1F5130] text-[11px]">Bid Locked</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-[#1F5130] text-white flex items-center justify-center font-bold text-xs mb-1">
                      ✓
                    </div>
                    <span className="font-semibold text-[#1F5130] text-[11px]">Escrow Funded</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
                      deal.status === "in_transit" || deal.status === "settled" ? "bg-[#1F5130] text-white" : "bg-[#F5A623] text-white animate-pulse"
                    }`}>
                      {deal.status === "in_transit" || deal.status === "settled" ? "✓" : "3"}
                    </div>
                    <span className="font-semibold text-[11px] text-[#5D4037]">Gate QC & Pickup</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
                      deal.status === "settled" ? "bg-[#4CAF50] text-white" : "bg-gray-200 text-gray-500"
                    }`}>
                      {deal.status === "settled" ? "✓" : "4"}
                    </div>
                    <span className="font-semibold text-[11px] text-gray-500">Payout Released</span>
                  </div>
                </div>
                {/* Connecting track */}
                <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 relative overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#1F5130] via-[#26A69A] to-[#4CAF50] transition-all duration-500"
                    style={{
                      width: deal.status === "settled" ? "100%" : deal.status === "in_transit" ? "75%" : "50%",
                    }}
                  />
                </div>
              </div>

              {/* Expandable Farmer Collective Breakdown */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setExpandedDealId(isExpanded ? null : deal.id)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-[#1F5130] hover:text-[#143720] transition-colors py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#F5A623]" />
                    {language === "en"
                      ? `Pooled Collective (${deal.farmers.length} smallholder farmers combined) - Direct Split Audit`
                      : `संयुक्त किसान समूह (${deal.farmers.length} किसान जुड़े) - सीधा भुगतान विवरण`}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isExpanded && (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-[#FFF8E7] text-[#5D4037] font-semibold border-b border-[#1F5130]/10">
                          <th className="py-2.5 px-3 rounded-l-lg">Farmer Partner</th>
                          <th className="py-2.5 px-3">Village</th>
                          <th className="py-2.5 px-3">Supplied Qty</th>
                          <th className="py-2.5 px-3">Share %</th>
                          <th className="py-2.5 px-3">Exact Direct Payout</th>
                          <th className="py-2.5 px-3">Bank UTR Ref</th>
                          <th className="py-2.5 px-3 rounded-r-lg">Escrow Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {deal.farmers.map((farmer, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/70">
                            <td className="py-2.5 px-3 font-semibold text-[#1F5130] flex items-center gap-1.5">
                              <span>🧑‍🌾</span>
                              <span>{farmer.name}</span>
                            </td>
                            <td className="py-2.5 px-3 text-gray-500">{farmer.village}</td>
                            <td className="py-2.5 px-3 font-mono font-medium">{farmer.quantityKg} kg</td>
                            <td className="py-2.5 px-3 font-mono text-gray-600">{farmer.sharePct.toFixed(1)}%</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#1F5130]">
                              {formatPaise(farmer.amountPaise)}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[10px] text-gray-400">{farmer.utr}</td>
                            <td className="py-2.5 px-3">
                              {farmer.status === "credited" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#e8f5e9] text-[#4CAF50]">
                                  ✓ Credited
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#fff3e0] text-[#d88909]">
                                  🔒 In Escrow
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setSelectedGatePass(deal)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#1F5130]/20 hover:border-[#1F5130] text-[#1F5130] font-semibold text-xs transition-colors shadow-2xs"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#F5A623]" />
                    <span>{language === "en" ? "Digital Gate Pass" : "डिजिटल गेट पास"}</span>
                  </button>

                  <button
                    onClick={() => setSelectedInvoice(deal)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#1F5130]/20 hover:border-[#1F5130] text-[#1F5130] font-semibold text-xs transition-colors shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#26A69A]" />
                    <span>{language === "en" ? "Tax Invoice & Audit" : "टैक्स बिल व ऑडिट"}</span>
                  </button>

                  <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 text-gray-600 text-xs">
                    <Truck className="w-3.5 h-3.5 text-gray-400" />
                    <span>{deal.vehicleNumber} ({deal.driverName})</span>
                  </div>
                </div>

                {/* Status action */}
                {deal.status !== "settled" && (
                  <button
                    onClick={() => handleConfirmReceipt(deal.id)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1F5130] hover:bg-[#143720] text-white font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4 text-[#4CAF50]" />
                    <span>{language === "en" ? "Confirm Delivery & Release Escrow" : "डिलीवरी की पुष्टि करें व भुगतान जारी करें"}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Digital Gate Pass Modal */}
      {selectedGatePass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedGatePass(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-gray-100">
              <span className="text-3xl block mb-1">🌾</span>
              <h3 className="font-[var(--font-poppins)] font-bold text-[#1F5130] text-lg">
                APMC Authorized Digital Gate Pass
              </h3>
              <p className="text-xs text-gray-500 font-mono">
                PASS ID: {selectedGatePass.contractNumber}
              </p>
            </div>

            {/* Simulated QR Code Canvas */}
            <div className="my-5 p-4 rounded-2xl bg-[#FFF8E7] border-2 border-dashed border-[#1F5130]/30 flex flex-col items-center justify-center text-center">
              <div className="w-40 h-40 bg-white p-2 rounded-xl shadow-inner flex items-center justify-center">
                {/* SVG QR Code Pattern */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#1F5130]" fill="currentColor">
                  <path d="M0,0 h30 v30 h-30 z M5,5 h20 v20 h-20 z M10,10 h10 v10 h-10 z" />
                  <path d="M70,0 h30 v30 h-30 z M75,5 h20 v20 h-20 z M80,10 h10 v10 h-10 z" />
                  <path d="M0,70 h30 v30 h-30 z M5,75 h20 v20 h-20 z M10,80 h10 v10 h-10 z" />
                  <path d="M40,5 h10 v10 h-10 z M55,5 h10 v10 h-10 z M40,20 h20 v10 h-20 z" />
                  <path d="M5,40 h10 v10 h-10 z M20,40 h10 v10 h-10 z M5,55 h20 v10 h-20 z" />
                  <path d="M40,40 h20 v20 h-20 z M65,40 h10 v10 h-10 z M40,65 h10 v10 h-10 z" />
                  <path d="M80,40 h15 v10 h-15 z M70,55 h25 v10 h-25 z M80,70 h15 v20 h-15 z" />
                  <path d="M40,80 h30 v15 h-30 z" />
                </svg>
              </div>
              <p className="text-[11px] font-mono text-gray-500 mt-2">
                Scan at APMC Barrier & Farm Gate Weighbridge
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Authorized Vehicle:</span>
                <span className="font-bold text-[#1F5130]">{selectedGatePass.vehicleNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Designated Driver:</span>
                <span className="font-semibold text-gray-800">{selectedGatePass.driverName} ({selectedGatePass.driverPhone})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Authorized Quantity:</span>
                <span className="font-bold text-[#1F5130]">{selectedGatePass.totalKg} kg ({selectedGatePass.crop.toUpperCase()} Grade {selectedGatePass.grade})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Security Clearance:</span>
                <span className="text-[#4CAF50] font-bold">✓ Pre-verified by Escrow Deposit</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedGatePass(null)}
              className="mt-6 w-full py-3 rounded-xl bg-[#1F5130] text-white font-bold text-xs"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Tax Invoice & Split Audit Sheet */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
              <div>
                <span className="text-2xl">🌾</span>
                <h3 className="font-[var(--font-poppins)] font-bold text-[#1F5130] text-lg mt-1">
                  Tax Invoice & Split Payout Audit
                </h3>
                <p className="text-xs text-gray-500">
                  GST Compliant Direct Farmer Agricultural Purchase
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono font-bold text-gray-700">INVOICE: INV-{selectedInvoice.contractNumber}</p>
                <p className="text-xs text-gray-400">Date: {selectedInvoice.pickupTime}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Billed To (Buyer):</p>
                <p className="font-semibold text-gray-800 mt-1">{currentUser?.company_name || "Taj Gateway Hospitality Ltd"}</p>
                <p className="text-gray-500">GSTIN: {currentUser?.gst_number || "27AABCT3518Q1ZP"}</p>
                <p className="text-gray-500">Procurement Account • Nashik Regional Division</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Seller Entity:</p>
                <p className="font-semibold text-gray-800 mt-1">HarvestMarket Farmer Collective FPO</p>
                <p className="text-gray-500">Direct Farm Gate Collective Pool</p>
                <p className="text-gray-500">Nashik District, Maharashtra 422209</p>
              </div>
            </div>

            {/* Split Itemized Table */}
            <div className="my-4">
              <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px] mb-2">Itemized Crop Lots & Direct Farmer Disbursals:</p>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 font-semibold border-y border-gray-200">
                    <th className="py-2 px-2">Farmer</th>
                    <th className="py-2 px-2">Crop Description</th>
                    <th className="py-2 px-2">Rate/kg</th>
                    <th className="py-2 px-2">Qty (kg)</th>
                    <th className="py-2 px-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedInvoice.farmers.map((f, i) => (
                    <tr key={i}>
                      <td className="py-2.5 px-2 font-medium text-gray-800">{f.name} ({f.village})</td>
                      <td className="py-2.5 px-2 text-gray-500">{selectedInvoice.crop.toUpperCase()} Grade {selectedInvoice.grade} (HSN 0702)</td>
                      <td className="py-2.5 px-2 font-mono">₹{(selectedInvoice.pricePerKgPaise / 100).toFixed(2)}</td>
                      <td className="py-2.5 px-2 font-mono">{f.quantityKg} kg</td>
                      <td className="py-2.5 px-2 font-mono font-bold text-right text-gray-800">
                        {formatPaise(f.amountPaise)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#FFF8E7] font-bold text-[#1F5130]">
                    <td colSpan={3} className="py-2.5 px-2">Total Direct Farm Gate Purchase</td>
                    <td className="py-2.5 px-2 font-mono">{selectedInvoice.totalKg} kg</td>
                    <td className="py-2.5 px-2 font-mono text-right">{formatPaise(selectedInvoice.totalEscrowPaise)}</td>
                  </tr>
                  <tr className="text-gray-500 text-[11px]">
                    <td colSpan={4} className="py-1 px-2">Middleman Commissions / Broker Fees</td>
                    <td className="py-1 px-2 text-right font-mono text-[#4CAF50]">₹0.00 (Zero Fee)</td>
                  </tr>
                  <tr className="text-gray-500 text-[11px]">
                    <td colSpan={4} className="py-1 px-2">GST on Raw Farm Produce (Exempt under Sec 11)</td>
                    <td className="py-1 px-2 text-right font-mono">₹0.00</td>
                  </tr>
                  <tr className="border-t-2 border-[#1F5130] text-sm font-extrabold text-[#1F5130]">
                    <td colSpan={4} className="py-2.5 px-2">Total Invoice Value (Settled via Escrow)</td>
                    <td className="py-2.5 px-2 text-right font-mono">{formatPaise(selectedInvoice.totalEscrowPaise)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-[11px] text-gray-400">
                Digital Certificate ID: 2026-HM-AUDIT-99218
              </span>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2.5 rounded-xl bg-[#1F5130] text-white font-bold text-xs"
              >
                Close Audit Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
