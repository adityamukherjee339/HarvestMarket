"use client";

import React from "react";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { MarketStoreProvider, useMarketStore } from "@/lib/store";
import { FarmerBottomNav } from "@/components/farmer/FarmerBottomNav";
import { ConnectivityChip } from "@/components/common/ConnectivityChip";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { TrustScoreBadge } from "@/components/common/TrustScoreBadge";
import { Mic, Home, PlusCircle, Layers, IndianRupee, User, ArrowLeftRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function FarmerHeader() {
  const { currentUser } = useMarketStore();
  const { t, language } = useI18n();
  const pathname = usePathname();

  const navLinks = [
    { href: "/farmer", label: t.home, icon: Home },
    { href: "/farmer/log-harvest", label: t.logHarvest, icon: PlusCircle },
    { href: "/farmer/pools", label: t.pools, icon: Layers },
    { href: "/farmer/earnings", label: t.earnings, icon: IndianRupee },
    { href: "/farmer/profile", label: t.profile, icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#1F5130]/15 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Portal Badge */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🌾</span>
            <div>
              <span className="font-[var(--font-poppins)] font-bold text-[#1F5130] text-lg tracking-tight block leading-tight">
                HarvestMarket
              </span>
              <span className="text-[10px] font-semibold text-[#F5A623] tracking-wide uppercase">
                {language === "en" ? "Farmer Portal" : "किसान पोर्टल"}
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#1F5130] text-white shadow-sm"
                    : "text-[#5D4037] hover:text-[#1F5130] hover:bg-[#FFF8E7]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#F5A623]" : "text-gray-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ConnectivityChip />
          <LanguageToggle />

          {/* Switch to Buyer */}
          <Link
            href="/buyer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1F5130]/20 bg-[#FFF8E7] text-[#1F5130] hover:bg-[#1F5130] hover:text-white transition-all text-xs font-semibold"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>{language === "en" ? "Switch to Buyer" : "खरीदार पोर्टल"}</span>
          </Link>

          {currentUser && (
            <div className="hidden sm:block">
              <TrustScoreBadge score={currentUser.trust_score} size="sm" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function FarmerLayoutInner({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FFF8E7] flex flex-col">
      <React.Suspense fallback={<div className="h-16 bg-white border-b border-[#1F5130]/15" />}>
        <FarmerHeader />
      </React.Suspense>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        {children}
      </main>
      {/* Floating Mic FAB (Mobile only) */}
      <Link
        href="/farmer/log-harvest"
        className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[#F5A623] text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform border-2 border-white"
        aria-label="Speak your harvest"
      >
        <Mic className="w-6 h-6" />
      </Link>
      <React.Suspense fallback={null}>
        <FarmerBottomNav />
      </React.Suspense>
    </div>
  );
}

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <MarketStoreProvider>
        <FarmerLayoutInner>{children}</FarmerLayoutInner>
      </MarketStoreProvider>
    </I18nProvider>
  );
}
