export interface UserProfile {
  id: string;
  email: string;
  role: "farmer" | "buyer";
  full_name: string;
  phone: string;
  language: "en" | "hi";
  village?: string;
  company_name?: string;
  business_type?: "hotel" | "restaurant" | "supermarket" | "wholesaler" | "other";
  gst_number?: string;
  trust_score: number;
  trust_label: string;
  trust_updated_at: string;
}

export interface CropProfile {
  crop: string;
  display_name_en: string;
  display_name_hi: string;
  icon: string;
  shelf_life_hours: number;
  decay_rate: number;
  floor_pct: number;
  base_price_paise: number; // in paise
  mandi_gov_price_paise: number; // in paise
}

export interface HarvestListing {
  id: string;
  farmer_id: string;
  farmer_name: string;
  crop: string;
  quantity_kg: number;
  expected_price_paise: number; // What the farmer wants to start the bid at
  mandi_benchmark_paise: number; // Government mandi benchmark
  ai_grade: "A" | "B" | "C";
  ai_confidence: number;
  defects: string[];
  photo_urls: string[];
  lat: number;
  lng: number;
  village: string;
  captured_at: string;
  status: "logged" | "pooled" | "sold" | "cancelled";
  pool_id?: string;
}

export interface AuctionBid {
  id: string;
  pool_id: string;
  buyer_id: string;
  buyer_name: string;
  buyer_type: string;
  buyer_trust: number;
  price_per_kg_paise: number;
  quantity_kg: number;
  pickup_at: string;
  status: "active" | "outbid" | "accepted" | "rejected";
  created_at: string;
}

export interface HarvestPool {
  id: string;
  crop: string;
  grade: "A" | "B" | "C";
  total_kg: number;
  centroid_lat: number;
  centroid_lng: number;
  village_cluster: string;
  status: "active" | "locked" | "paid" | "closed" | "expired";
  expires_at: string;
  base_price_paise: number;
  reserve_price_paise: number;
  gov_mandi_price_paise: number;
  urgency_state: "fresh" | "moderate" | "urgent" | "expired";
  farmers_count: number;
  listings: HarvestListing[];
  bids: AuctionBid[];
  created_at: string;
  locked_bid?: AuctionBid;
  payment_id?: string;
}

export interface TrustEvent {
  id: string;
  user_id: string;
  event_type: string;
  title: string;
  value: number; // change in trust
  date: string;
  verified: boolean;
}

export const DEMO_CROPS: Record<string, CropProfile> = {
  tomato: {
    crop: "tomato",
    display_name_en: "Hybrid Tomato",
    display_name_hi: "हाइब्रिड टमाटर",
    icon: "🍅",
    shelf_life_hours: 72,
    decay_rate: 0.005,
    floor_pct: 65,
    base_price_paise: 3200, // ₹32.00/kg
    mandi_gov_price_paise: 2750, // Govt Mandi: ₹27.50/kg
  },
  onion: {
    crop: "onion",
    display_name_en: "Nashik Red Onion",
    display_name_hi: "नासिक लाल प्याज़",
    icon: "🧅",
    shelf_life_hours: 360,
    decay_rate: 0.001,
    floor_pct: 75,
    base_price_paise: 2600, // ₹26.00/kg
    mandi_gov_price_paise: 2280, // Govt Mandi: ₹22.80/kg
  },
  potato: {
    crop: "potato",
    display_name_en: "Chandramukhi Potato",
    display_name_hi: "चंद्रमुखी आलू",
    icon: "🥔",
    shelf_life_hours: 480,
    decay_rate: 0.0008,
    floor_pct: 80,
    base_price_paise: 2200, // ₹22.00/kg
    mandi_gov_price_paise: 1850, // Govt Mandi: ₹18.50/kg
  },
  wheat: {
    crop: "wheat",
    display_name_en: "Sharbati Golden Wheat",
    display_name_hi: "शरबती गेहूं",
    icon: "🌾",
    shelf_life_hours: 720,
    decay_rate: 0.0004,
    floor_pct: 85,
    base_price_paise: 3100, // ₹31.00/kg
    mandi_gov_price_paise: 2650, // Govt Mandi: ₹26.50/kg
  },
  greens: {
    crop: "greens",
    display_name_en: "Organic Spinach",
    display_name_hi: "देसी पालक",
    icon: "🥬",
    shelf_life_hours: 24,
    decay_rate: 0.015,
    floor_pct: 50,
    base_price_paise: 3800, // ₹38.00/kg
    mandi_gov_price_paise: 2900, // Govt Mandi: ₹29.00/kg
  },
};

