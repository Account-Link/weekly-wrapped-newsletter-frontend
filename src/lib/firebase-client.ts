"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";

// 方法功能：读取 Firebase Web 配置
const getFirebaseConfig = () => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    measurementId,
  };
};

// 方法功能：初始化并复用 Firebase App 单例
export const getFirebaseApp = (): FirebaseApp | null => {
  const existing = getApps();
  if (existing.length > 0) return existing[0];

  // 重要逻辑：配置缺失时不初始化，避免客户端报错
  const config = getFirebaseConfig();
  if (!config) return null;

  return initializeApp(config);
};
