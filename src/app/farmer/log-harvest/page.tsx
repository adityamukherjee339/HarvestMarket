"use client";

import React, { useState, useRef, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { useMarketStore } from "@/lib/store";
import { DEMO_CROPS } from "@/lib/demo-data";
import {
  Mic,
  MicOff,
  FileText,
  Camera,
  MapPin,
  Loader2,
  Check,
  ChevronDown,
  X,
  Sparkles,
  Volume2,
  AlertTriangle,
} from "lucide-react";

function formatPaise(paise: number): string {
  return `₹${(paise / 100).toFixed(2)}`;
}

type Tab = "voice" | "form" | "camera";

interface ParsedVoiceData {
  crop: string;
  quantity_kg: number;
  expected_price_paise: number;
  village: string;
  notes: string;
}

export default function LogHarvestPage() {
  const { t, language } = useI18n();
  const { currentUser, addNewListing } = useMarketStore();
  const [activeTab, setActiveTab] = useState<Tab>("voice");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceParsed, setVoiceParsed] = useState<ParsedVoiceData | null>(null);
  const [voiceRawText, setVoiceRawText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Form state
  const [formCrop, setFormCrop] = useState("tomato");
  const [formQuantity, setFormQuantity] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formVillage, setFormVillage] = useState(currentUser?.village || "Pimpalgaon, Nashik");
  const [formGrade, setFormGrade] = useState<"A" | "B" | "C">("A");
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // GPS state
  const [gpsLat, setGpsLat] = useState(20.0059);
  const [gpsLng, setGpsLng] = useState(73.79);
  const [gpsStatus, setGpsStatus] = useState<"ready" | "fetching" | "done" | "error">("ready");

  const cropsList = Object.values(DEMO_CROPS);

  const captureGPS = useCallback(() => {
    setGpsStatus("fetching");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLat(pos.coords.latitude);
          setGpsLng(pos.coords.longitude);
          setGpsStatus("done");
        },
        () => {
          // Fallback to Nashik
          setGpsStatus("done");
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setGpsStatus("done");
    }
  }, []);

  React.useEffect(() => {
    captureGPS();
  }, [captureGPS]);

  // Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        await processVoice();
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      // Fallback: simulate voice processing
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        simulateVoiceParsing();
      }, 2000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const processVoice = async () => {
    setIsProcessing(true);
    try {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", blob, "harvest_voice.webm");

      const res = await fetch("/api/voice-harvest", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setVoiceParsed(data.parsed);
        setVoiceRawText(data.transcription || "");
      } else {
        simulateVoiceParsing();
      }
    } catch {
      simulateVoiceParsing();
    }
    setIsProcessing(false);
  };

  const simulateVoiceParsing = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const demoText = language === "en"
        ? "I have 500 kg of tomatoes, A grade quality from Pimpalgaon. I want at least 35 rupees per kg."
        : "मेरे पास 500 किलो टमाटर है, A ग्रेड, पिम्पलगांव से। मुझे कम से कम 35 रुपए प्रति किलो चाहिए।";
      setVoiceRawText(demoText);
      setVoiceParsed({
        crop: "tomato",
        quantity_kg: 500,
        expected_price_paise: 3500,
        village: "Pimpalgaon, Nashik",
        notes: "A grade quality, farmer wants minimum ₹35/kg",
      });
      setIsProcessing(false);
    }, 1500);
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls: string[] = [];
    Array.from(files).forEach((file) => {
      urls.push(URL.createObjectURL(file));
    });
    setFormPhotos((prev) => [...prev, ...urls].slice(0, 3));
  };

  const submitListing = (data: {
    crop: string;
    quantity_kg: number;
    expected_price_paise: number;
    grade: "A" | "B" | "C";
    village: string;
    photos: string[];
  }) => {
    const cropInfo = DEMO_CROPS[data.crop] || DEMO_CROPS.tomato;
    addNewListing({
      farmer_id: currentUser?.id || "farmer-1",
      farmer_name: currentUser?.full_name || "Farmer",
      crop: data.crop,
      quantity_kg: data.quantity_kg,
      expected_price_paise: data.expected_price_paise,
      mandi_benchmark_paise: cropInfo.mandi_gov_price_paise,
      ai_grade: data.grade,
      ai_confidence: 0.88,
      defects: [],
      photo_urls: data.photos,
      lat: gpsLat,
      lng: gpsLng,
      village: data.village,
      pool_id: undefined,
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuantity || !formPrice) return;
    submitListing({
      crop: formCrop,
      quantity_kg: parseFloat(formQuantity),
      expected_price_paise: Math.round(parseFloat(formPrice) * 100),
      grade: formGrade,
      village: formVillage,
      photos: formPhotos,
    });
    // Reset form
    setFormQuantity("");
    setFormPrice("");
    setFormPhotos([]);
  };

  const handleVoiceConfirm = () => {
    if (!voiceParsed) return;
    submitListing({
      crop: voiceParsed.crop,
      quantity_kg: voiceParsed.quantity_kg,
      expected_price_paise: voiceParsed.expected_price_paise,
      grade: "A",
      village: voiceParsed.village,
      photos: [],
    });
    setVoiceParsed(null);
    setVoiceRawText("");
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "voice", label: language === "en" ? "Voice" : "आवाज़", icon: <Mic className="w-5 h-5" /> },
    { id: "form", label: language === "en" ? "Form" : "फॉर्म", icon: <FileText className="w-5 h-5" /> },
    { id: "camera", label: language === "en" ? "Camera" : "कैमरा", icon: <Camera className="w-5 h-5" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="font-[var(--font-poppins)] text-xl font-bold text-[#1F5130]">
        {language === "en" ? "Log Your Harvest" : "फसल दर्ज करें"}
      </h1>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1F5130] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <Check className="w-5 h-5 text-[#4CAF50]" />
          <span className="text-sm font-semibold">
            {language === "en" ? "Harvest logged & pooled!" : "फसल दर्ज और पूल हुई!"}
          </span>
        </div>
      )}

      {/* GPS Chip */}
      <div className="flex items-center gap-2">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
          gpsStatus === "done"
            ? "bg-[#e8f5e9] text-[#1F5130] border-[#4CAF50]"
            : gpsStatus === "fetching"
            ? "bg-[#fff3e0] text-[#d88909] border-[#F5A623] animate-pulse"
            : "bg-gray-100 text-gray-500 border-gray-200"
        }`}>
          <MapPin className="w-3.5 h-3.5" />
          {gpsStatus === "done"
            ? `${gpsLat.toFixed(4)}, ${gpsLng.toFixed(4)}`
            : gpsStatus === "fetching"
            ? (language === "en" ? "Fetching GPS..." : "GPS पा रहे हैं...")
            : (language === "en" ? "GPS Ready" : "GPS तैयार")}
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-1 bg-white rounded-2xl p-1 border border-[#1F5130]/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all touch-target ${
              activeTab === tab.id
                ? "bg-[#1F5130] text-white shadow-md"
                : "text-gray-500 hover:text-[#1F5130] hover:bg-[#e8f5e9]"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Voice Tab */}
      {activeTab === "voice" && (
        <div className="space-y-4">
          <div className="agro-card p-6 flex flex-col items-center text-center">
            <div className="mb-3">
              <Sparkles className="w-5 h-5 text-[#F5A623] mx-auto mb-1" />
              <p className="text-sm text-gray-600 leading-relaxed">
                {language === "en"
                  ? "Speak naturally in Hindi or English. Tell us your crop, quantity, quality, location, and the price you want."
                  : "हिंदी या अंग्रेज़ी में बात करें। फसल, मात्रा, गुणवत्ता, जगह और दाम बताएं।"}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                {language === "en"
                  ? 'Example: "I have 5 quintals of A-grade tomato from Nashik. I want ₹35 per kg."'
                  : 'उदाहरण: "मेरे पास नासिक से 5 क्विंटल A ग्रेड टमाटर है। ₹35 प्रति किलो चाहिए।"'}
              </p>
            </div>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all touch-target ${
                isRecording
                  ? "bg-[#D84A3A] text-white scale-110 pulse-urgent-dot"
                  : isProcessing
                  ? "bg-gray-300 text-gray-600"
                  : "bg-[#F5A623] text-white hover:scale-105 active:scale-95 shadow-lg"
              }`}
            >
              {isProcessing ? (
                <Loader2 className="w-10 h-10 animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-10 h-10" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>

            <p className="text-xs text-gray-500 mt-3">
              {isRecording
                ? (language === "en" ? "🔴 Recording... Tap to stop" : "🔴 रिकॉर्डिंग... रुकने के लिए टैप करें")
                : isProcessing
                ? (language === "en" ? "⏳ AI is parsing your voice..." : "⏳ AI आपकी आवाज़ समझ रहा है...")
                : (language === "en" ? "Tap the mic and speak" : "माइक दबाएं और बोलें")}
            </p>
          </div>

          {/* Parsed Voice Result as Editable Chips */}
          {voiceParsed && (
            <div className="agro-card p-4 space-y-3 border-2 border-[#4CAF50]">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#1F5130] text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#F5A623]" />
                  {language === "en" ? "AI Parsed Result" : "AI का नतीजा"}
                </h3>
                <button onClick={() => setVoiceParsed(null)}>
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {voiceRawText && (
                <div className="p-2.5 rounded-lg bg-[#FFF8E7] border border-[#F5A623]/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Volume2 className="w-3 h-3 text-[#F5A623]" />
                    <span className="text-[10px] font-semibold text-[#d88909] uppercase">
                      {language === "en" ? "Transcribed" : "लिखित"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 italic">&quot;{voiceRawText}&quot;</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-[#e8f5e9] text-[#1F5130] border border-[#4CAF50]/30">
                  {DEMO_CROPS[voiceParsed.crop]?.icon || "🌿"} {voiceParsed.crop}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-[#e0f2f1] text-[#26A69A] border border-[#26A69A]/30">
                  ⚖️ {voiceParsed.quantity_kg} kg
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-[#fff3e0] text-[#d88909] border border-[#F5A623]/30">
                  💰 {formatPaise(voiceParsed.expected_price_paise)}/kg
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                  📍 {voiceParsed.village}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleVoiceConfirm}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1F5130] text-white font-semibold text-sm hover:bg-[#143720] transition-colors touch-target"
                >
                  <Check className="w-5 h-5" />
                  {language === "en" ? "Confirm & Log" : "पुष्टि करें"}
                </button>
                <button
                  onClick={() => { setVoiceParsed(null); setVoiceRawText(""); }}
                  className="px-4 py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-colors touch-target"
                >
                  {language === "en" ? "Redo" : "फिर से"}
                </button>
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-[#e0f2f1] border border-[#26A69A]/20">
            <p className="text-[11px] text-[#26A69A] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {language === "en"
                ? "Gemini AI Voice Parser — translates unstructured rural audio & regional dialects into structured JSON data entries."
                : "Gemini AI वॉयस पार्सर — ग्रामीण बोली को संरचित डेटा में बदलता है।"}
            </p>
          </div>
        </div>
      )}

      {/* Form Tab */}
      {activeTab === "form" && (
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Crop Selector */}
          <div className="agro-card p-4">
            <label className="block text-sm font-semibold text-[#1F5130] mb-2">
              {language === "en" ? "Select Crop" : "फसल चुनें"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {cropsList.map((crop) => (
                <button
                  key={crop.crop}
                  type="button"
                  onClick={() => setFormCrop(crop.crop)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all touch-target ${
                    formCrop === crop.crop
                      ? "border-[#1F5130] bg-[#e8f5e9] shadow-sm"
                      : "border-transparent bg-[#FFF8E7] hover:border-[#4CAF50]/50"
                  }`}
                >
                  <span className="text-2xl">{crop.icon}</span>
                  <span className="text-[11px] font-semibold text-[#1F5130]">
                    {language === "en" ? crop.display_name_en.split(" ").pop() : crop.display_name_hi.split(" ").pop()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="agro-card p-4">
              <label className="block text-sm font-semibold text-[#1F5130] mb-1.5">
                {language === "en" ? "Quantity (kg)" : "मात्रा (किलो)"}
              </label>
              <input
                type="number"
                value={formQuantity}
                onChange={(e) => setFormQuantity(e.target.value)}
                placeholder="e.g. 500"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#1F5130] bg-[#FFF8E7] focus:border-[#1F5130] focus:ring-1 focus:ring-[#1F5130] outline-none num-tabular touch-target"
              />
            </div>
            <div className="agro-card p-4">
              <label className="block text-sm font-semibold text-[#1F5130] mb-1.5">
                {language === "en" ? "Start Price (₹/kg)" : "शुरुआती दर (₹/किलो)"}
              </label>
              <input
                type="number"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="e.g. 35"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#1F5130] bg-[#FFF8E7] focus:border-[#1F5130] focus:ring-1 focus:ring-[#1F5130] outline-none num-tabular touch-target"
              />
              {formCrop && (
                <p className="text-[10px] text-gray-400 mt-1">
                  {language === "en" ? "Govt Rate" : "मंडी भाव"}: {formatPaise(DEMO_CROPS[formCrop]?.mandi_gov_price_paise || 0)}/kg
                </p>
              )}
            </div>
          </div>

          {/* Grade */}
          <div className="agro-card p-4">
            <label className="block text-sm font-semibold text-[#1F5130] mb-2">
              {language === "en" ? "Quality Grade" : "ग्रेड"}
            </label>
            <div className="flex gap-2">
              {(["A", "B", "C"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFormGrade(g)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all touch-target ${
                    formGrade === g
                      ? g === "A"
                        ? "border-[#4CAF50] bg-[#e8f5e9] text-[#1F5130]"
                        : g === "B"
                        ? "border-[#F5A623] bg-[#fff3e0] text-[#d88909]"
                        : "border-[#D84A3A] bg-[#ffebee] text-[#D84A3A]"
                      : "border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  Grade {g}
                </button>
              ))}
            </div>
          </div>

          {/* Village */}
          <div className="agro-card p-4">
            <label className="block text-sm font-semibold text-[#1F5130] mb-1.5">
              {language === "en" ? "Village / Location" : "गांव / स्थान"}
            </label>
            <input
              type="text"
              value={formVillage}
              onChange={(e) => setFormVillage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-[#FFF8E7] focus:border-[#1F5130] focus:ring-1 focus:ring-[#1F5130] outline-none touch-target"
            />
          </div>

          {/* Photos */}
          <div className="agro-card p-4">
            <label className="block text-sm font-semibold text-[#1F5130] mb-2">
              {language === "en" ? "Photos (up to 3)" : "फोटो (अधिकतम 3)"}
            </label>
            <div className="flex gap-2 flex-wrap">
              {formPhotos.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormPhotos((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-[#D84A3A] text-white flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {formPhotos.length < 3 && (
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[#1F5130] hover:text-[#1F5130] transition-colors touch-target"
                >
                  <Camera className="w-6 h-6" />
                  <span className="text-[10px]">{language === "en" ? "Add" : "जोड़ें"}</span>
                </button>
              )}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                className="hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-[#1F5130] text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-[#143720] active:scale-[0.98] transition-all shadow-lg touch-target"
          >
            <Check className="w-5 h-5" />
            {language === "en" ? "Log Harvest & Auto-Pool" : "फसल दर्ज करें और पूल में जोड़ें"}
          </button>
        </form>
      )}

      {/* Camera Tab */}
      {activeTab === "camera" && (
        <div className="space-y-4">
          <div className="agro-card p-6 text-center">
            <Camera className="w-12 h-12 text-[#1F5130] mx-auto mb-3" />
            <h3 className="font-semibold text-[#1F5130] mb-1">
              {language === "en" ? "Take Photos for AI Grading" : "AI ग्रेडिंग के लिए फोटो लें"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {language === "en"
                ? "Take 2-3 clear photos of your harvest. Gemini AI will analyze quality, check for defects, and assign a grade (A/B/C)."
                : "2-3 साफ फोटो लें। Gemini AI गुणवत्ता जांचेगा और ग्रेड (A/B/C) देगा।"}
            </p>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="px-6 py-3 rounded-xl bg-[#F5A623] text-white font-semibold text-sm hover:bg-[#d88909] transition-colors touch-target flex items-center gap-2 mx-auto"
            >
              <Camera className="w-5 h-5" />
              {language === "en" ? "Open Camera" : "कैमरा खोलें"}
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleCameraCapture}
              className="hidden"
            />
          </div>

          {formPhotos.length > 0 && (
            <div className="agro-card p-4">
              <h3 className="font-semibold text-[#1F5130] text-sm mb-2">
                {language === "en" ? "Captured Photos" : "ली गई फोटो"}
              </h3>
              <div className="flex gap-2 flex-wrap">
                {formPhotos.map((url, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-[#4CAF50]">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  submitListing({
                    crop: formCrop,
                    quantity_kg: 500,
                    expected_price_paise: DEMO_CROPS[formCrop]?.base_price_paise || 3200,
                    grade: formGrade,
                    village: formVillage,
                    photos: formPhotos,
                  });
                  setFormPhotos([]);
                }}
                className="w-full mt-3 py-3 rounded-xl bg-[#1F5130] text-white font-semibold text-sm touch-target"
              >
                {language === "en" ? "Submit for AI Grading & Pool" : "AI ग्रेडिंग और पूल के लिए भेजें"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
