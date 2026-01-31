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
      <div className="download-page download-page--error">
        <p className="download-error-text">Error: No image URL provided.</p>
      </div>
    );
  }

  return (
    <div className="download-page">
      <div className="download-card">
        <h1 className="download-title">Your Wrapped is Ready!</h1>
        <p className="download-subtitle">
          Click the image below to download and share it with your friends.
        </p>

        <div className="download-image">
          <ImageDownloader
            src={url}
            fileName={filename}
            trackingEventName="share_card_download"
            trackingData={{ type }}
            width="100%"
            style={{ width: "100%", maxWidth: 600, margin: "0 auto" }}
          />
        </div>

        <p className="download-hint">
          If download doesn&apos;t start, long press (mobile) or right click to
          save.
        </p>
      </div>
      <style jsx>{`
        .download-page {
          min-height: 100vh;
          background: #f3f4f6;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .download-page--error {
          align-items: center;
          justify-content: center;
        }

        .download-card {
          background: #fffffe;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          width: 100%;
          text-align: center;
        }

        .download-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #1f2937;
          text-align: center;
        }

        .download-subtitle {
          color: #4b5563;
          margin-bottom: 24px;
          text-align: center;
        }

        .download-image {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
          width: 100%;
        }

        .download-hint {
          font-size: 14px;
          color: #9ca3af;
          margin-top: 16px;
        }

        .download-error-text {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}
