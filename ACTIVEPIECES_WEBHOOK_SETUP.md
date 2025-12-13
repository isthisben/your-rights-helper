# Activepieces Webhook Integration Setup

This document explains how to set up and use the Activepieces webhook integration in this application.

## Overview

The Activepieces webhook handler is a Supabase Edge Function that receives and processes webhook events from Activepieces automation workflows. It's designed to integrate seamlessly without modifying existing business logic.

## Architecture

- **Location**: `supabase/functions/activepieces-webhook/index.ts`
- **Type**: Supabase Edge Function (Deno runtime)
- **Endpoint**: `https://<your-supabase-project>.supabase.co/functions/v1/activepieces-webhook`

## Supported Event Types

The webhook handler supports the following Activepieces event types:

- `flow.activated` - When a flow is activated
- `flow.deactivated` - When a flow is deactivated
- `run.started` - When a workflow run starts
- `run.completed` - When a workflow run completes successfully
- `run.failed` - When a workflow run fails
- `piece.triggered` - When a piece/action is triggered
- `piece.completed` - When a piece/action completes
- `piece.failed` - When a piece/action fails

## Setup Instructions

### 1. Deploy the Edge Function

Deploy the webhook handler to your Supabase project:

```bash
supabase functions deploy activepieces-webhook
```

### 2. Configure Environment Variables

Set the webhook secret in your Supabase project (optional but recommended):

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **Edge Functions** > **Secrets**
3. Add a new secret:
   - **Name**: `ACTIVEPIECES_WEBHOOK_SECRET`
   - **Value**: Your Activepieces webhook secret (if using signature verification)

**Note**: If no secret is configured, the webhook will still work but signature verification will be skipped (useful for development).

### 3. Configure CORS (Optional)

If you need to restrict CORS origins:

1. Go to **Settings** > **Edge Functions** > **Secrets**
2. Add a secret:
   - **Name**: `ALLOWED_ORIGIN`
   - **Value**: Your allowed origin (e.g., `https://yourdomain.com`)

If not set, the function will allow all origins (with a warning in production).

### 4. Get Your Webhook URL

Your webhook URL will be:
```
https://<your-project-ref>.supabase.co/functions/v1/activepieces-webhook
```

Replace `<your-project-ref>` with your Supabase project reference ID.

### 5. Configure Activepieces

1. In your Activepieces instance, create or edit a workflow
2. Add a "Webhook" or "HTTP Request" action
3. Set the webhook URL to your Supabase function URL
4. Configure the webhook to send POST requests with JSON payloads
5. (Optional) If using signature verification, configure Activepieces to include signature headers

## Webhook Payload Format

The webhook expects a JSON payload with the following structure:

```json
{
  "event": "run.completed",
  "flowId": "flow_123",
  "runId": "run_456",
  "pieceId": "piece_789",
  "data": {
    // Additional event-specific data
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "metadata": {
    // Additional metadata
  }
}
```

**Required Fields:**
- `event`: The event type (one of the supported types listed above)

**Optional Fields:**
- `flowId`: ID of the flow that triggered the event
- `runId`: ID of the workflow run
- `pieceId`: ID of the piece/action
- `data`: Event-specific data payload
- `timestamp`: ISO 8601 timestamp
- `metadata`: Additional metadata

## Security

### Signature Verification

The webhook handler supports HMAC-SHA256 signature verification:

1. **Format**: `timestamp.payload` → HMAC-SHA256 → Base64
2. **Headers**: 
   - `x-activepieces-signature` or `x-signature` (signature)
   - `x-activepieces-timestamp` or `x-timestamp` (timestamp, optional)

**Note**: As of December 2024, Activepieces doesn't natively support HMAC signatures. This functionality is prepared for when they add it, or for custom implementations.

### Authentication

The function is configured with `verify_jwt = false` in `supabase/config.toml`, meaning it doesn't require Supabase authentication. This is appropriate for webhooks from external services.

If you need additional security:
- Use signature verification (when available)
- Implement IP whitelisting at the Supabase level
- Use a reverse proxy with authentication

## Customization

### Adding Event Handlers

To add custom logic for specific events, modify the `processWebhookEvent` function in `supabase/functions/activepieces-webhook/index.ts`:

```typescript
case 'run.completed':
  console.log('Run completed:', payload.runId);
  // Add your custom logic here
  // Example: Update database, send notifications, etc.
  break;
```

### Storing Webhook Events

To store webhook events in Supabase, you can add code like this in `processWebhookEvent`:

```typescript
// Example: Store in Supabase
const { data, error } = await supabase
  .from('webhook_events')
  .insert({
    event_type: payload.event,
    flow_id: payload.flowId,
    run_id: payload.runId,
    payload: payload,
    created_at: new Date().toISOString(),
  });
```

**Note**: You'll need to create the `webhook_events` table in your Supabase database first.

## Testing

### Test with cURL

```bash
curl -X POST https://<your-project-ref>.supabase.co/functions/v1/activepieces-webhook \
  -H "Content-Type: application/json" \
  -H "apikey: <your-anon-key>" \
  -d '{
    "event": "run.completed",
    "flowId": "test_flow",
    "runId": "test_run",
    "data": {"test": "data"}
  }'
```

### Test Locally

1. Install Supabase CLI: `npm install -g supabase`
2. Start local Supabase: `supabase start`
3. Serve the function: `supabase functions serve activepieces-webhook`
4. Test with the local URL: `http://localhost:54321/functions/v1/activepieces-webhook`

## Monitoring

Monitor webhook events through:
- **Supabase Logs**: Dashboard > Logs > Edge Functions
- **Function Logs**: Check console.log outputs in the function
- **Error Tracking**: Errors are logged and returned in responses

## Troubleshooting

### Webhook not receiving events
- Verify the webhook URL is correct
- Check Supabase function is deployed
- Verify CORS settings
- Check Activepieces webhook configuration

### Signature verification failing
- Verify `ACTIVEPIECES_WEBHOOK_SECRET` is set correctly
- Check signature header name matches
- Ensure Activepieces is sending signatures (if supported)

### Function errors
- Check Supabase function logs
- Verify payload format matches expected structure
- Ensure required fields are present

## Integration with Existing Features

This webhook integration is designed to work alongside existing features without modifying them:

- ✅ Chat functionality remains unchanged
- ✅ Reminder system remains unchanged
- ✅ Text-to-speech remains unchanged
- ✅ All existing business logic is preserved

The webhook handler operates independently and can trigger actions based on Activepieces events without affecting the core application flow.
