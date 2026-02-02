// 文件功能：将后端周报数据映射为邮件渲染数据，处于数据适配阶段
// 方法概览：API 数据规范化、视图字段构建、周报数据汇总
import type {
  WeeklyReportApiResponse,
  WeeklyReportData,
} from "@/domain/report/types";
import {
  FEEDLING_COPY_MAP,
  getDiscoveryText,
  getMilesScrolledText,
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
import { calculateFeedlingState } from "@/domain/report/utils";

// 方法功能：适配器配置入参定义
export interface AdapterOptions {
  assetBaseUrl: string;
  trackingBaseUrl: string;
}

// 方法功能：格式化周起止日期为展示字符串
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
      currentSpread: report.spread_end_text ?? "",
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

// 方法功能：构建开场模块数据
function buildOpening(
  feedlingState: WeeklyReportData["feedling"]["state"],
  report: WeeklyReportData,
): WeeklyOpening {
  // 重要逻辑：开场文案根据 feedlingState 拆分为 title/subtitle，便于高亮关键短语
  const openingCopy =
    FEEDLING_COPY_MAP[feedlingState] ?? FEEDLING_COPY_MAP.curious;
  return {
    title:
      openingCopy.split(" a lot of ")[0].trim() || "This week you explored",
    subtitle: openingCopy.replace("This week you explored", "").trim(),
    dateRange: report.weekRange,
  };
}

// 方法功能：构建趋势模块数据
function buildTrend(report: WeeklyReportData): WeeklyTrend {
  return {
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
    trendProgress: calculateTrendProgress(
      report.trend.penetrationStart,
      report.trend.penetrationEnd,
      report.trend.currentReach,
    ),
    type: report.trend.type,
    ctaLabel: "Share My Week",
  };
}

// 方法功能：构建诊断模块数据
function buildDiagnosis(report: WeeklyReportData): WeeklyDiagnosis {
  const thisWeekVal = report.stats.totalTimeMinutes;
  const lastWeekVal = report.stats.lastWeekTimeMinutes;

  // 重要逻辑：诊断文案拆分为差值与描述，方便模板高亮对比数据
  const comparisonFull = getTimeComparisonText(
    report.stats.totalTimeMinutes,
    report.stats.lastWeekTimeMinutes,
  );
  const timeMatch = comparisonFull.match(/^(\d+h \d+min)/);
  const comparisonDiff = timeMatch ? timeMatch[0] : null;
  const comparisonText = comparisonDiff
    ? comparisonFull.replace(comparisonDiff, "").trim()
    : comparisonFull;

  const milesFull = getMilesScrolledText(report.stats.milesScrolled);
  const milesComment = milesFull.split("miles")[1] || "";

  const { totalTimeValue, totalTimeUnit } = formatTotalTimeDisplay(
    report.stats.totalTimeMinutes,
  );

  return {
    title: "This week you watched",
    totalVideosValue: report.stats.totalVideos.toLocaleString(),
    totalVideosUnit: "Videos",
    totalTimeValue,
    totalTimeUnit,
    comparisonDiff,
    comparisonText: `${comparisonText} 👍`,
    miles: report.stats.milesScrolled,
    milesComment,
    thisWeekLabel: "This Week",
    lastWeekLabel: "Last Week",
    thisWeekValue: thisWeekVal,
    lastWeekValue: lastWeekVal,
  };
}

// 方法功能：构建本周新内容模块数据
function buildNewContents(
  report: WeeklyReportData,
  assetBaseUrl: string,
): WeeklyNewContent[] {
  return report.newTopics.slice(0, 3).map((topicItem, index) => ({
    label: topicItem.topic,
    stickerUrl:
      topicItem.picUrl ||
      `${assetBaseUrl}/figma/content-sticker-${index + 1}.png`,
  }));
}

// 方法功能：构建 rabbit hole 模块数据
function buildRabbitHole(
  report: WeeklyReportData,
  assetBaseUrl: string,
): WeeklyRabbitHole {
  return {
    timeLabel: report.rabbitHole.time
      ? `${report.rabbitHole.day} ${report.rabbitHole.time}`
      : "—",
    description: report.rabbitHole.category
      ? `You watched ${report.rabbitHole.count ?? 0} videos of ${report.rabbitHole.category}.`
      : "You went down a rabbit hole.",
    imageUrl: `${assetBaseUrl}/figma/cat-gif.png`,
  };
}

// 方法功能：构建 nudge 模块数据
function buildWeeklyNudge(report: WeeklyReportData): WeeklyNudge {
  return {
    title: report.nudge.text || "👍🏻 Weekly Nudge 👍🏻",
    message: "Invite 1 friend to unlock next week",
    ctaLabel: "Share your invite link",
    linkUrl: "https://feedling.app/nudge-invite",
  };
}

export function mapReportToWeeklyData(
  uid: string,
  report: WeeklyReportData,
  options: AdapterOptions,
): WeeklyData {
  // 重要逻辑：统一资产与追踪入口，保证后续渲染可直接使用
  const assetBaseUrl = options.assetBaseUrl;
  const feedlingState = report.feedling.state || calculateFeedlingState(report);
  const opening = buildOpening(feedlingState, report);
  const trend = buildTrend(report);
  const diagnosis = buildDiagnosis(report);
  const newContents = buildNewContents(report, assetBaseUrl);
  const rabbitHole = buildRabbitHole(report, assetBaseUrl);
  const weeklyNudge = buildWeeklyNudge(report);

  return {
    uid,
    assetBaseUrl,
    weekStart: report.weekRange.split(" - ")[0],
    weekEnd: report.weekRange.split(" - ")[1] || report.weekRange,
    trackingBaseUrl: options.trackingBaseUrl,
    feedlingState,
    opening,
    trend,
    diagnosis,
    newContents,
    rabbitHole,
    weeklyNudge,
    footer: {
      tiktokUrl: "https://tiktok.com/@feedling",
    },
  };
}

// 方法功能：将分钟格式化为小时分钟字符串
function formatTotalTimeDisplay(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) {
    // 重要逻辑：分钟为 0 时将小时作为单位，保持数值与单位留空格
    return { totalTimeValue: `${hours}`, totalTimeUnit: "h" };
  }
  return { totalTimeValue: `${hours} h ${minutes}`, totalTimeUnit: "min" };
}

// 方法功能：计算趋势进度百分比
function calculateTrendProgress(
  start: number,
  end: number,
  current?: number,
): number {
  // 重要逻辑：确保范围合法并限制在 0-100
  if (current === undefined || current === null) return 0;
  const range = end - start;
  if (range <= 0) return 0;
  const raw = ((current - start) / range) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}
