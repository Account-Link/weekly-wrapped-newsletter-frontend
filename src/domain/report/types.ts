// 文件功能：周报领域类型定义，处于数据模型层
// 方法概览：无，类型声明集合
/**
 * types.ts
 * 定义周报所需的所有数据结构和枚举类型
 */

// ==========================================
// 1. 核心枚举定义 (Enums)
// ==========================================

// Feedling 猫咪的 5 种状态 [Source: PRD - Feedling State System]
export type FeedlingState =
  | "curious" // 好奇
  | "excited" // 兴奋 (Priority 1)
  | "cozy" // 舒适
  | "sleepy" // 困倦
  | "dizzy"; // 晕头转向

// 趋势扩散的 4 个阶段 [Source: PRD - Spread Progress]
export type TrendStatus =
  | "spreading" // 正在扩散
  | "going_mainstream" // 走向主流
  | "almost_everywhere" // 几乎随处可见
  | "everywhere"; // 无处不在

export type TrendType = "sound" | "hashtag" | "creator" | "format";

// 用户发现趋势的时机分类 [Source: PRD - Discovery Variants]
export type DiscoveryType =
  | "early" // 前 40% (Early Discoverer)
  | "late" // 后 60% (Late Discoverer)
  | "missed"; // 未发现 (Not Exposed)

// Nudge (建议) 的类型 [Source: PRD - Nudge Variants]
export type NudgeType =
  | "late_night" // 深夜刷屏
  | "rabbit_hole" // 掉进兔子洞
  | "brainrot" // 脑残内容过多
  | "time_increase" // 时长增加
  | "default"; // 默认 (健康)

// ==========================================
// 2. 数据接口定义 (Interfaces)
// ==========================================

export type TopicTag =
  | "Travel"
  | "Crafts"
  | "Music"
  | "Food"
  | "Fitness"
  | "Pets"
  | "Gaming"
  | "Fashion";

export interface WeeklyReportApiTopicItem {
  topic: TopicTag;
  pic_url: string;
}

export interface WeeklyReportApiResponse {
  id: number;
  app_user_id: string;
  email_content?: string | null;
  period_start?: string | null;
  period_end?: string | null;
  created_at: string;
  updated_at: string;
  send_status: "pending" | "sent" | "failed";
  feeding_state?: FeedlingState | null;
  trend_name?: string | null;
  trend_type?: TrendType | null;
  discovery_rank?: number | null;
  total_discoverers?: number | null;
  origin_niche_text?: string | null;
  spread_end_text?: string | null;
  reach_start?: number | null;
  reach_end?: number | null;
  current_reach?: number | null;
  total_videos?: number | null;
  total_time?: number | null;
  pre_total_time?: number | null;
  miles_scrolled?: number | null;
  topics?: WeeklyReportApiTopicItem[] | null;
  timezone?: string | null;
  rabbit_hole_datetime?: string | null;
  rabbit_hole_date?: string | null;
  rabbit_hole_time?: string | null;
  rabbit_hole_count?: number | null;
  rabbit_hole_category?: string | null;
  nudge_text?: string | null;
}

export interface WeeklyReportTopicItem {
  topic: TopicTag;
  picUrl?: string;
}

// 核心输入：周报完整数据对象
export interface WeeklyReportData {
  id?: number;
  // 基础信息
  weekRange: string; // e.g., "Jan 18 - Jan 24"
  periodStart?: string;
  periodEnd?: string;
  user: {
    name: string;
    avatarUrl?: string;
  };

  // 模块 1: Feedling 与 趋势 [Source: PRD Screen 1]
  feedling: {
    state: FeedlingState; // 猫咪状态 (由 utils 计算或后端传入)
  };
  trend: {
    name: string; // 趋势名称 e.g. "Leave Em Alone"
    rank: number | null; // 用户发现排位 (null 代表没发现)
    totalDiscoverers: number; // 总发现人数
    origin: string; // 起源标签 e.g. "#BeautyTik"
    currentSpread: string; // 当前扩散阶段
    penetrationStart: number; // 起始渗透率 e.g. 0.2
    penetrationEnd: number; // 结束渗透率 e.g. 12
    type?: TrendType;
    currentReach?: number;
    endText?: string;
  };

  // 模块 2: 统计数据 [Source: PRD Screen 2]
  stats: {
    totalVideos: number; // 观看视频总数
    totalTimeMinutes: number; // 本周总时长 (分钟)
    lastWeekTimeMinutes: number; // 上周总时长 (用于对比)
    lateNightPercentage: number; // 深夜观看比例 (0-100)
    milesScrolled: number; // 拇指滑动英里数
    // 用于计算逻辑的额外字段 (PRD Logic 部分需要)
    contentDiversityScore?: number; // 内容多样性分数 (0-100)
    brainrotPercentage?: number; // "脑残"内容占比 (0-100)
  };

  // 新发现的话题 (最多 3 个) [Source: PRD New Contents]
  newTopics: WeeklyReportTopicItem[];
  timezone?: string;

  // 兔子洞数据 (可选) [Source: PRD Rabbit Hole]
  rabbitHole: {
    hasRabbitHole: boolean;
    datetime?: string;
    day?: string; // e.g. "Wednesday"
    time?: string; // e.g. "3:09 AM"
    count?: number; // 连续观看数量
    category?: string; // 类别
  };

  // 模块 3: 建议与行动 [Source: PRD Screen 3]
  nudge: {
    type: NudgeType;
    limitTime?: string; // 例如 "3 AM"（仅当 type 为 "late_night" 时有效）
    text?: string;
  };
}

// ===== 业务类型定义 (View Models) =====

export interface WeeklyOpening {
  title: string;
  subtitle: string;
  dateRange: string;
}

export interface WeeklyTrend {
  topic: string;
  statusText: string;
  discoveryText: string;
  rank: number | null;
  totalDiscoverers: number;
  startTag: string;
  startPercent: string;
  endTag: string;
  endPercent: string;
  trendProgress: number; // 0-100
  type?: TrendType;
  ctaLabel: string;
  progressImageUrl?: string;
  shareUrl?: string;
}

export interface WeeklyDiagnosis {
  title: string;
  totalVideosValue: string;
  totalVideosUnit: string;
  totalTimeValue: string;
  totalTimeUnit: string;
  comparisonDiff: string | null;
  comparisonText: string;
  miles: string;
  milesComment: string;
  thisWeekLabel: string;
  lastWeekLabel: string;
  thisWeekValue: number; // 0-100
  lastWeekValue: number; // 0-100
  barChartImageUrl?: string;
  shareUrl?: string;
}

export interface WeeklyNewContent {
  label: string;
  stickerUrl: string;
}

export interface WeeklyRabbitHole {
  timeLabel: string;
  description: string;
  imageUrl: string;
}

export interface WeeklyNudge {
  title: string;
  message: string;
  ctaLabel: string;
  linkUrl?: string;
}

export interface WeeklyFooter {
  tiktokUrl: string;
}

export interface WeeklyData {
  id?: number;
  uid: string;
  assetBaseUrl: string;
  weekStart: string; // ISO date string
  weekEnd: string; // ISO date string
  feedlingState: FeedlingState;
  opening: WeeklyOpening;
  trend: WeeklyTrend;
  diagnosis: WeeklyDiagnosis;
  newContents: WeeklyNewContent[];
  rabbitHole: WeeklyRabbitHole;
  weeklyNudge: WeeklyNudge;
  footer: WeeklyFooter;
  period_start?: string;
  period_end?: string;
}
