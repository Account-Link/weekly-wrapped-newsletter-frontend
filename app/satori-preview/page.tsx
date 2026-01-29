import { TrendShareCard } from "@/components/satori/TrendShareCard";
import { StatsShareCard } from "@/components/satori/StatsShareCard";
import {
  renderDiagnosisBarChartImage,
  renderTrendProgressImage,
  uploadPngToVercelBlob,
} from "@/lib/satori-assets";
import { DiagnosisBarChart } from "@/components/satori/DiagnosisBarChart";
import { TrendProgress } from "@/components/satori/TrendProgress";
import { mockReports } from "@/domain/report/mock";
import { mapReportToWeeklyData } from "@/domain/report/adapter";
import crypto from "node:crypto";

const assetBaseUrl =
  process.env.EMAIL_ASSET_BASE_URL || "http://localhost:3000";

export default async function SatoriPreviewPage({
  searchParams,
}: {
  params?: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const caseKey =
    typeof resolvedSearchParams.case === "string"
      ? resolvedSearchParams.case
      : "curious";
  const report = mockReports[caseKey] ?? mockReports.curious;
  const data = mapReportToWeeklyData("preview-user", report, { assetBaseUrl });

  const assetId = crypto.randomUUID();
  const progressPng = await renderTrendProgressImage({
    progress: data.hero.trendProgress,
    startLabel: data.trend.startTag,
    endLabel: data.trend.endTag,
    width: 520,
    height: 64,
  });
  const barChartPng = await renderDiagnosisBarChartImage({
    lastWeekLabel: data.diagnosis.lastWeekLabel,
    thisWeekLabel: data.diagnosis.thisWeekLabel,
    lastWeekValue: data.diagnosis.lastWeekValue,
    thisWeekValue: data.diagnosis.thisWeekValue,
    width: 520,
    height: 265,
  });

  const progressUrl = await uploadPngToVercelBlob(
    progressPng,
    `preview/${caseKey}-${assetId}-progress.png`,
  );
  const barsUrl = await uploadPngToVercelBlob(
    barChartPng,
    `preview/${caseKey}-${assetId}-bars.png`,
  );

  const contentIcons = data.newContents.slice(0, 3).map((c) => c.stickerUrl);
  const contentLabels = data.newContents.slice(0, 3).map((c) => c.label);
  while (contentIcons.length < 3) contentIcons.push("");
  while (contentLabels.length < 3) contentLabels.push("");

  const card = {
    trend: {
      topicIconData: `${assetBaseUrl}/figma/trend-icon.png`,
      topBgData: `${assetBaseUrl}/figma/trend-card-bg_top.png`,
      topicTitle: data.trend.topic.replace(/“|”/g, ""),
      topicSubtitle: data.trend.statusText,
      discoveryRank: data.trend.rank ?? 0,
      totalDiscovery: data.trend.totalDiscoverers.toLocaleString(),
      progress: data.hero.trendProgress,
      fireIconData: `${assetBaseUrl}/figma/fire.png`,
      hashtag: data.trend.startTag,
      hashtagPercent: data.trend.startPercent,
      globalPercent: data.trend.endPercent,
      bottomBgData: `${assetBaseUrl}/figma/trend-card-bg_bottom.png`,
    },
    stats: {
      headerIconData: `${assetBaseUrl}/figma/stats-icon.png`,
      topBgData: `${assetBaseUrl}/figma/stats-card-bg_top.png`,
      totalVideos: data.diagnosis.totalVideosValue,
      totalTime: `${data.diagnosis.totalTimeValue} ${data.diagnosis.totalTimeUnit}`,
      runIconData: `${assetBaseUrl}/figma/download-icon_black.png`,
      miles: `${data.diagnosis.miles}`,
      barChartData: {
        lastWeekLabel: data.diagnosis.lastWeekLabel,
        thisWeekLabel: data.diagnosis.thisWeekLabel,
        lastWeekValue: data.diagnosis.lastWeekValue,
        thisWeekValue: data.diagnosis.thisWeekValue,
      },
      contentIcons,
      contentLabels,
      bottomBgData: `${assetBaseUrl}/figma/stats-card-bg_bottom.png`,
    },
  };

  const moduleBoxStyle = (bg: string) => ({
    background: bg,
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    padding: 12,
  });

  return (
    <main
      style={{
        margin: 0,
        padding: 16,
        background: "#F3F4F6",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 24,
      }}
    >
      <div style={moduleBoxStyle("#fff")}>
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>TrendProgress (HTML)</h3>
        <div style={{ width: 520, height: 64 }}>
          <TrendProgress
            progress={card.trend.progress}
            startLabel={card.trend.hashtag}
            endLabel={card.trend.globalPercent}
            fireIconData={card.trend.fireIconData}
            width={520}
          />
        </div>
      </div>

      <div style={moduleBoxStyle("#000")}>
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>
          DiagnosisBarChart (HTML)
        </h3>
        <div style={{ width: 520, height: 265 }}>
          <DiagnosisBarChart {...card.stats.barChartData} />
        </div>
      </div>

      <div style={moduleBoxStyle("#ECECEC")}>
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>TrendShareCard (HTML)</h3>
        <div style={{ width: 390 }}>
          <TrendShareCard {...card.trend} />
        </div>
      </div>

      <div style={moduleBoxStyle("#000")}>
        <h3 style={{ fontSize: 18, marginBottom: 8, color: "#fff" }}>
          StatsShareCard (HTML)
        </h3>
        <div style={{ width: 390 }}>
          <StatsShareCard {...card.stats} />
        </div>
      </div>

      <div style={{ gridColumn: "1 / -1", ...moduleBoxStyle("#fff") }}>
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>Generated PNGs</h3>
        <div style={{ display: "flex", gap: 16 }}>
          <div>
            <h4 style={{ fontSize: 14, marginBottom: 6 }}>TrendProgress.png</h4>
            <img
              src={progressUrl}
              style={{
                width: 520,
                height: 64,
                border: "1px solid #E5E7EB",
                borderRadius: 8,
              }}
            />
          </div>
          <div>
            <h4 style={{ fontSize: 14, marginBottom: 6 }}>DiagnosisBars.png</h4>
            <img
              src={barsUrl}
              style={{
                width: 520,
                height: 265,
                border: "1px solid #E5E7EB",
                borderRadius: 8,
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
