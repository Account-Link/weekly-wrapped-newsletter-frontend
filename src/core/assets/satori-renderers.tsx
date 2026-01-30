// 文件功能：将 Satori 组件渲染为 PNG，处于 Assets 生成阶段
// 方法概览：进度条图、诊断柱状图、趋势分享卡、统计分享卡渲染
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { TrendProgress } from "@/components/satori/TrendProgress";
import { DiagnosisBarChart } from "@/components/satori/DiagnosisBarChart";
import { TrendShareCard } from "@/components/satori/TrendShareCard";
import { StatsShareCard } from "@/components/satori/StatsShareCard";
import type { TrendType } from "@/domain/report/types";
import { fetchImageData, loadFontData, loadImageData } from "./image-loader";

const RENDER_SCALE = 4;
const FONT_NAME = "Noto Sans";

// 方法功能：根据趋势类型选择图标文件名
function getTrendIconFileName(trendType?: TrendType) {
  if (trendType === "sound") return "trend-icon_sound.png";
  if (trendType === "hashtag") return "trend-icon_hashtag.png";
  if (trendType === "creator") return "trend-icon_creator.png";
  if (trendType === "format") return "trend-icon_format.png";
  return "trend-icon.png";
}

// 方法功能：将 Satori 输出的 SVG 转成 PNG Buffer
function renderSvgToPng(svg: string) {
  // 重要逻辑：统一使用高清缩放比例，保证邮件内图片清晰
  const resvg = new Resvg(svg, {
    fitTo: { mode: "zoom", value: RENDER_SCALE },
  });
  const pngData = resvg.render();
  return Buffer.from(pngData.asPng());
}

// 方法功能：渲染趋势进度条 PNG，供邮件主视觉使用
export async function renderTrendProgressImage(options: {
  progress: number;
  width?: number;
  height?: number;
}) {
  const baseWidth = options.width ?? 520;
  const baseHeight = options.height ?? 64;
  const horizontalPadding = 23;
  const width = baseWidth + horizontalPadding * 2;
  const height = baseHeight;
  // 重要逻辑：加载字体与火焰图标，保持样式一致
  const fontData = await loadFontData();
  const fireIconData = await loadImageData("fire.png");

  // 重要逻辑：生成 SVG 后统一转 PNG，供上传与邮件渲染
  const svg = await satori(
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: baseWidth, height: baseHeight, display: "flex" }}>
        <TrendProgress
          progress={options.progress}
          fireIconData={fireIconData}
          width={baseWidth}
        />
      </div>
    </div>,
    {
      width,
      height,
      fonts: [
        {
          name: FONT_NAME,
          data: fontData.regular,
          weight: 400,
          style: "normal",
        },
        { name: FONT_NAME, data: fontData.bold, weight: 700, style: "normal" },
      ],
    },
  );

  return renderSvgToPng(svg);
}

// 方法功能：渲染诊断柱状图 PNG，供诊断模块展示
export async function renderDiagnosisBarChartImage(options: {
  lastWeekLabel: string;
  thisWeekLabel: string;
  lastWeekValue: number;
  thisWeekValue: number;
  width?: number;
  height?: number;
}) {
  const width = options.width ?? 520;
  const height = options.height ?? 265;
  // 重要逻辑：统一字体加载，确保图表排版一致
  const fontData = await loadFontData();

  // 重要逻辑：Satori 输出 SVG，再转 PNG 供模板引用
  const svg = await satori(
    <DiagnosisBarChart
      lastWeekLabel={options.lastWeekLabel}
      thisWeekLabel={options.thisWeekLabel}
      lastWeekValue={options.lastWeekValue}
      thisWeekValue={options.thisWeekValue}
    />,
    {
      width,
      height,
      fonts: [
        {
          name: FONT_NAME,
          data: fontData.regular,
          weight: 400,
          style: "normal",
        },
        { name: FONT_NAME, data: fontData.bold, weight: 700, style: "normal" },
      ],
    },
  );

  return renderSvgToPng(svg);
}

