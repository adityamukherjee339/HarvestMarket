"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { I18nProvider } from "@/lib/i18n";
import { MarketStoreProvider } from "@/lib/store";
import {
  Sprout,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Mic,
  Camera,
  BarChart3,
  Users,
  IndianRupee,
} from "lucide-react";

function LandingContent() {
  const { t, language } = useI18n();

  const stats = [
    { value: "30-40%", label: language === "en" ? "More income for farmers" : "किसानों को ज़्यादा आमदनी", icon: TrendingUp },
    { value: "AI", label: language === "en" ? "Photo quality grading" : "फोटो से क्वालिटी ग्रेडिंग", icon: Camera },
    { value: "₹0", label: language === "en" ? "Zero middleman fee" : "बिचौलिया शुल्क शून्य", icon: IndianRupee },
    { value: "Live", label: language === "en" ? "Transparent reverse auction" : "लाइव रिवर्स नीलामी", icon: BarChart3 },
  ];

  const features = [
    {
      icon: Mic,
      title: language === "en" ? "Voice Crop Logging" : "बोलकर फसल दर्ज करें",
      desc: language === "en"
        ? "Speak in Hindi or English — AI converts your voice to structured crop data instantly. No typing needed."
        : "हिंदी या अंग्रेज़ी में बोलें — AI आपकी आवाज़ को फसल डेटा में बदल देगा।",
    },
    {
      icon: Camera,
      title: language === "en" ? "AI Quality Grading" : "AI से ग्रेडिंग",
      desc: language === "en"
        ? "Take 2-3 photos of your harvest. Gemini AI grades quality (A/B/C) with defect analysis in seconds."
        : "2-3 फोटो लें, Gemini AI सेकंडों में A/B/C ग्रेड और दोष बताएगा।",
    },
    {
      icon: Users,
      title: language === "en" ? "Smart Pool Formation" : "स्मार्ट पूल बनाना",
      desc: language === "en"
        ? "Small harvests with same grade combine automatically within 10km. Meet MOQ together."
        : "एक ही ग्रेड की छोटी फसलें 10km में अपने-आप जुड़ जाती हैं।",
    },
    {
      icon: BarChart3,
      title: language === "en" ? "Live Reverse Auction" : "लाइव रिवर्स नीलामी",
      desc: language === "en"
        ? "Buyers bid UP. You see govt mandi rate vs live bids. Lock the best deal with one tap."
        : "खरीदार ऊपर बोली लगाएं। सरकारी मंडी भाव और लाइव बोली देखें। एक टैप में सौदा पक्का।",
    },
    {
      icon: IndianRupee,
      title: language === "en" ? "Transparent Split Payout" : "पारदर्शी बँटवारा",
      desc: language === "en"
        ? "Every farmer gets paid exactly by their contribution. Track payout status in real-time."
        : "हर किसान को उसके योगदान के हिसाब से भुगतान। रियल-टाइम ट्रैकिंग।",
    },
    {
      icon: ShieldCheck,
      title: language === "en" ? "Trust Scores" : "विश्वास स्कोर",
      desc: language === "en"
        ? "Both farmers and buyers earn trust scores. See who pays on time and delivers quality."
        : "किसान और खरीदार दोनों का विश्वास स्कोर। देखें कौन समय पर भुगतान करता है।",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#1F5130]/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <span className="font-[var(--font-poppins)] font-bold text-lg text-[#1F5130]">
              HarvestMarket
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5A623]/20 text-[#d88909] border border-[#F5A623]/30">
              DEMO MODE
            </span>
          </div>
        </div>
      </header>

      <div className="h-14" />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-10 pb-16">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #1F5130 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e8f5e9] text-[#1F5130] text-sm font-semibold mb-6 border border-[#4CAF50]/20">
            <Sprout className="w-4 h-4 text-[#4CAF50]" />
            <span>Code Yudh Hackathon — Team NativeCoder</span>
          </div>
          <h1 className="font-[var(--font-poppins)] text-4xl sm:text-5xl md:text-6xl font-bold text-[#1F5130] leading-tight mb-4">
            {language === "en" ? (
              <>Fair Price. Fresh Trust.<br /><span className="text-[#4CAF50]">Straight from the Field.</span></>
            ) : (
              <>सही दाम। ताज़ा विश्वास।<br /><span className="text-[#4CAF50]">सीधे खेत से बाज़ार।</span></>
            )}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            {language === "en"
              ? "India's first AI-powered harvest pooling platform. Smallholder farmers pool harvests, get AI quality grades, and sell directly to corporate buyers through live reverse auctions — no middlemen."
              : "भारत का पहला AI-संचालित फसल पूलिंग प्लेटफॉर्म। छोटे किसान फसल जोड़ें, AI ग्रेडिंग पाएं, और बिना बिचौलियों के सीधे कॉर्पोरेट खरीदारों को बेचें।"}
          </p>

          {/* Stat strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mb-12">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="agro-card p-4 flex flex-col items-center gap-1.5 agro-card-interactive"
              >
                <stat.icon className="w-6 h-6 text-[#F5A623]" />
                <span className="font-[var(--font-poppins)] text-2xl font-bold text-[#1F5130]">{stat.value}</span>
                <span className="text-xs text-gray-500 text-center leading-tight">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Two Portal Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Link href="/farmer" className="group">
              <div className="agro-card agro-card-interactive p-6 sm:p-8 text-left border-2 border-transparent hover:border-[#4CAF50] transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#e8f5e9] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    🧑‍🌾
                  </div>
                  <div>
                    <h2 className="font-[var(--font-poppins)] text-xl font-bold text-[#1F5130]">
                      {language === "en" ? "I'm a Farmer" : "मैं किसान हूं"}
                    </h2>
                    <span className="text-xs text-gray-500">
                      {language === "en" ? "Sell your harvest" : "अपनी फसल बेचें"}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                  {t.farmerTagline}
                </p>
                <div className="flex items-center gap-2 text-[#1F5130] font-semibold text-sm group-hover:gap-3 transition-all">
                  <span>{language === "en" ? "Enter Farmer Portal" : "किसान पोर्टल खोलें"}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            <Link href="/buyer" className="group">
              <div className="agro-card agro-card-interactive p-6 sm:p-8 text-left border-2 border-transparent hover:border-[#26A69A] transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#e0f2f1] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    🏢
                  </div>
                  <div>
                    <h2 className="font-[var(--font-poppins)] text-xl font-bold text-[#1F5130]">
                      {language === "en" ? "I'm a Buyer" : "मैं खरीदार हूं"}
                    </h2>
                    <span className="text-xs text-gray-500">
                      {language === "en" ? "Source verified produce" : "सत्यापित उपज खरीदें"}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                  {t.buyerTagline}
                </p>
                <div className="flex items-center gap-2 text-[#26A69A] font-semibold text-sm group-hover:gap-3 transition-all">
                  <span>{language === "en" ? "Enter Buyer Portal" : "खरीदार पोर्टल खोलें"}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-[var(--font-poppins)] text-2xl sm:text-3xl font-bold text-[#1F5130] text-center mb-2">
            {language === "en" ? "How It Works" : "यह कैसे काम करता है"}
          </h2>
          <p className="text-center text-gray-500 mb-10 text-sm">
            {language === "en" ? "Built for the farmer first — low bandwidth, low tech literacy, Hindi + English" : "किसान के लिए बना — कम बैंडविड्थ, आसान, हिंदी + अंग्रेज़ी"}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, idx) => (
              <div key={idx} className="agro-card p-5 agro-card-interactive">
                <div className="w-10 h-10 rounded-xl bg-[#1F5130]/5 flex items-center justify-center mb-3">
                  <feature.icon className="w-5 h-5 text-[#1F5130]" />
                </div>
                <h3 className="font-[var(--font-poppins)] font-semibold text-[#1F5130] mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 text-center bg-[#1F5130] text-white/80">
        <p className="text-sm font-semibold text-white mb-1">🌾 HarvestMarket</p>
        <p className="text-xs">Code Yudh Hackathon • Team NativeCoder • 2026</p>
        <p className="text-[11px] mt-2 opacity-60">
          Demo Mode — All data is simulated for demonstration
        </p>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <I18nProvider>
      <MarketStoreProvider>
        <LandingContent />
      </MarketStoreProvider>
    </I18nProvider>
  );
}
