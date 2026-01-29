import React from "react";
import { TrendProgress } from "./TrendProgress";

export interface TrendShareCardProps {
  topicIconData: string;
  topicTitle: string;
  topicSubtitle: string;
  discoveryRank: number;
  totalDiscovery: string; // "2,847"
  progress: number;
  fireIconData: string;
  hashtag: string;
  hashtagPercent: string;
  globalPercent: string;
  footerDecorData: string; // Bottom colorful waves
}

export const TrendShareCard: React.FC<TrendShareCardProps> = ({
  topicIconData,
  topicTitle,
  topicSubtitle,
  discoveryRank,
  totalDiscovery,
  progress,
  fireIconData,
  hashtag,
  hashtagPercent,
  globalPercent,
  footerDecorData,
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#ECECEC", // Light gray background
        fontFamily: "Helvetica",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top Torn Paper Effect - Optional/Simulated or Image */}
      {/* Assuming pure CSS or background for now, or just flat */}

      {/* Main Content Container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          paddingTop: 80,
          paddingLeft: 40,
          paddingRight: 40,
          flex: 1,
        }}
      >
        {/* Topic Icon */}
        <img
          src={topicIconData}
          width={200}
          height={200}
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
              fontSize: 48,
              fontWeight: 900,
              color: "#000",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            “{topicTitle}”
          </span>
          <span
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#FF5678",
              marginTop: 8,
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
            fontSize: 24,
            fontWeight: 700,
            color: "#000",
            marginBottom: 40,
          }}
        >
          <span>You were</span>
          <span style={{ color: "#FF5678", margin: "0 6px" }}>
            #{discoveryRank}
          </span>
          <span>to discover out of</span>
          <span style={{ color: "#FF5678", margin: "0 6px" }}>
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
            gap: 8,
          }}
        >
          {/* Custom Progress Bar with Fire */}
          {/* We can reuse TrendProgress structure but might need slight adjustments for the card look if different */}
          {/* Based on image, it looks similar but with labels below */}

          <div
            style={{
              display: "flex",
              width: "100%",
              height: 48,
              backgroundColor: "#D1D1D1",
              borderRadius: 48,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: "#6A00F4",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              {/* Fire Icon positioned at the end */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  marginRight: -20,
                  marginTop: -10,
                  display: "flex",
                }}
              >
                <img
                  src={fireIconData}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 8,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 20, fontWeight: 700 }}>{hashtag}</span>
              <span style={{ fontSize: 20, fontWeight: 400 }}>
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
              <span style={{ fontSize: 20, fontWeight: 700 }}>Everywhere</span>
              <span style={{ fontSize: 20, fontWeight: 400 }}>
                {globalPercent}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Decor */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height: 180,
          marginTop: "auto",
        }}
      >
        <img
          src={footerDecorData}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </div>
  );
};
