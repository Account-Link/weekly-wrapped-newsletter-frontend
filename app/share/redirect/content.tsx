// 文件功能：分享跳转页内容组件，处于分享链路跳转入口
// 方法概览：解析参数、记录埋点、延迟跳转
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/api/tracking";

// 方法功能：渲染跳转页面并执行跳转逻辑
export default function RedirectContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const type = searchParams.get("type") || "unknown";
  const uid = searchParams.get("uid") || "anonymous";
  const weekStart = searchParams.get("weekStart");
  const periodStart = searchParams.get("period_start");
  const periodEnd = searchParams.get("period_end");
  const [status, setStatus] = useState("Redirecting...");

  useEffect(() => {
    // 重要逻辑：无 URL 直接报错，避免空跳转
    if (!url) {
      setStatus("Invalid URL");
      return;
    }

    // 重要逻辑：跳转前先写入埋点，保证可追踪
    trackEvent({
      event: "click",
      type, // 埋点 code
      action: "redirect", // 具体交互动作
      uid,
      eid: weekStart || null,
      source: "email",
      extraData: {
        targetUrl: url,
      },
    }).catch(() => null);

    // 重要逻辑：处理 URL 参数传递
    const targetUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    if (periodStart) targetUrl.searchParams.set("period_start", periodStart);
    if (periodEnd) targetUrl.searchParams.set("period_end", periodEnd);

    // 重要逻辑：短暂延时让埋点完成再跳转
    const timer = setTimeout(() => {
      window.location.href = targetUrl.toString();
    }, 500);

    return () => clearTimeout(timer);
  }, [url, type, uid, weekStart, periodStart, periodEnd]);

  if (!url) {
    return (
      <div className="h-dvh w-[40.2rem] flex items-center justify-center p-4">
        <p className="text-red-500">Error: No redirect URL provided.</p>
      </div>
    );
  }

  return (
    <div
      className="h-dvh w-[40.2rem] flex flex-col items-center justify-center"
      style={{ background: "#fffffe" }}
    >
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-8 w-8 bg-gray-200 rounded-full mb-4"></div>
        <p className="text-gray-500">{status}</p>
      </div>
    </div>
  );
}
