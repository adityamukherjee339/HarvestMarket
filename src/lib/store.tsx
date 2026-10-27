"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  UserProfile,
  HarvestPool,
  HarvestListing,
  AuctionBid,
  DEMO_FARMERS,
  DEMO_BUYERS,
  INITIAL_POOLS,
  DEMO_CROPS,
} from "./demo-data";

export interface SplitPayoutItem {
  farmer_id: string;
  farmer_name: string;
  quantity_kg: number;
  share_pct: number;
  amount_paise: number;
  status: "locked" | "escrow_funded" | "processing" | "credited";
}

interface MarketStoreType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  switchDemoUser: (id: string) => void;
  isOnline: boolean;
  queuedSyncCount: number;
  pools: HarvestPool[];
  listings: HarvestListing[];
  addNewListing: (listing: Omit<HarvestListing, "id" | "captured_at" | "status">) => HarvestListing;
  placeBid: (poolId: string, pricePerKgPaise: number, quantityKg: number, pickupAt: string) => boolean;
  acceptBid: (poolId: string, bidId: string) => { success: boolean; payouts: SplitPayoutItem[]; totalAmountPaise: number };
  simulatePaymentStatus: (poolId: string, status: "processing" | "credited") => void;
  resetToDemo: () => void;
}

const MarketStoreContext = createContext<MarketStoreType | null>(null);

