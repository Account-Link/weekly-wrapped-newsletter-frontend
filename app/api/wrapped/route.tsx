import { NextResponse } from "next/server";
import {
  mapApiReportToWeeklyReportData,
  mapReportToWeeklyData,
} from "../../../src/domain/report/adapter";
import { mockReports } from "../../../src/domain/report/mock";
import {
  attachBasicChartAssets,
  attachShareAssetsAndLinks,
  renderEmailHtmlFromWeeklyData,
  type UploadTarget,
} from "../../../src/lib/email-generator";
import crypto from "node:crypto";

interface WrappedRequestBody {
  uid: string;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const uploadTarget = (url.searchParams.get("upload") ??
      "api") as UploadTarget;
    const mockParam = url.searchParams.get("mock");
    const caseKey = url.searchParams.get("case");
    const useMock = mockParam === "true" || Boolean(caseKey);
    const assetBaseUrl = process.env.EMAIL_ASSET_BASE_URL || url.origin;
    let weeklyData;
    if (useMock) {
      const mockCase = caseKey ?? "curious";
      const apiReport = mockReports[mockCase] ?? mockReports.curious;
      const report = mapApiReportToWeeklyReportData(apiReport);
      weeklyData = mapReportToWeeklyData(apiReport.app_user_id, report, {
        assetBaseUrl,
        trackingBaseUrl: assetBaseUrl,
      });
    } else {
      const uid = url.searchParams.get("uid");
      if (!uid) {
        return NextResponse.json({ error: "Missing uid" }, { status: 400 });
      }
      const { getWeeklyData } = await import("../../../src/lib/firebase-admin");
      weeklyData = await getWeeklyData(uid);
    }

    const assetId = crypto.randomUUID();
    await attachBasicChartAssets(weeklyData, {
      useUploads: true,
      uploadTarget,
      progressKey: `preview/${caseKey ?? "real"}-${assetId}-progress.png`,
      barsKey: `preview/${caseKey ?? "real"}-${assetId}-bars.png`,
    });
    await attachShareAssetsAndLinks(weeklyData, {
      assetBaseUrl,
      uploadTarget,
      shareTrendKey: `preview/${caseKey ?? "real"}-${assetId}-share-trend.png`,
      shareStatsKey: `preview/${caseKey ?? "real"}-${assetId}-share-stats.png`,
    });
    const html = await renderEmailHtmlFromWeeklyData(weeklyData);

    return new NextResponse(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { adminDb, getWeeklyData } =
      await import("../../../src/lib/firebase-admin");
    // 重要逻辑：权限握手，确保 Firebase Admin 已正确初始化并具备访问权限
    // - 可根据业务需要执行一次轻量级读操作或健康检查
    // - 例如：列出集合以确认连接正常（轻量动作）
    const shouldCheckAdmin = process.env.FIREBASE_ADMIN_CHECK === "true";
    if (!shouldCheckAdmin || !adminDb) {
      // 重要逻辑：本地业务开发跳过权限握手
    } else {
      await adminDb.listCollections();
    }

    // 重要逻辑：后端请求校验说明
    // - 可在此处校验 API_KEY 或签名头，确保请求来自可信后端
    // - 示例：const apiKey = request.headers.get("x-api-key")
    //         if (apiKey !== process.env.INTERNAL_API_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = (await request.json()) as WrappedRequestBody;
    if (!body?.uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    const assetBaseUrl =
      process.env.EMAIL_ASSET_BASE_URL || new URL(request.url).origin;
    const weeklyData = await getWeeklyData(body.uid);

    const assetId = crypto.randomUUID();
    await attachBasicChartAssets(weeklyData, {
      useUploads: true,
      uploadTarget: "api",
      progressKey: `weekly/${body.uid}/${weeklyData.weekStart}-${assetId}-progress.png`,
      barsKey: `weekly/${body.uid}/${weeklyData.weekStart}-${assetId}-bars.png`,
    });
    await attachShareAssetsAndLinks(weeklyData, {
      assetBaseUrl,
      uploadTarget: "api",
      shareTrendKey: `weekly/${body.uid}/${weeklyData.weekStart}-${assetId}-share-trend.png`,
      shareStatsKey: `weekly/${body.uid}/${weeklyData.weekStart}-${assetId}-share-stats.png`,
    });

    // 重要逻辑：服务端渲染 React Email 模板为 HTML，供邮件服务商发送
    const html = await renderEmailHtmlFromWeeklyData(weeklyData);

    // 重要逻辑：返回 HTML 与数据便于联调与回归测试
    return NextResponse.json({ html, data: weeklyData });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
