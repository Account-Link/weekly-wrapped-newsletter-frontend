/**
 * Core pipeline for email report generation.
 * Orchestrates the data -> assets -> HTML transformation flow.
 * (邮件报告生成的核心流水线。编排 数据 -> 资源 -> HTML 的转换流程。)
 *
 * Responsibilities (职责):
 * - Asset generation (charts, share cards) (资源生成：图表、分享卡片)
 * - Image uploading (图片上传)
 * - Share link injection (分享链接注入)
 * - Final HTML rendering (最终 HTML 渲染)
 */
import { render } from "@react-email/render";
import { FypScoutReportEmail } from "../../../emails/fyp-scout-report";
import type { WeeklyData } from "@/lib/firebase-admin";
import {
  renderDiagnosisBarChartImage,
  renderStatsShareCardImage,
  renderTrendProgressImage,
  renderTrendShareCardImage,
} from "@/core/assets/satori-renderers";
import { uploadPngToNewApi, uploadToVercelBlob } from "@/core/uploader";
import type {
  ChartAssetOptions,
  PrepareWeeklyDataOptions,
  ReportPipelineRunOptions,
  ReportPipelineRunResult,
  ShareAssetOptions,
} from "./types";
import { createLogger } from "@/lib/logger";

const logger = createLogger("ReportPipeline");

const bufferToDataUrl = (buffer: Buffer) =>
  `data:image/png;base64,${buffer.toString("base64")}`;

/**
 * Renders share card PNGs using Satori.
 * (使用 Satori 渲染分享卡片 PNG 图片。)
 *
 * This is a blocking operation that uses CPU-intensive SVG generation + resvg rendering.
 * (这是一个阻塞操作，使用 CPU 密集的 SVG 生成 + resvg 渲染。)
 *
 * @param data - The weekly report data (周报数据)
 * @returns Object containing trend and stats card PNG buffers (包含趋势和统计卡片 PNG 缓冲区的对象)
 */
async function renderShareCardPngs(data: WeeklyData) {
  return logger.measure("renderShareCardPngs (CPU Blocking)", async () => {
    const [trendCardPng, statsCardPng] = await Promise.all([
      renderTrendShareCardImage({
        topicTitle: data.trend.topic.replace(/“|”/g, ""),
        topicSubtitle: data.trend.statusText,
        discoveryRank: data.trend.rank ?? 0,
        totalDiscovery: data.trend.totalDiscoverers.toLocaleString(),
        progress: data.trend.trendProgress,
        hashtag: data.trend.startTag,
        hashtagPercent: data.trend.startPercent,
        endTag: data.trend.endTag,
        globalPercent: data.trend.endPercent,
        width: 390,
        height: 693,
        trendType: data.trend.type,
      }),
      renderStatsShareCardImage({
        totalVideos: data.diagnosis.totalVideosValue,
        totalTime: `${data.diagnosis.totalTimeValue} ${data.diagnosis.totalTimeUnit}`,
        miles: `${data.diagnosis.miles}`,
        comparisonDiff: data.diagnosis.comparisonDiff,
        comparisonText: data.diagnosis.comparisonText,
        milesComment: data.diagnosis.milesComment,
        barChartData: {
          lastWeekLabel: data.diagnosis.lastWeekLabel,
          thisWeekLabel: data.diagnosis.thisWeekLabel,
          lastWeekValue: data.diagnosis.lastWeekValue,
          thisWeekValue: data.diagnosis.thisWeekValue,
        },
        contents: data.newContents.slice(0, 3).map((content) => ({
          label: content.label,
          iconUrl: content.stickerUrl,
        })),
        width: 390,
        height: 960,
      }),
    ]);
    return { trendCardPng, statsCardPng };
  });
}

/**
 * Generates basic chart assets (Trend Progress & Diagnosis Bar Chart).
 * These are small charts embedded directly in the email body.
 * (生成基础图表资源（趋势进度条 & 诊断柱状图）。这些是直接嵌入邮件正文的小图表。)
 *
 * @param data - The weekly report data (周报数据)
 * @param options - Configuration for upload targets and keys (上传目标和键值的配置)
 */
