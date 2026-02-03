export type ClickAction =
  | "share_week"
  | "share_stats"
  | "invite_click"
  | "unsubscribe";

// 方法功能：拼接基础 URL，避免尾部斜杠导致重复路径
const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, "");

// 方法功能：生成打开像素 URL
export const getOpenPixelUrl = (uid: string, emailId: string, baseUrl = "") => {
  if (!uid || !emailId || !baseUrl) return "";
  const normalized = normalizeBaseUrl(baseUrl);
  return `${normalized}/api/track/open?uid=${encodeURIComponent(
    uid,
  )}&eid=${encodeURIComponent(emailId)}`;
};

// 方法功能：生成点击追踪 URL
export const getClickTrackingUrl = (
  uid: string,
  emailId: string,
  action: ClickAction,
  targetUrl?: string,
  baseUrl = "",
  periodStart?: string,
  periodEnd?: string,
) => {
  if (!uid || !emailId || !baseUrl) return "";
  const normalized = normalizeBaseUrl(baseUrl);
  const params = new URLSearchParams();
  params.set("uid", uid);
  params.set("eid", emailId);
  params.set("action", action);
  if (targetUrl) {
    params.set("url", targetUrl);
  }
  if (periodStart) {
    params.set("period_start", periodStart);
  }
  if (periodEnd) {
    params.set("period_end", periodEnd);
  }
  return `${normalized}/api/track/click?${params.toString()}`;
};
