import { getAnalytics, logEvent, isSupported } from "firebase/analytics";
import { getFirebaseApp } from "@/lib/firebase-client";
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

  // 1. 发送给后端 Firestore (原有逻辑)
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

  const fetchPromise = fetch("/api/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch((err) => {
    if (process.env.NODE_ENV === "development") {
      console.error("Tracking failed:", err);
    }
  });

  // 2. 发送给 Google Analytics (新增逻辑)
  // 重要逻辑：仅在客户端环境执行
  if (typeof window !== "undefined") {
    try {
      const app = getFirebaseApp();
      if (app && (await isSupported())) {
        const analytics = getAnalytics(app);
        logEvent(analytics, event, {
          ...params,
          uid: payload.uid,
          session_id,
          // GA4 自动采集 page_location/title, 这里无需重复
        });
      }
    } catch (err) {
      // GA 上报失败不应阻塞主流程，静默失败即可
      if (process.env.NODE_ENV === "development") {
        console.warn("GA tracking failed:", err);
      }
    }
  }

  // 等待 fetch 完成 (可选，通常不需要 await fetch，因为它使用了 keepalive)
  // 但为了兼容旧代码的 await 调用习惯，我们返回 fetchPromise
  return fetchPromise;
};
