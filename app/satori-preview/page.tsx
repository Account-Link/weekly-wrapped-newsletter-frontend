// 文件功能：Satori 组件与 PNG 结果预览页面，处于开发调试入口
// 方法概览：构建预览数据、生成资源、渲染组件与 PNG
import { TrendShareCard } from "@/components/satori/TrendShareCard";
import { StatsShareCard } from "@/components/satori/StatsShareCard";
import {
  buildPreviewAssetKeys,
  buildWeeklyDataFromMock,
} from "@/lib/email-generator";
import { loadImageData } from "@/core/assets/image-loader";
import { DiagnosisBarChart } from "@/components/satori/DiagnosisBarChart";
import { TrendProgress } from "@/components/satori/TrendProgress";
import type { TrendType } from "@/domain/report/types";
import crypto from "node:crypto";
import { ReportPipeline } from "@/core/pipeline";
import type { WeeklyNewContent } from "@/lib/firebase-admin";

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
// 方法功能：根据趋势类型映射图标文件名
const getTrendIconFileName = (trendType?: TrendType) =>
  trendType ? trendIconByType[trendType] : "trend-icon.png";

// 方法功能：渲染 Satori 组件与 PNG 的预览页面
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
  // 重要逻辑：预览直接使用 mock 数据，避免依赖后端
  const data = buildWeeklyDataFromMock(caseKey, assetBaseUrl);

  // 重要逻辑：生成唯一资源 key，防止预览资源冲突
  const assetId = crypto.randomUUID();
  const assetKeys = buildPreviewAssetKeys(caseKey, assetId);
  const { data: weeklyData, assets } = await ReportPipeline.run({
    data,
    assetBaseUrl,
    uploadTarget: "api",
    useUploads: false,
    assetKeys,
  });
  const progressUrl = weeklyData.trend.progressImageUrl ?? "";
  const barsUrl = weeklyData.diagnosis.barChartImageUrl ?? "";
  const trendShareCardUrl = assets.trendCardUrl;
  const statsShareCardUrl = assets.statsCardUrl;

  // Load assets
  const [
    topicIconData,
    topicIconBgData,
    trendTopBgData,
    fireIconData,
    trendBottomBgData,
    headerIconData,
    statsTopBgData,
    statsBottomBgData,
  ] = await Promise.all([
    loadImageData(getTrendIconFileName(weeklyData.trend.type)),
    loadImageData("trend-icon-bg.png"),
    loadImageData("trend-card-bg_top.png"),
    loadImageData("fire.png"),
    loadImageData("trend-card-bg_bottom.png"),
    loadImageData("stats-icon.png"),
    loadImageData("stats-card-bg_top.png"),
    loadImageData("stats-card-bg_bottom.png"),
  ]);

  const contents = await Promise.all(
    weeklyData.newContents.map(async (content, index) => ({
      icon: await loadImageData(`content-sticker-${index + 1}.png`),
      label: content.label,
    })),
  );

  // 重要逻辑：统一拼装卡片数据，供 HTML 组件与 PNG 预览使用
  const card = {
    trend: {
      topicIconData,
      topicIconBgData,
      topBgData: trendTopBgData,
      topicTitle: weeklyData.trend.topic.replace(/“|”/g, ""),
      topicSubtitle: weeklyData.trend.statusText,
      discoveryRank: weeklyData.trend.rank ?? 0,
      totalDiscovery: weeklyData.trend.totalDiscoverers.toLocaleString(),
      progress: weeklyData.trend.trendProgress,
      fireIconData,
      hashtag: weeklyData.trend.startTag,
      hashtagPercent: weeklyData.trend.startPercent,
      endTag: weeklyData.trend.endTag,
      globalPercent: weeklyData.trend.endPercent,
      bottomBgData: trendBottomBgData,
    },
    stats: {
      headerIconData,
      topBgData: statsTopBgData,
      totalVideos: weeklyData.diagnosis.totalVideosValue,
      totalTime: `${weeklyData.diagnosis.totalTimeValue} ${weeklyData.diagnosis.totalTimeUnit}`,
      miles: `${weeklyData.diagnosis.miles}`,
      comparisonDiff: weeklyData.diagnosis.comparisonDiff,
      comparisonText: weeklyData.diagnosis.comparisonText,
      milesComment: weeklyData.diagnosis.milesComment,
      barChartData: {
        lastWeekLabel: weeklyData.diagnosis.lastWeekLabel,
        thisWeekLabel: weeklyData.diagnosis.thisWeekLabel,
        lastWeekValue: weeklyData.diagnosis.lastWeekValue,
        thisWeekValue: weeklyData.diagnosis.thisWeekValue,
      },
      contents,
      bottomBgData: statsBottomBgData,
    },
  };

  // 方法功能：生成模块容器样式
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
      {/* <div style={moduleBoxStyle("#fffffe")}>
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>TrendProgress (HTML)</h3>
        <div style={{ width: 520, height: 64 }}>
          <TrendProgress
            progress={card.trend.progress}
            fireIconData={card.trend.fireIconData}
            width={520}
          />
        </div>
      </div>

      <div style={moduleBoxStyle("#000001")}>
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>
          DiagnosisBarChart (HTML)
        </h3>
        <div style={{ width: 520, height: 265 }}>
          <DiagnosisBarChart {...card.stats.barChartData} />
        </div>
      </div> */}

      <div style={moduleBoxStyle("#ECECEC")}>
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>TrendShareCard (HTML)</h3>
        <div style={{ width: 390 }}>
          <TrendShareCard {...card.trend} />
        </div>
      </div>

      <div style={moduleBoxStyle("#000001")}>
        <h3 style={{ fontSize: 18, marginBottom: 8, color: "#fffffe" }}>
          StatsShareCard (HTML)
        </h3>
        <div style={{ width: 390 }}>
          <StatsShareCard {...card.stats} />
        </div>
      </div>

      {/* <div style={{ gridColumn: "1 / -1", ...moduleBoxStyle("#fffffe") }}>
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
      </div> */}
    </main>
  );
}
