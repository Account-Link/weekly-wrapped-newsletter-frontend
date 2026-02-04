export type TrackEventPayload = {
  event: string;
  type?: string; // 埋点 code
  uid?: string;
  eid?: string; // Renamed from email_id
  action?: string; // 具体交互动作
  source?: string;
  extraData?: Record<string, unknown>; // Renamed from metadata
};

export const trackEvent = async (payload: TrackEventPayload) => {
  try {
    // 使用 keepalive: true 防止页面跳转打断请求
    const res = await fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    if (!res.ok) {
      console.error("Tracking failed:", res.statusText);
    }
  } catch (error) {
    // 确保埋点错误绝对不影响主流程
    console.error("Tracking error:", error);
  }
};
