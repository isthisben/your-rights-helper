import type { CaseCreatedPayload, ExportSnapshotPayload } from './types';

/**
 * Activepieces webhook client
 * 
 * This module provides functions to trigger Activepieces workflows via webhooks.
 * Webhook URLs are configured via environment variables.
 */

// Use Vercel API proxy to avoid CORS issues
// In development, Vite proxy will handle it; in production, Vercel routes /api/* to API functions
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || '/api';
};

const CASE_CREATED_WEBHOOK_URL = `${getApiUrl()}/activepieces-case-created`;
const EXPORT_SNAPSHOT_WEBHOOK_URL = `${getApiUrl()}/activepieces-export-snapshot`;

/**
 * Error class for Activepieces webhook errors
 */
export class ActivepiecesError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: unknown
  ) {
    super(message);
    this.name = 'ActivepiecesError';
  }
}

/**
 * Send a case created event to Activepieces
 * 
 * @param payload - Case creation payload
 * @returns Promise that resolves when the webhook is sent
 * @throws {ActivepiecesError} If the webhook URL is not configured or request fails
 * 
 * @example
 * ```ts
 * await sendCaseCreated({
 *   caseState: currentCaseState,
 *   timestamp: new Date().toISOString(),
 *   email: userEmail,
 *   language: 'en-A2'
 * });
 * ```
 */
export async function sendCaseCreated(
  payload: CaseCreatedPayload
): Promise<void> {
  // URL is always available (uses API proxy)

  try {
    const response = await fetch(CASE_CREATED_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Try to parse error response, but handle non-JSON gracefully
      let errorData: unknown;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch {
          // If JSON parsing fails, use text
          errorData = await response.text();
        }
      } else {
        errorData = await response.text();
      }

      throw new ActivepiecesError(
        `Case created webhook failed: ${response.status} ${response.statusText}`,
        response.status,
        errorData
      );
    }

    // Handle non-JSON responses (some webhooks return empty body or text)
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        await response.json();
      } catch {
        // If JSON parsing fails, that's okay - webhook was successful
      }
    }
  } catch (error) {
    if (error instanceof ActivepiecesError) {
      throw error;
    }
    
    // Network errors, etc.
    throw new ActivepiecesError(
      `Failed to send case created webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      error
    );
  }
}

/**
 * Send an export snapshot request to Activepieces
 * 
 * @param payload - Export snapshot payload
 * @returns Promise that resolves when the webhook is sent
 * @throws {ActivepiecesError} If the webhook URL is not configured or request fails
 * 
 * @example
 * ```ts
 * await sendExportSnapshot({
 *   caseState: currentCaseState,
 *   timestamp: new Date().toISOString(),
 *   email: userEmail,
 *   metadata: {
 *     format: 'json',
 *     includeDocuments: true
 *   }
 * });
 * ```
 */
export async function sendExportSnapshot(
  payload: ExportSnapshotPayload
): Promise<void> {
  // URL is always available (uses API proxy)

  try {
    const response = await fetch(EXPORT_SNAPSHOT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Try to parse error response, but handle non-JSON gracefully
      let errorData: unknown;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch {
          // If JSON parsing fails, use text
          errorData = await response.text();
        }
      } else {
        errorData = await response.text();
      }

      throw new ActivepiecesError(
        `Export snapshot webhook failed: ${response.status} ${response.statusText}`,
        response.status,
        errorData
      );
    }

    // Handle non-JSON responses (some webhooks return empty body or text)
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        await response.json();
      } catch {
        // If JSON parsing fails, that's okay - webhook was successful
      }
    }
  } catch (error) {
    if (error instanceof ActivepiecesError) {
      throw error;
    }
    
    // Network errors, etc.
    throw new ActivepiecesError(
      `Failed to send export snapshot webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      error
    );
  }
}
