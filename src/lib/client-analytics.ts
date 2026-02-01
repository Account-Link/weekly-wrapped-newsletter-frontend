"use client";

import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { getFirebaseApp } from "@/lib/firebase-client";

export type ShareSavedAction = "share_week" | "share_stats";

export type ShareSavedPayload = {
  uid: string;
  emailId: string;
  action: ShareSavedAction;
};

// 方法功能：记录图片保存事件（客户端 Firebase Analytics）
export const trackShareSaved = async (payload: ShareSavedPayload) => {
  const app = getFirebaseApp();
  if (!app) return;

  // 重要逻辑：Analytics 仅在浏览器支持时启用
  const supported = await isSupported();
  if (!supported) return;

  const analytics = getAnalytics(app);
  logEvent(analytics, "share_saved", {
    uid: payload.uid,
    email_id: payload.emailId,
    action: payload.action,
  });
};
