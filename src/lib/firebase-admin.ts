import admin from "firebase-admin";

// 重要逻辑：God Mode 单例初始化，防止重复初始化导致报错
// - 当 admin.apps.length > 0 时，说明已经初始化过，直接复用现有 app
// - 从环境变量读取服务账号 JSON，支持纯 JSON 字符串或 Base64 编码
function initAdminSingleton() {
  const alreadyInitialized = admin.apps.length > 0;
  if (alreadyInitialized) return;

  // 重要逻辑：本地业务开发可通过环境变量跳过 Firebase 初始化
  if (process.env.FIREBASE_ADMIN_SKIP_INIT === "true") {
    return;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY in environment");
  }

  let jsonText = raw;
  // 重要逻辑：兼容 Base64 输入（例如 CI/Env 注入的安全变量）
  try {
    // 粗略判断是否为 Base64：包含非 JSON 常见字符时尝试解码
    if (!raw.trim().startsWith("{")) {
      const decoded = Buffer.from(raw, "base64").toString("utf-8");
      if (decoded.trim().startsWith("{")) {
        jsonText = decoded;
      }
    }
  } catch {
    // 忽略解码失败，保持原始字符串
  }

  // 重要逻辑：解析与校验服务账号对象结构
  let serviceAccount: unknown;
  try {
    serviceAccount = JSON.parse(jsonText);
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY must be valid JSON or Base64(JSON)"
    );
  }
  if (!serviceAccount || typeof serviceAccount !== "object") {
    throw new Error("Service account must be an object");
  }
  const sa = serviceAccount as {
    project_id?: string;
    client_email?: string;
    private_key?: string;
    [k: string]: unknown;
  };
  if (!sa.project_id || !sa.client_email || !sa.private_key) {
    throw new Error(
      "Service account missing required fields: project_id, client_email, private_key"
    );
  }
  // 重要逻辑：private_key 可能包含转义的 \\n，需要替换为真实换行
  sa.private_key = sa.private_key.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert(sa as admin.ServiceAccount),
    // 可选：若需使用 Cloud Storage 指定桶名，可通过环境变量配置
    // storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

// 执行单例初始化
initAdminSingleton();

// 导出 Firestore 与 Cloud Storage 客户端
export const adminDb = admin.apps.length > 0 ? admin.firestore() : null;
export const adminStorage = admin.apps.length > 0 ? admin.storage() : null;

// ===== 业务类型定义 =====
export interface WeeklyStat {
  label: string;
  value: string;
  delta?: string;
}

export interface WeeklyHero {
  imageUrl: string;
  imageAlt: string;
  trendProgress: number; // 0-100
}

export interface WeeklyOpening {
  title: string;
  subtitle: string;
  dateRange: string;
  decorUrl: string;
  catUrl: string;
}

export interface WeeklyTrend {
  stickerUrl: string;
  topic: string;
  statusText: string;
  discoveryText: string;
  rank: number | null;
  totalDiscoverers: number;
  startTag: string;
  startPercent: string;
  endTag: string;
  endPercent: string;
  ctaLabel: string;
  ctaIconUrl: string;
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
  miles: number;
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
}

export interface WeeklyData {
  uid: string;
  weekStart: string; // ISO date string
  weekEnd: string;   // ISO date string
  hero: WeeklyHero;
  opening: WeeklyOpening;
  trend: WeeklyTrend;
  diagnosis: WeeklyDiagnosis;
  newContents: WeeklyNewContent[];
  rabbitHole: WeeklyRabbitHole;
  weeklyNudge: WeeklyNudge;
  stats: WeeklyStat[];
}

// 重要逻辑：周报数据获取（当前返回 Mock，保留真实查询注释）
export async function getWeeklyData(uid: string): Promise<WeeklyData> {
  // 真实实现示例（注释说明）：
  // - Firestore 结构示例：
  //   collections:
  //     users/{uid}/reports/{yyyy-mm-dd}
  // - 查询最近一周文档并聚合需要的指标
  //
  // const reportRef = adminDb
  //   .collection("users")
  //   .doc(uid)
  //   .collection("reports")
  //   .orderBy("date", "desc")
  //   .limit(1);
  // const snapshot = await reportRef.get();
  // if (!snapshot.empty) {
  //   const doc = snapshot.docs[0].data();
  //   // 映射为 WeeklyData 返回
  // }

  // Mock 数据：符合 PRD 的字段结构
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);
  start.setDate(end.getDate() - 7);
  const dateRange = `${start.toISOString().slice(0, 10)} - ${end
    .toISOString()
    .slice(0, 10)}`;
  // 重要逻辑：本地预览需使用完整 URL，生产可替换为 CDN
  const assetBaseUrl = process.env.EMAIL_ASSET_BASE_URL || "http://localhost:3000";

  return {
    uid,
    weekStart: start.toISOString().slice(0, 10),
    weekEnd: end.toISOString().slice(0, 10),
    hero: {
      imageUrl:
        "https://assets.fyp-scout.example/cat-feedling.png",
      imageAlt: "Feedling 猫咪",
      trendProgress: 72,
    },
    opening: {
      title: "This week you explored",
      subtitle: "a lot of New Corners in TikTok.",
      dateRange,
      decorUrl: "",
      catUrl: `${assetBaseUrl}/figma/cat-gif.png`,
    },
    trend: {
      stickerUrl: `${assetBaseUrl}/figma/topic-sticker-sound.png`,
      topic: "“Leave Em Alone”",
      statusText: "blew up this week",
      discoveryText: "You're one of the first 1,000 people to see this trend.",
      rank: 47,
      totalDiscoverers: 2847,
      startTag: "NYC",
      startPercent: "10%",
      endTag: "Everywhere",
      endPercent: "100%",
      ctaLabel: "Share My Week",
      ctaIconUrl: "",
    },
    diagnosis: {
      title: "This week you watched",
      totalVideosValue: "9,222",
      totalVideosUnit: "Videos",
      totalTimeValue: "19 h 14",
      totalTimeUnit: "min",
      comparisonDiff: "2h 35min",
      comparisonText: "less than last week 👍",
      miles: 18,
      milesComment: "- a half marathon.",
      thisWeekLabel: "This Week",
      lastWeekLabel: "Last Week",
      thisWeekValue: 60,
      lastWeekValue: 80,
    },
    newContents: [
      {
        label: "Hongkong Vlog",
        stickerUrl: `${assetBaseUrl}/figma/content-sticker-1.svg`,
      },
      {
        label: "Pottery DIY",
        stickerUrl: `${assetBaseUrl}/figma/content-sticker-2.svg`,
      },
      {
        label: "Jazz Covers",
        stickerUrl: `${assetBaseUrl}/figma/content-sticker-3.svg`,
      },
    ],
    rabbitHole: {
      timeLabel: "Wed 3:09 AM",
      description: "You watched 156 videos of comedy.",
      imageUrl: `${assetBaseUrl}/figma/cat-gif.svg`,
    },
    weeklyNudge: {
      title: "👍🏻 Weekly Nudge 👍🏻",
      message: "“Try putting your phone down before 3 AM this week!”",
      ctaLabel: "Share My Scroll Stats",
    },
    stats: [
      { label: "新增关注", value: "1,284", delta: "+12%" },
      { label: "内容互动", value: "8,532", delta: "+8%" },
      { label: "帖子发布", value: "36", delta: "-3%" },
      { label: "转化率", value: "4.7%", delta: "+0.5%" },
    ],
  };
}
