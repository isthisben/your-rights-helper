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

  const WEBHOOK_URL = process.env.ACTIVEPIECES_EXPORT_SNAPSHOT_WEBHOOK;
  
  if (!WEBHOOK_URL) {
    console.error('ACTIVEPIECES_EXPORT_SNAPSHOT_WEBHOOK is not configured');
    return res.status(500).json({ 
      error: 'Webhook not configured',
      message: 'ACTIVEPIECES_EXPORT_SNAPSHOT_WEBHOOK environment variable is missing. Please add it in Vercel project settings.'
    });
  }

  try {
    // Explicitly parse body to ensure proper JSON handling
    // Vercel auto-parses, but we need to ensure it's an object
    let payload: any;
    if (typeof req.body === 'string') {
      try {
        payload = JSON.parse(req.body);
      } catch (e) {
        console.error('Failed to parse request body as JSON:', e);
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    } else if (req.body && typeof req.body === 'object') {
      payload = req.body;
    } else {
      console.error('Invalid request body type:', typeof req.body);
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Validate and trim email field
    if (!payload.email || typeof payload.email !== 'string') {
      console.error('Email field missing or invalid:', {
        email: payload.email,
        emailType: typeof payload.email,
        payloadKeys: Object.keys(payload || {}),
      });
      return res.status(400).json({ 
        error: 'Email field is required and must be a string',
        received: { email: payload.email, type: typeof payload.email }
      });
    }

    // Trim email and validate it's not empty after trimming
    const trimmedEmail = payload.email.trim();
    if (!trimmedEmail) {
      console.error('Email field is empty or whitespace only:', {
        originalEmail: payload.email,
        trimmedEmail: trimmedEmail,
      });
      return res.status(400).json({ 
        error: 'Email field cannot be empty or whitespace only',
        received: payload.email
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      console.error('Email field has invalid format:', trimmedEmail);
      return res.status(400).json({ 
        error: 'Email field must be a valid email address',
        received: trimmedEmail
      });
    }

    // Log the payload for debugging (without sensitive data)
    console.log('Export snapshot webhook called');
    console.log('Webhook URL:', WEBHOOK_URL);
    console.log('Payload keys:', Object.keys(payload || {}));
    console.log('Email in payload (trimmed):', trimmedEmail);
    console.log('Email type:', typeof trimmedEmail);
    console.log('Has caseState:', !!payload?.caseState);
    console.log('CaseState scenario:', payload?.caseState?.scenario);
    console.log('CaseState incidentDate:', payload?.caseState?.incidentDate);
    console.log('CaseState acasStatus:', payload?.caseState?.acasStatus);
    console.log('Full payload structure:', JSON.stringify({
      email: trimmedEmail,
      timestamp: payload?.timestamp,
      hasCaseState: !!payload?.caseState,
      caseStateKeys: payload?.caseState ? Object.keys(payload.caseState) : [],
    }, null, 2));

    // Construct payload explicitly to ensure email is at top level with trimmed value
    const webhookPayload = {
      email: trimmedEmail, // Use trimmed email to ensure no whitespace issues
      timestamp: payload.timestamp,
      caseState: payload.caseState,
      metadata: payload.metadata,
    };

    // Log the exact payload being sent to Activepieces (full structure)
    console.log('Payload being sent to Activepieces (full):', JSON.stringify(webhookPayload, null, 2));
    console.log('Payload being sent to Activepieces (summary):', JSON.stringify({
      email: webhookPayload.email,
      emailLength: webhookPayload.email?.length,
      hasTimestamp: !!webhookPayload.timestamp,
      hasCaseState: !!webhookPayload.caseState,
      hasMetadata: !!webhookPayload.metadata,
    }));

    // Forward the request to Activepieces webhook
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    console.log('Activepieces response status:', response.status);
    console.log('Activepieces response headers:', Object.fromEntries(response.headers.entries()));

    // Read response body once (can only be read once)
    const responseText = await response.text().catch(() => '');
    console.log('Activepieces response body:', responseText || '(empty)');

    if (!response.ok) {
      console.error('Activepieces webhook error:', response.status, responseText);
      
      return res.status(response.status).json({
        error: 'Webhook request failed',
        status: response.status,
        details: responseText.slice(0, 500) || 'Unknown error', // Limit error text length
      });
    }

    // Activepieces webhooks typically return empty JSON or minimal response
    // Note: 200 OK from Activepieces means the webhook was RECEIVED, not that the flow completed
    // The flow may still be running or may fail later - check Activepieces dashboard for flow execution status
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json') && responseText) {
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { raw: responseText };
      }
    } else {
      responseData = responseText ? { raw: responseText } : { success: true };
    }

    console.log('Webhook accepted by Activepieces. Flow execution status should be checked in Activepieces dashboard.');

    // Return success response
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      success: true,
      message: 'Export snapshot webhook sent successfully',
      note: 'Webhook received by Activepieces. Check Activepieces dashboard to verify flow execution and email delivery.',
      data: responseData,
    });

  } catch (error) {
    console.error('Activepieces export snapshot webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({
      error: 'Failed to send webhook',
      message: errorMessage,
    });
  }
}
