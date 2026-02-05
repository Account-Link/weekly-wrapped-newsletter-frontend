// 文件功能：诊断柱状图组件，供 Satori 渲染为图表
// 方法概览：时间格式化、刻度选择、柱状图渲染
import React from "react";

export interface DiagnosisBarChartProps {
  lastWeekLabel: string;
  thisWeekLabel: string;
  lastWeekValue: number;
  thisWeekValue: number;
  width?: number;
  height?: number;
  axisFontSize?: number;
  valueFontSize?: number;
  barWidth?: number;
}

// 方法功能：将分钟数格式化为小时/分钟字符串
function formatMinutes(minutes: number, isAxis = false) {
  const totalMinutes = Math.max(0, Math.round(minutes));

  // 特殊处理：如果是 Y 轴刻度且刚好是 30 分钟，强制显示 0.5h
  if (isAxis && totalMinutes === 30) {
    return "0.5h";
  }

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  // Case 1: 纯分钟 (不足 1 小时)，直接显示分钟 (e.g., 27min, 30min)
  if (hours === 0) {
    return `${mins}min`;
  }

  // Case 2: 整小时 (分钟为 0)，只显示小时 (e.g., 12h)
  if (mins === 0) {
    return `${hours.toLocaleString()}h`;
  }

  // Case 3: 混合模式 (e.g., 1h 27min)
  return `${hours.toLocaleString()}h${mins}min`;
}

// 方法功能：根据最大分钟数选择上方刻度
function pickTopHours(maxMinutes: number) {
  const maxHours = maxMinutes / 60;

  // 如果最大值不超过 1 小时，固定使用 1h 作为最大刻度，0.5h (30min) 作为中间刻度
  if (maxHours <= 1) {
    return 1;
  }

  // 其他情况：根据量级决定刻度单位
  let stepUnit = 1;
  if (maxHours > 1000) {
    stepUnit = 100;
  } else if (maxHours > 20) {
    // 覆盖 70h, 120h, 140h 等场景
    stepUnit = 10;
  }

  // 取最大小时数的一半，按 stepUnit 向上取整作为步长 (mid)
  // 最大刻度为步长的两倍
  const rawMid = maxHours / 2;
  let mid = Math.ceil(rawMid / stepUnit) * stepUnit;

  // 如果最大值刚好等于或超过计算出的最大刻度 (mid * 2)，为了避免顶格，增加一个步长
  // 注意：这里 mid 已经是 stepUnit 的倍数，直接加 stepUnit 即可
  if (mid * 2 <= maxHours) {
    mid += stepUnit;
  }

  return mid * 2;
}

// 方法功能：渲染对比柱状图
export const DiagnosisBarChart: React.FC<DiagnosisBarChartProps> = ({
  lastWeekLabel,
  thisWeekLabel,
  lastWeekValue,
  thisWeekValue,
  width,
  height,
  axisFontSize = 14,
  valueFontSize = 16,
  barWidth = 32,
}) => {
  // 重要逻辑：计算刻度与高度比例，保证图表可读
  const maxMinutes = Math.max(lastWeekValue, thisWeekValue, 1);
  const topHours = pickTopHours(maxMinutes);
  const topMinutes = topHours * 60;
  const midHours = topHours / 2;
  const xAxisHeight = 36;
  const topPadding = 12;
  const scale = 85 / topMinutes;
  const lastHeight = Math.max(5, lastWeekValue * scale);
  const thisHeight = Math.max(5, thisWeekValue * scale);
  const lastLabel = formatMinutes(lastWeekValue);
  const thisLabel = formatMinutes(thisWeekValue);

  // 动态计算 gap：宽度较小时减小间距，避免过于分散
  const chartWidth = width ?? 520;
  const gap = chartWidth < 400 ? 40 : 80;

  return (
    <div
      style={{
        width: chartWidth,
        height: height ?? 265,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        fontFamily: "Noto Sans",
        fontWeight: 700,
        position: "relative",
        paddingLeft: 40,
        paddingTop: topPadding,
        boxSizing: "border-box",
        backgroundColor: "#313131",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: topPadding,
          left: 40,
          right: 0,
          bottom: xAxisHeight,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 0,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            width: "100%",
            height: 1,
            borderTop: "1px dashed rgba(255,255,254,0.3)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            width: "100%",
            height: 1,
            borderTop: "1px dashed rgba(255,255,254,0.3)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            width: "100%",
            height: 1,
            borderTop: "1px solid rgba(255,255,254,0.2)",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          top: topPadding,
          bottom: xAxisHeight,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "rgba(255,255,254,0.3)",
          fontSize: axisFontSize,
          fontWeight: 700,
          textAlign: "right",
          width: 34,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            transform: "translateY(-50%)",
          }}
        >
          {formatMinutes(topHours * 60, true)}
        </span>
        <span
          style={{
            position: "absolute",
            top: "50%",
            right: 0,
            transform: "translateY(-50%)",
          }}
        >
          {formatMinutes(midHours * 60, true)}
        </span>
        <span
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            transform: "translateY(50%)",
          }}
        >
          0h
        </span>
      </div>

      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          gap: gap,
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 80,
            height: "100%",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "center",
              opacity: 0.5,
              width: "100%",
              paddingBottom: 1, // subtle adjustment for border
            }}
          >
            <span
              style={{
                fontSize: valueFontSize,
                fontWeight: 700,
                color: "rgba(255,255,254,0.6)",
                marginBottom: 8,
              }}
            >
              {lastLabel}
            </span>
            <div
              style={{
                width: barWidth,
                height: `${lastHeight}%`,
                backgroundColor: "#22C083",
                borderTopLeftRadius: 25,
                borderTopRightRadius: 25,
              }}
            />
          </div>
          <div
            style={{
              height: xAxisHeight,
              width: "100%", // 显式占满父容器宽度 (80px)
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: axisFontSize,
                fontWeight: 700,
                color: "rgba(255,255,254,0.2)",
              }}
            >
              {lastWeekLabel}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 80,
            height: "100%",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "center",
              width: "100%",
              paddingBottom: 1,
            }}
          >
            <span
              style={{
                fontSize: valueFontSize,
                fontWeight: 700,
                color: "#FFFFFE",
                marginBottom: 8,
              }}
            >
              {thisLabel}
            </span>
            <div
              style={{
                width: barWidth,
                height: `${thisHeight}%`,
                backgroundColor: "#22C083",
                borderTopLeftRadius: 25,
                borderTopRightRadius: 25,
              }}
            />
          </div>
          <div
            style={{
              height: xAxisHeight,
              width: "100%", // 显式占满父容器宽度 (80px)
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: axisFontSize,
                fontWeight: 700,
                color: "#FFFFFE",
              }}
            >
              {thisWeekLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
