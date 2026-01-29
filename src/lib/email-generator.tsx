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
  process.env.EMAIL_ASSET_BASE_URL || "http://localhost:3000";

export async function generateEmailHtml(caseKey: string = "curious") {
  const report = mockReports[caseKey] ?? mockReports.curious;
  const data = mapReportToWeeklyData("preview-user", report, {
    assetBaseUrl,
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
    startLabel: data.trend.startTag,
    endLabel: data.trend.endTag,
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
    `preview/${caseKey}-${assetId}-progress.png`
  );

  data.diagnosis.barChartImageUrl = await uploadPngToVercelBlob(
    barChartPng,
    `preview/${caseKey}-${assetId}-bars.png`
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
  });

  data.trend.shareUrl = await uploadPngToVercelBlob(
    trendCardPng,
    `preview/${caseKey}-${assetId}-share-trend.png`
  );

  data.diagnosis.shareUrl = await uploadPngToVercelBlob(
    statsCardPng,
    `preview/${caseKey}-${assetId}-share-stats.png`
  );

  const html = await render(<FypScoutReportEmail data={data} />, {
    pretty: true,
  });

  return html;
}
