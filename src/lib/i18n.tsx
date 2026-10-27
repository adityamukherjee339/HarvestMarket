"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi";

export interface Translations {
  tagline: string;
  appTitle: string;
  farmer: string;
  buyer: string;
  farmerTagline: string;
  buyerTagline: string;
  online: string;
  offline: string;
  syncing: string;
  home: string;
  logHarvest: string;
  pools: string;
  earnings: string;
  profile: string;
  marketplace: string;
  activeBids: string;
  deals: string;
  trustScore: string;
  todaysMandiPrices: string;
  activeListings: string;
  speakHarvest: string;
  govBenchmark: string;
  yourPrice: string;
  highestBid: string;
  lockDeal: string;
  fresh: string;
  moderate: string;
  urgent: string;
  expired: string;
  quintals: string;
  kg: string;
  perKg: string;
  login: string;
  signup: string;
  logout: string;
  demoAccountNotice: string;
  switchRole: string;
  qualityGrade: string;
  photoVerified: string;
  countdown: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    tagline: "Fair price. Fresh trust. Straight from the field.",
    appTitle: "HarvestMarket",
    farmer: "Farmer",
    buyer: "Corporate Buyer",
    farmerTagline: "Pool your harvest, verify quality with AI, and get 30-40% higher live bids.",
    buyerTagline: "Direct bulk sourcing with verified quality grades and transparent escrow.",
    online: "Online",
    offline: "Offline",
    syncing: "Syncing...",
    home: "Home",
    logHarvest: "Log Crop",
    pools: "Pools",
    earnings: "Earnings",
    profile: "Profile",
    marketplace: "Marketplace",
    activeBids: "Active Bids",
    deals: "Deals",
    trustScore: "Trust Score",
    todaysMandiPrices: "Govt Mandi Benchmark Prices",
    activeListings: "My Active Harvest Lots",
    speakHarvest: "Speak Your Harvest",
    govBenchmark: "Govt Mandi Rate",
    yourPrice: "Your Start Price",
    highestBid: "Highest Bid",
    lockDeal: "Lock Best Deal",
    fresh: "Fresh",
    moderate: "Moderate",
    urgent: "Expiring Soon",
    expired: "Expired",
    quintals: "q",
    kg: "kg",
    perKg: "/kg",
    login: "Log In",
    signup: "Sign Up",
    logout: "Log Out",
    demoAccountNotice: "Hackathon Demo Mode Active",
    switchRole: "Switch Portal",
    qualityGrade: "Grade",
    photoVerified: "AI Verified",
    countdown: "Time Remaining",
  },
  hi: {
    tagline: "सही दाम। ताज़ा विश्वास। सीधे खेत से बाज़ार।",
    appTitle: "हार्वेस्टमार्केट",
    farmer: "किसान भाई",
    buyer: "थोक खरीदार",
    farmerTagline: "फसल जोड़ें, AI से ग्रेडिंग कराएं, और 30-40% ज्यादा दाम पाएं।",
    buyerTagline: "सीधे किसानों से सत्यापित गुणवत्ता वाला थोक माल खरीदें।",
    online: "ऑनलाइन",
    offline: "ऑफ़लाइन",
    syncing: "सिंक हो रहा है...",
    home: "होम",
    logHarvest: "फसल दर्ज करें",
    pools: "पूल",
    earnings: "कमाई",
    profile: "प्रोफ़ाइल",
    marketplace: "बाज़ार",
    activeBids: "सक्रिय बोलियां",
    deals: "सौदे",
    trustScore: "विश्वास स्कोर",
    todaysMandiPrices: "आज के सरकारी मंडी भाव",
    activeListings: "मेरी सक्रिय फसलें",
    speakHarvest: "बोलकर फसल बताएं",
    govBenchmark: "सरकारी मंडी दर",
    yourPrice: "आपकी शुरुआती दर",
    highestBid: "सबसे ऊंची बोली",
    lockDeal: "सौदा पक्का करें",
    fresh: "ताज़ा",
    moderate: "मध्यम",
    urgent: "जल्द समाप्त",
    expired: "समाप्त",
    quintals: "क्विंटल",
    kg: "किलो",
    perKg: "/किलो",
    login: "लॉग इन",
    signup: "साइन अप",
    logout: "लॉग आउट",
    demoAccountNotice: "डेमो मोड सक्रिय",
    switchRole: "पोर्टल बदलें",
    qualityGrade: "ग्रेड",
    photoVerified: "AI सत्यापित",
    countdown: "बचा हुआ समय",
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType>({
  language: "en",
  setLanguage: () => {},
  t: translations.en,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("harvestmarket_lang") as Language;
    if (saved === "hi" || saved === "en") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("harvestmarket_lang", lang);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
