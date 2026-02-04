// 文件功能：提供周报邮件 HTML 生成 API，处于主流程入口层
// 方法概览：GET 预览生成、POST 生产生成
import { NextResponse } from "next/server";
import { mockReports } from "../../../src/domain/report/mock";
import {
  buildPreviewAssetKeys,
  buildWeeklyAssetKeys,
  buildWeeklyDataFromApiReport,
  type UploadTarget,
} from "../../../src/lib/email-generator";
import { getAssetBaseUrl, getTrackingBaseUrl } from "@/lib/config";
import type { WeeklyReportApiResponse } from "../../../src/domain/report/types";
import crypto from "node:crypto";
import { ReportPipeline } from "@/core/pipeline";

// 方法功能：POST 请求体类型定义
interface WrappedRequestBody {
  uid?: string;
  params?: WeeklyReportApiResponse;
}

// 方法功能：GET 生成预览 HTML，支持 mock/真实数据
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const uploadTarget = (url.searchParams.get("upload") ??
      "api") as UploadTarget;
    const mockParam = url.searchParams.get("mock");
    const caseKey = url.searchParams.get("case");
    const useMock = mockParam === "true" || Boolean(caseKey);
    const assetBaseUrl = getAssetBaseUrl();
    const trackingBaseUrl = getTrackingBaseUrl();
    let weeklyData;
    if (useMock) {
      const mockCase = caseKey ?? "curious";
      const apiReport = mockReports[mockCase] ?? mockReports.curious;
      weeklyData = buildWeeklyDataFromApiReport(apiReport, {
        assetBaseUrl,
      });
    } else {
      const uid = url.searchParams.get("uid");
      if (!uid) {
        return NextResponse.json({ error: "Missing uid" }, { status: 400 });
      }
      const { getWeeklyData } =
        await import("../../../src/domain/report/service");
      weeklyData = await getWeeklyData(uid);
      console.log("weeklyData", weeklyData);
    }

    // 重要逻辑：每次生成使用唯一资源 key，避免覆盖
    const assetId = crypto.randomUUID();
    const assetKeys = buildPreviewAssetKeys(caseKey ?? "real", assetId);
    const { html } = await ReportPipeline.run({
      data: weeklyData,
      assetBaseUrl,
      uploadTarget,
      useUploads: true,
      assetKeys,
    });

    return new NextResponse(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 方法功能：POST 生成生产 HTML，返回 HTML 与数据
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WrappedRequestBody;
    const enableUidFetch = process.env.WRAPPED_UID_FETCH_ENABLED === "true";
    const assetBaseUrl = getAssetBaseUrl();
    const trackingBaseUrl = getTrackingBaseUrl();
    let weeklyData;
    if (body?.params) {
      weeklyData = buildWeeklyDataFromApiReport(body.params, {
        assetBaseUrl,
        uidOverride: body.uid,
      });
    } else if (enableUidFetch) {
      if (!body?.uid) {
        return NextResponse.json({ error: "Missing uid" }, { status: 400 });
      }
      const { adminDb } = await import("../../../src/lib/firebase-admin");
      const { getWeeklyData } =
        await import("../../../src/domain/report/service");
      const shouldCheckAdmin = process.env.FIREBASE_ADMIN_CHECK === "true";
      if (!shouldCheckAdmin || !adminDb) {
      } else {
        await adminDb.listCollections();
      }
      weeklyData = await getWeeklyData(body.uid);
    } else {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const assetId = crypto.randomUUID();
    const assetKeys = buildWeeklyAssetKeys(
      weeklyData.uid,
      weeklyData.weekStart,
      assetId,
    );
    const { html, data } = await ReportPipeline.run({
      data: weeklyData,
      assetBaseUrl,
      uploadTarget: "api",
      useUploads: true,
      assetKeys,
    });

    // 重要逻辑：返回 HTML 与数据便于联调与回归测试
    return NextResponse.json({ html, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
