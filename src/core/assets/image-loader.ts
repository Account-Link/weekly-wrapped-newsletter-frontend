// 文件功能：集中读取字体与图片资源，供 Satori 渲染阶段使用
// 方法概览：加载字体、加载本地图片、拉取远程图片并做 base64 缓存
import { readFile } from "node:fs/promises";
import path from "node:path";

const fontRegularPath = path.join(
  process.cwd(),
  "public/fonts/NotoSans-Regular.ttf",
);
const fontBoldPath = path.join(process.cwd(), "public/fonts/NotoSans-Bold.ttf");

let cachedRegularFont: Buffer | null = null;
let cachedBoldFont: Buffer | null = null;
const cachedImages = new Map<string, string>();

// 方法功能：将 Buffer 转为 ArrayBuffer，供 Satori 字体使用
function toArrayBuffer(data: Buffer): ArrayBuffer {
  return data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  ) as ArrayBuffer;
}

// 方法功能：读取并缓存字体数据，返回 Satori 所需的字形字节
export async function loadFontData() {
  // 重要逻辑：字体只读取一次并缓存，避免重复 IO 影响渲染性能
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

// 方法功能：加载本地图片并转成 base64 Data URL
export async function loadImageData(filename: string) {
  // 重要逻辑：本地资源转 base64，供 Satori 直接渲染
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
      return "";
    }
  }
  return cachedImages.get(filename)!;
}

// 方法功能：拉取远程图片并转成 base64 Data URL
export async function fetchImageData(url: string): Promise<string> {
  // 重要逻辑：远程图片统一转 base64，避免跨域或代理限制
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
