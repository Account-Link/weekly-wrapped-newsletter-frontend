import { render } from "@react-email/render";
import { FypScoutReportEmail } from "../../emails/fyp-scout-report";
import { mapReportToWeeklyData } from "@/domain/report/adapter";
import { mockReports } from "@/domain/report/mock";
import {
  renderDiagnosisBarChartImage,
  renderTrendProgressImage,
  renderTrendShareCardImage,
  renderStatsShareCardImage,
  uploadPngToVercelBlob
} from "@/lib/satori-assets";
import { TrendShareCard } from "@/components/satori/TrendShareCard";
import { StatsShareCard } from "@/components/satori/StatsShareCard";
import crypto from "node:crypto";

const assetBaseUrl =
  process.env.EMAIL_ASSET_BASE_URL || "http://localhost:3000";

export default async function EmailPreviewPage({
  searchParams
}: {
  params?: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const caseKey =
    typeof resolvedSearchParams.case === "string" ? resolvedSearchParams.case : "curious";
  const report = mockReports[caseKey] ?? mockReports.curious;
  const data = mapReportToWeeklyData("preview-user", report, {
    assetBaseUrl
  });

  const assetId = crypto.randomUUID();
  const contentIcons = data.newContents.slice(0, 3).map((content) => content.stickerUrl);
  const contentLabels = data.newContents.slice(0, 3).map((content) => content.label);
  while (contentIcons.length < 3) contentIcons.push("");
  while (contentLabels.length < 3) contentLabels.push("");
  const progressPng = await renderTrendProgressImage({
    progress: data.hero.trendProgress,
    startLabel: data.trend.startTag,
    endLabel: data.trend.endTag,
    width: 520,
    height: 64
  });
  const barChartPng = await renderDiagnosisBarChartImage({
    lastWeekLabel: data.diagnosis.lastWeekLabel,
    thisWeekLabel: data.diagnosis.thisWeekLabel,
    lastWeekValue: data.diagnosis.lastWeekValue,
    thisWeekValue: data.diagnosis.thisWeekValue,
    width: 300,
    height: 140
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

  // 重要逻辑：服务端渲染邮件 HTML 供本地预览
  const html = await render(<FypScoutReportEmail data={data} />, {
    pretty: true
  });
  const sidebarCardStyle = {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    padding: 12
  };
  const debugScale = 0.6;
  const debugWidth = 600;
  const debugHeight = 1000;

  return (
    <main style={{ margin: 0, padding: 16, background: "#F3F4F6", display: "grid", gridTemplateColumns: "minmax(0, 1fr) 520px", gap: 24, alignItems: "start" }}>
      <div style={{ minWidth: 0 }}>
        <h2 style={{fontSize: 20, marginBottom: 10}}>Email Preview</h2>
        <iframe
          title="FYP Scout Email Preview"
          srcDoc={html}
          style={{
            width: "100%",
            height: "100vh",
            border: "none",
            background: "#FFFFFF"
          }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{fontSize: 20, marginBottom: 4}}>Generated Share Cards</h2>
        <div style={sidebarCardStyle}>
          <h3 style={{fontSize: 16, marginBottom: 8}}>Trend Share Card</h3>
          <img src={data.trend.shareUrl} style={{width: "100%", border: "1px solid #E5E7EB", borderRadius: 8}} />
          <a href={data.trend.shareUrl} target="_blank" style={{display: "block", marginTop: 8, fontSize: 12}}>Open Original</a>
        </div>

        <div style={sidebarCardStyle}>
          <h3 style={{fontSize: 16, marginBottom: 8}}>Stats Share Card</h3>
          <img src={data.diagnosis.shareUrl} style={{width: "100%", border: "1px solid #E5E7EB", borderRadius: 8}} />
          <a href={data.diagnosis.shareUrl} target="_blank" style={{display: "block", marginTop: 8, fontSize: 12}}>Open Original</a>
        </div>

        <div style={sidebarCardStyle}>
          <h3 style={{fontSize: 16, marginBottom: 12}}>HTML Debug</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ width: debugWidth * debugScale, height: debugHeight * debugScale, overflow: "hidden", border: "1px solid #E5E7EB", borderRadius: 8, background: "#ECECEC" }}>
              <div style={{ width: debugWidth, height: debugHeight, transform: `scale(${debugScale})`, transformOrigin: "top left" }}>
                <TrendShareCard
                  topicIconData={data.trend.stickerUrl}
                  topicTitle={data.trend.topic.replace(/“|”/g, "")}
                  topicSubtitle={data.trend.statusText}
                  discoveryRank={data.trend.rank ?? 0}
                  totalDiscovery={data.trend.totalDiscoverers.toLocaleString()}
                  progress={data.hero.trendProgress}
                  fireIconData={`${assetBaseUrl}/figma/fire.png`}
                  hashtag={data.trend.startTag}
                  hashtagPercent={data.trend.startPercent}
                  globalPercent={data.trend.endPercent}
                  footerDecorData={`${assetBaseUrl}/figma/footer-decors.png`}
                />
              </div>
            </div>
            <div style={{ width: debugWidth * debugScale, height: debugHeight * debugScale, overflow: "hidden", border: "1px solid #E5E7EB", borderRadius: 8, background: "#000000" }}>
              <div style={{ width: debugWidth, height: debugHeight, transform: `scale(${debugScale})`, transformOrigin: "top left" }}>
                <StatsShareCard
                  headerIconData={`${assetBaseUrl}/figma/feedling-icon.png`}
                  totalVideos={data.diagnosis.totalVideosValue}
                  totalTime={`${data.diagnosis.totalTimeValue} ${data.diagnosis.totalTimeUnit}`}
                  runIconData={`${assetBaseUrl}/figma/download-icon_black.png`}
                  miles={`${data.diagnosis.miles}`}
                  barChartData={{
                    lastWeekLabel: data.diagnosis.lastWeekLabel,
                    thisWeekLabel: data.diagnosis.thisWeekLabel,
                    lastWeekValue: data.diagnosis.lastWeekValue,
                    thisWeekValue: data.diagnosis.thisWeekValue,
                  }}
                  contentIcons={contentIcons}
                  contentLabels={contentLabels}
                  footerDecorData={`${assetBaseUrl}/figma/torn-paper-bottom-grey.png`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
