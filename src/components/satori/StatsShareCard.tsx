import React from "react";
import { DiagnosisBarChart } from "./DiagnosisBarChart";

export interface StatsShareCardProps {
  headerIconData: string;
  topBgData: string;
  totalVideos: string;
  totalTime: string;
  runIconData: string;
  miles: string;
  barChartData: {
    lastWeekLabel: string;
    thisWeekLabel: string;
    lastWeekValue: number;
    thisWeekValue: number;
  };
  barChartWidth?: number;
  barChartHeight?: number;
  contentIcons: string[]; // Array of 3 icon base64 strings
  contentLabels: string[]; // Array of 3 labels
  bottomBgData: string;
}

export const StatsShareCard: React.FC<StatsShareCardProps> = ({
  headerIconData,
  topBgData,
  totalVideos,
  totalTime,
  runIconData,
  miles,
  barChartData,
  barChartWidth,
  barChartHeight,
  contentIcons,
  contentLabels,
  bottomBgData,
}) => {
  return (
    <div
      style={{
        width: 390,
        height: 980,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#313131",
        fontFamily: "Noto Sans",
        color: "#FFFFFF",
        position: "relative",
        paddingTop: 40,
        paddingBottom: 80,
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          flex: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header Icon */}
        <img
          src={headerIconData}
          width={180}
          style={{ objectFit: "contain", marginBottom: 24 }}
          alt="Stats"
        />

        {/* Title */}
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          This week you watched
        </span>

        {/* Stats Grid */}
        <div
          style={{
            display: "flex",
            marginTop: 20,
            marginBottom: 20,
            width: "100%",
            justifyContent: "space-between",
            padding: "0 30px",
            boxSizing: "border-box",
          }}
        >
          {/* Box 1 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255, 255, 255, 0.30)",
              borderRadius: 24,
              padding: "20px 0",
              width: 155,
              boxSizing: "border-box",
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 700, color: "#FF5678" }}>
              {totalVideos} Videos
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>
              Total Videos
            </span>
          </div>

          {/* Box 2 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255, 255, 255, 0.30)",
              borderRadius: 24,
              padding: "20px 0",
              width: 155,
              boxSizing: "border-box",
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 700, color: "#FF5678" }}>
              {totalTime}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>
              Total Time
            </span>
          </div>
        </div>

        {/* Run Stats */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            <span>Your thumb ran </span>
            <span style={{ color: "#FF5678", marginLeft: 6, marginRight: 6 }}>
              {miles + " miles"}
            </span>
          </div>
        </div>

        {/* Bar Chart Section */}
        <div
          style={{
            width: 330,
            height: 265,
            display: "flex",
            marginBottom: 20,
          }}
        >
          <DiagnosisBarChart {...barChartData} width={330} height={265} />
        </div>

        {/* New Contents Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
            • New contents you got into •
          </span>
          <div style={{ display: "flex", gap: 32, justifyContent: "center" }}>
            {contentIcons.map((icon, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    width: 100,
                    height: 100,
                    display: "flex",
                  }}
                >
                  <img
                    src={icon}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700 }}>
                  {contentLabels[idx]}
                </span>
              </div>
            ))}
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
