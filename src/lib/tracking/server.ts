import { getTrackingBaseUrl, getAppBaseUrl } from "../config";

export type ClickTrackingOptions = {
  uid: string;
  event: string;
  targetUrl?: string;
  params?: Record<string, unknown>;
};

/**
 * Generate a 1x1 pixel tracking URL for email opens.
 */
export const getOpenPixelUrl = (uid: string, emailId: string) => {
  // Prevent pollution of production data in development unless explicitly enabled
  if (
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_DEV_TRACKING !== "true"
  ) {
    return "";
  }

  if (!uid || !emailId) return "";
  const baseUrl = getTrackingBaseUrl();
  return `${baseUrl}/api/track?event=open&uid=${encodeURIComponent(
    uid,
  )}&eid=${encodeURIComponent(emailId)}`;
};

/**
 * Generate a redirect tracking URL.
 * Used in emails to track clicks before redirecting the user to the destination.
 */
export const getClickTrackingUrl = ({
  uid,
  event,
  targetUrl,
  params: customParams,
}: ClickTrackingOptions) => {
  if (!uid) return "";
  const baseUrl = getTrackingBaseUrl();
  const qs = new URLSearchParams();

  qs.set("uid", uid);
  qs.set("event", event);

  if (targetUrl) {
    try {
      // Support relative paths by resolving against App Base URL
      const isRelative = !targetUrl.startsWith("http");
      const base = isRelative ? getAppBaseUrl() : undefined;
      const u = new URL(targetUrl, base);

      qs.set("targetUrl", u.toString());
    } catch {
      qs.set("targetUrl", targetUrl);
    }
  }

  if (customParams) {
    qs.set("params", JSON.stringify(customParams));
  }

  return `${baseUrl}/api/redirect?${qs.toString()}`;
};
