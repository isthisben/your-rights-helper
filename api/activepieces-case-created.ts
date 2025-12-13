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

  const WEBHOOK_URL = process.env.ACTIVEPIECES_CASE_CREATED_WEBHOOK;
  
  if (!WEBHOOK_URL) {
    console.error('ACTIVEPIECES_CASE_CREATED_WEBHOOK is not configured');
    return res.status(500).json({ 
      error: 'Webhook not configured',
      message: 'ACTIVEPIECES_CASE_CREATED_WEBHOOK environment variable is missing. Please add it in Vercel project settings.'
    });
  }

  try {
    const payload = req.body;

    // Log the payload for debugging (without sensitive data)
    console.log('Case created webhook called');
    console.log('Webhook URL:', WEBHOOK_URL);
    console.log('Payload keys:', Object.keys(payload || {}));
    console.log('Email in payload:', payload?.email);
    console.log('Has caseState:', !!payload?.caseState);
    console.log('CaseState scenario:', payload?.caseState?.scenario);
    console.log('CaseState incidentDate:', payload?.caseState?.incidentDate);
    console.log('CaseState acasStatus:', payload?.caseState?.acasStatus);
    console.log('Language:', payload?.language);
    console.log('Full payload structure:', JSON.stringify({
      email: payload?.email,
      timestamp: payload?.timestamp,
      language: payload?.language,
      hasCaseState: !!payload?.caseState,
      caseStateKeys: payload?.caseState ? Object.keys(payload.caseState) : [],
    }, null, 2));

    // Forward the request to Activepieces webhook
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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
      message: 'Case created webhook sent successfully',
      data: responseData,
    });

  } catch (error) {
    console.error('Activepieces case created webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({
      error: 'Failed to send webhook',
      message: errorMessage,
    });
  }
}
