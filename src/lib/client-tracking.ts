export type TrackEventPayload = {
  event: string;
  type?: string;
  uid?: string;
  eid?: string; // Renamed from email_id
  action?: string;
  source?: string;
  targetUrl?: string;
  extraData?: Record<string, unknown>; // Renamed from metadata
};

export const trackEvent = async (payload: TrackEventPayload) => {
  try {
    // 使用相对路径，自动适配当前域名
    const res = await fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("Tracking failed:", res.statusText);
    }
  } catch (error) {
    console.error("Tracking error:", error);
  }
};
