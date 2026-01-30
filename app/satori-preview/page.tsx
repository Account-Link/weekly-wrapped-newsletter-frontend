import { TrendShareCard } from "@/components/satori/TrendShareCard";
import { StatsShareCard } from "@/components/satori/StatsShareCard";
import {
  renderDiagnosisBarChartImage,
  renderStatsShareCardImage,
  renderTrendProgressImage,
  renderTrendShareCardImage,
  uploadPngToNewApi,
} from "@/lib/satori-assets";
import { DiagnosisBarChart } from "@/components/satori/DiagnosisBarChart";
import { TrendProgress } from "@/components/satori/TrendProgress";
import { mockReports } from "@/domain/report/mock";
import {
  mapApiReportToWeeklyReportData,
  mapReportToWeeklyData,
} from "@/domain/report/adapter";
import type { TrendType } from "@/domain/report/types";
import crypto from "node:crypto";

const assetBaseUrl =
  process.env.EMAIL_ASSET_BASE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");
const trendIconByType: Record<TrendType, string> = {
  sound: "trend-icon_sound.png",
  hashtag: "trend-icon_hashtag.png",
  creator: "trend-icon_creator.png",
  format: "trend-icon_format.png",
};
const getTrendIconFileName = (trendType?: TrendType) =>
  trendType ? trendIconByType[trendType] : "trend-icon.png";

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
  const apiReport = mockReports[caseKey] ?? mockReports.curious;
  const report = mapApiReportToWeeklyReportData(apiReport);
  const data = mapReportToWeeklyData(apiReport.app_user_id, report, {
    assetBaseUrl,
    trackingBaseUrl: assetBaseUrl,
  });

  const assetId = crypto.randomUUID();
  const progressPng = await renderTrendProgressImage({
    progress: data.hero.trendProgress,
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

  const statsShareCardPng = await renderStatsShareCardImage({
    totalVideos: data.diagnosis.totalVideosValue,
    totalTime: `${data.diagnosis.totalTimeValue} ${data.diagnosis.totalTimeUnit}`,
    miles: `${data.diagnosis.miles}`,
    barChartData: {
      lastWeekLabel: data.diagnosis.lastWeekLabel,
      thisWeekLabel: data.diagnosis.thisWeekLabel,
      lastWeekValue: data.diagnosis.lastWeekValue,
      thisWeekValue: data.diagnosis.thisWeekValue,
    },
    contentLabels: data.newContents.slice(0, 3).map((c) => c.label),
    width: 390,
    height: 980,
  });

  const trendShareCardPng = await renderTrendShareCardImage({
    topicTitle: data.trend.topic.replace(/“|”/g, ""),
    topicSubtitle: data.trend.statusText,
    discoveryRank: data.trend.rank ?? 0,
    totalDiscovery: data.trend.totalDiscoverers.toLocaleString(),
    progress: data.hero.trendProgress,
    hashtag: data.trend.startTag,
    hashtagPercent: data.trend.startPercent,
    globalPercent: data.trend.endPercent,
    width: 390,
    height: 693,
    trendType: data.trend.type,
  });

  const progressUrl = await uploadPngToNewApi(
    progressPng,
    `preview/${caseKey}-${assetId}-progress.png`,
  );
  const barsUrl = await uploadPngToNewApi(
    barChartPng,
    `preview/${caseKey}-${assetId}-bars.png`,
  );
  const statsShareCardUrl = await uploadPngToNewApi(
    statsShareCardPng,
    `preview/${caseKey}-${assetId}-stats-share-card.png`,
  );
  const trendShareCardUrl = await uploadPngToNewApi(
    trendShareCardPng,
    `preview/${caseKey}-${assetId}-trend-share-card.png`,
  );

  const contentIcons = data.newContents.slice(0, 3).map((c) => c.stickerUrl);
  const contentLabels = data.newContents.slice(0, 3).map((c) => c.label);
  while (contentIcons.length < 3) contentIcons.push("");
  while (contentLabels.length < 3) contentLabels.push("");

  const card = {
    trend: {
      topicIconData: `${assetBaseUrl}/figma/${getTrendIconFileName(
        data.trend.type,
      )}`,
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
        <div>
          <div>
            <h4 style={{ fontSize: 14, marginBottom: 6 }}>TrendProgress.png</h4>
            <img
              src={progressUrl}
              style={{
                width: 566,
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
          <div>
            <h4 style={{ fontSize: 14, marginBottom: 6 }}>
              StatsShareCard.png
            </h4>
            <img
              src={statsShareCardUrl}
              style={{
                width: 390,
                height: "auto",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
              }}
            />
          </div>
          <div>
            <h4 style={{ fontSize: 14, marginBottom: 6 }}>
              TrendShareCard.png
            </h4>
            <img
              src={trendShareCardUrl}
              style={{
                width: 390,
                height: "auto",
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
