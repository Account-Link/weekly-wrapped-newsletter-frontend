import { TrackEventPayload } from "./types";

/**
 * Send a tracking event to the server.
 * Uses `keepalive: true` to ensure delivery even if the page unloads.
 */
export const trackEvent = async (payload: TrackEventPayload) => {
  const getUuid = () => {
    if (typeof window === "undefined") return "server";
    let id = localStorage.getItem("device_uuid");
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `dev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem("device_uuid", id);
    }
    return id;
  };

  const getSessionId = () => {
    if (typeof window === "undefined") return "server";
    let sid = sessionStorage.getItem("session_id");
    if (!sid) {
      sid =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem("session_id", sid);
    }
    return sid;
  };

  const buildCommonParams = () => {
    if (typeof window === "undefined") {
      return {
        platform: "server",
        language: "en-US",
      };
    }
    const nav = navigator;
    const scr = window.screen;
    return {
      platform: "web",
      language: nav.language,
      user_agent: nav.userAgent,
      os: nav.userAgent,
      screen_width: scr?.width,
      screen_height: scr?.height,
      device_pixel_ratio: window.devicePixelRatio,
    };
  };

  const buildPageParams = () => {
    if (typeof window === "undefined") {
      return {};
    }
    return {
      page_url: window.location.href,
      page_title: document.title,
      referrer: document.referrer || undefined,
    };
  };

  const event = payload.event;
  const timestamp = payload.timestamp ?? Date.now();
  const uuid = payload.uuid ?? getUuid();
  const session_id = payload.session_id ?? getSessionId();
  const common_params = {
    ...buildCommonParams(),
    ...(payload.common_params || {}),
  };
  const page_params = {
    ...buildPageParams(),
    ...(payload.page_params || {}),
  };

  // 重要逻辑：所有非默认字段由调用方放入 params，客户端仅透传与自动采集默认参数
  const params = payload.params || {};

  const body = {
    event,
    uid: payload.uid,
    uuid,
    session_id,
    timestamp,
    common_params,
    page_params,
    params: Object.keys(params).length ? params : undefined,
  };

  try {
    const res = await fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      keepalive: true,
    });

    if (!res.ok) {
      if (process.env.NODE_ENV === "development") {
        console.error("Tracking failed:", res.statusText);
      }
    }
  } catch (error) {
    // Ensure tracking errors never block the main application flow
    if (process.env.NODE_ENV === "development") {
      console.error("Tracking error:", error);
    }
  }
};
