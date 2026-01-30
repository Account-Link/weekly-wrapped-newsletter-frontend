// 文件功能：趋势分享卡组件，供 Satori 渲染为图片
// 方法概览：渲染卡片结构与进度条区块
import React from "react";
import { TrendProgress } from "./TrendProgress";

export interface TrendShareCardProps {
  topicIconData: string;
  topicIconBgData: string;
  topBgData: string;
  topicTitle: string;
  topicSubtitle: string;
  discoveryRank: number;
  totalDiscovery: string; // "2,847"
  progress: number;
  fireIconData: string;
  hashtag: string;
  hashtagPercent: string;
  endTag: string;
  globalPercent: string;
  bottomBgData: string; // Bottom background
}

// 方法功能：渲染趋势分享卡内容
export const TrendShareCard: React.FC<TrendShareCardProps> = ({
  topicIconData,
  topicIconBgData,
  topBgData,
  topicTitle,
  topicSubtitle,
  discoveryRank,
  totalDiscovery,
  progress,
  fireIconData,
  hashtag,
  hashtagPercent,
  endTag,
  globalPercent,
  bottomBgData,
}) => {
  return (
    <div
      style={{
        width: 390,
        height: 693,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#ECECEC", // Light gray background
        fontFamily: "Noto Sans",
        position: "relative",
      }}
    >
      <img
        src={topBgData}
        alt="Top Background"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />

      {/* Main Content Container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          paddingTop: 80,
          paddingBottom: 80,
          paddingLeft: 40,
          paddingRight: 40,
          flex: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 180,
            height: 160,
            backgroundImage: `url(${topicIconBgData})`,
            backgroundSize: "100% 100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <img
            src={topicIconData}
            width={120}
            style={{ objectFit: "contain" }}
            alt="Topic"
          />
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#000",
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            “{topicTitle}”
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#FF345D",
              textAlign: "center",
            }}
          >
            {topicSubtitle}
          </span>
        </div>

        {/* Discovery Text */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 16,
            fontWeight: "bold",
            color: "#000",
            lineHeight: 1.3,
            marginBottom: 40,
            width: 330,
            textAlign: "center",
          }}
        >
          <span>You were</span>
          <span
            style={{ color: "#FF5678", margin: "0 6px", fontWeight: "bold" }}
          >
            #{discoveryRank}
          </span>
          <span>to discover out of</span>
          <span
            style={{ color: "#FF5678", margin: "0 6px", fontWeight: "bold" }}
          >
            {totalDiscovery}
          </span>
          <span>people.</span>
        </div>

        {/* Progress Section */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", width: 330, height: 32 }}>
            {/* 重要逻辑：使用统一进度条组件保证样式一致 */}
            <TrendProgress
              width={330}
              progress={progress}
              fireIconData={fireIconData}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: 330,
              marginTop: 2,
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "50%",
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700 }}>{hashtag}</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>
                {hashtagPercent}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "50%",
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700 }}>{endTag}</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>
                {globalPercent}
              </span>
            </div>
          </div>
        </div>
      </div>

      <img
        src={bottomBgData}
        alt="Bottom Background"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />
    </div>
  );
};
