/**
 * Modern Tracking Schema Design
 *
 * Core Concept:
 * - Event: WHAT happened (e.g., 'click', 'page_view')
 * - Module (type): WHERE it happened (e.g., 'invite_flow', 'download_page')
 * - Action: HOW it happened (e.g., 'submit', 'share')
 * - Context: WHO and WHEN (uid, eid, timestamp - handled automatically or via top-level props)
 * - Properties (extraData): DETAILS (targetUrl, filename, etc.)
 */

export type TrackingModule =
  | "invite_flow"
  | "download_page"
  | "unsubscribe_flow"
  | "email_share"
  | "redirect"
  | (string & {}); // Allow string for flexibility with autocompletion

export type TrackingAction =
  | "view"
  | "click"
  | "submit"
  | "share_week"
  | "share_stats"
  | "invite_click"
  | "unsubscribe"
  | "download"
  | (string & {});

export interface BaseTrackingPayload {
  /**
   * The name of the event.
   * Recommendation: Use verb_noun format (e.g., 'click_button') or Keep generic 'click' and use 'type'/'action' to refine.
   * Current System: Uses generic 'click', 'page_view', 'open'.
   */
  event: string;

  /**
   * The module or feature area where the event occurred.
   * Equivalent to 'Category' in GA/GTM.
   */
  type?: TrackingModule;

  /**
   * The specific interaction or sub-event.
   */
  action?: TrackingAction;

  /**
   * User ID
   */
  uid?: string;

  /**
   * Email ID / Entity ID (Context)
   */
  eid?: string | null;

  /**
   * Source of the event (e.g., 'web', 'email', 'app')
   */
  source?: string;

  /**
   * Custom properties for the event.
   */
  extraData?: Record<string, unknown>;
}

// Re-export for compatibility
export type TrackEventPayload = BaseTrackingPayload;
