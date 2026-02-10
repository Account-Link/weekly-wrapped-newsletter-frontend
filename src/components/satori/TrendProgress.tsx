// 文件功能：趋势进度条组件，供 Satori 渲染为图表
// 方法概览：数值归一化与进度条渲染
import React from "react";

// 方法功能：将进度限制在 0-100 区间
function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export interface TrendProgressProps {
  progress: number;
  fireIconData: string;
  width?: number | string;
}

// 方法功能：渲染趋势进度条与火焰图标
export const TrendProgress: React.FC<TrendProgressProps> = ({
  progress,
  fireIconData,
  width,
}) => {
  // 重要逻辑：直接使用 progress 作为当前进度百分比
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
        overflow: "visible",
      }}
    >
      <div
        style={{
          width: "100%",
          height: 32,
          backgroundColor: "#D1D1D1",
          borderRadius: 32,
          display: "flex",
          overflow: "visible",
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
            overflow: "visible",
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
