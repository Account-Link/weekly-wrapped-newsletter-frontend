import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { TrendProgress } from "../components/satori/TrendProgress";
import { DiagnosisBarChart } from "../components/satori/DiagnosisBarChart";
import { TrendShareCard } from "../components/satori/TrendShareCard";
import { StatsShareCard } from "../components/satori/StatsShareCard";
import type { TrendType } from "@/domain/report/types";

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

async function fetchImageData(url: string): Promise<string> {
  if (!url) return "";
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Failed to fetch image: ${url}`);
      return "";
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get("content-type") || "image/png";
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch (e) {
    console.error(`Error fetching image ${url}`, e);
    return "";
  }
}

function getTrendIconFileName(trendType?: TrendType) {
  if (trendType === "sound") return "trend-icon_sound.png";
  if (trendType === "hashtag") return "trend-icon_hashtag.png";
  if (trendType === "creator") return "trend-icon_creator.png";
  if (trendType === "format") return "trend-icon_format.png";
  return "trend-icon.png";
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
  width?: number;
  height?: number;
}) {
  const baseWidth = options.width ?? 520;
  const baseHeight = options.height ?? 64;
  const horizontalPadding = 23;
  const width = baseWidth + horizontalPadding * 2;
  const height = baseHeight;
  const fontData = await loadFontData();
  const fireIconData = await loadImageData("fire.png");

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
  const fontData = await loadFontData();

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
  const fontData = await loadFontData();

  const [headerIconData, topBgData, bottomBgData] = await Promise.all([
    loadImageData("stats-icon.png"),
    loadImageData("stats-card-bg_top.png"),
    loadImageData("stats-card-bg_bottom.png"),
  ]);

  const contents = await Promise.all(
    options.contents.slice(0, 3).map(async (c) => ({
      label: c.label,
      icon: await fetchImageData(c.iconUrl),
    })),
  );

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

export async function uploadPngToNewApi(buffer: Buffer, fileName: string) {
  console.log("Uploading file:", fileName);
  const uploadBaseUrl =
    process.env.UPLOAD_API_BASE_URL || "https://tee.feedling.app:8080";
  const formData = new FormData();
  const file = new Blob([new Uint8Array(buffer)], { type: "image/png" });
  formData.append("file", file, fileName);

  const response = await fetch(`${uploadBaseUrl}/upload`, {
    method: "POST",
    body: formData,
  });
  console.log("Upload request:", `${uploadBaseUrl}/upload`);
  console.log("Upload response:", response);
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    const detail = errorText ? ` ${errorText}` : "";
    throw new Error(`Upload failed: ${response.status}${detail}`);
  }

  const result = (await response.json()) as { url?: string };
  if (!result?.url) {
    throw new Error("Upload failed: missing url");
  }

  return result.url;
}

export async function uploadToVercelBlob(buffer: Buffer, fileName: string) {
  // 确保文件名包含路径结构，避免根目录混乱
  const blob = await put(fileName, buffer, {
    access: "public",
    // 如果需要，可以从环境变量读取 token，默认会自动读取 BLOB_READ_WRITE_TOKEN
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return blob.url;
}
