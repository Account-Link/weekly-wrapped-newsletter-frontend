import admin from "firebase-admin";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// 方法功能：点击埋点查询参数类型定义
type ClickAction = "share_week" | "share_stats" | "invite_click" | "unsubscribe";
type ClickTrackQuery = {
  uid: string;
  eid: string;
  action: ClickAction;
  url?: string;
};

// 方法功能：构建去重文档 ID
const buildDocId = (uid: string, emailId: string, eventType: string) =>
  `${uid}_${emailId}_${eventType}`;

// 方法功能：解析并校验 action 参数
const parseAction = (value: string | null): ClickAction | null => {
  if (!value) return null;
  if (
    value === "share_week" ||
    value === "share_stats" ||
    value === "invite_click" ||
    value === "unsubscribe"
  ) {
    return value;
  }
  return null;
};

// 方法功能：检查重定向 URL 是否在白名单内
const isAllowedRedirect = (target: URL, requestOrigin: URL) => {
  const rawAllowlist = process.env.TRACK_REDIRECT_ALLOWLIST || "";
  const allowlist = rawAllowlist
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const allowedHosts = new Set([requestOrigin.host, ...allowlist]);
  return allowedHosts.has(target.host);
};

// 方法功能：写入点击埋点数据
const recordClickEvent = async (query: ClickTrackQuery, request: Request) => {
  if (!adminDb) return;

  // 重要逻辑：点击事件按 action 去重，避免重复统计
  const eventKey = query.action === "unsubscribe" ? "unsubscribe" : query.action;
  const eventType = query.action === "unsubscribe" ? "unsubscribe" : "click";
  const docId = buildDocId(query.uid, query.eid, eventKey);

  await adminDb.collection("analytics_logs").doc(docId).set(
    {
      event_type: eventType,
      action: query.action === "unsubscribe" ? null : query.action,
      uid: query.uid,
      email_id: query.eid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      user_agent: request.headers.get("user-agent") || "",
    },
    { merge: true },
  );
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const uid = url.searchParams.get("uid") || "";
  const eid = url.searchParams.get("eid") || "";
  const action = parseAction(url.searchParams.get("action"));
  const targetUrl = url.searchParams.get("url");

  if (!uid || !eid || !action) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  if (action === "unsubscribe") {
    // 重要逻辑：退订点击统一引导到退订确认页，避免外部跳转
    void recordClickEvent({ uid, eid, action }, request);
    const redirectUrl = new URL("/unsubscribe", url.origin);
    redirectUrl.searchParams.set("state", "confirm");
    redirectUrl.searchParams.set("uid", uid);
    redirectUrl.searchParams.set("eid", eid);
    return NextResponse.redirect(redirectUrl);
  }

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let parsedTarget: URL;
  try {
    parsedTarget = new URL(targetUrl);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  // 重要逻辑：仅允许白名单域名跳转，避免开放重定向风险
  if (!isAllowedRedirect(parsedTarget, url)) {
    return NextResponse.json({ error: "Blocked url" }, { status: 403 });
  }

  void recordClickEvent({ uid, eid, action, url: targetUrl }, request);
  return NextResponse.redirect(parsedTarget);
}
