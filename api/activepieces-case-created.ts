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

    // Forward the request to Activepieces webhook
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('Activepieces webhook error:', response.status, errorText);
      
      return res.status(response.status).json({
        error: 'Webhook request failed',
        status: response.status,
        details: errorText.slice(0, 500), // Limit error text length
      });
    }

    // Activepieces webhooks typically return empty JSON or minimal response
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch {
        responseData = {};
      }
    } else {
      responseData = { success: true };
    }

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