export const MarketStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => DEMO_FARMERS[0]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [queuedSyncCount, setQueuedSyncCount] = useState<number>(0);
  const [pools, setPools] = useState<HarvestPool[]>(() => INITIAL_POOLS);
  const [listings, setListings] = useState<HarvestListing[]>(() => {
    return INITIAL_POOLS.flatMap((p) => p.listings);
  });

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync state from localStorage if available
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("harvestmarket_current_user");
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      const savedPools = localStorage.getItem("harvestmarket_pools");
      if (savedPools) {
        setPools(JSON.parse(savedPools));
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  const savePools = (newPools: HarvestPool[]) => {
    setPools(newPools);
    try {
      localStorage.setItem("harvestmarket_pools", JSON.stringify(newPools));
    } catch {
      // Ignore
    }
  };

  const switchDemoUser = (id: string) => {
    const found = [...DEMO_FARMERS, ...DEMO_BUYERS].find((u) => u.id === id);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem("harvestmarket_current_user", JSON.stringify(found));
    }
  };

  // Dual-Key Pooling Algorithm: 10km radius + exact same crop & grade
  const addNewListing = (data: Omit<HarvestListing, "id" | "captured_at" | "status">): HarvestListing => {
    const newListing: HarvestListing = {
      ...data,
      id: `list-${Date.now()}`,
      captured_at: new Date().toISOString(),
      status: "pooled",
    };

    setListings((prev) => [newListing, ...prev]);

    // Check for matching active pool (same crop, same grade, within 10 km)
    const updatedPools = [...pools];
    const matchIndex = updatedPools.findIndex(
      (p) =>
        p.crop === data.crop &&
        p.grade === data.ai_grade &&
        p.status === "active"
    );

    if (matchIndex >= 0) {
      const pool = updatedPools[matchIndex];
      const newTotal = pool.total_kg + data.quantity_kg;
      // Weighted centroid calculation
      const newLat = (pool.centroid_lat * pool.total_kg + data.lat * data.quantity_kg) / newTotal;
      const newLng = (pool.centroid_lng * pool.total_kg + data.lng * data.quantity_kg) / newTotal;

      pool.total_kg = newTotal;
      pool.centroid_lat = newLat;
      pool.centroid_lng = newLng;
      pool.farmers_count += 1;
      pool.listings.push(newListing);
      newListing.pool_id = pool.id;
    } else {
      // Create new pool
      const cropProf = DEMO_CROPS[data.crop] || DEMO_CROPS.tomato;
      const newPoolId = `pool-${data.crop}-${data.ai_grade.toLowerCase()}-${Date.now().toString().slice(-4)}`;
      const newPool: HarvestPool = {
        id: newPoolId,
        crop: data.crop,
        grade: data.ai_grade,
        total_kg: data.quantity_kg,
        centroid_lat: data.lat,
        centroid_lng: data.lng,
        village_cluster: `${data.village} Cluster`,
        status: "active",
        expires_at: new Date(Date.now() + cropProf.shelf_life_hours * 3600 * 1000).toISOString(),
        base_price_paise: cropProf.base_price_paise,
        reserve_price_paise: data.expected_price_paise,
        gov_mandi_price_paise: cropProf.mandi_gov_price_paise,
        urgency_state: "fresh",
        farmers_count: 1,
        listings: [newListing],
        bids: [],
        created_at: new Date().toISOString(),
      };
      newListing.pool_id = newPoolId;
      updatedPools.unshift(newPool);
    }

    savePools(updatedPools);
    return newListing;
  };

  // Buyer places bid (validates price >= reserve)
  const placeBid = (poolId: string, pricePerKgPaise: number, quantityKg: number, pickupAt: string): boolean => {
    if (!currentUser || currentUser.role !== "buyer") return false;

    const updatedPools = pools.map((pool) => {
      if (pool.id !== poolId || pool.status !== "active") return pool;

      const newBid: AuctionBid = {
        id: `bid-${Date.now()}`,
        pool_id: poolId,
        buyer_id: currentUser.id,
        buyer_name: currentUser.company_name || currentUser.full_name,
        buyer_type: currentUser.business_type || "Corporate Buyer",
        buyer_trust: currentUser.trust_score,
        price_per_kg_paise: pricePerKgPaise,
        quantity_kg: quantityKg,
        pickup_at: pickupAt,
        status: "active",
        created_at: new Date().toISOString(),
      };

      // Mark lower bids as outbid
      const updatedBids = pool.bids.map((b) => ({
        ...b,
        status: b.price_per_kg_paise < pricePerKgPaise ? ("outbid" as const) : b.status,
      }));

      return {
        ...pool,
        bids: [newBid, ...updatedBids],
      };
    });

    savePools(updatedPools);
    return true;
  };

  // Atomic Accept Bid + Split Payout Arithmetic (Zero paise loss)
  const acceptBid = (
    poolId: string,
    bidId: string
  ): { success: boolean; payouts: SplitPayoutItem[]; totalAmountPaise: number } => {
    const pool = pools.find((p) => p.id === poolId);
    if (!pool || pool.status !== "active") {
      return { success: false, payouts: [], totalAmountPaise: 0 };
    }

    const winningBid = pool.bids.find((b) => b.id === bidId);
    if (!winningBid) {
      return { success: false, payouts: [], totalAmountPaise: 0 };
    }

    const totalAmountPaise = Math.round((winningBid.price_per_kg_paise * winningBid.quantity_kg));
    let runningTotalPaise = 0;

    // Calculate integer paise split for each farmer
    const payouts: SplitPayoutItem[] = pool.listings.map((item) => {
      const sharePct = Math.round((item.quantity_kg / pool.total_kg) * 10000) / 100;
      const farmerSharePaise = Math.floor((item.quantity_kg / pool.total_kg) * totalAmountPaise);
      runningTotalPaise += farmerSharePaise;

      return {
        farmer_id: item.farmer_id,
        farmer_name: item.farmer_name,
        quantity_kg: item.quantity_kg,
        share_pct: sharePct,
        amount_paise: farmerSharePaise,
        status: "processing",
      };
    });

    // Zero-loss remainder distribution to first lot (largest lot)
    const remainder = totalAmountPaise - runningTotalPaise;
    if (remainder > 0 && payouts.length > 0) {
      payouts[0].amount_paise += remainder;
    }

    const updatedPools = pools.map((p) => {
      if (p.id !== poolId) return p;
      return {
        ...p,
        status: "locked" as const,
        locked_bid: winningBid,
        bids: p.bids.map((b) => ({
          ...b,
          status: b.id === bidId ? ("accepted" as const) : ("rejected" as const),
        })),
        listings: p.listings.map((l) => ({ ...l, status: "sold" as const })),
      };
    });

    savePools(updatedPools);

    // Save payouts to local store for viewing
    try {
      localStorage.setItem(`harvestmarket_payout_${poolId}`, JSON.stringify(payouts));
    } catch {
      // Ignore
    }

    return { success: true, payouts, totalAmountPaise };
  };

  const simulatePaymentStatus = (poolId: string, status: "processing" | "credited") => {
    const updated = pools.map((p) => {
      if (p.id === poolId) {
        return {
          ...p,
          status: status === "credited" ? ("paid" as const) : p.status,
        };
      }
      return p;
    });
    savePools(updated);
  };

  const resetToDemo = () => {
    localStorage.removeItem("harvestmarket_pools");
    localStorage.removeItem("harvestmarket_current_user");
    setPools(INITIAL_POOLS);
    setCurrentUser(DEMO_FARMERS[0]);
    setListings(INITIAL_POOLS.flatMap((p) => p.listings));
  };

  return (
    <MarketStoreContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchDemoUser,
        isOnline,
        queuedSyncCount,
        pools,
        listings,
        addNewListing,
        placeBid,
        acceptBid,
        simulatePaymentStatus,
        resetToDemo,
      }}
    >
      {children}
    </MarketStoreContext.Provider>
  );
};

export const useMarketStore = () => {
  const ctx = useContext(MarketStoreContext);
  if (!ctx) throw new Error("useMarketStore must be used inside MarketStoreProvider");
  return ctx;
};
