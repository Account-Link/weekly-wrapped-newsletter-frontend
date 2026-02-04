// 文件功能：邮件主流程编排与资源注入的核心管线，处于 Data→Assets→HTML 的中心阶段
// 方法概览：资源生成/上传、分享链接注入、HTML 渲染、统一运行入口
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

const bufferToDataUrl = (buffer: Buffer) =>
  `data:image/png;base64,${buffer.toString("base64")}`;

async function renderShareCardPngs(data: WeeklyData) {
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
}

// 方法功能：生成基础图表并回填到 WeeklyData，属于 Assets 生成阶段
async function attachBasicChartAssets(
  data: WeeklyData,
  options: ChartAssetOptions,
) {
  // 重要逻辑：先生成基础图表，再统一回填到 WeeklyData 的可渲染字段
  const { useUploads = true, uploadTarget = "api" } = options;
  
  // 重要逻辑：并行生成基础图表
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
    // 重要逻辑：上传后写回 URL，供邮件模板渲染图片版本
    const uploadFn =
      uploadTarget === "vercel" ? uploadToVercelBlob : uploadPngToNewApi;
    
    // 重要逻辑：并行上传基础图表
    const [progressImageUrl, barChartImageUrl] = await Promise.all([
      uploadFn(progressPng, options.progressKey),
      uploadFn(barChartPng, options.barsKey),
    ]);
    
    data.trend.progressImageUrl = progressImageUrl;
    data.diagnosis.barChartImageUrl = barChartImageUrl;
    return;
  }

  // 重要逻辑：本地预览场景使用 Data URL，避免依赖远程上传
  // 方法功能：将 Buffer 转成 PNG Data URL 以便模板直接渲染
  data.trend.progressImageUrl = bufferToDataUrl(progressPng);
  data.diagnosis.barChartImageUrl = bufferToDataUrl(barChartPng);
}

// 方法功能：生成分享图并注入分享链接，属于 Assets 生成与 Link 注入阶段
async function attachShareAssetsAndLinks(
  data: WeeklyData,
  options: ShareAssetOptions,
) {
  // 重要逻辑：生成分享图并注入可追踪的分享链接，保证统计链路一致
  const { uploadTarget = "api", assetBaseUrl } = options;
  const uploadFn =
    uploadTarget === "vercel" ? uploadToVercelBlob : uploadPngToNewApi;

  // 重要逻辑：趋势分享图用于社交传播卡片
  const { trendCardPng, statsCardPng } = await renderShareCardPngs(data);

  // 重要逻辑：并行上传分享图并获取对外 URL
  const [trendCardUrl, statsCardUrl] = await Promise.all([
    uploadFn(trendCardPng, options.shareTrendKey),
    uploadFn(statsCardPng, options.shareStatsKey),
  ]);

  // 重要逻辑：构建可追踪的下载链接，带上用户与周期参数
  const encodedUid = encodeURIComponent(data.uid);
  const encodedWeekStart = encodeURIComponent(data.weekStart);
  data.trend.shareUrl = `${assetBaseUrl}/share/download?url=${encodeURIComponent(
    trendCardUrl,
  )}&filename=trend-card.png&type=trend_share_card&uid=${encodedUid}&weekStart=${encodedWeekStart}&theme=dark`;
  data.diagnosis.shareUrl = `${assetBaseUrl}/share/download?url=${encodeURIComponent(
    statsCardUrl,
  )}&filename=stats-card.png&type=stats_share_card&uid=${encodedUid}&weekStart=${encodedWeekStart}&theme=light`;

  if (data.weeklyNudge.linkUrl) {
    // 重要逻辑：行动按钮添加埋点跳转，统一落到 redirect 追踪入口
    data.weeklyNudge.linkUrl = `${assetBaseUrl}/share/redirect?url=${encodeURIComponent(
      data.weeklyNudge.linkUrl,
    )}&type=nudge_invite&uid=${encodedUid}&weekStart=${encodedWeekStart}`;
  }

  if (data.footer?.tiktokUrl) {
    // 重要逻辑：底部 TikTok 链接增加埋点追踪
    data.footer.tiktokUrl = `${assetBaseUrl}/share/redirect?url=${encodeURIComponent(
      data.footer.tiktokUrl,
    )}&type=footer_tiktok&uid=${encodedUid}&weekStart=${encodedWeekStart}`;
  }

  return { trendCardUrl, statsCardUrl };
}

// 方法功能：统一编排图表生成、上传、链接注入，属于主流程核心阶段
async function prepareWeeklyDataWithAssets(
  data: WeeklyData,
  options: PrepareWeeklyDataOptions,
) {
  // 重要逻辑：统一编排图表生成、图片上传与分享链接注入，避免入口分叉
  const { assetBaseUrl, uploadTarget, useUploads = true, assetKeys } = options;
  await attachBasicChartAssets(data, {
    useUploads,
    uploadTarget,
    progressKey: assetKeys.progressKey,
    barsKey: assetKeys.barsKey,
  });

  if (useUploads) {
    // 重要逻辑：生产路径生成分享图并注入下载/跳转链接
    return attachShareAssetsAndLinks(data, {
      assetBaseUrl,
      uploadTarget,
      shareTrendKey: assetKeys.shareTrendKey,
      shareStatsKey: assetKeys.shareStatsKey,
    });
  }

  // 重要逻辑：预览路径不注入分享链接，避免误触外部跳转
  data.trend.shareUrl = undefined;
  data.diagnosis.shareUrl = undefined;
  const { trendCardPng, statsCardPng } = await renderShareCardPngs(data);
  return {
    trendCardUrl: bufferToDataUrl(trendCardPng),
    statsCardUrl: bufferToDataUrl(statsCardPng),
  };
}

// 方法功能：将 WeeklyData 渲染为邮件 HTML，属于 HTML 输出阶段
async function renderEmailHtmlFromWeeklyData(data: WeeklyData) {
  // 重要逻辑：单一入口渲染 React Email，保证 HTML 输出稳定
  return render(<FypScoutReportEmail data={data} />, {
    pretty: true,
  });
}

// 方法功能：主流程入口，统一执行数据→资源→HTML 输出
async function run(
  options: ReportPipelineRunOptions,
): Promise<ReportPipelineRunResult> {
  // 重要逻辑：主流程编排，固定数据流向避免重复实现
  const {
    data,
    assetBaseUrl,
    assetKeys,
    uploadTarget,
    useUploads = true,
  } = options;
  // 重要逻辑：先注入资源，再渲染 HTML，确保模板读取到完整字段
  const assets = await prepareWeeklyDataWithAssets(data, {
    assetBaseUrl,
    uploadTarget,
    useUploads,
    assetKeys,
  });
  const html = await renderEmailHtmlFromWeeklyData(data);
  return { html, data, assets };
}

// 方法功能：对外暴露管线接口，作为单一业务编排入口
export const ReportPipeline = {
  attachBasicChartAssets,
  attachShareAssetsAndLinks,
  prepareWeeklyDataWithAssets,
  renderEmailHtmlFromWeeklyData,
  run,
};
