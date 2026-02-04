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
  type?: string | null; // 埋点 code
  uid?: string | null;
  eid?: string | null; // 对应之前的 eid/weekStart
  action?: string | null; // 具体动作
  source?: string | null; // 来源，如 "email", "web"
  extraData?: Record<string, unknown>;
};

// 规范化 Payload：处理字段映射与迁移
function normalizePayload(input: Record<string, any>): TrackEventPayload {
  const extraData = input.extraData ? { ...input.extraData } : {};

  // 1. 迁移 targetUrl 到 extraData
  const targetUrl = input.targetUrl || input.url;
  if (targetUrl) {
    extraData.targetUrl = targetUrl;
  }

  // 2. 解析 extraData 字符串 (如果是来自 URL 参数)
  if (typeof input.extraData === "string") {
    try {
      const parsed = JSON.parse(input.extraData);
      Object.assign(extraData, parsed);
    } catch {
      // ignore
    }
  }

  return {
    event: input.event || "unknown",
    type: input.type,
    uid: input.uid,
    eid: input.eid || input.email_id || input.weekStart,
    action: input.action,
    source: input.source,
    extraData: Object.keys(extraData).length > 0 ? extraData : undefined,
  };
}

// 从 URL 参数构建 (复用 normalizePayload)
function buildPayloadFromSearchParams(
  params: URLSearchParams,
): TrackEventPayload {
  const input: Record<string, any> = {};
  params.forEach((value, key) => {
    input[key] = value;
  });
  return normalizePayload(input);
}

// 写入 Firestore
async function recordEvent(
  payload: TrackEventPayload,
  request: Request,
): Promise<void> {
  if (!adminDb || !payload.event) return;

  // 移除 undefined 字段，防止 Firestore 报错
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  if (cleanPayload.extraData && cleanPayload.extraData.targetUrl === undefined) {
    delete cleanPayload.extraData.targetUrl;
  }

  // 构造文档 ID: uid_eid_event_type_action_timestamp
  const uidPart = payload.uid || "anon";
  const eidPart = payload.eid || "no_eid";
  const typePart = payload.type || "no_type";
  const actionPart = payload.action || "no_action";
  const timestamp = Date.now();
  const docId = `${uidPart}_${eidPart}_${payload.event}_${typePart}_${actionPart}_${timestamp}`;

  try {
    await adminDb.collection("analytics_logs").doc(docId).set({
      ...cleanPayload,
      userAgent: request.headers.get("user-agent"),
      ip:
        request.headers.get("x-forwarded-for") ??
        request.headers.get("x-real-ip"),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Firestore write failed:", error);
  }
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
    const body = await request.json();
    const payload = normalizePayload(body);
    await recordEvent(payload, request);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}
