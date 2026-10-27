"use client";

import React from "react";
import { useMarketStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

export const ConnectivityChip: React.FC = () => {
  const { isOnline, queuedSyncCount } = useMarketStore();
  const { t } = useI18n();

  if (!isOnline) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ffebee] text-[#D84A3A] border border-[#ffcdd2] shadow-xs">
        <WifiOff className="w-3.5 h-3.5" />
        <span>
          {t.offline} {queuedSyncCount > 0 ? `(${queuedSyncCount} queued)` : ""}
        </span>
      </div>
    );
  }

  if (queuedSyncCount > 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e0f2f1] text-[#26A69A] border border-[#b2dfdb] animate-pulse">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        <span>{t.syncing}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e8f5e9] text-[#1F5130] border border-[#c8e6c9]">
      <span className="w-2 h-2 rounded-full bg-[#4CAF50] pulse-live-dot" />
      <span className="hidden sm:inline">{t.online}</span>
    </div>
  );
};
