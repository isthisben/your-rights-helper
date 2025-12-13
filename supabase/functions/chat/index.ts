import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Get allowed origin from environment or use a default
function getAllowedOrigin(): string {
  const origin = Deno.env.get('ALLOWED_ORIGIN');
  if (origin) return origin;
  // In production, you should set this to your actual domain
  // For now, allow all origins but log a warning
  if (Deno.env.get('ENVIRONMENT') === 'production') {
    console.warn('ALLOWED_ORIGIN not set in production - using wildcard');
  }
  return '*';
}

const corsHeaders = {
  'Access-Control-Allow-Origin': getAllowedOrigin(),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GREENPT_API_KEY = Deno.env.get('GREENPT_API_KEY');
    
    if (!GREENPT_API_KEY) {
      console.error('GREENPT_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Chat service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages } = await req.json();
    console.log('Received messages:', messages.length);

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GreenPT API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please wait a moment and try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Surface more detail to help debug model / key issues (without exposing secrets)
      const safeErrorMessage = errorText || 'Unknown error from chat provider';
      return new Response(
        JSON.stringify({ 
          error: `Failed to get response from chat service (status ${response.status}).`,
          details: safeErrorMessage.slice(0, 500),
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Stream the response back to the client
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
