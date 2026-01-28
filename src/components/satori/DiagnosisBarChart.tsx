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
  const maxBarHeight = 100;
  const lastHeight = Math.round(
    (clampPercent(lastWeekValue) / 100) * maxBarHeight
  );
  const thisHeight = Math.round(
    (clampPercent(thisWeekValue) / 100) * maxBarHeight
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        fontFamily: "Noto Sans",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          height: maxBarHeight + 20,
          justifyContent: "space-around",
          alignItems: "flex-end",
          color: "#AAAAAA",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 12 }}>{lastWeekLabel}</span>
          <div
            style={{
              width: 20,
              height: lastHeight,
              backgroundColor: "#555555",
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 12 }}>{thisWeekLabel}</span>
          <div
            style={{
              width: 20,
              height: thisHeight,
              backgroundColor: "#00CC66",
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5,
            }}
          />
        </div>
      </div>
    </div>
  );
};
