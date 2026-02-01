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
            style={{ width: "100%", maxWidth: 360, margin: "0 auto" }}
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
          background: #1f1f1f;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(16px, 6vw, 24px);
          color: #fffffe;
        }

        .download-page--error {
          align-items: center;
          justify-content: center;
        }

        .download-card {
          background: #2a2a2a;
          padding: clamp(20px, 6vw, 28px);
          border-radius: 24px;
          box-shadow: 0 18px 30px -16px rgba(0, 0, 0, 0.5);
          max-width: 402px;
          width: 100%;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: clamp(12px, 4vw, 18px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .download-title {
          font-size: clamp(22px, 6vw, 28px);
          font-weight: 700;
          margin: 0;
          color: #fffffe;
          text-align: center;
        }

        .download-subtitle {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          font-size: clamp(14px, 4vw, 16px);
          line-height: clamp(20px, 5vw, 22px);
          text-align: center;
        }

        .download-image {
          display: flex;
          justify-content: center;
          width: 100%;
          padding: clamp(8px, 3vw, 12px);
          background: #181818;
          border-radius: 18px;
        }

        .download-hint {
          font-size: clamp(12px, 3.5vw, 14px);
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }

        .download-error-text {
          color: #ff4f7a;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
