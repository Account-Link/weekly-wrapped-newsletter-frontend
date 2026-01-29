import type { WeeklyReportData } from "@/domain/report/types";
import {
  FEEDLING_COPY_MAP,
  SPREAD_VISUAL_MAP,
  getDiscoveryText,
  getMilesScrolledText,
  getNudgeCopy,
  getTimeComparisonText,
} from "@/domain/report/logic-map";
import type {
  WeeklyData,
  WeeklyDiagnosis,
  WeeklyNewContent,
  WeeklyOpening,
  WeeklyRabbitHole,
  WeeklyTrend,
  WeeklyNudge,
} from "@/lib/firebase-admin";
import {
  calculateFeedlingState,
  determineNudgeType,
} from "@/domain/report/utils";

export interface AdapterOptions {
  assetBaseUrl: string;
}

export function mapReportToWeeklyData(
  uid: string,
  report: WeeklyReportData,
  options: AdapterOptions,
): WeeklyData {
  const assetBaseUrl = options.assetBaseUrl;
  const feedlingState = report.feedling.state || calculateFeedlingState(report);
  const nudgeType = report.nudge.type || determineNudgeType(report);

  // 重要逻辑：根据趋势阶段生成扩散文案
  const spreadVisual = SPREAD_VISUAL_MAP[report.trend.currentSpread];

  const opening: WeeklyOpening = {
    title:
      FEEDLING_COPY_MAP[feedlingState].split(" a lot of ")[0].trim() ||
      "This week you explored",
    subtitle: FEEDLING_COPY_MAP[feedlingState]
      .replace("This week you explored", "")
      .trim(),
    dateRange: report.weekRange,
    decorUrl: "", // Unused in new template
    catUrl: `${assetBaseUrl}/figma/opening-cat.png`,
  };

  const trend: WeeklyTrend = {
    stickerUrl: `${assetBaseUrl}/figma/topic-sticker-sound.png`,
    topic: `“${report.trend.name}”`,
    statusText: "blew up this week",
    discoveryText: getDiscoveryText(
      report.trend.rank,
      report.trend.totalDiscoverers,
    ),
    rank: report.trend.rank,
    totalDiscoverers: report.trend.totalDiscoverers,
    startTag: report.trend.origin,
    startPercent: `${report.trend.penetrationStart}%`,
    endTag: spreadVisual.split("→")[1]?.trim() ? "Everywhere" : "Everywhere",
    endPercent: `${report.trend.penetrationEnd}%`,
    ctaLabel: "Share My Week",
    ctaIconUrl: "", // Unused in new template
  };

  const thisWeekVal = report.stats.totalTimeMinutes;
  const lastWeekVal = report.stats.lastWeekTimeMinutes;

  // Split Diagnosis Logic
  const comparisonFull = getTimeComparisonText(
    report.stats.totalTimeMinutes,
    report.stats.lastWeekTimeMinutes,
  );
  // Attempt to extract time part (e.g. "2h 35min")
  const timeMatch = comparisonFull.match(/^(\d+h \d+min)/);
  const comparisonDiff = timeMatch ? timeMatch[0] : null;
  const comparisonText = comparisonDiff
    ? comparisonFull.replace(comparisonDiff, "").trim()
    : comparisonFull;

  const milesFull = getMilesScrolledText(report.stats.milesScrolled);
  const milesComment = milesFull.split("miles")[1] || "";

  const diagnosis: WeeklyDiagnosis = {
    title: "This week you watched",
    totalVideosValue: report.stats.totalVideos.toLocaleString(),
    totalVideosUnit: "Videos",
    totalTimeValue: formatMinutes(report.stats.totalTimeMinutes)
      .replace("min", "")
      .trim(), // "19 h 14"
    totalTimeUnit: "min",
    comparisonDiff,
    comparisonText: `${comparisonText} 👍`,
    miles: report.stats.milesScrolled,
    milesComment,
    thisWeekLabel: "This Week",
    lastWeekLabel: "Last Week",
    thisWeekValue: thisWeekVal,
    lastWeekValue: lastWeekVal,
  };

  const newContents: WeeklyNewContent[] = report.newTopics
    .slice(0, 3)
    .map((label, index) => ({
      label,
      stickerUrl: `${assetBaseUrl}/figma/content-sticker-${index + 1}.png`,
    }));

  const rabbitHole: WeeklyRabbitHole = {
    timeLabel: report.rabbitHole.time
      ? `${report.rabbitHole.day} ${report.rabbitHole.time}`
      : "—",
    description: report.rabbitHole.category
      ? `You watched ${report.rabbitHole.count ?? 0} videos of ${report.rabbitHole.category}.`
      : "You went down a rabbit hole.",
    imageUrl: `${assetBaseUrl}/figma/cat-gif.png`,
  };

  const weeklyNudge: WeeklyNudge = {
    title: "👍🏻 Weekly Nudge 👍🏻",
    message: getNudgeCopy(nudgeType, report.nudge.limitTime),
    ctaLabel: "Share My Scroll Stats",
    linkUrl: "https://feedling.app/nudge-invite", // Placeholder
  };

  return {
    uid,
    weekStart: report.weekRange.split(" - ")[0],
    weekEnd: report.weekRange.split(" - ")[1] || report.weekRange,
    hero: {
      imageUrl: `${assetBaseUrl}/figma/opening-cat.png`,
      imageAlt: "Feedling Cat",
      trendProgress: Math.round(report.trend.penetrationEnd),
    },
    opening,
    trend,
    diagnosis,
    newContents,
    rabbitHole,
    weeklyNudge,
    stats: [
      {
        label: "Total Videos",
        value: report.stats.totalVideos.toLocaleString(),
      },
      {
        label: "Total Time",
        value: formatMinutes(report.stats.totalTimeMinutes),
      },
      { label: "Miles", value: `${report.stats.milesScrolled}` },
      { label: "Late Night", value: `${report.stats.lateNightPercentage}%` },
    ],
    footer: {
      tiktokUrl: "https://tiktok.com/@feedling",
    },
  };
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} h ${m} min`;
}

function mapToPercent(current: number, lastWeek: number): number {
  if (lastWeek <= 0) return 50;
  const ratio = (current / lastWeek) * 100;
  return Math.max(10, Math.min(100, Math.round(ratio)));
}

function buildDeltaNote(report: WeeklyReportData): string {
  const comparison = getTimeComparisonText(
    report.stats.totalTimeMinutes,
    report.stats.lastWeekTimeMinutes,
  );
  const milesText = getMilesScrolledText(report.stats.milesScrolled);
  return `${comparison} 👍 ${milesText}`;
}
