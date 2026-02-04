// 文件功能：重定向服务 API，负责记录点击并跳转
// 方法概览：验证白名单、记录埋点、执行 307 跳转
import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/api/tracking";
import { getAppBaseUrl } from "@/lib/config";

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
  // 注意：在 Serverless 环境下，fire-and-forget 可能不可靠，最好 await。
  // 但为了跳转速度，这里我们假设 /api/track 响应很快，或者接受极小概率丢失。
  // 更稳妥的方式是直接在这里调 DB，但为了解耦，我们调用内部 API。
  const trackPayload = {
    event: "click",
    type: "redirect",
    uid: uid || undefined,
    eid: emailId || undefined, // 统一使用 eid
    action: action || undefined,
    targetUrl: targetUrlStr || undefined,
    source: "email_redirect",
    extraData,
  };

  // 这里我们选择直接调用 trackEvent (它是 fetch 调用)

  // 为了性能，不 await 它的完全完成，但在 Vercel 等平台可能需要在 response 前完成。
  // 权衡：为了解耦和复用 /api/track 的逻辑，我们发起一个 fetch。
  // 如果追求极致性能，可以将 recordEvent 逻辑抽取到 lib/analytics.ts 中共享。
  const appBaseUrl = getAppBaseUrl();
  fetch(`${appBaseUrl}/api/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trackPayload),
  }).catch((err) => console.error("Redirect tracking failed:", err));

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
