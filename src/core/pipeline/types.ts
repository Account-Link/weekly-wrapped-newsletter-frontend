// 文件功能：定义主流程管线相关类型，供编排与外部调用使用
// 方法概览：无，类型声明集合
import type { WeeklyData } from "@/lib/firebase-admin";

export type UploadTarget = "api" | "vercel";

export type ChartAssetOptions = {
  useUploads?: boolean;
  uploadTarget?: UploadTarget;
  progressKey: string;
  barsKey: string;
};

export type ShareAssetOptions = {
  uploadTarget?: UploadTarget;
  assetBaseUrl: string;
  shareTrendKey: string;
  shareStatsKey: string;
};

export type AssetKeySet = {
  progressKey: string;
  barsKey: string;
  shareTrendKey: string;
  shareStatsKey: string;
};

export type PrepareWeeklyDataOptions = {
  assetBaseUrl: string;
  uploadTarget?: UploadTarget;
  useUploads?: boolean;
  assetKeys: AssetKeySet;
};

export type ReportPipelineRunOptions = {
  data: WeeklyData;
  assetBaseUrl: string;
  assetKeys: AssetKeySet;
  uploadTarget?: UploadTarget;
  useUploads?: boolean;
};

export type ReportPipelineRunResult = {
  html: string;
  data: WeeklyData;
  assets: {
    trendCardUrl?: string;
    statsCardUrl?: string;
  };
};
