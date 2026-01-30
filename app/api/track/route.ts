// 文件功能：邮件埋点收集 API，处于分享跳转与统计回传阶段
// 方法概览：解析参数、记录事件、返回透明像素
import admin from "firebase-admin";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// 方法功能：透明像素常量，用于 GET 埋点响应
const transparentGif = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  "base64",
);

// 方法功能：埋点事件结构定义
type TrackEventPayload = {
  event: string | null;
  type?: string | null;
  uid?: string | null;
  source?: string | null;
  targetUrl?: string | null;
  weekStart?: string | null;
  metadata?: Record<string, unknown>;
};

// 方法功能：从 URL 参数构建埋点载荷
function buildPayloadFromSearchParams(
  params: URLSearchParams,
): TrackEventPayload {
  return {
    event: params.get("event"),
    type: params.get("type"),
    uid: params.get("uid"),
    source: params.get("source"),
    targetUrl: params.get("targetUrl"),
    weekStart: params.get("weekStart"),
  };
}

// 方法功能：写入埋点事件到 Firestore
async function recordEvent(
  payload: TrackEventPayload,
  request: Request,
): Promise<void> {
  if (!adminDb || !payload.event) {
    return;
  }

  // 重要逻辑：写入 Firebase 作为埋点事件源
  await adminDb.collection("email_events").add({
    event: payload.event,
    type: payload.type ?? null,
    uid: payload.uid ?? null,
    source: payload.source ?? null,
    targetUrl: payload.targetUrl ?? null,
    weekStart: payload.weekStart ?? null,
    userAgent: request.headers.get("user-agent"),
    ip: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip"),
    metadata: payload.metadata ?? null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

export async function GET(request: Request) {
  // 重要逻辑：GET 请求读取 query 并写入埋点
  const url = new URL(request.url);
  const payload = buildPayloadFromSearchParams(url.searchParams);

  await recordEvent(payload, request);

  return new NextResponse(transparentGif, {
    status: 200,
    headers: {
      "content-type": "image/gif",
      "cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}

export async function POST(request: Request) {
  // 重要逻辑：POST 请求读取 body 并写入埋点
  const body = (await request.json()) as TrackEventPayload;

  await recordEvent(body, request);

  return NextResponse.json({ success: true });
}