// 方法功能：渲染趋势分享卡 PNG，供分享与下载使用
export async function renderTrendShareCardImage(options: {
  topicTitle: string;
  topicSubtitle: string;
  discoveryRank: number;
  totalDiscovery: string;
  progress: number;
  hashtag: string;
  hashtagPercent: string;
  endTag: string;
  globalPercent: string;
  width?: number;
  height?: number;
  trendType?: TrendType;
  topicIconData?: string;
  topicIconBgData?: string;
  topBgData?: string;
  bottomBgData?: string;
}) {
  const width = options.width ?? 600;
  const height = options.height ?? 1000;
  // 重要逻辑：加载字体与默认图资源，确保分享卡完整
  const fontData = await loadFontData();

  // 重要逻辑：并行加载分享卡资源，降低渲染耗时
  const [
    defaultTopicIconData,
    defaultTopicIconBgData,
    fireIconData,
    defaultTopBgData,
    defaultBottomBgData,
  ] = await Promise.all([
    loadImageData(getTrendIconFileName(options.trendType)),
    loadImageData("trend-icon-bg.png"),
    loadImageData("fire.png"),
    loadImageData("trend-card-bg_top.png"),
    loadImageData("trend-card-bg_bottom.png"),
  ]);

  const topicIconData = options.topicIconData ?? defaultTopicIconData;
  const topicIconBgData = options.topicIconBgData ?? defaultTopicIconBgData;
  const topBgData = options.topBgData ?? defaultTopBgData;
  const bottomBgData = options.bottomBgData ?? defaultBottomBgData;

  // 重要逻辑：组合卡片组件输出 SVG，再转 PNG
  const svg = await satori(
    <TrendShareCard
      topicIconData={topicIconData}
      topicIconBgData={topicIconBgData}
      topicTitle={options.topicTitle}
      topicSubtitle={options.topicSubtitle}
      discoveryRank={options.discoveryRank}
      totalDiscovery={options.totalDiscovery}
      progress={options.progress}
      fireIconData={fireIconData}
      hashtag={options.hashtag}
      hashtagPercent={options.hashtagPercent}
      endTag={options.endTag}
      globalPercent={options.globalPercent}
      topBgData={topBgData}
      bottomBgData={bottomBgData}
    />,
    {
      width,
      height,
      fonts: [
        {
          name: FONT_NAME,
          data: fontData.regular,
          weight: 400,
          style: "normal",
        },
        { name: FONT_NAME, data: fontData.bold, weight: 700, style: "normal" },
        { name: FONT_NAME, data: fontData.bold, weight: 900, style: "normal" },
      ],
    },
  );

  return renderSvgToPng(svg);
}

// 方法功能：渲染统计分享卡 PNG，供分享与下载使用
export async function renderStatsShareCardImage(options: {
  totalVideos: string;
  totalTime: string;
  miles: string;
  comparisonDiff?: string | null;
  comparisonText: string;
  milesComment?: string;
  barChartData: {
    lastWeekLabel: string;
    thisWeekLabel: string;
    lastWeekValue: number;
    thisWeekValue: number;
  };
  width?: number;
  height?: number;
  contents: {
    label: string;
    iconUrl: string;
  }[];
}) {
  const width = options.width ?? 600;
  const height = options.height ?? 1000;
  // 重要逻辑：字体加载与资源准备，保证视觉一致
  const fontData = await loadFontData();

  // 重要逻辑：并行加载头图与背景资源
  const [headerIconData, topBgData, bottomBgData] = await Promise.all([
    loadImageData("stats-icon.png"),
    loadImageData("stats-card-bg_top.png"),
    loadImageData("stats-card-bg_bottom.png"),
  ]);

  // 重要逻辑：内容图标转 base64，确保 Satori 可渲染
  const contents = await Promise.all(
    options.contents.slice(0, 3).map(async (content) => ({
      label: content.label,
      icon: await fetchImageData(content.iconUrl),
    })),
  );

  // 重要逻辑：输出 SVG 并转 PNG 供邮件与分享使用
  const svg = await satori(
    <StatsShareCard
      headerIconData={headerIconData}
      totalVideos={options.totalVideos}
      totalTime={options.totalTime}
      miles={options.miles}
      comparisonDiff={options.comparisonDiff}
      comparisonText={options.comparisonText}
      milesComment={options.milesComment}
      barChartData={options.barChartData}
      contents={contents}
      topBgData={topBgData}
      bottomBgData={bottomBgData}
    />,
    {
      width,
      height,
      fonts: [
        {
          name: FONT_NAME,
          data: fontData.regular,
          weight: 400,
          style: "normal",
        },
        { name: FONT_NAME, data: fontData.bold, weight: 700, style: "normal" },
      ],
    },
  );

  return renderSvgToPng(svg);
}
