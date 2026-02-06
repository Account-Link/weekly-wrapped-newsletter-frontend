// 文件功能：统计分享卡组件，供 Satori 渲染为图片
// 方法概览：统计信息展示、柱状图与内容卡片渲染
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

// 方法功能：渲染统计分享卡内容
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
        height: 693,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#313131",
        fontFamily: "Noto Sans",
        color: "#FFFFFE",
        position: "relative",
        paddingTop: 40,
        paddingBottom: 40,
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
          textAlign: "center",
        }}
      >
        {/* Header Icon */}
        <img
          src={headerIconData}
          style={{
            objectFit: "contain",
            marginBottom: 0,
            width: "105px",
            height: "95px",
          }}
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
              border: "1px solid rgba(255, 255, 254, 0.30)",
              borderRadius: 24,
              padding: "20px 0",
              width: 155,
              height: 71,
              boxSizing: "border-box",
            }}
          >
            <span
              style={{
                fontSize: 20,
                lineHeight: 1,
                fontWeight: 700,
                color: "#FF5678",
              }}
            >
              {totalVideos} Videos
            </span>
            <span
              style={{
                fontSize: 12,
                lineHeight: 1,
                fontWeight: 700,
                marginTop: 8,
              }}
            >
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
              border: "1px solid rgba(255, 255, 254, 0.30)",
              borderRadius: 24,
              padding: "20px 0",
              width: 155,
              height: 71,
              boxSizing: "border-box",
            }}
          >
            <span
              style={{
                fontSize: 20,
                lineHeight: 1,
                fontWeight: 700,
                color: "#FF5678",
              }}
            >
              {totalTime}
            </span>
            <span
              style={{
                fontSize: 12,
                lineHeight: 1,
                fontWeight: 700,
                marginTop: 8,
              }}
            >
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
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          <span>Your thumb scrolled &nbsp;</span>
          <span style={{ fontSize: 20, color: "#FF5678" }}>{miles}</span>
        </div>

        {/* Bar Chart Section */}
        <div
          style={{
            width: 330,
            height: 148,
            display: "flex",
            marginBottom: 10,
          }}
        >
          {/* 重要逻辑：使用统一柱状图组件保证对比口径一致 */}
          <DiagnosisBarChart
            {...barChartData}
            width={330}
            height={148}
            axisFontSize={10}
            valueFontSize={12}
            barWidth={24}
          />
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
          <span
            style={{
              fontSize: 16,
              lineHeight: 1,
              fontWeight: 700,
              marginBottom: 20,
            }}
          >
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
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 100,
                    height: 100,
                    display: "flex",
                    borderRadius: "9999px",
                    border: "1px solid rgba(255,255,254,0.3)",
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
                {/* 文字换行 */}
                <div
                  style={{
                    fontSize: 12,
                    lineHeight: 1.2,
                    fontWeight: 700,
                    textAlign: "center",
                    width: 100,
                    wordBreak: "break-word",
                  }}
                >
                  {content.label}
                </div>
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
