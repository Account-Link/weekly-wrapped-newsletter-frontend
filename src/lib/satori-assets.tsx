import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { TrendProgress } from "../components/satori/TrendProgress";
import { DiagnosisBarChart } from "../components/satori/DiagnosisBarChart";
import { TrendShareCard } from "../components/satori/TrendShareCard";
import { StatsShareCard } from "../components/satori/StatsShareCard";

const fontRegularPath = path.join(
  process.cwd(),
  "public/fonts/NotoSans-Regular.ttf",
);
const fontBoldPath = path.join(process.cwd(), "public/fonts/NotoSans-Bold.ttf");

let cachedRegularFont: Buffer | null = null;
let cachedBoldFont: Buffer | null = null;
const cachedImages = new Map<string, string>();
const RENDER_SCALE = 4;
const FONT_NAME = "Noto Sans";

function toArrayBuffer(data: Buffer): ArrayBuffer {
  return data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  ) as ArrayBuffer;
}

async function loadFontData() {
  if (!cachedRegularFont) {
    cachedRegularFont = await readFile(fontRegularPath);
  }
  if (!cachedBoldFont) {
    cachedBoldFont = await readFile(fontBoldPath);
  }
  return {
    regular: toArrayBuffer(cachedRegularFont),
    bold: toArrayBuffer(cachedBoldFont),
  };
}

async function loadImageData(filename: string) {
  if (!cachedImages.has(filename)) {
    const iconPath = path.join(process.cwd(), "public/figma", filename);
    try {
      const buffer = await readFile(iconPath);
      cachedImages.set(
        filename,
        `data:image/png;base64,${buffer.toString("base64")}`,
      );
    } catch (e) {
      console.error(`Failed to load image: ${filename}`, e);
      return ""; // Return empty string or placeholder if missing
    }
  }
  return cachedImages.get(filename)!;
}

async function loadFireIconData() {
  return loadImageData("fire.png");
}

function renderSvgToPng(svg: string) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "zoom", value: RENDER_SCALE },
  });
  const pngData = resvg.render();
  return Buffer.from(pngData.asPng());
}

export async function renderTrendProgressImage(options: {
  progress: number;
  startLabel: string;
  endLabel: string;
  width?: number;
  height?: number;
}) {
  const width = options.width ?? 520;
  const height = options.height ?? 64;
  const fontData = await loadFontData();
  const fireIconData = await loadImageData("fire.png");

  const svg = await satori(
    <TrendProgress
      progress={options.progress}
      startLabel={options.startLabel}
      endLabel={options.endLabel}
      fireIconData={fireIconData}
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
  const fontData = await loadFontData();

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

export async function renderTrendShareCardImage(options: {
  topicTitle: string;
  topicSubtitle: string;
  discoveryRank: number;
  totalDiscovery: string;
  progress: number;
  hashtag: string;
  hashtagPercent: string;
  globalPercent: string;
  width?: number;
  height?: number;
  topicIconData?: string;
  topBgData?: string;
  bottomBgData?: string;
}) {
  const width = options.width ?? 600;
  const height = options.height ?? 1000;
  const fontData = await loadFontData();

  const [
    defaultTopicIconData,
    fireIconData,
    defaultTopBgData,
    defaultBottomBgData,
  ] = await Promise.all([
    loadImageData("trend-icon.png"),
    loadImageData("fire.png"),
    loadImageData("trend-card-bg_top.png"),
    loadImageData("trend-card-bg_bottom.png"),
  ]);

  const topicIconData = options.topicIconData ?? defaultTopicIconData;
  const topBgData = options.topBgData ?? defaultTopBgData;
  const bottomBgData = options.bottomBgData ?? defaultBottomBgData;

  const svg = await satori(
    <TrendShareCard
      topicIconData={topicIconData}
      topicTitle={options.topicTitle}
      topicSubtitle={options.topicSubtitle}
      discoveryRank={options.discoveryRank}
      totalDiscovery={options.totalDiscovery}
      progress={options.progress}
      fireIconData={fireIconData}
      hashtag={options.hashtag}
      hashtagPercent={options.hashtagPercent}
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

export async function renderStatsShareCardImage(options: {
  totalVideos: string;
  totalTime: string;
  miles: string;
  barChartData: {
    lastWeekLabel: string;
    thisWeekLabel: string;
    lastWeekValue: number;
    thisWeekValue: number;
  };
  contentLabels: string[];
  barChartWidth?: number;
  barChartHeight?: number;
  width?: number;
  height?: number;
}) {
  const width = options.width ?? 600;
  const height = options.height ?? 1000;
  const fontData = await loadFontData();

  const [headerIconData, runIconData, topBgData, bottomBgData, c1, c2, c3] =
    await Promise.all([
      loadImageData("stats-icon.png"), // Assumption
      loadImageData("download-icon_black.png"), // Placeholder for run icon
      loadImageData("stats-card-bg_top.png"),
      loadImageData("stats-card-bg_bottom.png"),
      loadImageData("content-sticker-1.png"),
      loadImageData("content-sticker-2.png"),
      loadImageData("content-sticker-3.png"),
    ]);

  const svg = await satori(
    <StatsShareCard
      headerIconData={headerIconData}
      totalVideos={options.totalVideos}
      totalTime={options.totalTime}
      runIconData={runIconData}
      miles={options.miles}
      barChartData={options.barChartData}
      barChartWidth={options.barChartWidth}
      barChartHeight={options.barChartHeight}
      contentIcons={[c1, c2, c3]}
      contentLabels={options.contentLabels}
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

export async function uploadPngToVercelBlob(buffer: Buffer, fileName: string) {
  // TODO: 调试模式 - 强制使用 Base64 以验证样式，后续测试上传时设为 false
  const forceBase64 = false;
  const token =
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.VERCEL_BLOB_READ_WRITE_TOKEN;

  if (!token || forceBase64) {
    return `data:image/png;base64,${buffer.toString("base64")}`;
  }
  const blob = await put(fileName, buffer, {
    access: "public",
    contentType: "image/png",
    token,
  });
  return blob.url;
}