// Deterministic baseline timestamp for seed data to avoid SSR/hydration mismatches
const DEMO_BASE_TIME = 1793102400000;
const demoIso = (offsetMs = 0) => new Date(DEMO_BASE_TIME + offsetMs).toISOString();

export const DEMO_FARMERS: UserProfile[] = [
  {
    id: "farmer-1",
    email: "farmer1@harvestmarket.in",
    role: "farmer",
    full_name: "Ramesh Patel",
    phone: "+91 98220 12341",
    language: "hi",
    village: "Pimpalgaon, Nashik",
    trust_score: 92,
    trust_label: "Prompt Handover (99%)",
    trust_updated_at: demoIso(),
  },
  {
    id: "farmer-2",
    email: "farmer2@harvestmarket.in",
    role: "farmer",
    full_name: "Suresh Shinde",
    phone: "+91 98220 12342",
    language: "hi",
    village: "Niphad, Nashik",
    trust_score: 84,
    trust_label: "Accurate Quality Grade",
    trust_updated_at: demoIso(),
  },
  {
    id: "farmer-3",
    email: "farmer3@harvestmarket.in",
    role: "farmer",
    full_name: "Ganesh Jadhav",
    phone: "+91 98220 12343",
    language: "en",
    village: "Dindori, Nashik",
    trust_score: 89,
    trust_label: "Zero Cancellation Record",
    trust_updated_at: demoIso(),
  },
  {
    id: "farmer-4",
    email: "farmer4@harvestmarket.in",
    role: "farmer",
    full_name: "Kavita Patil",
    phone: "+91 98220 12344",
    language: "hi",
    village: "Sinnar, Nashik",
    trust_score: 81,
    trust_label: "High Consistency",
    trust_updated_at: demoIso(),
  },
  {
    id: "farmer-5",
    email: "farmer5@harvestmarket.in",
    role: "farmer",
    full_name: "Anand Deshmukh",
    phone: "+91 98220 12345",
    language: "en",
    village: "Yeola, Nashik",
    trust_score: 50,
    trust_label: "New Farmer",
    trust_updated_at: demoIso(),
  },
];

export const DEMO_BUYERS: UserProfile[] = [
  {
    id: "buyer-1",
    email: "buyer1@harvestmarket.in",
    role: "buyer",
    full_name: "Vikram Mehta",
    company_name: "Taj Gateway Hospitality",
    business_type: "hotel",
    phone: "+91 98110 54321",
    language: "en",
    gst_number: "27AABCT3518Q1ZP",
    trust_score: 96,
    trust_label: "Instant Escrow & 24h Payout",
    trust_updated_at: demoIso(),
  },
  {
    id: "buyer-2",
    email: "buyer2@harvestmarket.in",
    role: "buyer",
    full_name: "Priya Roy",
    company_name: "Nature's Fresh Supermarket",
    business_type: "supermarket",
    phone: "+91 98110 54322",
    language: "en",
    gst_number: "27AABCN8821R1ZZ",
    trust_score: 88,
    trust_label: "On-Time Cold Chain Pickup",
    trust_updated_at: demoIso(),
  },
  {
    id: "buyer-3",
    email: "buyer3@harvestmarket.in",
    role: "buyer",
    full_name: "Amit Shah",
    company_name: "Hyperpure Wholesale",
    business_type: "wholesaler",
    phone: "+91 98110 54323",
    language: "hi",
    gst_number: "27AABCH1290M1Z2",
    trust_score: 92,
    trust_label: "Zero Dispute Record",
    trust_updated_at: demoIso(),
  },
];

