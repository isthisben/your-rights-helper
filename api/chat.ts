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
  
  try {
    const { messages } = req.body;

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

    const response = await fetch('https://api.greenpt.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GREENPT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'green-l-raw',
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

    // Check if body was already consumed
    if ((response as any).bodyUsed) {
      console.error('Response body was already consumed!');
      return res.status(500).json({ error: 'Response body already consumed' });
    }

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


    // In Vercel Node.js runtime, we need to handle the stream properly
    // The issue might be that the stream completes immediately
    // Let's try a more robust approach with timeout detection
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let chunkCount = 0;
    let totalBytes = 0;
    let hasReceivedData = false;
    let readAttempts = 0;
    const maxReadAttempts = 10000; // Safety limit

    // Stream chunks using a while loop
    try {
      while (readAttempts < maxReadAttempts) {
        readAttempts++;
        
        // Add a small timeout to detect if stream is stuck
        const readPromise = reader.read();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Read timeout')), 30000)
        );
        
        let readResult;
        try {
          readResult = await Promise.race([readPromise, timeoutPromise]) as ReadableStreamReadResult<Uint8Array>;
        } catch (timeoutError) {
          // Timeout handled silently, will break loop
          break;
        }
        
        const { done, value } = readResult;
        
        if (done) {
          break;
        }
        
        if (value && value.length > 0) {
          hasReceivedData = true;
          totalBytes += value.length;
          const chunk = decoder.decode(value, { stream: true });
          
          if (chunk && chunk.length > 0) {
            chunkCount++;
            res.write(chunk);
            // Force flush (important for Vercel)
            if (typeof (res as any).flush === 'function') {
              (res as any).flush();
            }
          }
        } else {
          // If we've tried many times with no data, break
          if (readAttempts > 100 && !hasReceivedData) {
            break;
          }
        }
      }
      
      if (!hasReceivedData) {
        console.error('No data received from GreenPT stream despite 200 status');
        return res.status(500).json({ 
          error: 'No data received from chat service',
          message: 'The API returned successfully but no content was streamed. This might be a GreenPT API issue or streaming format problem.',
          debug: {
            readAttempts,
            chunkCount,
            totalBytes
          }
        });
      }
      
      // Finalize the stream
      res.end();
    } catch (streamError) {
      console.error('Stream error:', streamError);
      if (!res.headersSent) {
        return res.status(500).json({ 
          error: 'Stream error occurred', 
          details: streamError instanceof Error ? streamError.message : String(streamError) 
        });
      } else {
        res.end();
      }
    } finally {
      // Release the reader
      try {
        reader.releaseLock();
      } catch (e) {
        // Ignore if already released
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
