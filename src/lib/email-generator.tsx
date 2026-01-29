import { render } from "@react-email/render";
import { FypScoutReportEmail } from "../../emails/fyp-scout-report";
import { mapReportToWeeklyData } from "@/domain/report/adapter";
import { mockReports } from "@/domain/report/mock";
import {
  renderDiagnosisBarChartImage,
  renderTrendProgressImage,
  renderTrendShareCardImage,
  renderStatsShareCardImage,
  uploadPngToVercelBlob,
} from "@/lib/satori-assets";
import crypto from "node:crypto";

const assetBaseUrl =
  process.env.EMAIL_ASSET_BASE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export async function generateEmailHtml(caseKey: string = "curious") {
  const report = mockReports[caseKey] ?? mockReports.curious;
  const data = mapReportToWeeklyData("preview-user", report, {
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

  data.trend.progressImageUrl = await uploadPngToVercelBlob(
    progressPng,
    `preview/${caseKey}-${assetId}-progress.png`,
  );

  data.diagnosis.barChartImageUrl = await uploadPngToVercelBlob(
    barChartPng,
    `preview/${caseKey}-${assetId}-bars.png`,
  );

  // Generate and Upload Share Cards
  const trendCardPng = await renderTrendShareCardImage({
    topicTitle: data.trend.topic.replace(/“|”/g, ""), // Remove quotes if added by adapter
    topicSubtitle: data.trend.statusText,
    discoveryRank: data.trend.rank ?? 0,
    totalDiscovery: data.trend.totalDiscoverers.toLocaleString(),
    progress: data.hero.trendProgress,
    hashtag: data.trend.startTag,
    hashtagPercent: data.trend.startPercent,
    globalPercent: data.trend.endPercent,
    width: 390,
    height: 693,
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

  const trendCardUrl = await uploadPngToVercelBlob(
    trendCardPng,
    `preview/${caseKey}-${assetId}-share-trend.png`,
  );
  const encodedUid = encodeURIComponent(data.uid);
  const encodedWeekStart = encodeURIComponent(data.weekStart);
  data.trend.shareUrl = `${assetBaseUrl}/share/download?url=${encodeURIComponent(
    trendCardUrl,
  )}&filename=trend-card.png&type=trend_share_card&uid=${encodedUid}&weekStart=${encodedWeekStart}`;

  const statsCardUrl = await uploadPngToVercelBlob(
    statsCardPng,
    `preview/${caseKey}-${assetId}-share-stats.png`,
  );
  data.diagnosis.shareUrl = `${assetBaseUrl}/share/download?url=${encodeURIComponent(
    statsCardUrl,
  )}&filename=stats-card.png&type=stats_share_card&uid=${encodedUid}&weekStart=${encodedWeekStart}`;

  // Update Nudge and Footer URLs with tracking redirect
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

  const html = await render(<FypScoutReportEmail data={data} />, {
    pretty: true,
  });

  return html;
}
