"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Home, PlusCircle, Layers, IndianRupee, User } from "lucide-react";

export const FarmerBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    { href: "/farmer", label: t.home, icon: Home },
    { href: "/farmer/log-harvest", label: t.logHarvest, icon: PlusCircle, isCta: true },
    { href: "/farmer/pools", label: t.pools, icon: Layers },
    { href: "/farmer/earnings", label: t.earnings, icon: IndianRupee },
    { href: "/farmer/profile", label: t.profile, icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#1F5130]/15 shadow-lg safe-bottom">
      <div className="max-w-lg mx-auto px-2 flex items-center justify-around h-18">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isCta) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6 group"
              >
                <div className="w-14 h-14 rounded-full bg-[#1F5130] text-[#FFF8E7] flex items-center justify-center shadow-lg group-hover:scale-105 group-active:scale-95 transition-all border-4 border-[#FFF8E7]">
                  <Icon className="w-7 h-7 text-[#F5A623]" />
                </div>
                <span className="text-[11px] font-bold text-[#1F5130] mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] px-2 rounded-xl transition-colors ${
                isActive
                  ? "text-[#1F5130] font-bold"
                  : "text-gray-500 hover:text-[#1F5130] font-medium"
              }`}
            >
              <Icon
                className={`w-6 h-6 transition-transform ${
                  isActive ? "scale-110 text-[#1F5130]" : "text-gray-400"
                }`}
              />
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
