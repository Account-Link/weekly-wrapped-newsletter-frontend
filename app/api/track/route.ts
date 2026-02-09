// 文件功能：邮件埋点收集 API，处于分享跳转与统计回传阶段
// 方法概览：解析参数、记录事件、返回透明像素
import admin from "firebase-admin";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { waitUntil } from "@vercel/functions";
import type { TrackEventPayload } from "@/lib/tracking/types";

const transparentGif = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  "base64",
);

// 定义输入接口，涵盖 URL 参数和 JSON Body 的可能字段
type TrackEventInput = {
  event?: string;
  uid?: string;
  uuid?: string;
  session_id?: string;
  eid?: string | null;
  timestamp?: number | string;
  common_params?: string | Record<string, unknown>;
  page_params?: string | Record<string, unknown>;
  params?: string | Record<string, unknown>;
  [key: string]: unknown;
};

// 规范化 Payload：处理字段映射与迁移
function normalizePayload(input: TrackEventInput): TrackEventPayload {
  let params: Record<string, unknown> = {};
  let commonParams: Record<string, unknown> = {};
  let pageParams: Record<string, unknown> = {};

  // 处理 params: 可能是 JSON 对象 (POST body) 或 JSON 字符串 (URL params)
  if (typeof input.params === "string") {
    try {
      const parsed = JSON.parse(input.params);
      if (typeof parsed === "object" && parsed !== null) {
        params = parsed;
      }
    } catch {
      // ignore
    }
  } else if (typeof input.params === "object" && input.params !== null) {
    params = { ...(input.params as Record<string, unknown>) };
  }
  if (typeof input.eid === "string" && input.eid && !("eid" in params)) {
    params.eid = input.eid;
  }

  if (typeof input.common_params === "string") {
    try {
      const parsed = JSON.parse(input.common_params);
      if (typeof parsed === "object" && parsed !== null) {
        commonParams = parsed as Record<string, unknown>;
      }
    } catch {
      // ignore
    }
  } else if (
    typeof input.common_params === "object" &&
    input.common_params !== null
  ) {
    commonParams = { ...(input.common_params as Record<string, unknown>) };
  }

  if (typeof input.page_params === "string") {
    try {
      const parsed = JSON.parse(input.page_params);
      if (typeof parsed === "object" && parsed !== null) {
        pageParams = parsed as Record<string, unknown>;
      }
    } catch {
      // ignore
    }
  } else if (
    typeof input.page_params === "object" &&
    input.page_params !== null
  ) {
    pageParams = { ...(input.page_params as Record<string, unknown>) };
  }

  const timestampValue =
    typeof input.timestamp === "string"
      ? Number(input.timestamp)
      : input.timestamp;

  return {
    event: input.event || "unknown",
    uid: input.uid || undefined,
    uuid: input.uuid || undefined,
    session_id: input.session_id || undefined,
    timestamp: Number.isFinite(timestampValue) ? timestampValue : undefined,
    common_params:
      Object.keys(commonParams).length > 0 ? commonParams : undefined,
    page_params: Object.keys(pageParams).length > 0 ? pageParams : undefined,
    params: Object.keys(params).length > 0 ? params : undefined,
  };
}

// 从 URL 参数构建 (复用 normalizePayload)
function buildPayloadFromSearchParams(
  params: URLSearchParams,
): TrackEventPayload {
  const input: TrackEventInput = {};
  params.forEach((value, key) => {
    input[key] = value;
  });
  return normalizePayload(input);
}

// 提前创建 Formatter 实例以复用，避免每次请求重复实例化的性能开销
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

// 写入 Firestore
async function recordEvent(
  payload: TrackEventPayload,
  request: Request,
): Promise<void> {
  if (!adminDb || !payload.event) return;

  // 移除 undefined 字段，防止 Firestore 报错
  const cleanPayload = JSON.parse(JSON.stringify(payload));

  // 处理 common_params
  const commonParams = cleanPayload.common_params || {};
  const userAgent =
    commonParams.user_agent || request.headers.get("user-agent");
  if (userAgent) {
    commonParams.user_agent = userAgent;
  }

  // 处理 page_params
  const pageParams = cleanPayload.page_params || {};
  const referrer = pageParams.referrer || request.headers.get("referer");
  if (referrer) {
    pageParams.referrer = referrer;
  }

  // 更新 cleanPayload，避免设置 undefined
  if (Object.keys(commonParams).length > 0) {
    cleanPayload.common_params = commonParams;
  } else {
    delete cleanPayload.common_params;
  }

  if (Object.keys(pageParams).length > 0) {
    cleanPayload.page_params = pageParams;
  } else {
    delete cleanPayload.page_params;
  }

  const uidPart = payload.uid || "anon";
  const rawEid = (payload.params as Record<string, unknown> | undefined)?.eid;
  const eidPart = typeof rawEid === "string" && rawEid ? rawEid : "no_eid";
  const sessionPart = payload.session_id || payload.uuid || "no_session";
  const timestamp = payload.timestamp ?? Date.now();

  // Format timestamp to YYYYMMDDHHMMSS (America/New_York)
  const date = new Date(timestamp);
  const parts = dateFormatter.formatToParts(date);
  const p = parts.reduce(
    (acc, part) => {
      acc[part.type] = part.value;
      return acc;
    },
    {} as Record<string, string>,
  );

  const formattedTime = `${p.year}${p.month}${p.day}${p.hour}${p.minute}${p.second}`;

  // 构造文档 ID: timestamp_uid_eid_event_session
  // 这样在 Firestore 中默认按时间倒序/正序排列
  const docId = `${formattedTime}_${uidPart}_${eidPart}_${payload.event}_${sessionPart}`;

  try {
    await adminDb
      .collection("analytics_logs")
      .doc(docId)
      .set({
        ...cleanPayload,
        timestamp, // 保留原始毫秒级时间戳字段
        formattedTime, // 保留可读时间字段
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
  console.log("requrest", request.url);
  const url = new URL(request.url);
  const payload = buildPayloadFromSearchParams(url.searchParams);

  // 1. 记录埋点 (使用 waitUntil 异步写入，快速响应)
  waitUntil(recordEvent(payload, request));

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

    // 使用 waitUntil 异步写入，快速响应
    waitUntil(recordEvent(payload, request));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}
