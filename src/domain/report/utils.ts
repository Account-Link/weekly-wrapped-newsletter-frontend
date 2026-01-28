/**
 * utils.ts
 * 核心业务逻辑辅助函数 (Priority Logic & Helpers)
 */

import {
  WeeklyReportData,
  FeedlingState,
  NudgeType,
} from "@/domain/report/types";

// ==========================================
// 1. Feedling 状态优先级计算 [Source: PRD Feedling State Priority]
// ==========================================
// 逻辑：如果满足多个条件，返回优先级最高的那个 (Priority 1 is highest)
export function calculateFeedlingState(data: WeeklyReportData): FeedlingState {
  const { trend, stats, newTopics, rabbitHole } = data;

  // 阈值配置（可根据 PRD 调整）
  const DIVERSITY_THRESHOLD = 60;
  const NEW_TOPICS_THRESHOLD = 3;
  const MILES_SLEEPY_THRESHOLD = 26;
  const DEEP_RABBIT_HOLE_COUNT = 100;

  // 预处理数据
  const isEarlyDiscoverer =
    trend.rank !== null && trend.rank <= trend.totalDiscoverers * 0.4;
  const diversityScore = stats.contentDiversityScore ?? 0;
  const brainrotPct = stats.brainrotPercentage ?? 0;
  const timeDecreased = stats.totalTimeMinutes < stats.lastWeekTimeMinutes;
  const isDeepRabbitHole = (rabbitHole.count ?? 0) > DEEP_RABBIT_HOLE_COUNT;

  // Priority 1: Excited (用户发现了早期趋势)
  if (isEarlyDiscoverer) {
    return "excited";
  }

  // Priority 2: Curious (内容多样性 > 阈值 或 发现了 N 个以上新话题)
  if (diversityScore > DIVERSITY_THRESHOLD || newTopics.length >= NEW_TOPICS_THRESHOLD) {
    return "curious";
  }

  // Priority 3: Cozy (屏幕时间减少 且 没有深度兔子洞)
  if (timeDecreased && !isDeepRabbitHole) {
    return "cozy";
  }

  // Priority 4: Sleepy (深度兔子洞 或 滑动距离 > 阈值)
  if (isDeepRabbitHole || stats.milesScrolled > MILES_SLEEPY_THRESHOLD) {
    return "sleepy";
  }

  // Priority 5: Dizzy (脑残内容占比 > 20%)
  if (brainrotPct > 20) {
    return "dizzy";
  }

  // Fallback (如果都不满足，默认为 cozy)
  return "cozy";
}

// ==========================================
// 2. Nudge 类型优先级计算 [Source: PRD Nudge Selection]
// ==========================================
export function determineNudgeType(data: WeeklyReportData): NudgeType {
  const { stats, rabbitHole } = data;

  // 阈值配置
  const BRAINROT_THRESHOLD = 25;
  const TIME_INCREASE_THRESHOLD = 30;
  const LATE_NIGHT_THRESHOLD = 40;
  const HIGH_MILES_THRESHOLD = 26;
  const DEEP_RABBIT_HOLE_COUNT = 100;

  // 预处理
  const rabbitHoleCount = rabbitHole.count ?? 0;
  const brainrotPct = stats.brainrotPercentage ?? 0;
  const lastWeek = stats.lastWeekTimeMinutes > 0 ? stats.lastWeekTimeMinutes : 1;
  const timeIncreasePct =
    ((stats.totalTimeMinutes - lastWeek) / lastWeek) * 100;

  // Priority 1: Deep Rabbit Hole (最长连续观看 > 100 视频)
  if (rabbitHoleCount > DEEP_RABBIT_HOLE_COUNT) {
    return "rabbit_hole";
  }

  // Priority 2: Late Night (深夜比例大 且 Miles 高)
  if (stats.milesScrolled > HIGH_MILES_THRESHOLD && stats.lateNightPercentage > LATE_NIGHT_THRESHOLD) {
    return "late_night";
  }

  // Priority 3: High Brainrot (脑残内容 > 阈值)
  if (brainrotPct > BRAINROT_THRESHOLD) {
    return "brainrot";
  }

  // Priority 4: Time Increased (时间增长 > 阈值)
  if (timeIncreasePct > TIME_INCREASE_THRESHOLD) {
    return "time_increase";
  }

  // Priority 5: Default
  return "default";
}
