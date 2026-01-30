import type {
  WeeklyReportApiResponse,
  WeeklyReportData,
  TrendStatus,
} from "@/domain/report/types";
import {
  FEEDLING_COPY_MAP,
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
  trackingBaseUrl: string;
}

function formatWeekRange(
  periodStart?: string | null,
  periodEnd?: string | null,
) {
  const startDate = periodStart ? new Date(periodStart) : null;
  const endDate = periodEnd ? new Date(periodEnd) : null;
  const isValidDate = (date: Date | null) =>
    Boolean(date && !Number.isNaN(date.getTime()));
  const formatDate = (date: Date, includeYear: boolean) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: includeYear ? "numeric" : undefined,
    });
  if (isValidDate(startDate) && isValidDate(endDate)) {
    const includeStartYear =
      startDate!.getFullYear() !== endDate!.getFullYear();
    return `${formatDate(startDate!, includeStartYear)} - ${formatDate(
      endDate!,
      true,
    )}`;
  }
  if (isValidDate(startDate)) {
    return formatDate(startDate!, true);
  }
  return "—";
}

function normalizeTrendStatus(value?: string | null): TrendStatus {
  if (
    value === "spreading" ||
    value === "going_mainstream" ||
    value === "almost_everywhere" ||
    value === "everywhere"
  ) {
    return value;
  }
  return "spreading";
}

export function mapApiReportToWeeklyReportData(
  report: WeeklyReportApiResponse,
): WeeklyReportData {
  // 重要逻辑：统一后端原始字段的格式与缺省值，保证模板渲染不缺关键字段
  return {
    weekRange: formatWeekRange(report.period_start, report.period_end),
    periodStart: report.period_start ?? undefined,
    periodEnd: report.period_end ?? undefined,
    user: {
      name: report.app_user_id || "Guest",
    },
    feedling: {
      state: report.feeding_state ?? "curious",
    },
    trend: {
      name: report.trend_name ?? "Unknown",
      rank: report.discovery_rank ?? null,
      totalDiscoverers: report.total_discoverers ?? 0,
      origin: report.origin_niche_text ?? "",
      currentSpread: normalizeTrendStatus(report.spread_end_text),
      penetrationStart: report.reach_start ?? 0,
      penetrationEnd: report.reach_end ?? 0,
      type: report.trend_type ?? undefined,
      currentReach: report.current_reach ?? undefined,
      endText: report.spread_end_text ?? undefined,
    },
    stats: {
      totalVideos: report.total_videos ?? 0,
      totalTimeMinutes: report.total_time ?? 0,
      lastWeekTimeMinutes: report.pre_total_time ?? 0,
      lateNightPercentage: 0,
      milesScrolled: report.miles_scrolled ?? 0,
    },
    newTopics:
      report.topics?.map((item) => ({
        topic: item.topic,
        picUrl: item.pic_url,
      })) ?? [],
    timezone: report.timezone ?? undefined,
    rabbitHole: {
      hasRabbitHole:
        Boolean(report.rabbit_hole_datetime) ||
        (report.rabbit_hole_count ?? 0) > 0,
      datetime: report.rabbit_hole_datetime ?? undefined,
      day: report.rabbit_hole_date ?? undefined,
      time: report.rabbit_hole_time ?? undefined,
      count: report.rabbit_hole_count ?? undefined,
      category: report.rabbit_hole_category ?? undefined,
    },
    nudge: {
      type: "default",
      text: report.nudge_text ?? undefined,
    },
  };
}

export function mapReportToWeeklyData(
  uid: string,
  report: WeeklyReportData,
  options: AdapterOptions,
): WeeklyData {
  const assetBaseUrl = options.assetBaseUrl;
  const feedlingState = report.feedling.state || calculateFeedlingState(report);
  const nudgeType = report.nudge.type || determineNudgeType(report);

  // 重要逻辑：开场文案根据 feedlingState 拆分为 title/subtitle，便于高亮关键短语
  const openingCopy =
    FEEDLING_COPY_MAP[feedlingState] ?? FEEDLING_COPY_MAP.curious;
  const opening: WeeklyOpening = {
    title:
      openingCopy.split(" a lot of ")[0].trim() || "This week you explored",
    subtitle: openingCopy.replace("This week you explored", "").trim(),
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
    endTag: report.trend.endText || "Everywhere",
    endPercent: `${report.trend.penetrationEnd}%`,
    type: report.trend.type,
    ctaLabel: "Share My Week",
    ctaIconUrl: "", // Unused in new template
  };

  const thisWeekVal = report.stats.totalTimeMinutes;
  const lastWeekVal = report.stats.lastWeekTimeMinutes;

  // 重要逻辑：诊断文案拆分为差值与描述，方便模板高亮对比数据
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
    .map((topicItem, index) => ({
      label: topicItem.topic,
      stickerUrl:
        topicItem.picUrl ||
        `${assetBaseUrl}/figma/content-sticker-${index + 1}.png`,
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
    title: report.nudge.text || "👍🏻 Weekly Nudge 👍🏻",
    message: "Invite 1 friend to unlock next week",
    ctaLabel: "Share your invite link",
    linkUrl: "https://feedling.app/nudge-invite", // Placeholder
  };

  return {
    uid,
    weekStart: report.weekRange.split(" - ")[0],
    weekEnd: report.weekRange.split(" - ")[1] || report.weekRange,
    trackingBaseUrl: options.trackingBaseUrl,
    feedlingState,
    hero: {
      imageUrl: `${assetBaseUrl}/figma/opening-cat.png`,
      imageAlt: "Feedling Cat",
      trendProgress: calculateTrendProgress(
        report.trend.penetrationStart,
        report.trend.penetrationEnd,
        report.trend.currentReach,
      ),
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

function calculateTrendProgress(
  start: number,
  end: number,
  current?: number,
): number {
  if (current === undefined || current === null) return 0;
  const range = end - start;
  if (range <= 0) return 0;
  const raw = ((current - start) / range) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
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
