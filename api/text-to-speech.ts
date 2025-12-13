import type { VercelRequest, VercelResponse } from '@vercel/node';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get and trim API key (in case there's whitespace)
  let ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  if (ELEVENLABS_API_KEY) {
    ELEVENLABS_API_KEY = ELEVENLABS_API_KEY.trim();
  }
  
  if (!ELEVENLABS_API_KEY) {
    return res.status(500).json({ 
      error: 'Text-to-speech service not configured',
      message: 'ELEVENLABS_API_KEY environment variable is missing. Please add it in Vercel project settings.'
    });
  }

  try {
    const { text, language = 'en', speed = 1.0 } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Get appropriate voice for language
    const langPrefix = language.split('-')[0].toLowerCase();
    const voiceId = VOICE_MAP[langPrefix] || VOICE_MAP['en'];

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          output_format: 'mp3_44100_128',
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
      console.error('ElevenLabs API error:', errorText);
      return res.status(response.status).json({ 
        error: `ElevenLabs API error: ${response.status}` 
      });
    }

    if (!response.body) {
      return res.status(500).json({ error: 'No response body from TTS service' });
    }

    // Stream the audio response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Transfer-Encoding', 'chunked');

    const reader = response.body.getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      res.end();
    } catch (streamError) {
      console.error('Stream error:', streamError);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Stream error occurred' });
      }
    }
  } catch (error) {
    console.error('Text-to-speech error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
}

