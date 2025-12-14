import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

// Get allowed origin from environment
function getAllowedOrigin(): string {
  const origin = Deno.env.get('ALLOWED_ORIGIN');
  if (origin) return origin;
  return '*';
}

// Activepieces webhook event types
type ActivepiecesEventType = 
  | 'flow.activated'
  | 'flow.deactivated'
  | 'run.started'
  | 'run.completed'
  | 'run.failed'
  | 'piece.triggered'
  | 'piece.completed'
  | 'piece.failed';

interface ActivepiecesWebhookPayload {
  event: ActivepiecesEventType;
  flowId?: string;
  runId?: string;
  pieceId?: string;
  data?: Record<string, unknown>;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': getAllowedOrigin(),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-activepieces-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Verify webhook signature if secret is configured
// Note: Activepieces currently doesn't support HMAC signatures natively
// This function is prepared for when they add it, or for custom implementations
async function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string | null,
  timestamp: string | null = null
): Promise<boolean> {
  if (!secret) {
    // If no secret is configured, allow the request (for development)
    console.warn('ACTIVEPIECES_WEBHOOK_SECRET not configured - skipping signature verification');
    return true;
  }

  if (!signature) {
    console.error('Webhook signature missing');
    return false;
  }

  // Standard HMAC-SHA256 verification (common webhook pattern)
  // Format: timestamp.payload -> HMAC-SHA256 -> base64
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    
    // Create message: timestamp.payload (if timestamp provided) or just payload
    const message = timestamp 
      ? `${timestamp}.${payload}`
      : payload;
    const messageData = encoder.encode(message);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    
    // Convert to base64 (common format for webhook signatures)
    const expectedSignature = base64Encode(signatureBuffer);
    
    // Compare signatures
    // Note: For production, use constant-time comparison
    return signature === expectedSignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Process webhook event based on event type
async function processWebhookEvent(payload: ActivepiecesWebhookPayload): Promise<void> {
  console.log(`Processing Activepieces webhook event: ${payload.event}`, {
    flowId: payload.flowId,
    runId: payload.runId,
    pieceId: payload.pieceId,
    timestamp: payload.timestamp,
  });

  // Handle different event types
  switch (payload.event) {
    case 'flow.activated':
      console.log('Flow activated:', payload.flowId);
      // Add your flow activation logic here
      break;
    
    case 'flow.deactivated':
      console.log('Flow deactivated:', payload.flowId);
      // Add your flow deactivation logic here
      break;
    
    case 'run.started':
      console.log('Run started:', payload.runId, 'for flow:', payload.flowId);
      // Add your run started logic here
      break;
    
    case 'run.completed':
      console.log('Run completed:', payload.runId, 'for flow:', payload.flowId);
      // Add your run completion logic here
      // You can access payload.data for run results
      break;
    
    case 'run.failed':
      console.log('Run failed:', payload.runId, 'for flow:', payload.flowId);
      // Add your run failure handling logic here
      // You can access payload.data for error details
      break;
    
    case 'piece.triggered':
      console.log('Piece triggered:', payload.pieceId, 'in flow:', payload.flowId);
      // Add your piece trigger logic here
      break;
    
    case 'piece.completed':
      console.log('Piece completed:', payload.pieceId, 'in flow:', payload.flowId);
      // Add your piece completion logic here
      break;
    
    case 'piece.failed':
      console.log('Piece failed:', payload.pieceId, 'in flow:', payload.flowId);
      // Add your piece failure handling logic here
      break;
    
    default:
      console.log('Unknown event type:', payload.event);
  }

  // Store webhook event in Supabase if needed
  // This is optional and can be customized based on your needs
  // Example:
  // const { data, error } = await supabase
  //   .from('webhook_events')
  //   .insert({
  //     event_type: payload.event,
  //     flow_id: payload.flowId,
  //     run_id: payload.runId,
  //     payload: payload,
  //     created_at: new Date().toISOString(),
  //   });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Get webhook secret from environment
    const webhookSecret = Deno.env.get('ACTIVEPIECES_WEBHOOK_SECRET');
    
    // Get signature and timestamp from headers (Activepieces may use different header names)
    const signature = req.headers.get('x-activepieces-signature') || 
                     req.headers.get('x-signature') ||
                     req.headers.get('signature');
    const timestamp = req.headers.get('x-activepieces-timestamp') ||
                     req.headers.get('x-timestamp') ||
                     req.headers.get('timestamp');

    // Read the raw body for signature verification
    const rawBody = await req.text();
    
    // Verify signature if secret is configured
    if (webhookSecret && signature) {
      const isValid = await verifyWebhookSignature(rawBody, signature, webhookSecret, timestamp);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Parse the webhook payload
    let payload: ActivepiecesWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      console.error('Failed to parse webhook payload:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate required fields
    if (!payload.event) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: event' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Process the webhook event
    await processWebhookEvent(payload);

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Webhook received and processed',
        event: payload.event,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Activepieces webhook error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
