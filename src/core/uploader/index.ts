/**
 * Core Uploader Module
 * (核心上传模块)
 *
 * Unified entry point for image uploading, occurring after the Asset generation phase.
 * Provides implementations for both backend API upload and Vercel Blob upload.
 * (统一的图片上传入口，处于资源生成阶段之后。提供后端 API 上传和 Vercel Blob 上传两种实现。)
 */
import { put } from "@vercel/blob";
import { createLogger } from "@/lib/logger";

const logger = createLogger("Core/Uploader");

/**
 * Uploads a PNG buffer to the new backend API.
 * Used for production and testing environments where Vercel Blob is not the primary target.
 * (上传 PNG Buffer 到新的后端 API。用于 Vercel Blob 不是主要目标的生产和测试环境。)
 *
 * @param buffer - The PNG image buffer (PNG 图片缓冲区)
 * @param fileName - The name of the file to upload (要上传的文件名)
 * @returns The public URL of the uploaded file (上传文件的公开 URL)
 */
export async function uploadPngToNewApi(buffer: Buffer, fileName: string) {
  logger.info(`Uploading file to API: ${fileName}`);
  
  const uploadBaseUrl =
    process.env.UPLOAD_API_BASE_URL || "https://tee.feedling.app:8080";
  const formData = new FormData();
  const file = new Blob([new Uint8Array(buffer)], { type: "image/png" });
  formData.append("file", file, fileName);

  logger.info(`Target URL: ${uploadBaseUrl}/upload`);

  const response = await fetch(`${uploadBaseUrl}/upload`, {
    method: "POST",
    body: formData,
  });

  logger.info(`Upload response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    const detail = errorText ? ` ${errorText}` : "";
    logger.error(`Upload failed: ${response.status}${detail}`);
    throw new Error(`Upload failed: ${response.status}${detail}`);
  }

  const result = (await response.json()) as { url?: string };
  if (!result?.url) {
    logger.error("Upload failed: missing url in response");
    throw new Error("Upload failed: missing url");
  }

  return result.url;
}

/**
 * Uploads a PNG buffer to Vercel Blob storage.
 * Returns a publicly accessible URL.
 * (上传 PNG Buffer 到 Vercel Blob 存储。返回可公开访问的 URL。)
 *
 * @param buffer - The PNG image buffer (PNG 图片缓冲区)
 * @param fileName - The name of the file to upload (要上传的文件名)
 * @returns The public URL of the uploaded file (上传文件的公开 URL)
 */
export async function uploadToVercelBlob(buffer: Buffer, fileName: string) {
  logger.info(`Uploading file to Vercel Blob: ${fileName}`);
  
  const blob = await put(fileName, buffer, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  
  logger.success(`Upload successful: ${blob.url}`);
  return blob.url;
}
