"use client";

import React, { useEffect, useState } from "react";

interface Props {
  expiresAt: string;
  className?: string;
}

export function TimeRemaining({ expiresAt, className }: Props) {
  const [display, setDisplay] = useState<string>("--h --m");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    function update() {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setDisplay("Expired");
        return;
      }
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (hrs > 24) {
        setDisplay(`${Math.floor(hrs / 24)}d ${hrs % 24}h`);
      } else {
        setDisplay(`${hrs}h ${mins}m`);
      }
    }

    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!mounted) {
    return <span className={className}>--h --m</span>;
  }

  return <span className={className}>{display}</span>;
}
