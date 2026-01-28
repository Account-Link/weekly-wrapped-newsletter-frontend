import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import path from "node:path";

const fontPath = path.join(
  process.cwd(),
  "node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf"
);

let cachedFont: Buffer | null = null;

async function loadFontData() {
  if (!cachedFont) {
    cachedFont = await readFile(fontPath);
  }
  return cachedFont;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
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
  const progress = clampPercent(options.progress);
  const fontData = await loadFontData();

  const svg = await satori(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 8,
        fontFamily: "Noto Sans",
        color: "#111111"
      }}
    >
      <div
        style={{
          width: "100%",
          height: 32,
          backgroundColor: "#D1D1D1",
          borderRadius: 32,
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: "#6A00F4",
            borderRadius: 32
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          fontSize: 12,
          fontWeight: 700
        }}
      >
        <span>{options.startLabel}</span>
        <span>{options.endLabel}</span>
      </div>
    </div>,
    {
      width,
      height,
      fonts: [
        { name: "Noto Sans", data: fontData, weight: 400, style: "normal" },
        { name: "Noto Sans", data: fontData, weight: 700, style: "normal" }
      ]
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
  const maxBarHeight = 100;
  const lastHeight = Math.round(
    (clampPercent(options.lastWeekValue) / 100) * maxBarHeight
  );
  const thisHeight = Math.round(
    (clampPercent(options.thisWeekValue) / 100) * maxBarHeight
  );
  const fontData = await loadFontData();

  const svg = await satori(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        fontFamily: "Noto Sans"
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          height: maxBarHeight + 20,
          justifyContent: "space-around",
          alignItems: "flex-end",
          color: "#AAAAAA"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6
          }}
        >
          <span style={{ fontSize: 12 }}>{options.lastWeekLabel}</span>
          <div
            style={{
              width: 20,
              height: lastHeight,
              backgroundColor: "#555555",
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6
          }}
        >
          <span style={{ fontSize: 12 }}>{options.thisWeekLabel}</span>
          <div
            style={{
              width: 20,
              height: thisHeight,
              backgroundColor: "#00CC66",
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5
            }}
          />
        </div>
      </div>
    </div>,
    {
      width,
      height,
      fonts: [
        { name: "Noto Sans", data: fontData, weight: 400, style: "normal" },
        { name: "Noto Sans", data: fontData, weight: 700, style: "normal" }
      ]
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
  const token = process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return `data:image/png;base64,${buffer.toString("base64")}`;
  }
  const blob = await put(fileName, buffer, {
    access: "public",
    contentType: "image/png",
    token
  });
  return blob.url;
}
