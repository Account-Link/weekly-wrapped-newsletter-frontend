import { getTrackingBaseUrl, getAppBaseUrl } from "../config";
import { TrackingAction } from "./types";

export type ClickTrackingOptions = {
  uid: string;
  emailId: string;
  action: TrackingAction;
  type?: string; // Module code
  targetUrl?: string;
  extraData?: Record<string, unknown>;
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
  emailId,
  action,
  type,
  targetUrl,
  extraData,
}: ClickTrackingOptions) => {
  if (!uid || !emailId) return "";
  const baseUrl = getTrackingBaseUrl();
  const params = new URLSearchParams();

  params.set("uid", uid);
  params.set("eid", emailId);
  params.set("action", action);
  if (type) {
    params.set("type", type);
  }

  if (targetUrl) {
    try {
      // Support relative paths by resolving against App Base URL
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
