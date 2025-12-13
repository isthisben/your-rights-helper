import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ElevenLabs voices with language support
const VOICE_MAP: Record<string, string> = {
  'en': 'EXAVITQu4vr4xnSDxMaL', // Sarah - English
  'cy': 'EXAVITQu4vr4xnSDxMaL', // Sarah - fallback for Welsh
  'pl': 'pqHfZKP75CvOlQylNhV4', // Bill - Polish support
  'ur': 'onwK4e9ZLuTAKqWW03F9', // Daniel - Urdu support
  'pa': 'onwK4e9ZLuTAKqWW03F9', // Daniel - Punjabi support
  'bn': 'onwK4e9ZLuTAKqWW03F9', // Daniel - Bengali support
  'ro': 'pqHfZKP75CvOlQylNhV4', // Bill - Romanian support
  'ar': 'onwK4e9ZLuTAKqWW03F9', // Daniel - Arabic support
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language = 'en', speed = 1.0 } = await req.json();

    if (!text) {
      throw new Error("Text is required");
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ElevenLabs API key not configured");
    }

    // Get appropriate voice for language
    const langPrefix = language.split('-')[0].toLowerCase();
    const voiceId = VOICE_MAP[langPrefix] || VOICE_MAP['en'];

    console.log(`Generating speech for language: ${language}, voice: ${voiceId}, speed: ${speed}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          output_format: "mp3_44100_128",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
            speed: Math.max(0.7, Math.min(1.2, speed)),
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Stream the audio response
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Text-to-speech error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
