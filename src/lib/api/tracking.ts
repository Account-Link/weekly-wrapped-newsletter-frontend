export type TrackEventPayload = {
  event: string;
  type?: string;
  uid?: string;
  source?: string;
  targetUrl?: string;
  eid?: string | null;
  action?: string;
  extraData?: Record<string, unknown>;
};

export async function trackEvent(payload: TrackEventPayload): Promise<void> {
  const response = await fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // Silently fail or log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Tracking failed:", await response.text());
    }
  }
}
