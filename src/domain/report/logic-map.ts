// 文件功能：文案映射与生成逻辑，处于数据适配与渲染准备阶段
// 方法概览：状态文案、趋势/时长/里程文案生成
/**
 * logic-maps.ts
 * 负责将数据状态映射为前端展示的文案 (Copy Mapping)
 */

import { FeedlingState } from "@/domain/report/types";

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
  lastWeekMinutes: number,
): string {
  const diff = currentMinutes - lastWeekMinutes;
  const formatTime = (mins: number) => {
    const h = Math.floor(Math.abs(mins) / 60);
    const m = Math.floor(Math.abs(mins) % 60);

    // Case 1: 纯分钟 (不足 1 小时)，直接显示分钟 (e.g., 27min, 30min)
    if (h === 0) {
      return `${m}min`;
    }

    // Case 2: 整小时 (分钟为 0)，只显示小时 (e.g., 12h)
    if (m === 0) {
      return `${h.toLocaleString()}h`;
    }

    // Case 3: 混合模式 (e.g., 1h 27min)
    return `${h.toLocaleString()}h ${m}min`;
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
// Input: feet (number)
// Output: { valueText: string, comment: string }
// valueText: e.g. "1,200 ft" or "over a mile."
// comment: e.g. "— a short hallway" or "Touch grass?"
export function getScrolledDistanceText(feet: number): {
  valueText: string;
  comment: string;
} {
  const roundedFeet = Math.round(feet);
  const formattedFeet = `${roundedFeet.toLocaleString()} ft`;

  if (roundedFeet <= 30) {
    return {
      valueText: formattedFeet,
      comment: "— You barely scrolled - great job!",
    };
  }
  if (roundedFeet <= 50) {
    return {
      valueText: formattedFeet,
      comment: "— About the length of a city bus.",
    };
  }
  if (roundedFeet <= 100) {
    return {
      valueText: formattedFeet,
      comment: "— About the length of a blue whale.",
    };
  }
  if (roundedFeet <= 200) {
    return {
      valueText: formattedFeet,
      comment: "— Two blue whales laid end to end.",
    };
  }
  if (roundedFeet <= 220) {
    return {
      valueText: formattedFeet,
      comment: "— About two basketball courts laid end to end.",
    };
  }
  if (roundedFeet <= 260) {
    return {
      valueText: formattedFeet,
      comment: "— About two and a half basketball courts laid end to end.",
    };
  }
  if (roundedFeet <= 299) {
    return {
      valueText: formattedFeet,
      comment: "— About three basketball courts laid end to end.",
    };
  }
  if (roundedFeet <= 380) {
    return {
      valueText: formattedFeet,
      comment: "— About the height of the Statue of Liberty.",
    };
  }
  if (roundedFeet <= 480) {
    return {
      valueText: formattedFeet,
      comment: "— About the height of the Great Pyramid of Giza in Egypt.",
    };
  }
  if (roundedFeet <= 600) {
    return {
      valueText: formattedFeet,
      comment: "— About the height of the Washington Monument in DC.",
    };
  }
  if (roundedFeet <= 800) {
    return {
      valueText: formattedFeet,
      comment: "— About the height of the Space Needle in Seattle.",
    };
  }
  if (roundedFeet <= 1100) {
    return {
      valueText: formattedFeet,
      comment: "— About the height of the Eiffel Tower in Paris.",
    };
  }
  if (roundedFeet <= 1454) {
    return {
      valueText: formattedFeet,
      comment:
        "— About the height of the Empire State Building in New York City.",
    };
  }
  if (roundedFeet <= 2000) {
    return {
      valueText: formattedFeet,
      comment: "— About the height of One World Trade Center in New York City.",
    };
  }
  if (roundedFeet <= 2999) {
    return {
      valueText: formattedFeet,
      comment:
        "— Around the height of two Empire State Buildings stacked on top of one another",
    };
  }
  if (roundedFeet <= 4000) {
    return {
      valueText: formattedFeet,
      comment:
        "— Around the height of two World Trade Centers stacked on top of one another.",
    };
  }
  if (roundedFeet <= 4500) {
    return {
      valueText: formattedFeet,
      comment:
        "— Around the height of four Eiffel Towers stacked on top of one another.",
    };
  }
  if (roundedFeet < 5280) {
    return {
      valueText: formattedFeet,
      comment:
        "— Around the height of three World Trade Centers stacked on top of one another",
    };
  }

  // 5280+
  return { valueText: "over a mile.", comment: "Touch grass?" };
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
