// 文件功能：邮件生成入口封装，处于主流程调用层
// 方法概览：数据构建、资源 key 生成、HTML 生成入口
import {
  mapApiReportToWeeklyReportData,
  mapReportToWeeklyData,
} from "@/domain/report/adapter";
import { mockReports } from "@/domain/report/mock";
import crypto from "node:crypto";
import type { WeeklyData } from "@/lib/firebase-admin";
import { getWeeklyData } from "@/domain/report/service";
import type { WeeklyReportApiResponse } from "@/domain/report/types";
import { ReportPipeline } from "@/core/pipeline/report-pipeline";
import type { AssetKeySet } from "@/core/pipeline/types";

const assetBaseUrl =
  process.env.EMAIL_ASSET_BASE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

type GenerateEmailOptions = {
  uidOverride?: string;
  useUploads?: boolean;
  useRealData?: boolean;
};

export type { UploadTarget } from "@/core/pipeline/types";

// 方法功能：将 API 返回的报告映射为 WeeklyData，供渲染与资源注入
export function buildWeeklyDataFromApiReport(
  apiReport: WeeklyReportApiResponse,
  options: {
    assetBaseUrl: string;
    trackingBaseUrl: string;
    uidOverride?: string;
  },
): WeeklyData {
  // 重要逻辑：统一处理 uid 与基础 URL，确保追踪链路一致
  const report = mapApiReportToWeeklyReportData(apiReport);
  const resolvedUid = options.uidOverride || apiReport.app_user_id || "preview";
  return mapReportToWeeklyData(resolvedUid, report, {
    assetBaseUrl: options.assetBaseUrl,
    trackingBaseUrl: options.trackingBaseUrl,
  });
}

// 方法功能：使用 mock 数据生成 WeeklyData，供本地预览与调试
export function buildWeeklyDataFromMock(
  caseKey: string,
  baseUrl: string,
  uidOverride?: string,
): WeeklyData {
  // 重要逻辑：优先使用指定 caseKey，避免空数据影响渲染
  const apiReport = mockReports[caseKey] ?? mockReports.curious;
  return buildWeeklyDataFromApiReport(apiReport, {
    assetBaseUrl: baseUrl,
    trackingBaseUrl: baseUrl,
    uidOverride,
  });
}

// 方法功能：生成预览场景的资源 key 集合
export function buildPreviewAssetKeys(
  caseKey: string,
  assetId: string,
): AssetKeySet {
  // 重要逻辑：预览资源统一放在 preview 目录
  return {
    progressKey: `preview/${caseKey}-${assetId}-progress.png`,
    barsKey: `preview/${caseKey}-${assetId}-bars.png`,
    shareTrendKey: `preview/${caseKey}-${assetId}-share-trend.png`,
    shareStatsKey: `preview/${caseKey}-${assetId}-share-stats.png`,
  };
}

// 方法功能：生成线上周报资源 key 集合
export function buildWeeklyAssetKeys(
  uid: string,
  weekStart: string,
  assetId: string,
): AssetKeySet {
  // 重要逻辑：以 uid/周起始时间分桶，便于资源归档
  return {
    progressKey: `weekly/${uid}/${weekStart}-${assetId}-progress.png`,
    barsKey: `weekly/${uid}/${weekStart}-${assetId}-bars.png`,
    shareTrendKey: `weekly/${uid}/${weekStart}-${assetId}-share-trend.png`,
    shareStatsKey: `weekly/${uid}/${weekStart}-${assetId}-share-stats.png`,
  };
}

export const attachBasicChartAssets = ReportPipeline.attachBasicChartAssets;
export const attachShareAssetsAndLinks =
  ReportPipeline.attachShareAssetsAndLinks;
export const prepareWeeklyDataWithAssets =
  ReportPipeline.prepareWeeklyDataWithAssets;
export const renderEmailHtmlFromWeeklyData =
  ReportPipeline.renderEmailHtmlFromWeeklyData;

// 方法功能：生成邮件 HTML，供 API 与预览入口使用
export async function generateEmailHtml(
  caseKey: string = "curious",
  options?: string | GenerateEmailOptions,
) {
  // 重要逻辑：允许 options 为字符串以快速覆写 uid
  const resolvedOptions =
    typeof options === "string" ? { uidOverride: options } : (options ?? {});
  const {
    uidOverride,
    useUploads = true,
    useRealData = false,
  } = resolvedOptions;

  let data: WeeklyData;
  if (useRealData && uidOverride) {
    // 如果指定使用真实数据且有 uid，则从 API 拉取
    data = await getWeeklyData(uidOverride);
  } else {
    data = buildWeeklyDataFromMock(caseKey, assetBaseUrl, uidOverride);
  }

  // 重要逻辑：生成唯一资源 key，避免覆盖历史资产
  const assetId = crypto.randomUUID();
  const assetKeys =
    useRealData && uidOverride
      ? buildWeeklyAssetKeys(data.uid, data.weekStart, assetId)
      : buildPreviewAssetKeys(caseKey, assetId);

  const { html } = await ReportPipeline.run({
    data,
    assetBaseUrl,
    useUploads,
    assetKeys,
  });
  return html;
}
