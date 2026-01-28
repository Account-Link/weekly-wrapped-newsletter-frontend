import React from "react";

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export interface DiagnosisBarChartProps {
  lastWeekLabel: string;
  thisWeekLabel: string;
  lastWeekValue: number;
  thisWeekValue: number;
}

export const DiagnosisBarChart: React.FC<DiagnosisBarChartProps> = ({
  lastWeekLabel,
  thisWeekLabel,
  lastWeekValue,
  thisWeekValue,
}) => {
  // Normalize values to 0-100 scale if they aren't already, 
  // but assuming input is already 0-100 relative to max.
  // Actually, let's assume inputs are relative to each other and fit within 100.
  // If they are raw values, we should normalize.
  // Based on previous code `clampPercent`, they seem to be 0-100.
  // Let's stick to using them as percentages for height.
  
  const maxVal = Math.max(lastWeekValue, thisWeekValue, 1);
  // Scale so the largest bar hits 85% height to leave room for the top label
  const scale = 85 / maxVal;
  
  const lastHeight = Math.max(5, lastWeekValue * scale); 
  const thisHeight = Math.max(5, thisWeekValue * scale);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        fontFamily: "Noto Sans",
        position: "relative",
      }}
    >
      {/* Grid Lines (Background) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 40, // Leave space for x-axis labels
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 0,
        }}
      >
        {/* Top Line (100%) */}
        <div style={{ width: "100%", height: 1, borderTop: "1px dashed #555" }} />
        {/* Middle Line (50%) */}
        <div style={{ width: "100%", height: 1, borderTop: "1px dashed #555" }} />
        {/* Bottom Line (0%) */}
        <div style={{ width: "100%", height: 1, borderTop: "1px solid #555" }} />
      </div>

      {/* Y-Axis Labels (Placeholder) */}
      <div
        style={{
          position: "absolute",
          left: -40,
          top: 0,
          bottom: 40,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "#888",
          fontSize: 14,
          fontWeight: 700,
          textAlign: "right",
          width: 30,
        }}
      >
         <span></span>
         <span></span>
         <span>0 h</span>
      </div>

      {/* Bars Container */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: 40, 
          gap: 80,
          zIndex: 1,
        }}
      >
        {/* Last Week Group */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: 0.5,
            width: 80,
            height: "100%",
            justifyContent: "flex-end",
          }}
        >
          {/* Value Label (Above Bar) */}
          <span style={{ fontSize: 16, fontWeight: 700, color: "#CCCCCC", marginBottom: 8 }}>
            {lastWeekValue}
          </span>
          {/* Bar */}
          <div
            style={{
              width: 32,
              height: `${lastHeight}%`,
              backgroundColor: "#22C083",
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
            }}
          />
        </div>

        {/* This Week Group */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 80,
            height: "100%",
            justifyContent: "flex-end",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", marginBottom: 8 }}>
            {thisWeekValue}
          </span>
          <div
            style={{
              width: 32,
              height: `${thisHeight}%`,
              backgroundColor: "#22C083",
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
            }}
          />
        </div>
      </div>

      {/* X-Axis Labels (Fixed at bottom) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 80,
          height: 30,
          alignItems: "center",
        }}
      >
         <span style={{ width: 80, textAlign: "center", fontSize: 16, fontWeight: 700, color: "#CCCCCC", opacity: 0.5 }}>Last Week</span>
         <span style={{ width: 80, textAlign: "center", fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>This Week</span>
      </div>
    </div>
  );
};
