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
    const assetKeys = useMock
      ? buildPreviewAssetKeys(caseKey ?? "real", assetId)
      : buildWeeklyAssetKeys(weeklyData.uid, weeklyData.weekStart, assetId);

    console.log(
      `[API/Wrapped] Generating preview for uid=${weeklyData.uid} case=${caseKey ?? "real"}`,
    );

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
    console.error("[API/Wrapped] GET Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({ error: message, stack }, { status: 500 });
  }
}

// 方法功能：POST 生成生产 HTML，返回 HTML 与数据
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WrappedRequestBody;
    console.log(
      `[API/Wrapped] Received POST request. uid=${body.uid}, hasParams=${!!body.params}`,
    );

    const enableUidFetch = process.env.WRAPPED_UID_FETCH_ENABLED === "true";
    const assetBaseUrl = getAssetBaseUrl();

    let weeklyData;
    if (body?.params) {
      console.log("[API/Wrapped] Building data from provided params");
      weeklyData = buildWeeklyDataFromApiReport(body.params, {
        assetBaseUrl,
        uidOverride: body.uid,
      });
    } else if (enableUidFetch) {
      if (!body?.uid) {
        return NextResponse.json({ error: "Missing uid" }, { status: 400 });
      }

      console.log(
        `[API/Wrapped] Fetching data from service for uid=${body.uid}`,
      );
      const { getWeeklyData } =
        await import("../../../src/domain/report/service");

      // Optional: Check Firebase Admin connection if needed
      // const { adminDb } = await import("../../../src/lib/firebase-admin");

      weeklyData = await getWeeklyData(body.uid);
      console.log(
        `[API/Wrapped] Data fetched successfully. weekStart=${weeklyData.weekStart}`,
      );
    } else {
      return NextResponse.json(
        { error: "Missing params or UID fetch disabled" },
        { status: 400 },
      );
    }

    const assetId = crypto.randomUUID();
    const assetKeys = buildWeeklyAssetKeys(
      weeklyData.uid,
      weeklyData.weekStart,
      assetId,
    );

    console.log(
      `[API/Wrapped] Starting pipeline execution. assetId=${assetId}`,
    );
    const { html, data } = await ReportPipeline.run({
      data: weeklyData,
      assetBaseUrl,
      uploadTarget: "api",
      useUploads: true,
      assetKeys,
    });
    console.log("[API/Wrapped] Pipeline execution completed");

    // 重要逻辑：返回 HTML 与数据便于联调与回归测试
    return NextResponse.json({ html, data });
  } catch (error) {
    console.error("[API/Wrapped] POST Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      { error: message, stack, location: "POST /api/wrapped" },
      { status: 500 },
    );
  }
}
