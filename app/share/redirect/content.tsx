// 文件功能：分享跳转页内容组件，处于分享链路跳转入口
// 方法概览：解析参数、记录埋点、延迟跳转
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { postTrackEvent } from "@/lib/api-client";

// 方法功能：渲染跳转页面并执行跳转逻辑
export default function RedirectContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const type = searchParams.get("type") || "unknown";
  const uid = searchParams.get("uid") || "anonymous";
  const weekStart = searchParams.get("weekStart");
  const [status, setStatus] = useState("Redirecting...");

  useEffect(() => {
    // 重要逻辑：无 URL 直接报错，避免空跳转
    if (!url) {
      setStatus("Invalid URL");
      return;
    }

    // 重要逻辑：跳转前先写入埋点，保证可追踪
    postTrackEvent({
      event: "email_button_click",
      type,
      uid,
      weekStart: weekStart || null,
      source: "email",
      targetUrl: url,
    }).catch(() => null);

    // 重要逻辑：短暂延时让埋点完成再跳转
    const timer = setTimeout(() => {
      window.location.href = url;
    }, 500);

    return () => clearTimeout(timer);
  }, [url, type, uid, weekStart]);

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
