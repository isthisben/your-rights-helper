import type { CaseState } from '@/types/case';

/**
 * Payload for the "Case Created" webhook
 * Sent when a new case is created/initialized
 */
export interface CaseCreatedPayload {
  /** Full case state at creation time */
  caseState: CaseState;
  /** ISO timestamp when the case was created */
  timestamp: string;
  /** User's email if available (from legal advisor or reminder signup) */
  email?: string;
  /** User's language preference */
  language: string;
}

/**
 * Payload for the "Export Snapshot" webhook
 * Sent when user requests to export their case snapshot
 */
export interface ExportSnapshotPayload {
  /** Full case state snapshot */
  caseState: CaseState;
  /** ISO timestamp when the snapshot was exported */
  timestamp: string;
  /** User's email for sending the export */
  email?: string;
  /** Export format or additional metadata */
  metadata?: {
    format?: 'json' | 'pdf';
    includeDocuments?: boolean;
    [key: string]: unknown;
  };
}
