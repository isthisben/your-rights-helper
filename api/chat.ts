import type { VercelRequest, VercelResponse } from '@vercel/node';

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
  let GREENPT_API_KEY = process.env.GREENPT_API_KEY;
  if (GREENPT_API_KEY) {
    GREENPT_API_KEY = GREENPT_API_KEY.trim();
  }
  
  if (!GREENPT_API_KEY) {
    console.error('GREENPT_API_KEY is not configured');
    return res.status(500).json({ 
      error: 'Chat service not configured',
      message: 'GREENPT_API_KEY environment variable is missing. Please add it in Vercel project settings.'
    });
  }
  
  // Log API key status (without exposing the key)
  console.log('GREENPT_API_KEY found:', GREENPT_API_KEY ? `Yes (${GREENPT_API_KEY.length} chars)` : 'No');

  try {
    const { messages } = req.body;
    
    console.log('Received chat request with', messages?.length || 0, 'messages');

    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format:', typeof messages);
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // System prompt emphasizing safety and A2-level English
    const systemPrompt = `You are a helpful assistant for people going through employment issues in the UK.

IMPORTANT RULES:
- You CANNOT give legal advice. You can only explain processes and help organize information.
- Always remind users to seek professional advice for their specific situation.
- Use simple, clear English (A2 level - short sentences, common words).
- Be calm, friendly, and supportive. Many users are stressed.
- Focus on explaining steps in the employment tribunal process.
- If asked about time limits, remind users that strict deadlines apply and they should check with ACAS or an advisor.
- Never claim to be a lawyer or give definitive legal guidance.

Start responses with empathy when appropriate. Keep answers concise and actionable.`;

    console.log('Calling GreenPT API...');
    const response = await fetch('https://api.greenpt.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GREENPT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-nemo-instruct-2407',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content
          }))
        ],
        stream: true,
      }),
    });

    console.log('GreenPT API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GreenPT API error:', response.status, errorText);
      
      // Handle specific error codes
      if (response.status === 401 || response.status === 403) {
        return res.status(401).json({ 
          error: 'Invalid API key',
          message: 'The GreenPT API key is invalid or expired. Please check your GREENPT_API_KEY in Vercel environment variables.',
          details: errorText.slice(0, 200)
        });
      }
      
      if (response.status === 429) {
        return res.status(429).json({ 
          error: 'Too many requests. Please wait a moment and try again.' 
        });
      }
      
      if (response.status === 402) {
        return res.status(402).json({ 
          error: 'Service temporarily unavailable. Please try again later.' 
        });
      }

      const safeErrorMessage = errorText || 'Unknown error from chat provider';
      return res.status(response.status).json({ 
        error: `Failed to get response from chat service (status ${response.status}).`,
        message: safeErrorMessage.slice(0, 500),
      });
    }

    if (!response.body) {
      console.error('No response body from GreenPT');
      return res.status(500).json({ error: 'No response body from chat service' });
    }

    // Set headers for streaming response BEFORE any writes
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering

    console.log('Starting to stream response...');

    // Get the reader and decoder
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let chunkCount = 0;
    let totalBytes = 0;

    // Stream chunks using a while loop
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('Stream completed. Total chunks:', chunkCount, 'Total bytes:', totalBytes);
          break;
        }
        
        if (value) {
          totalBytes += value.length;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) {
            chunkCount++;
            // Log first chunk to verify data is coming through
            if (chunkCount === 1) {
              console.log('First chunk received from GreenPT (first 300 chars):', chunk.substring(0, 300));
            }
            res.write(chunk);
            // Force flush (important for Vercel)
            if (typeof (res as any).flush === 'function') {
              (res as any).flush();
            }
          }
        }
      }
      
      // Finalize the stream
      console.log('Ending response stream. Total chunks sent:', chunkCount);
      res.end();
    } catch (streamError) {
      console.error('Stream error:', streamError);
      if (!res.headersSent) {
        return res.status(500).json({ error: 'Stream error occurred' });
      } else {
        res.end();
      }
    }
    
  } catch (error) {
    console.error('Chat function error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
}
