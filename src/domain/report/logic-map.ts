/**
 * logic-maps.ts
 * 负责将数据状态映射为前端展示的文案 (Copy Mapping)
 */

import { FeedlingState, TrendStatus } from "@/domain/report/types";

// ==========================================
// A. Feedling 状态文案映射 [Source: PRD Feedling Status Copy]
// ==========================================
export const FEEDLING_COPY_MAP: Record<FeedlingState, string> = {
  curious: "This week you explored a lot of new corners in TikTok.",
  excited: "Your trend instincts paid off this week.",
  cozy: "You had a balanced week on TikTok.",
  sleepy: "You spent a lot of late nights scrolling this week.",
  dizzy: "Your feed got a little chaotic this week.",
};

// ==========================================
// B. 趋势扩散进度条文案 [Source: PRD Spread Progress Variants]
// ==========================================
export const SPREAD_VISUAL_MAP: Record<TrendStatus, string> = {
  spreading: "0.2% → 4%",
  going_mainstream: "0.2% → 8%",
  almost_everywhere: "0.2% → 10%",
  everywhere: "0.2% → 12%",
};

// ==========================================
// C. 发现排名文案生成逻辑 [Source: PRD Discovery Variants]
// ==========================================
export function getDiscoveryText(rank: number | null, total: number): string {
  // Case 1: 未发现 (Not Exposed)
  if (rank === null) {
    return "This blew up but your feed missed it. Your taste might be more niche than you think.";
  }

  // 计算前 40% 的阈值
  const earlyThreshold = Math.floor(total * 0.4);

  // Case 2: 早期发现者 (Early Discoverer - Top 40%)
  if (rank <= earlyThreshold) {
    return `You were #${rank.toLocaleString()} to discover out of ${total.toLocaleString()} people.`;
  }

  // Case 3: 晚期发现者 (Late Discoverer - Bottom 60%)
  return `You joined at #${rank.toLocaleString()} out of ${total.toLocaleString()} people. Fashionably late.`;
}

// ==========================================
// D. 时长对比文案生成逻辑 [Source: PRD Time Comparison Variants]
// ==========================================
export function getTimeComparisonText(
  currentMinutes: number,
  lastWeekMinutes: number
): string {
  // 重要逻辑：避免除 0
  if (lastWeekMinutes <= 0) {
    return "No baseline from last week";
  }
  const diff = currentMinutes - lastWeekMinutes;
  const percentage = (diff / lastWeekMinutes) * 100;

  // 辅助函数：将分钟转换为 "Xh Xmin" 格式
  const formatTime = (mins: number) => {
    const h = Math.floor(Math.abs(mins) / 60);
    const m = Math.floor(Math.abs(mins) % 60);
    return `${h}h ${m}min`;
  };

  // 逻辑判断
  if (percentage < -5) {
    return `${formatTime(diff)} less than last week`; // 下降超过 5%
  }
  if (percentage >= -5 && percentage < -2) {
    return "Slightly less than last week"; // 下降 2-5%
  }
  if (percentage >= -2 && percentage <= 2) {
    return "About the same as last week"; // 波动 2% 以内
  }
  if (percentage > 2 && percentage <= 5) {
    return "A bit more than last week"; // 上升 2-5%
  }

  return `${formatTime(diff)} more than last week`; // 上升超过 5% (默认为 >5%)
}

// ==========================================
// E. 拇指滑动距离文案 [Source: PRD Miles Scrolled Variants]
// ==========================================
export function getMilesScrolledText(miles: number): string {
  const baseText = `Your thumb ran ${miles} miles`;

  if (miles < 5) return `${baseText} - a nice walk.`;
  if (miles < 13) return `${baseText} - a 10K run.`;
  if (miles < 26) return `${baseText} - a half marathon.`;

  return `${baseText} - more than a full marathon.`;
}

// ==========================================
// F. 建议 (Nudge) 文案映射 [Source: PRD Nudge Variants]
// ==========================================
// 注意：部分文案需要动态参数，所以使用函数处理
export function getNudgeCopy(type: string, limitTime: string = "3 AM"): string {
  switch (type) {
    case "late_night":
      return `Try putting your phone down before ${limitTime} this week`;
    case "rabbit_hole":
      return "When you notice the drift, try searching for something specific";
    case "brainrot":
      return `Try using "Not Interested" on a few videos this week`;
    case "time_increase":
      return "Try setting a scroll limit for yourself";
    case "default":
    default:
      return "Your Feedling had a balanced week. Keep it up!";
  }
}
