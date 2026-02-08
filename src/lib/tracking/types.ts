export type TrackingCommonParams = {
  platform?: string;
  language?: string;
  user_agent?: string;
  os?: string;
  screen_width?: number;
  screen_height?: number;
  device_pixel_ratio?: number;
};

export type TrackingPageParams = {
  page_url?: string;
  page_title?: string;
  referrer?: string;
};

export type TrackEventPayload = {
  event: string;
  uid?: string;
  uuid?: string;
  session_id?: string;
  timestamp?: number;
  common_params?: TrackingCommonParams;
  page_params?: TrackingPageParams;
  params?: Record<string, unknown>;
  // legacy fields kept for compatibility at compile-time only
  eid?: string | null;
  type?: string;
  action?: string;
  source?: string;
};
