// 文件功能：重定向服务 API，负责记录点击并跳转
// 方法概览：验证白名单、记录埋点、执行 307 跳转
import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { getAppBaseUrl } from "@/lib/config";
import { adminDb } from "@/lib/firebase-admin";
import { waitUntil } from "@vercel/functions"; // 使用 waitUntil 确保异步任务完成

// 允许的重定向白名单
const isAllowedRedirect = (target: URL, requestOrigin: URL) => {
  const rawAllowlist = process.env.TRACK_REDIRECT_ALLOWLIST || "";
  const allowlist = rawAllowlist
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const allowedHosts = new Set([requestOrigin.host, ...allowlist]);
  return allowedHosts.has(target.host);
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams;

  const targetUrlStr = params.get("url") || params.get("targetUrl");
  const uid = params.get("uid");
  const event = params.get("event");
  const uuid = params.get("uuid");
  const sessionId = params.get("session_id");

  // 解析 params (JSON 字符串)
  let customParams: Record<string, unknown> = {};
  const paramsStr = params.get("params");
  if (paramsStr) {
    try {
      customParams = JSON.parse(paramsStr);
    } catch (e) {
      console.error("Failed to parse params JSON:", e);
    }
  }

  // 1. 记录埋点 (异步调用纯埋点接口，不阻塞跳转)
  // 使用 waitUntil 确保在 Response 返回后，Serverless 函数不会立即被冻结，而是等待 Promise 完成

  const appBaseUrl = getAppBaseUrl();
  const resolvedParams =
    Object.keys(customParams).length > 0 ? { ...customParams } : {};
  const rawEid = customParams.eid;
  const eid = typeof rawEid === "string" && rawEid ? rawEid : null;
  if (eid) {
    resolvedParams.eid = eid;
  }
  if (targetUrlStr) {
    resolvedParams.targetUrl = targetUrlStr;
  }

  const redirectPayload = {
    event: "redirect",
    uid: uid || undefined,
    uuid: uuid || undefined,
    session_id: sessionId || undefined,
    params: Object.keys(resolvedParams).length > 0 ? resolvedParams : undefined,
  };

  const redirectPromise = fetch(`${appBaseUrl}/api/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(redirectPayload),
  }).catch((err) => console.error("Redirect tracking failed:", err));

  const shouldTrackClick = async () => {
    if (!event || !uid) return true;
    const rawEid = customParams.eid;
    const eid = typeof rawEid === "string" && rawEid ? rawEid : null;
    if (!eid) return true;
    if (!adminDb) return true;

    const docId = `dedupe_${uid}_${eid}_${event}`;
    try {
      await adminDb.collection("analytics_logs").doc(docId).create({
        uid,
        eid,
        event,
        type: "dedupe",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return true;
    } catch (error) {
      const code = (error as { code?: string | number })?.code;
      if (code === "already-exists" || code === 6) return false;
      return true;
    }
  };

  const eventPromise = shouldTrackClick()
    .then((shouldTrack) => {
      if (!shouldTrack || !event) return null;
      const eventPayload = {
        event,
        uid: uid || undefined,
        uuid: uuid || undefined,
        session_id: sessionId || undefined,
        params:
          Object.keys(resolvedParams).length > 0 ? resolvedParams : undefined,
      };
      return fetch(`${appBaseUrl}/api/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventPayload),
      });
    })
    .catch((err) => console.error("Redirect tracking failed:", err));

  waitUntil(redirectPromise);
  waitUntil(eventPromise);

  // 2. 处理重定向
  if (targetUrlStr) {
    try {
      // 兼容相对路径跳转（如果是相对路径，基于当前 origin）
      const parsedTarget = new URL(targetUrlStr, url.origin);
      if (isAllowedRedirect(parsedTarget, url)) {
        return NextResponse.redirect(parsedTarget);
      }
    } catch {
      // Invalid URL
    }
  }

  // 如果没有有效 URL，跳转到首页或显示错误
  return NextResponse.redirect(new URL("/", url.origin));
}
