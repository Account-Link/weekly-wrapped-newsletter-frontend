import React from "react";

export interface DiagnosisBarChartProps {
  lastWeekLabel: string;
  thisWeekLabel: string;
  lastWeekValue: number;
  thisWeekValue: number;
  width?: number;
  height?: number;
}

const timeSteps = [6, 12, 24, 36, 48, 72];

function formatMinutes(minutes: number) {
  const totalMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours <= 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h${mins}min`;
}

function pickTopHours(maxMinutes: number) {
  const maxHours = Math.max(1, Math.ceil(maxMinutes / 60));
  return (
    timeSteps.find((step) => step >= maxHours) ?? Math.ceil(maxHours / 12) * 12
  );
}

export const DiagnosisBarChart: React.FC<DiagnosisBarChartProps> = ({
  lastWeekLabel,
  thisWeekLabel,
  lastWeekValue,
  thisWeekValue,
  width,
  height,
}) => {
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
            borderTop: "1px dashed rgba(255,255,255,0.3)",
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
            borderTop: "1px dashed rgba(255,255,255,0.3)",
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
            borderTop: "1px solid rgba(255,255,255,0.2)",
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
          color: "rgba(255,255,255,0.3)",
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
          {`${topHours}h`}
        </span>
        <span
          style={{
            position: "absolute",
            top: "50%",
            right: 0,
            transform: "translateY(-50%)",
          }}
        >
          {`${midHours}h`}
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
              color: "rgba(255,255,255,0.6)",
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
              color: "#FFFFFF",
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
            fontSize: 16,
            fontWeight: 700,
            color: "rgba(255,255,255,0.2)",
          }}
        >
          {lastWeekLabel.toLowerCase()}
        </span>
        <span
          style={{
            width: 80,
            textAlign: "center",
            fontSize: 16,
            fontWeight: 700,
            color: "#FFFFFF",
          }}
        >
          {thisWeekLabel.toLowerCase()}
        </span>
      </div>
    </div>
  );
};
