// 文件功能：文案映射与生成逻辑，处于数据适配与渲染准备阶段
// 方法概览：状态文案、趋势/时长/里程文案生成
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
// 方法功能：生成发现排名文案
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
// 方法功能：生成本周与上周时长对比文案
export function getTimeComparisonText(
  currentMinutes: number,
  lastWeekMinutes: number
): string {
  const diff = currentMinutes - lastWeekMinutes;
  const formatTime = (mins: number) => {
    const h = Math.floor(Math.abs(mins) / 60);
    const m = Math.floor(Math.abs(mins) % 60);
    return `${h}h ${m}min`;
  };
  if (diff >= 0) {
    return `${formatTime(diff)} more than last week`;
  }
  return `${formatTime(diff)} less than last week`;
}

// ==========================================
// E. 拇指滑动距离文案 [Source: PRD Miles Scrolled Variants]
// ==========================================
// 方法功能：生成拇指滑动里程文案
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
// 方法功能：生成 nudge 建议文案
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
