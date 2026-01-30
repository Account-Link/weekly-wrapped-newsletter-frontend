import React from "react";
import { DiagnosisBarChart } from "./DiagnosisBarChart";

export interface StatsShareCardProps {
  headerIconData: string;
  topBgData: string;
  totalVideos: string;
  totalTime: string;
  miles: string;
  comparisonDiff?: string | null;
  comparisonText: string;
  milesComment?: string;
  barChartData: {
    lastWeekLabel: string;
    thisWeekLabel: string;
    lastWeekValue: number;
    thisWeekValue: number;
  };
  contents: {
    icon: string;
    label: string;
  }[];
  bottomBgData: string;
}

export const StatsShareCard: React.FC<StatsShareCardProps> = ({
  headerIconData,
  topBgData,
  totalVideos,
  totalTime,
  miles,
  comparisonDiff,
  comparisonText,
  milesComment,
  barChartData,
  contents,
  bottomBgData,
}) => {
  return (
    <div
      style={{
        width: 390,
        height: 960,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#313131",
        fontFamily: "Noto Sans",
        color: "#FFFFFF",
        position: "relative",
        paddingTop: 40,
        paddingBottom: 80,
        boxSizing: "border-box",
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
          style={{ objectFit: "contain", marginBottom: 0 }}
          alt="Stats"
        />

        {/* Title */}
        <div
          style={{
            fontSize: 24,
            height: 24,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1,
          }}
        >
          This week you watched
        </div>

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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: "32px",
            marginBottom: 20,
          }}
        >
          <span>Your thumb ran</span>
          <span style={{ fontSize: 20, color: "#FF5678", marginLeft: 4 }}>
            {miles} miles
          </span>
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
          <div
            style={{
              display: "flex",
              width: "330px",
              justifyContent: "space-between",
            }}
          >
            {contents.map((content, idx) => (
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
                    borderRadius: "9999px",
                    border: "1px solid rgba(255,255,255,0.3)",
                    overflow: "hidden",
                  }}
                >
                  {content.icon ? (
                    <img
                      src={content.icon}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                      alt={content.label}
                    />
                  ) : null}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700 }}>
                  {content.label}
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