export const INITIAL_POOLS: HarvestPool[] = [
  {
    id: "pool-nashik-tomato-a",
    crop: "tomato",
    grade: "A",
    total_kg: 1800,
    centroid_lat: 20.0059,
    centroid_lng: 73.79,
    village_cluster: "Pimpalgaon Cluster (Nashik)",
    status: "active",
    expires_at: demoIso(),
    base_price_paise: 3200,
    reserve_price_paise: 3100,
    gov_mandi_price_paise: 2750,
    urgency_state: "fresh",
    farmers_count: 3,
    listings: [
      {
        id: "list-1",
        farmer_id: "farmer-1",
        farmer_name: "Ramesh Patel",
        crop: "tomato",
        quantity_kg: 800,
        expected_price_paise: 3300,
        mandi_benchmark_paise: 2750,
        ai_grade: "A",
        ai_confidence: 0.94,
        defects: ["Uniform firmness", "Vibrant crimson shade"],
        photo_urls: ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80"],
        lat: 20.01,
        lng: 73.78,
        village: "Pimpalgaon",
        captured_at: demoIso(),
        status: "pooled",
      },
      {
        id: "list-2",
        farmer_id: "farmer-2",
        farmer_name: "Suresh Shinde",
        crop: "tomato",
        quantity_kg: 600,
        expected_price_paise: 3200,
        mandi_benchmark_paise: 2750,
        ai_grade: "A",
        ai_confidence: 0.91,
        defects: ["High brix content", "No blemishes"],
        photo_urls: ["https://images.unsplash.com/photo-1546470427-e26264be0b11?w=600&q=80"],
        lat: 20.02,
        lng: 73.81,
        village: "Niphad",
        captured_at: demoIso(),
        status: "pooled",
      },
      {
        id: "list-3",
        farmer_id: "farmer-4",
        farmer_name: "Kavita Patil",
        crop: "tomato",
        quantity_kg: 400,
        expected_price_paise: 3250,
        mandi_benchmark_paise: 2750,
        ai_grade: "A",
        ai_confidence: 0.89,
        defects: ["Export grade calibre"],
        photo_urls: ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80"],
        lat: 19.99,
        lng: 73.79,
        village: "Sinnar",
        captured_at: demoIso(),
        status: "pooled",
      },
    ],
    bids: [
      {
        id: "bid-101",
        pool_id: "pool-nashik-tomato-a",
        buyer_id: "buyer-1",
        buyer_name: "Taj Gateway Hospitality",
        buyer_type: "hotel",
        buyer_trust: 96,
        price_per_kg_paise: 3650, // ₹36.50/kg
        quantity_kg: 1800,
        pickup_at: demoIso(),
        status: "active",
        created_at: demoIso(),
      },
      {
        id: "bid-102",
        pool_id: "pool-nashik-tomato-a",
        buyer_id: "buyer-2",
        buyer_name: "Nature's Fresh Supermarket",
        buyer_type: "supermarket",
        buyer_trust: 88,
        price_per_kg_paise: 3450, // ₹34.50/kg
        quantity_kg: 1800,
        pickup_at: demoIso(),
        status: "outbid",
        created_at: demoIso(),
      },
    ],
    created_at: demoIso(),
  },
  {
    id: "pool-dindori-spinach-a",
    crop: "greens",
    grade: "A",
    total_kg: 650,
    centroid_lat: 20.1983,
    centroid_lng: 73.8322,
    village_cluster: "Dindori Organic Belt",
    status: "active",
    expires_at: demoIso(),
    base_price_paise: 3800,
    reserve_price_paise: 3350,
    gov_mandi_price_paise: 2900,
    urgency_state: "urgent",
    farmers_count: 2,
    listings: [
      {
        id: "list-4",
        farmer_id: "farmer-3",
        farmer_name: "Ganesh Jadhav",
        crop: "greens",
        quantity_kg: 400,
        expected_price_paise: 3900,
        mandi_benchmark_paise: 2900,
        ai_grade: "A",
        ai_confidence: 0.95,
        defects: ["Crisp tender leaves", "Harvested 3 hrs ago"],
        photo_urls: ["https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80"],
        lat: 20.2,
        lng: 73.83,
        village: "Dindori",
        captured_at: demoIso(),
        status: "pooled",
      },
      {
        id: "list-5",
        farmer_id: "farmer-1",
        farmer_name: "Ramesh Patel",
        crop: "greens",
        quantity_kg: 250,
        expected_price_paise: 3800,
        mandi_benchmark_paise: 2900,
        ai_grade: "A",
        ai_confidence: 0.88,
        defects: ["Zero yellowing", "Washed roots"],
        photo_urls: ["https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80"],
        lat: 20.19,
        lng: 73.84,
        village: "Dindori",
        captured_at: demoIso(),
        status: "pooled",
      },
    ],
    bids: [
      {
        id: "bid-201",
        pool_id: "pool-dindori-spinach-a",
        buyer_id: "buyer-3",
        buyer_name: "Hyperpure Wholesale",
        buyer_type: "wholesaler",
        buyer_trust: 92,
        price_per_kg_paise: 4200, // ₹42.00/kg (44% above mandi)
        quantity_kg: 650,
        pickup_at: demoIso(),
        status: "active",
        created_at: demoIso(),
      },
    ],
    created_at: demoIso(),
  },
  {
    id: "pool-niphad-onion-b",
    crop: "onion",
    grade: "B",
    total_kg: 4200,
    centroid_lat: 20.088,
    centroid_lng: 74.11,
    village_cluster: "Niphad Onion Mandi Cluster",
    status: "active",
    expires_at: demoIso(),
    base_price_paise: 2600,
    reserve_price_paise: 2500,
    gov_mandi_price_paise: 2280,
    urgency_state: "moderate",
    farmers_count: 4,
    listings: [
      {
        id: "list-6",
        farmer_id: "farmer-2",
        farmer_name: "Suresh Shinde",
        crop: "onion",
        quantity_kg: 2000,
        expected_price_paise: 2600,
        mandi_benchmark_paise: 2280,
        ai_grade: "B",
        ai_confidence: 0.86,
        defects: ["Size variance: medium-to-large", "Dry skin"],
        photo_urls: ["https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&q=80"],
        lat: 20.09,
        lng: 74.11,
        village: "Niphad",
        captured_at: demoIso(),
        status: "pooled",
      },
      {
        id: "list-7",
        farmer_id: "farmer-5",
        farmer_name: "Anand Deshmukh",
        crop: "onion",
        quantity_kg: 2200,
        expected_price_paise: 2550,
        mandi_benchmark_paise: 2280,
        ai_grade: "B",
        ai_confidence: 0.84,
        defects: ["Good firmness", "Minor outer peeling"],
        photo_urls: ["https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&q=80"],
        lat: 20.08,
        lng: 74.12,
        village: "Yeola",
        captured_at: demoIso(),
        status: "pooled",
      },
    ],
    bids: [
      {
        id: "bid-301",
        pool_id: "pool-niphad-onion-b",
        buyer_id: "buyer-2",
        buyer_name: "Nature's Fresh Supermarket",
        buyer_type: "supermarket",
        buyer_trust: 88,
        price_per_kg_paise: 2750, // ₹27.50/kg
        quantity_kg: 4200,
        pickup_at: demoIso(),
        status: "active",
        created_at: demoIso(),
      },
    ],
    created_at: demoIso(),
  },
];
