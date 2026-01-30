// 文件功能：分享下载页内容组件，处于分享链路落地页
// 方法概览：解析参数、记录埋点、渲染下载入口
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ImageDownloader } from "@/components/ImageDownloader";

// 方法功能：渲染分享下载页面内容
export default function DownloadContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const filename = searchParams.get("filename") || "image.png";
  const type = searchParams.get("type") || "unknown";
  const uid = searchParams.get("uid") || "anonymous";
  const weekStart = searchParams.get("weekStart");

  useEffect(() => {
    // 重要逻辑：打开下载页即上报点击埋点
    if (!url) {
      return;
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "email_button_click",
        type,
        uid,
        weekStart: weekStart || null,
        source: "email",
        targetUrl: url,
      }),
    }).catch(() => null);
  }, [type, url, uid, weekStart]);

  if (!url) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <p className="text-red-500">Error: No image URL provided.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Your Wrapped is Ready!
        </h1>
        <p className="text-gray-600 mb-6">
          Click the image below to download and share it with your friends.
        </p>

        <div className="flex justify-center mb-6">
          <ImageDownloader
            src={url}
            fileName={filename}
            trackingEventName="share_card_download"
            trackingData={{ type }}
            width="100%"
          />
        </div>

        <p className="text-sm text-gray-400 mt-4">
          If download doesn&apos;t start, long press (mobile) or right click to
          save.
        </p>
      </div>
    </div>
  );
}
