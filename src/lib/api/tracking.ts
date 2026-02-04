export type TrackEventPayload = {
  event: string;
  type?: string; // 埋点 code
  uid?: string;
  source?: string;
  eid?: string | null;
  action?: string;
  extraData?: Record<string, unknown>;
};

export async function trackEvent(payload: TrackEventPayload): Promise<void> {
  try {
    const response = await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true, // 防止页面跳转打断
    });

    if (!response.ok) {
      if (process.env.NODE_ENV === "development") {
        console.error("Tracking failed:", await response.text());
      }
    }
  } catch (error) {
    // Silently catch all errors to prevent blocking flow
    if (process.env.NODE_ENV === "development") {
      console.error("Tracking exception:", error);
    }
  }
}
