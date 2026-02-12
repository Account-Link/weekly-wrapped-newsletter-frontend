"use client";

import { useEffect } from "react";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";
import { getFirebaseApp } from "@/lib/firebase-client";

const sendMetricToGa4 = async (metric: Metric) => {
  const app = getFirebaseApp();
  if (!app) return;

  const supported = await isSupported();
  if (!supported) return;

  const analytics = getAnalytics(app);
  // 重要逻辑：统一使用 web_vital 事件名，便于 GA4 聚合和自定义维度配置
  logEvent(analytics, "web_vital", {
    metric_name: metric.name,
    metric_value: Math.round(metric.value * 1000) / 1000,
    metric_delta: Math.round(metric.delta * 1000) / 1000,
    metric_id: metric.id,
    metric_rating: metric.rating,
    navigation_type: metric.navigationType,
  });
};

export default function PerformanceReporter() {
  useEffect(() => {
    // 重要逻辑：仅在客户端注册性能指标监听，避免 SSR 报错
    onCLS(sendMetricToGa4);
    onFCP(sendMetricToGa4);
    onINP(sendMetricToGa4);
    onLCP(sendMetricToGa4);
    onTTFB(sendMetricToGa4);
  }, []);

  return null;
}
