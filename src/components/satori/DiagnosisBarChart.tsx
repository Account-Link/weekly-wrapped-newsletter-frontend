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

  // 其他情况：取最大小时数的一半向上取整作为步长 (mid)，最大刻度为步长的两倍
  // 例如：1.33h -> ceil(0.66) = 1h -> Top 2h
  // 例如：2.33h -> ceil(1.16) = 2h -> Top 4h
  const mid = Math.ceil(maxHours / 2);
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

  return (
    <div
      style={{
        width: width ?? 520,
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
          fontSize: 14,
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
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: xAxisHeight,
          gap: 80,
          zIndex: 1,
        }}
      >
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
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "rgba(255,255,254,0.6)",
              marginBottom: 8,
            }}
          >
            {lastLabel}
          </span>
          <div
            style={{
              width: 32,
              height: `${lastHeight}%`,
              backgroundColor: "#22C083",
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              marginBottom: 1,
            }}
          />
        </div>

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
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#FFFFFE",
              marginBottom: 8,
            }}
          >
            {thisLabel}
          </span>
          <div
            style={{
              width: 32,
              height: `${thisHeight}%`,
              backgroundColor: "#22C083",
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              marginBottom: 1,
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 40,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 80,
          height: xAxisHeight,
          alignItems: "center",
        }}
      >
        <span
          style={{
            width: 80,
            textAlign: "center",
            fontSize: 14,
            fontWeight: 700,
            color: "rgba(255,255,254,0.2)",
          }}
        >
          {lastWeekLabel}
        </span>
        <span
          style={{
            width: 80,
            textAlign: "center",
            fontSize: 14,
            fontWeight: 700,
            color: "#FFFFFE",
          }}
        >
          {thisWeekLabel}
        </span>
      </div>
    </div>
  );
};
