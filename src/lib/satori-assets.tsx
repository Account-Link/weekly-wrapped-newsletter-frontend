import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { TrendProgress } from "../components/satori/TrendProgress";
import { DiagnosisBarChart } from "../components/satori/DiagnosisBarChart";
import { TrendShareCard } from "../components/satori/TrendShareCard";
import { StatsShareCard } from "../components/satori/StatsShareCard";

const require = createRequire(import.meta.url);
const fontAsset = require("next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf");
const resolvedFontPath =
  typeof fontAsset === "string"
    ? fontAsset
    : typeof fontAsset?.default === "string"
      ? fontAsset.default
      : path.join(
          process.cwd(),
          "node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf"
        );
const fontPath = resolvedFontPath.startsWith("/_next/")
  ? path.join(process.cwd(), resolvedFontPath.replace(/^\/_next\//, ".next/"))
  : resolvedFontPath;

let cachedFont: Buffer | null = null;
const cachedImages = new Map<string, string>();
const RENDER_SCALE = 4;

async function loadFontData() {
  if (!cachedFont) {
    cachedFont = await readFile(fontPath);
  }
  return cachedFont;
}

async function loadImageData(filename: string) {
  if (!cachedImages.has(filename)) {
    const iconPath = path.join(process.cwd(), "public/figma", filename);
    try {
      const buffer = await readFile(iconPath);
      cachedImages.set(filename, `data:image/png;base64,${buffer.toString("base64")}`);
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
  const resvg = new Resvg(svg, { fitTo: { mode: "zoom", value: RENDER_SCALE } });
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
        { name: "Noto Sans", data: fontData, weight: 400, style: "normal" },
        { name: "Noto Sans", data: fontData, weight: 700, style: "normal" },
      ],
    }
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
  const width = options.width ?? 300;
  const height = options.height ?? 140;
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
        { name: "Noto Sans", data: fontData, weight: 400, style: "normal" },
        { name: "Noto Sans", data: fontData, weight: 700, style: "normal" },
      ],
    }
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
}) {
  const width = options.width ?? 600;
  const height = options.height ?? 1000;
  const fontData = await loadFontData();
  
  const [topicIconData, fireIconData, footerDecorData] = await Promise.all([
    loadImageData("topic-sticker-sound.png"),
    loadImageData("fire.png"),
    loadImageData("footer-decors.png"),
  ]);

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
      footerDecorData={footerDecorData}
    />,
    {
      width,
      height,
      fonts: [
        { name: "Noto Sans", data: fontData, weight: 400, style: "normal" },
        { name: "Noto Sans", data: fontData, weight: 700, style: "normal" },
        { name: "Noto Sans", data: fontData, weight: 900, style: "normal" },
      ],
    }
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
  width?: number;
  height?: number;
}) {
  const width = options.width ?? 600;
  const height = options.height ?? 1000;
  const fontData = await loadFontData();
  
  const [headerIconData, runIconData, footerDecorData, c1, c2, c3] = await Promise.all([
    loadImageData("feedling-icon.png"), // Assumption
    loadImageData("download-icon_black.png"), // Placeholder for run icon
    loadImageData("torn-paper-bottom-grey.png"), // Assumption
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
      contentIcons={[c1, c2, c3]}
      contentLabels={options.contentLabels}
      footerDecorData={footerDecorData}
    />,
    {
      width,
      height,
      fonts: [
        { name: "Noto Sans", data: fontData, weight: 400, style: "normal" },
        { name: "Noto Sans", data: fontData, weight: 700, style: "normal" },
      ],
    }
  );

  return renderSvgToPng(svg);
}

export async function uploadPngToVercelBlob(
  buffer: Buffer,
  fileName: string
) {
  // TODO: 调试模式 - 强制使用 Base64 以验证样式，后续测试上传时设为 false
  const forceBase64 = true;
  const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN;

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
