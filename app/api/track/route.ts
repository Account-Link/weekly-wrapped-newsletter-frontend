// 文件功能：邮件埋点收集 API，处于分享跳转与统计回传阶段
// 方法概览：解析参数、记录事件、返回透明像素
import admin from "firebase-admin";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const transparentGif = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  "base64",
);

// 统一的埋点 Payload 接口
type TrackEventPayload = {
  event: string; // 必填：事件名，如 "click", "open", "page_view"
  type?: string | null; // 二级分类，如 "share_week", "invite_page"
  uid?: string | null;
  eid?: string | null; // 对应之前的 eid/weekStart
  action?: string | null; // 具体动作，如 "share_stats", "unsubscribe"
  source?: string | null; // 来源，如 "email", "web"
  targetUrl?: string | null; // 跳转目标
  extraData?: Record<string, unknown>;
};

// 构建 Payload
function buildPayloadFromSearchParams(
  params: URLSearchParams,
): TrackEventPayload {
  let extraData: Record<string, unknown> | undefined;
  const extraDataStr = params.get("extraData");
  if (extraDataStr) {
    try {
      extraData = JSON.parse(extraDataStr);
    } catch {
      // ignore
    }
  }

  return {
    event: params.get("event") || "unknown",
    type: params.get("type"),
    uid: params.get("uid"),
    eid:
      params.get("eid") || params.get("email_id") || params.get("weekStart"),
    action: params.get("action"),
    source: params.get("source"),
    targetUrl: params.get("url") || params.get("targetUrl"), // 兼容 url 参数
    extraData,
  };
}

// 写入 Firestore
async function recordEvent(
  payload: TrackEventPayload,
  request: Request,
): Promise<void> {
  if (!adminDb || !payload.event) return;

  // 使用 event + uid + eid + action + timestamp(day) 作为去重键（可选优化）
  // 目前保持追加模式，但统一集合
  await adminDb.collection("analytics_logs").add({
    ...payload,
    userAgent: request.headers.get("user-agent"),
    ip:
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip"),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const payload = buildPayloadFromSearchParams(url.searchParams);

  // 1. 记录埋点
  await recordEvent(payload, request);

  // 2. 默认返回透明像素 (用于 open tracking 或纯埋点请求)
  return new NextResponse(transparentGif, {
    status: 200,
    headers: {
      "content-type": "image/gif",
      "cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TrackEventPayload;
    await recordEvent(body, request);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}
