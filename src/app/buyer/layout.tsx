"use client";

import React from "react";
import { I18nProvider } from "@/lib/i18n";
import { MarketStoreProvider } from "@/lib/store";
import { BuyerTopNav } from "@/components/buyer/BuyerTopNav";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <MarketStoreProvider>
        <div className="min-h-screen bg-[#FFF8E7] flex flex-col">
          <React.Suspense fallback={<div className="h-16 bg-white border-b border-gray-200" />}>
            <BuyerTopNav />
          </React.Suspense>
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4">
            {children}
          </main>
        </div>
      </MarketStoreProvider>
    </I18nProvider>
  );
}