async function attachBasicChartAssets(
  data: WeeklyData,
  options: ChartAssetOptions,
) {
  await logger.measure("attachBasicChartAssets", async () => {
    const { useUploads = true, uploadTarget = "api" } = options;

    // Parallel generation of basic charts
    const [progressPng, barChartPng] = await Promise.all([
      renderTrendProgressImage({
        progress: data.trend.trendProgress,
        width: 520,
        height: 64,
      }),
      renderDiagnosisBarChartImage({
        lastWeekLabel: data.diagnosis.lastWeekLabel,
        thisWeekLabel: data.diagnosis.thisWeekLabel,
        lastWeekValue: data.diagnosis.lastWeekValue,
        thisWeekValue: data.diagnosis.thisWeekValue,
        width: 520,
        height: 265,
      }),
    ]);

    if (useUploads) {
      const uploadFn =
        uploadTarget === "vercel" ? uploadToVercelBlob : uploadPngToNewApi;

      // Parallel upload
      const [progressImageUrl, barChartImageUrl] = await logger.measure(
        "Upload Basic Charts",
        () =>
          Promise.all([
            uploadFn(progressPng, options.progressKey),
            uploadFn(barChartPng, options.barsKey),
          ]),
      );

      data.trend.progressImageUrl = progressImageUrl;
      data.diagnosis.barChartImageUrl = barChartImageUrl;
      return;
    }

    // For local preview, use Data URLs
    data.trend.progressImageUrl = bufferToDataUrl(progressPng);
    data.diagnosis.barChartImageUrl = bufferToDataUrl(barChartPng);
  });
}

/**
 * Generates share assets and injects trackable share links.
 * (生成分享资源并注入可追踪的分享链接。)
 *
 * Includes logic to toggle between server-side generation (traditional)
 * and client-side generation (new optimization).
 * (包含在服务端生成（传统模式）和客户端生成（新优化模式）之间切换的逻辑。)
 *
 * @param data - The weekly report data (周报数据)
 * @param options - Configuration for upload targets and keys (上传目标和键值的配置)
 */
async function attachShareAssetsAndLinks(
  data: WeeklyData,
  options: ShareAssetOptions,
) {
  await logger.measure("attachShareAssetsAndLinks", async () => {
    const { uploadTarget = "api", assetBaseUrl } = options;

    // Common query params for all share links
    const encodedUid = encodeURIComponent(data.uid);
    const encodedWeekStart = encodeURIComponent(data.weekStart);
    let baseQueryParams = `uid=${encodedUid}&weekStart=${encodedWeekStart}`;
    if (data.period_start)
      baseQueryParams += `&period_start=${encodeURIComponent(data.period_start)}`;
    if (data.period_end)
      baseQueryParams += `&period_end=${encodeURIComponent(data.period_end)}`;

    // Server-Side Generation (Legacy/Stable)
    // Renders images on server, uploads them, and embeds URLs.
    logger.info("Server-side generation active. Rendering images...");
    const uploadFn =
      uploadTarget === "vercel" ? uploadToVercelBlob : uploadPngToNewApi;

    const { trendCardPng, statsCardPng } = await renderShareCardPngs(data);

    const [trendCardUrl, statsCardUrl] = await logger.measure(
      "Upload Share Cards",
      () =>
        Promise.all([
          uploadFn(trendCardPng, options.shareTrendKey),
          uploadFn(statsCardPng, options.shareStatsKey),
        ]),
    );

    data.trend.shareUrl = `${assetBaseUrl}/share/download?url=${encodeURIComponent(
      trendCardUrl,
    )}&filename=trend-card.png&type=trend_share_card&${baseQueryParams}&theme=dark`;
    data.diagnosis.shareUrl = `${assetBaseUrl}/share/download?url=${encodeURIComponent(
      statsCardUrl,
    )}&filename=stats-card.png&type=stats_share_card&${baseQueryParams}&theme=light`;

    // Inject trackable redirect links for other actions
    if (data.weeklyNudge.linkUrl) {
      data.weeklyNudge.linkUrl = `${assetBaseUrl}/share/redirect?url=${encodeURIComponent(
        data.weeklyNudge.linkUrl,
      )}&type=nudge_invite&${baseQueryParams}`;
    }

    if (data.footer?.tiktokUrl) {
      data.footer.tiktokUrl = `${assetBaseUrl}/share/redirect?url=${encodeURIComponent(
        data.footer.tiktokUrl,
      )}&type=footer_tiktok&${baseQueryParams}`;
    }
  });
}

