import React from "react";

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export interface TrendProgressProps {
  progress: number;
  fireIconData: string;
  width?: number | string;
}

export const TrendProgress: React.FC<TrendProgressProps> = ({
  progress,
  fireIconData,
  width,
}) => {
  const safeProgress = clampPercent(progress);

  return (
    <div
      style={{
        width: width ?? "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 8,
        fontFamily: "Noto Sans",
        color: "#111111",
      }}
    >
      <div
        style={{
          width: "100%",
          height: 32,
          backgroundColor: "#D1D1D1",
          borderRadius: 32,
          display: "flex",
        }}
      >
        <div
          style={{
            width: `${safeProgress}%`,
            height: "100%",
            backgroundColor: "#6A00F4",
            borderRadius: 32,
            position: "relative",
            display: "flex",
          }}
        >
          <img
            src={fireIconData}
            alt="trend progress"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 45,
              height: 55,
              transform: "translate(22px, -10px)",
            }}
          />
        </div>
      </div>
    </div>
  );
};
