// 文件功能：重定向服务 API，负责记录点击并跳转
// 方法概览：验证白名单、记录埋点、执行 307 跳转
import { NextResponse } from "next/server";
import { getAppBaseUrl } from "@/lib/config";
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
  const emailId = params.get("eid") || params.get("email_id");
  const action = params.get("action");
  const type = params.get("type"); // 支持 type 参数

  // 解析 extraData (JSON 字符串)
  let extraData: Record<string, unknown> = {};
  const extraDataStr = params.get("extraData");
  if (extraDataStr) {
    try {
      extraData = JSON.parse(extraDataStr);
    } catch (e) {
      console.error("Failed to parse extraData JSON:", e);
    }
  }

  // 1. 记录埋点 (异步调用纯埋点接口，不阻塞跳转)
  // 使用 waitUntil 确保在 Response 返回后，Serverless 函数不会立即被冻结，而是等待 Promise 完成

  // 确保 targetUrl 放入 extraData
  if (targetUrlStr) {
    extraData.targetUrl = targetUrlStr;
  }

  const trackPayload = {
    event: "click",
    type: type || undefined, // 传递 type
    uid: uid || undefined,
    eid: emailId || undefined, // 统一使用 eid
    action: action || undefined,
    source: "email_redirect",
    extraData: Object.keys(extraData).length > 0 ? extraData : undefined,
  };

  // 这里的 fetch 可能会比较慢，使用 waitUntil 包裹
  const appBaseUrl = getAppBaseUrl();
  const trackPromise = fetch(`${appBaseUrl}/api/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trackPayload),
  }).catch((err) => console.error("Redirect tracking failed:", err));

  waitUntil(trackPromise);

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
