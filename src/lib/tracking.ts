import { getTrackingBaseUrl, getAppBaseUrl } from "./config";

export type ClickAction =
  | "share_week"
  | "share_stats"
  | "invite_click"
  | "unsubscribe";

// 方法功能：生成打开像素 URL
export const getOpenPixelUrl = (uid: string, emailId: string) => {
  if (!uid || !emailId) return "";
  const baseUrl = getTrackingBaseUrl();
  return `${baseUrl}/api/track?event=open&uid=${encodeURIComponent(
    uid,
  )}&eid=${encodeURIComponent(emailId)}`;
};

export type ClickTrackingOptions = {
  uid: string;
  emailId: string;
  action: ClickAction;
  targetUrl?: string;
  extraData?: Record<string, unknown>;
};

// 方法功能：生成点击追踪 URL (指向重定向服务)
export const getClickTrackingUrl = ({
  uid,
  emailId,
  action,
  targetUrl,
  extraData,
}: ClickTrackingOptions) => {
  if (!uid || !emailId) return "";
  const baseUrl = getTrackingBaseUrl();
  const params = new URLSearchParams();

  params.set("uid", uid);
  params.set("eid", emailId);
  params.set("action", action);

  if (targetUrl) {
    try {
      // 兼容相对路径：如果是相对路径，直接使用 App Base URL 补全为绝对路径
      const isRelative = !targetUrl.startsWith("http");
      const base = isRelative ? getAppBaseUrl() : undefined;
      const u = new URL(targetUrl, base);

      params.set("targetUrl", u.toString());
    } catch {
      params.set("targetUrl", targetUrl);
    }
  }

  if (extraData) {
    params.set("extraData", JSON.stringify(extraData));
  }

  return `${baseUrl}/api/redirect?${params.toString()}`;
};