/**
 * High-level orchestrator for data preparation with assets.
 * (带资源的数据准备高级编排器。)
 *
 * @param data - The weekly report data (周报数据)
 * @param options - Pipeline options (流水线配置)
 */
async function prepareWeeklyDataWithAssets(
  data: WeeklyData,
  options: PrepareWeeklyDataOptions,
) {
  const { assetBaseUrl, uploadTarget, useUploads = true, assetKeys } = options;

  // 1. Generate basic charts (always needed for email body)
  await attachBasicChartAssets(data, {
    useUploads,
    uploadTarget,
    progressKey: assetKeys.progressKey,
    barsKey: assetKeys.barsKey,
  });

  // 2. Handle share assets (upload mode vs preview mode)
  if (useUploads) {
    return attachShareAssetsAndLinks(data, {
      assetBaseUrl,
      uploadTarget,
      shareTrendKey: assetKeys.shareTrendKey,
      shareStatsKey: assetKeys.shareStatsKey,
    });
  }

  // 3. Preview mode (no uploads, just generate Data URLs)
  logger.info("Preview mode: generating local Data URLs for share cards");
  data.trend.shareUrl = undefined;
  data.diagnosis.shareUrl = undefined;
  const { trendCardPng, statsCardPng } = await renderShareCardPngs(data);
  return {
    trendCardUrl: bufferToDataUrl(trendCardPng),
    statsCardUrl: bufferToDataUrl(statsCardPng),
  };
}

/**
 * Renders the final HTML string from the populated WeeklyData.
 * (根据填充好的 WeeklyData 渲染最终 HTML 字符串。)
 *
 * @param data - The fully populated weekly data (填充完整的周报数据)
 * @returns HTML string (HTML 字符串)
 */
async function renderEmailHtmlFromWeeklyData(data: WeeklyData) {
  return logger.measure("renderEmailHtmlFromWeeklyData", async () => {
    return render(<FypScoutReportEmail data={data} />, {
      pretty: true,
    });
  });
}

/**
 * Main Entry Point.
 * Orchestrates the full report generation pipeline.
 * (主入口点。编排完整的报告生成流水线。)
 *
 * @param options - Run options (运行配置)
 * @returns Result containing HTML, updated Data, and Asset URLs (包含 HTML、更新后的数据和资源 URL 的结果)
 */
async function run(
  options: ReportPipelineRunOptions,
): Promise<ReportPipelineRunResult> {
  return logger.measure("Pipeline Full Run", async () => {
    const {
      data,
      assetBaseUrl,
      assetKeys,
      uploadTarget,
      useUploads = true,
    } = options;

    logger.info(`Starting pipeline for uid=${data.uid}`);

    const assetsResult = await prepareWeeklyDataWithAssets(data, {
      assetBaseUrl,
      uploadTarget,
      useUploads,
      assetKeys,
    });

    const assets = assetsResult || {};

    const html = await renderEmailHtmlFromWeeklyData(data);

    logger.success("Pipeline completed successfully");
    return { html, data, assets };
  });
}

export const ReportPipeline = {
  attachBasicChartAssets,
  attachShareAssetsAndLinks,
  prepareWeeklyDataWithAssets,
  renderEmailHtmlFromWeeklyData,
  run,
};
