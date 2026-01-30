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
import crypto from "node:crypto";
import { ReportPipeline } from "@/core/pipeline";

// 方法功能：POST 请求体类型定义
interface WrappedRequestBody {
  uid: string;
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
    const assetBaseUrl = process.env.EMAIL_ASSET_BASE_URL || url.origin;
    let weeklyData;
    if (useMock) {
      const mockCase = caseKey ?? "curious";
      const apiReport = mockReports[mockCase] ?? mockReports.curious;
      weeklyData = buildWeeklyDataFromApiReport(apiReport, {
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
    const assetKeys = buildWeeklyAssetKeys(
      body.uid,
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
