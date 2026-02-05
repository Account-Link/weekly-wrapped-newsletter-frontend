"use client";

import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { getFirebaseApp } from "@/lib/firebase-client";

export type ShareSavedAction =
  | "share_week"
  | "share_stats"
  | "share_twitter_saved"
  | "share_linkedin_saved"
  | "share_copy_link_saved"
  | "share_messenger_saved"
  | "share_whatsapp_saved"
  | "share_instagram_saved"
  | (string & {});

export type ShareSavedPayload = {
  uid: string;
  emailId: string;
  action: ShareSavedAction;
};

// 方法功能：记录图片保存事件（客户端 Firebase Analytics）
export const trackShareSaved = async (payload: ShareSavedPayload) => {
  // Deduplication: Same user_id + email_id, only first time
  const key = `tracked_share_saved_${payload.uid}_${payload.emailId}_${payload.action}`;
  if (typeof window !== "undefined" && localStorage.getItem(key)) {
    return;
  }

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

  if (typeof window !== "undefined") {
    localStorage.setItem(key, "true");
  }
};
