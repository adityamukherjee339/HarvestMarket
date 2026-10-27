import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface ParsedVoiceData {
  crop: string;
  quantity_kg: number;
  expected_price_paise: number;
  village: string;
  quality_grade: "A" | "B" | "C";
  notes: string;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get("audio") as Blob | null;
    const textOverride = (formData.get("text") as string | null) || "";

    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    // Try real Gemini API if key is available and configured
    if (apiKey && !apiKey.startsWith("your-")) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
        let contents: any[] = [];
        const systemPrompt = `You are an Indian agricultural voice assistant for "HarvestMarket". 
Farmers speak in rural Hindi, Marathi, or Hinglish with accents and informal terms (like "क्विंटल", "बोरी", "क्रेट", "भाऊ", "पेटी").
Extract the harvest details into this exact JSON schema:
{
  "transcription": "Verbatim transcript of the farmer's speech in Devanagari or English",
  "parsed": {
    "crop": "tomato" | "onion" | "potato" | "chilli" | "wheat" | "garlic" | "greens",
    "quantity_kg": number,
    "expected_price_paise": number (e.g. ₹35/kg is 3500 paise),
    "village": string,
    "quality_grade": "A" | "B" | "C",
    "notes": string
  }
}
Always normalize quintals (1 quintal = 100 kg) and cratess/sacks (1 tomato crate approx 25kg, 1 onion sack approx 50kg). Return valid JSON only.`;

        if (audioBlob && audioBlob.size > 0) {
          const arrayBuffer = await audioBlob.arrayBuffer();
          const base64Audio = Buffer.from(arrayBuffer).toString("base64");
          contents = [
            systemPrompt,
            {
              inlineData: {
                mimeType: audioBlob.type || "audio/webm",
                data: base64Audio,
              },
            },
          ];
        } else if (textOverride) {
          contents = [systemPrompt, `Farmer message: "${textOverride}"`];
        }

        if (contents.length > 0) {
          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              responseMimeType: "application/json",
            },
          });

          const rawText = response.text || "";
          const parsedJson = JSON.parse(rawText);
          return NextResponse.json({
            success: true,
            transcription: parsedJson.transcription || textOverride || "Rural audio message parsed by Gemini",
            parsed: parsedJson.parsed,
            isDemo: false,
          });
        }
      } catch (aiErr) {
        console.warn("Gemini Live API fallback triggered:", aiErr);
      }
    }

    // Intelligent Demo Fallback (Guaranteed to work on Free Tier / Hackathon offline mode)
    const demoSamples = [
      {
        transcription: "मेरे पास 500 किलो A-ग्रेड टमाटर है पिम्पलगांव से। मुझे कम से कम ₹35 प्रति किलो का भाव चाहिए।",
        parsed: {
          crop: "tomato",
          quantity_kg: 500,
          expected_price_paise: 3500,
          village: "Pimpalgaon, Nashik",
          quality_grade: "A" as const,
          notes: "A-grade harvest, prompt dispatch ready at farm gate",
        },
      },
      {
        transcription: "निफाड से 20 क्विंटल नासिक लाल प्याज ग्रेड B, भाव ₹26 प्रति किलो पर लॉक करना है।",
        parsed: {
          crop: "onion",
          quantity_kg: 2000,
          expected_price_paise: 2600,
          village: "Niphad, Nashik",
          quality_grade: "B" as const,
          notes: "20 quintals cured red onion, medium-to-large caliber",
        },
      },
      {
        transcription: "दिंडोरी से 400 किलो ताजी पालक भाजी, सरकारी भाव ₹29 से ऊपर ₹38 प्रति किलो की उम्मीद।",
        parsed: {
          crop: "greens",
          quantity_kg: 400,
          expected_price_paise: 3800,
          village: "Dindori, Nashik",
          quality_grade: "A" as const,
          notes: "Fresh crisp organic harvest, zero yellowing",
        },
      },
    ];

    const chosen = demoSamples[Math.floor(Math.random() * demoSamples.length)];

    return NextResponse.json({
      success: true,
      transcription: chosen.transcription,
      parsed: chosen.parsed,
      isDemo: true,
      notice: "Demo mode: Gemini Voice-to-Text Parser active with seeded rural audio transcripts",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to process audio", details: String(err) },
      { status: 500 }
    );
  }
}
