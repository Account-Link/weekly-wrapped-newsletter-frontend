export type TrackEventPayload = {
  event: string;
  type?: string;
  uid?: string;
  source?: string;
  targetUrl?: string;
  weekStart?: string | null;
  metadata?: Record<string, unknown>;
};

type WeeklyReportAction = "unsubscribe" | "resubscribe";

const postJson = async (url: string, payload: unknown) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "";
    try {
      message = await response.text();
    } catch {
      message = "";
    }
    throw new Error(message || "request_failed");
  }
};

export const postWeeklyReportAction = async (
  action: WeeklyReportAction,
  uid: string,
) => {
  await postJson(`/weekly-report/${action}`, { app_user_id: uid });
};

export const postTrackEvent = async (payload: TrackEventPayload) => {
  await postJson("/api/track", payload);
};
