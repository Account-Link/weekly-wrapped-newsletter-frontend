"use client";

import React, { useState } from "react";

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

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      // 1. Tracking Hook (Placeholder for now)
      // In real implementation, call firebase/analytics logEvent here
      console.log(`[Tracking] Event: ${trackingEventName}`, {
        fileName,
        src,
        ...trackingData,
        timestamp: new Date().toISOString(),
      });

      // 2. Download Logic
      // Fetching blob to support cross-origin and proper filename
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
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
          backgroundColor: "#000",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 600,
          cursor: isDownloading ? "wait" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          opacity: isDownloading ? 0.7 : 1,
        }}
      >
        <span style={{ fontSize: 16 }}>⬇</span>
        {isDownloading ? "Downloading..." : "Download PNG"}
      </button>
    </div>
  );
};
