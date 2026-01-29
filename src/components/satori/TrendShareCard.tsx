import React from "react";
import { TrendProgress } from "./TrendProgress";

export interface TrendShareCardProps {
  topicIconData: string;
  topBgData: string;
  topicTitle: string;
  topicSubtitle: string;
  discoveryRank: number;
  totalDiscovery: string; // "2,847"
  progress: number;
  fireIconData: string;
  hashtag: string;
  hashtagPercent: string;
  globalPercent: string;
  bottomBgData: string; // Bottom background
}

export const TrendShareCard: React.FC<TrendShareCardProps> = ({
  topicIconData,
  topBgData,
  topicTitle,
  topicSubtitle,
  discoveryRank,
  totalDiscovery,
  progress,
  fireIconData,
  hashtag,
  hashtagPercent,
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
        {/* Topic Icon */}
        <img
          src={topicIconData}
          width={180}
          style={{ objectFit: "contain", marginBottom: 32 }}
          alt="Topic"
        />

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 40,
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
            <TrendProgress
              width={330}
              progress={progress}
              startLabel={hashtag}
              endLabel={"Everywhere"}
              fireIconData={fireIconData}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: 330,
              marginTop: 2,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{hashtag}</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>
                {hashtagPercent}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700 }}>Everywhere</span>
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
