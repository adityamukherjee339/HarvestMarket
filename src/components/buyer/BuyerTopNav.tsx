"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useMarketStore } from "@/lib/store";
import { ConnectivityChip } from "@/components/common/ConnectivityChip";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { TrustScoreBadge } from "@/components/common/TrustScoreBadge";
import {
  LayoutDashboard,
  ShoppingCart,
  Handshake,
  User,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export const BuyerTopNav: React.FC = () => {
  const pathname = usePathname();
  const { t } = useI18n();
  const { currentUser } = useMarketStore();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navItems = [
    { href: "/buyer", label: t.marketplace, icon: LayoutDashboard },
    { href: "/buyer/bids", label: t.activeBids, icon: ShoppingCart },
    { href: "/buyer/deals", label: t.deals, icon: Handshake },
    { href: "/buyer/profile", label: t.profile, icon: User },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#1F5130]/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/buyer" className="flex items-center gap-2">
              <span className="text-2xl">🌾</span>
              <span className="font-[var(--font-poppins)] font-bold text-lg text-[#1F5130]">
                HarvestMarket
              </span>
            </Link>
            <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5A623]/20 text-[#d88909] border border-[#F5A623]/30">
              BUYER PORTAL
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#1F5130] text-white"
                      : "text-gray-600 hover:bg-[#1F5130]/10 hover:text-[#1F5130]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ConnectivityChip />
            <LanguageToggle />
            <Link
              href="/buyer/notifications"
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D84A3A]" />
            </Link>
            {currentUser && (
              <TrustScoreBadge score={currentUser.trust_score} size="sm" />
            )}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#1F5130] text-white"
                      : "text-gray-700 hover:bg-[#e8f5e9]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#D84A3A] hover:bg-[#ffebee]"
            >
              <LogOut className="w-5 h-5" />
              {t.logout}
            </Link>
          </div>
        )}
      </header>
      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
};
