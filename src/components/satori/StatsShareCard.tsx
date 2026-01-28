import React from "react";
import { DiagnosisBarChart } from "./DiagnosisBarChart";

export interface StatsShareCardProps {
  headerIconData: string;
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
  contentIcons: string[]; // Array of 3 icon base64 strings
  contentLabels: string[]; // Array of 3 labels
  footerDecorData: string;
}

export const StatsShareCard: React.FC<StatsShareCardProps> = ({
  headerIconData,
  totalVideos,
  totalTime,
  runIconData,
  miles,
  barChartData,
  contentIcons,
  contentLabels,
  footerDecorData,
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#000000",
        fontFamily: "Noto Sans",
        color: "#FFFFFF",
        position: "relative",
      }}
    >
      {/* Top Decor - Optional, mimicking the top waves if needed, or just padding */}
      <div style={{ width: "100%", height: 20, backgroundColor: "#000" }} /> 

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          padding: 40,
          flex: 1,
        }}
      >
        {/* Header Icon */}
        <img
          src={headerIconData}
          width={120}
          height={120}
          style={{ objectFit: "contain", marginBottom: 24 }}
          alt="Stats"
        />

        {/* Title */}
        <span style={{ fontSize: 36, fontWeight: 700, marginBottom: 40, textAlign: "center" }}>
          This week you watched
        </span>

        {/* Stats Grid */}
        <div style={{ display: "flex", gap: 24, marginBottom: 40, width: "100%", justifyContent: "center" }}>
          {/* Box 1 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #333",
              borderRadius: 24,
              padding: "24px 32px",
              width: 240,
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 700, color: "#FF5678" }}>{totalVideos}</span>
            <span style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>Total Videos</span>
          </div>
          
          {/* Box 2 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #333",
              borderRadius: 24,
              padding: "24px 32px",
              width: 240,
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 700, color: "#FF5678" }}>{totalTime}</span>
            <span style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>Total Time</span>
          </div>
        </div>

        {/* Run Stats */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <img src={runIconData} width={24} height={24} alt="run" />
          <div style={{ display: "flex", alignItems: "center", fontSize: 24, fontWeight: 700 }}>
             <span>Your thumb ran</span>
             <span style={{ color: "#FF5678", marginLeft: 6 }}>{miles}</span>
          </div>
        </div>

        {/* Bar Chart Section */}
        <div style={{ width: 400, height: 200, display: "flex", marginBottom: 40 }}>
           <DiagnosisBarChart 
             {...barChartData}
           />
        </div>

        {/* New Contents Section */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
           <span style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>• New contents you got into •</span>
           <div style={{ display: "flex", gap: 32, justifyContent: "center" }}>
              {contentIcons.map((icon, idx) => (
                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                   <div style={{ 
                      width: 100, 
                      height: 100, 
                      borderRadius: "50%", 
                      border: "1px solid #333", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      overflow: "hidden" 
                   }}>
                      <img src={icon} style={{ width: "60%", height: "60%", objectFit: "contain" }} />
                   </div>
                   <span style={{ fontSize: 14, fontWeight: 700 }}>{contentLabels[idx]}</span>
                </div>
              ))}
           </div>
        </div>

      </div>

      {/* Footer Decor */}
      <div style={{ display: "flex", width: "100%", height: 60, marginTop: "auto" }}>
         <img src={footerDecorData} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </div>
  );
};
