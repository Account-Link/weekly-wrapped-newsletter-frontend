// 文件功能：点击下载图片的交互组件，处于分享下载页面
// 方法概览：点击下载、埋点占位、按钮状态控制
"use client";

import React, { useState } from "react";

// 方法功能：图片下载组件入参定义
interface ImageDownloaderProps {
  src: string;
  fileName: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  trackingEventName?: string;
  trackingData?: Record<string, unknown>;
  children?: React.ReactNode; // Optional: render custom content instead of default img
}

// 方法功能：渲染图片下载组件并处理下载逻辑
export const ImageDownloader: React.FC<ImageDownloaderProps> = ({
  src,
  fileName,
  width,
  height,
  className,
  style,
  trackingEventName = "image_download",
  trackingData,
  children,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  // 方法功能：触发下载并处理状态与异常
  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      console.log(`[Tracking] Event: ${trackingEventName}`, {
        fileName,
        src,
        ...trackingData,
        timestamp: new Date().toISOString(),
      });

      const link = document.createElement("a");
      if (src.startsWith("data:")) {
        link.href = src;
      } else {
        const apiUrl = `/api/download?url=${encodeURIComponent(
          src,
        )}&filename=${encodeURIComponent(fileName)}`;
        link.href = apiUrl;
      }
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again or right-click to save.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "flex-start",
        ...style,
      }}
    >
      {/* Image Preview Area - Click to download or just view */}
      <div
        style={{
          position: "relative",
          cursor: "pointer",
          width: width || "auto",
        }}
        onClick={handleDownload}
        title="Click to download"
      >
        {children ? (
          children
        ) : (
          <img
            src={src}
            alt={fileName}
            style={{
              width: width ?? "100%",
              height: height ?? "auto",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              display: "block",
            }}
          />
        )}

        {/* Hover Overlay Hint (Optional, kept simple for now) */}
      </div>

      {/* Explicit Download Button */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        style={{
          padding: "6px 12px",
          backgroundColor: "#000001",
          color: "#fffffe",
          border: "none",
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 600,
          cursor: isDownloading ? "wait" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          opacity: isDownloading ? 0.7 : 1,
          margin: "0 auto",
        }}
      >
        <span style={{ fontSize: 16 }}>⬇</span>
        {isDownloading ? "Downloading..." : "Download PNG"}
      </button>
    </div>
  );
};
