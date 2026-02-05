/**
 * API Route: Weekly Report Generation
 * (API 路由：周报生成)
 *
 * Serves as the main entry point for generating weekly newsletter emails.
 * Supports both preview (GET) and production (POST) modes.
 * (作为生成周报邮件的主要入口点。支持预览 (GET) 和生产 (POST) 模式。)
 */
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
import { createLogger } from "@/lib/logger";

const logger = createLogger("API/Wrapped");

/**
 * Request body structure for the POST endpoint.
 */
interface WrappedRequestBody {
  uid?: string;
  params?: WeeklyReportApiResponse;
}

/**
 * GET Handler
 * (GET 处理程序)
 *
 * Generates a preview HTML of the newsletter.
 * Supports:
 * - Mock data rendering (via ?mock=true or ?case=...)
 * - Real data rendering (via ?uid=...)
 * (生成简报的预览 HTML。支持：Mock 数据渲染或真实数据渲染。)
 *
 * @param request - The incoming HTTP request (传入的 HTTP 请求)
 */
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
      logger.info(`Using mock data: case=${mockCase}`);
    } else {
      const uid = url.searchParams.get("uid");
      if (!uid) {
        return NextResponse.json({ error: "Missing uid" }, { status: 400 });
      }
      const { getWeeklyData } =
        await import("../../../src/domain/report/service");
      weeklyData = await getWeeklyData(uid);
      logger.info(`Fetched real data for uid=${uid}`);
    }

    // Generate unique asset ID to prevent collisions during preview
    const assetId = crypto.randomUUID();
    const assetKeys = useMock
      ? buildPreviewAssetKeys(caseKey ?? "real", assetId)
      : buildWeeklyAssetKeys(weeklyData.uid, weeklyData.weekStart, assetId);

    logger.info(
      `Generating preview for uid=${weeklyData.uid} case=${caseKey ?? "real"}`,
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
    logger.error("GET request failed", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({ error: message, stack }, { status: 500 });
  }
}

/**
 * POST Handler
 * (POST 处理程序)
 *
 * Production endpoint for generating the newsletter HTML and data.
 * Can be triggered with:
 * - Direct params (push model)
 * - UID (pull model, if enabled)
 * (用于生成简报 HTML 和数据的生产端点。可以通过直接参数（推送模式）或 UID（拉取模式）触发。)
 *
 * @param request - The incoming HTTP request (传入的 HTTP 请求)
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WrappedRequestBody;
    logger.info(
      `Received POST request. uid=${body.uid}, params=${JSON.stringify(body.params)}`,
    );

    const enableUidFetch = process.env.WRAPPED_UID_FETCH_ENABLED === "true";
    const assetBaseUrl = getAssetBaseUrl();

    let weeklyData;
    if (body?.params) {
      logger.info("Building data from provided params");
      weeklyData = buildWeeklyDataFromApiReport(body.params, {
        assetBaseUrl,
        uidOverride: body.uid,
      });
    } else if (enableUidFetch) {
      if (!body?.uid) {
        return NextResponse.json({ error: "Missing uid" }, { status: 400 });
      }

      logger.info(`Fetching data from service for uid=${body.uid}`);

      const { getWeeklyData } =
        await import("../../../src/domain/report/service");

      weeklyData = await getWeeklyData(body.uid);
      logger.success(
        `Data fetched successfully. weekStart=${weeklyData.weekStart}`,
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

    logger.info(`Starting pipeline execution. assetId=${assetId}`);

    const { html, data } = await ReportPipeline.run({
      data: weeklyData,
      assetBaseUrl,
      uploadTarget: "api",
      useUploads: true,
      assetKeys,
    });

    logger.success("Pipeline execution completed");

    // Returns HTML and Data for debugging and integration testing
    return NextResponse.json({ html, data });
  } catch (error) {
    logger.error("POST request failed", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      { error: message, stack, location: "POST /api/wrapped" },
      { status: 500 },
    );
  }
}
