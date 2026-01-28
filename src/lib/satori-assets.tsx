import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { TrendProgress } from "../components/satori/TrendProgress";
import { DiagnosisBarChart } from "../components/satori/DiagnosisBarChart";

const fontPath = path.join(
  process.cwd(),
  "node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf"
);

let cachedFont: Buffer | null = null;
let cachedFireIcon: string | null = null;

async function loadFontData() {
  if (!cachedFont) {
    cachedFont = await readFile(fontPath);
  }
  return cachedFont;
}

async function loadFireIconData() {
  if (!cachedFireIcon) {
    const iconPath = path.join(process.cwd(), "public/figma/fire.png");
    const buffer = await readFile(iconPath);
    cachedFireIcon = `data:image/png;base64,${buffer.toString("base64")}`;
  }
  return cachedFireIcon;
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
  const fireIconData = await loadFireIconData();

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

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: width } });
  const pngData = resvg.render();
  return Buffer.from(pngData.asPng());
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

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: width } });
  const pngData = resvg.render();
  return Buffer.from(pngData.asPng());
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
