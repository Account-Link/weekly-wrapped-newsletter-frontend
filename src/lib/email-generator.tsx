import { render } from "@react-email/render";
import { FypScoutReportEmail } from "../../emails/fyp-scout-report";
import {
  mapApiReportToWeeklyReportData,
  mapReportToWeeklyData,
} from "@/domain/report/adapter";
import { mockReports } from "@/domain/report/mock";
import {
  renderDiagnosisBarChartImage,
  renderTrendProgressImage,
  renderTrendShareCardImage,
  renderStatsShareCardImage,
  uploadPngToNewApi,
  uploadToVercelBlob,
} from "@/lib/satori-assets";
import crypto from "node:crypto";
import type { WeeklyData } from "@/lib/firebase-admin";

const assetBaseUrl =
  process.env.EMAIL_ASSET_BASE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

type GenerateEmailOptions = {
  uidOverride?: string;
  useUploads?: boolean;
};

export type UploadTarget = "api" | "vercel";

type ChartAssetOptions = {
  useUploads?: boolean;
  uploadTarget?: UploadTarget;
  progressKey: string;
  barsKey: string;
};

type ShareAssetOptions = {
  uploadTarget?: UploadTarget;
  assetBaseUrl: string;
  shareTrendKey: string;
  shareStatsKey: string;
};

export function buildWeeklyDataFromMock(
  caseKey: string,
  baseUrl: string,
  uidOverride?: string,
): WeeklyData {
  const apiReport = mockReports[caseKey] ?? mockReports.curious;
  const report = mapApiReportToWeeklyReportData(apiReport);
  const resolvedUid = uidOverride || apiReport.app_user_id || "preview";
  return mapReportToWeeklyData(resolvedUid, report, {
    assetBaseUrl: baseUrl,
    trackingBaseUrl: baseUrl,
  });
}

export async function attachBasicChartAssets(
  data: WeeklyData,
  options: ChartAssetOptions,
) {
  const { useUploads = true, uploadTarget = "api" } = options;
  const progressPng = await renderTrendProgressImage({
    progress: data.hero.trendProgress,
    width: 520,
    height: 64,
  });

  const barChartPng = await renderDiagnosisBarChartImage({
    lastWeekLabel: data.diagnosis.lastWeekLabel,
    thisWeekLabel: data.diagnosis.thisWeekLabel,
    lastWeekValue: data.diagnosis.lastWeekValue,
    thisWeekValue: data.diagnosis.thisWeekValue,
    width: 520,
    height: 265,
  });

  if (useUploads) {
    const uploadFn =
      uploadTarget === "vercel" ? uploadToVercelBlob : uploadPngToNewApi;
    data.trend.progressImageUrl = await uploadFn(
      progressPng,
      options.progressKey,
    );
    data.diagnosis.barChartImageUrl = await uploadFn(
      barChartPng,
      options.barsKey,
    );
    return;
  }

  const toDataUrl = (buffer: Buffer) =>
    `data:image/png;base64,${buffer.toString("base64")}`;
  data.trend.progressImageUrl = toDataUrl(progressPng);
  data.diagnosis.barChartImageUrl = toDataUrl(barChartPng);
}

export async function attachShareAssetsAndLinks(
  data: WeeklyData,
  options: ShareAssetOptions,
) {
  const { uploadTarget = "api", assetBaseUrl } = options;
  const uploadFn =
    uploadTarget === "vercel" ? uploadToVercelBlob : uploadPngToNewApi;

  const trendCardPng = await renderTrendShareCardImage({
    topicTitle: data.trend.topic.replace(/“|”/g, ""),
    topicSubtitle: data.trend.statusText,
    discoveryRank: data.trend.rank ?? 0,
    totalDiscovery: data.trend.totalDiscoverers.toLocaleString(),
    progress: data.hero.trendProgress,
    hashtag: data.trend.startTag,
    hashtagPercent: data.trend.startPercent,
    endTag: data.trend.endTag,
    globalPercent: data.trend.endPercent,
    width: 390,
    height: 693,
    trendType: data.trend.type,
  });

  const statsCardPng = await renderStatsShareCardImage({
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
    contents: data.newContents.slice(0, 3).map((c) => ({
      label: c.label,
      iconUrl: c.stickerUrl,
    })),
    width: 390,
    height: 960,
  });

  const trendCardUrl = await uploadFn(trendCardPng, options.shareTrendKey);
  const statsCardUrl = await uploadFn(statsCardPng, options.shareStatsKey);

  const encodedUid = encodeURIComponent(data.uid);
  const encodedWeekStart = encodeURIComponent(data.weekStart);
  data.trend.shareUrl = `${assetBaseUrl}/share/download?url=${encodeURIComponent(
    trendCardUrl,
  )}&filename=trend-card.png&type=trend_share_card&uid=${encodedUid}&weekStart=${encodedWeekStart}`;
  data.diagnosis.shareUrl = `${assetBaseUrl}/share/download?url=${encodeURIComponent(
    statsCardUrl,
  )}&filename=stats-card.png&type=stats_share_card&uid=${encodedUid}&weekStart=${encodedWeekStart}`;

  if (data.weeklyNudge.linkUrl) {
    data.weeklyNudge.linkUrl = `${assetBaseUrl}/share/redirect?url=${encodeURIComponent(
      data.weeklyNudge.linkUrl,
    )}&type=nudge_invite&uid=${encodedUid}&weekStart=${encodedWeekStart}`;
  }

  if (data.footer?.tiktokUrl) {
    data.footer.tiktokUrl = `${assetBaseUrl}/share/redirect?url=${encodeURIComponent(
      data.footer.tiktokUrl,
    )}&type=footer_tiktok&uid=${encodedUid}&weekStart=${encodedWeekStart}`;
  }
}

export async function renderEmailHtmlFromWeeklyData(data: WeeklyData) {
  return render(<FypScoutReportEmail data={data} />, {
    pretty: true,
  });
}

export async function generateEmailHtml(
  caseKey: string = "curious",
  options?: string | GenerateEmailOptions,
) {
  const resolvedOptions =
    typeof options === "string" ? { uidOverride: options } : (options ?? {});
  const { uidOverride, useUploads = true } = resolvedOptions;
  const data = buildWeeklyDataFromMock(caseKey, assetBaseUrl, uidOverride);

  const assetId = crypto.randomUUID();
  await attachBasicChartAssets(data, {
    useUploads,
    progressKey: `preview/${caseKey}-${assetId}-progress.png`,
    barsKey: `preview/${caseKey}-${assetId}-bars.png`,
  });

  if (useUploads) {
    await attachShareAssetsAndLinks(data, {
      assetBaseUrl,
      shareTrendKey: `preview/${caseKey}-${assetId}-share-trend.png`,
      shareStatsKey: `preview/${caseKey}-${assetId}-share-stats.png`,
    });
  } else {
    data.trend.shareUrl = undefined;
    data.diagnosis.shareUrl = undefined;
  }

  return renderEmailHtmlFromWeeklyData(data);
}
