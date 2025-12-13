import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Get allowed origin from environment
function getAllowedOrigin(): string {
  const origin = Deno.env.get('ALLOWED_ORIGIN');
  if (origin) return origin;
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
    const { email, caseState } = await req.json();

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // TODO: Implement actual reminder service integration
    // For now, just store the request (you would integrate with an email service here)
    // Example: SendGrid, Resend, AWS SES, etc.
    
    // Log the reminder request (in production, you'd send an email)
    console.log('Reminder request received:', { email, caseState });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Reminder request received. You will receive email reminders for important deadlines.'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Reminders function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

