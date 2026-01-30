// 文件功能：统一图片上传入口，处于 Assets 生成后的上传阶段
// 方法概览：提供后端上传与 Vercel Blob 上传两种实现
import { put } from "@vercel/blob";

// 方法功能：通过后端 API 上传 PNG，供生产与测试环境复用
export async function uploadPngToNewApi(buffer: Buffer, fileName: string) {
  // 重要逻辑：统一上传入口，保证后端 API 与前端一致
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

// 方法功能：上传 PNG 到 Vercel Blob，返回可公开访问的 URL
export async function uploadToVercelBlob(buffer: Buffer, fileName: string) {
  // 重要逻辑：保持上传路径结构，避免资源散落
  const blob = await put(fileName, buffer, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return blob.url;
}
