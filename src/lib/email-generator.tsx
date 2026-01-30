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
} from "@/lib/satori-assets";
import crypto from "node:crypto";

const assetBaseUrl =
  process.env.EMAIL_ASSET_BASE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

type GenerateEmailOptions = {
  uidOverride?: string;
  useUploads?: boolean;
};

export async function generateEmailHtml(
  caseKey: string = "curious",
  options?: string | GenerateEmailOptions,
) {
  const resolvedOptions =
    typeof options === "string" ? { uidOverride: options } : (options ?? {});
  const { uidOverride, useUploads = true } = resolvedOptions;
  const apiReport = mockReports[caseKey] ?? mockReports.curious;
  const report = mapApiReportToWeeklyReportData(apiReport);
  const resolvedUid = uidOverride || apiReport.app_user_id || "preview";
  const data = mapReportToWeeklyData(resolvedUid, report, {
    assetBaseUrl,
    trackingBaseUrl: assetBaseUrl,
  });

  const assetId = crypto.randomUUID();
  const contentIcons = data.newContents
    .slice(0, 3)
    .map((content) => content.stickerUrl);
  const contentLabels = data.newContents
    .slice(0, 3)
    .map((content) => content.label);
  while (contentIcons.length < 3) contentIcons.push("");
  while (contentLabels.length < 3) contentLabels.push("");

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
    data.trend.progressImageUrl = await uploadPngToNewApi(
      progressPng,
      `preview/${caseKey}-${assetId}-progress.png`,
    );

    data.diagnosis.barChartImageUrl = await uploadPngToNewApi(
      barChartPng,
      `preview/${caseKey}-${assetId}-bars.png`,
    );

    const trendCardPng = await renderTrendShareCardImage({
      topicTitle: data.trend.topic.replace(/“|”/g, ""),
      topicSubtitle: data.trend.statusText,
      discoveryRank: data.trend.rank ?? 0,
      totalDiscovery: data.trend.totalDiscoverers.toLocaleString(),
      progress: data.hero.trendProgress,
      hashtag: data.trend.startTag,
      hashtagPercent: data.trend.startPercent,
      globalPercent: data.trend.endPercent,
      width: 390,
      height: 693,
      trendType: data.trend.type,
    });

    const statsCardPng = await renderStatsShareCardImage({
      totalVideos: data.diagnosis.totalVideosValue,
      totalTime: `${data.diagnosis.totalTimeValue} ${data.diagnosis.totalTimeUnit}`,
      miles: `${data.diagnosis.miles}`,
      barChartData: {
        lastWeekLabel: data.diagnosis.lastWeekLabel,
        thisWeekLabel: data.diagnosis.thisWeekLabel,
        lastWeekValue: data.diagnosis.lastWeekValue,
        thisWeekValue: data.diagnosis.thisWeekValue,
      },
      contentLabels,
      width: 390,
      height: 980,
    });

    const trendCardUrl = await uploadPngToNewApi(
      trendCardPng,
      `preview/${caseKey}-${assetId}-share-trend.png`,
    );
    const encodedUid = encodeURIComponent(data.uid);
    const encodedWeekStart = encodeURIComponent(data.weekStart);
    data.trend.shareUrl = `${assetBaseUrl}/share/download?url=${encodeURIComponent(
      trendCardUrl,
    )}&filename=trend-card.png&type=trend_share_card&uid=${encodedUid}&weekStart=${encodedWeekStart}`;

    const statsCardUrl = await uploadPngToNewApi(
      statsCardPng,
      `preview/${caseKey}-${assetId}-share-stats.png`,
    );
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
  } else {
    const toDataUrl = (buffer: Buffer) =>
      `data:image/png;base64,${buffer.toString("base64")}`;
    data.trend.progressImageUrl = toDataUrl(progressPng);
    data.diagnosis.barChartImageUrl = toDataUrl(barChartPng);
    data.trend.shareUrl = undefined;
    data.diagnosis.shareUrl = undefined;
  }

  const html = await render(<FypScoutReportEmail data={data} />, {
    pretty: true,
  });

  return html;
}
