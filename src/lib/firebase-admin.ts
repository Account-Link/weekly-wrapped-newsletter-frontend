// 文件功能：初始化 Firebase Admin 并定义周报数据类型与获取方法
// 方法概览：Admin 单例初始化、类型定义、周报数据拉取与映射
import admin from "firebase-admin";
import type {
  WeeklyReportApiResponse,
  FeedlingState,
  TrendType,
} from "@/domain/report/types";

// 方法功能：Admin 单例初始化，避免重复初始化导致报错
// 重要逻辑：God Mode 单例初始化，防止重复初始化导致报错
// - 当 admin.apps.length > 0 时，说明已经初始化过，直接复用现有 app
// - 从环境变量读取服务账号 JSON，支持纯 JSON 字符串或 Base64 编码
function initAdminSingleton() {
  const alreadyInitialized = admin.apps.length > 0;
  if (alreadyInitialized) return;

  // 重要逻辑：默认关闭 Firebase Admin，只有显式启用时才初始化
  const adminEnabled = process.env.FIREBASE_ADMIN_ENABLED === "true";
  if (!adminEnabled) return;

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
      "FIREBASE_SERVICE_ACCOUNT_KEY must be valid JSON or Base64(JSON)",
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
      "Service account missing required fields: project_id, client_email, private_key",
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

// 方法功能：执行单例初始化，确保后续客户端可用
initAdminSingleton();

// 方法功能：导出 Firestore 与 Cloud Storage 客户端
export const adminDb = admin.apps.length > 0 ? admin.firestore() : null;
export const adminStorage = admin.apps.length > 0 ? admin.storage() : null;

// ===== 业务类型定义 =====
export interface WeeklyHero {
  imageUrl: string;
  imageAlt: string;
  trendProgress: number; // 0-100
}

export interface WeeklyOpening {
  title: string;
  subtitle: string;
  dateRange: string;
  catUrl: string;
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
  linkUrl?: string;
}

export interface WeeklyFooter {
  tiktokUrl: string;
}

export interface WeeklyData {
  uid: string;
  weekStart: string; // ISO date string
  weekEnd: string; // ISO date string
  trackingBaseUrl: string;
  feedlingState: FeedlingState;
  hero: WeeklyHero;
  opening: WeeklyOpening;
  trend: WeeklyTrend;
  diagnosis: WeeklyDiagnosis;
  newContents: WeeklyNewContent[];
  rabbitHole: WeeklyRabbitHole;
  weeklyNudge: WeeklyNudge;
  footer: WeeklyFooter;
}

// 方法功能：拉取周报数据并映射为 WeeklyData
// 重要逻辑：请求后端接口并统一映射，保证模板可直接使用
export async function getWeeklyData(uid: string): Promise<WeeklyData> {
  const apiBaseUrl = process.env.WEEKLY_REPORT_API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error("Missing WEEKLY_REPORT_API_BASE_URL in environment");
  }

  const apiKey = process.env.WEEKLY_REPORT_API_KEY;
  const headers: HeadersInit = apiKey ? { "x-api-key": apiKey } : {};
  const url = new URL(
    `weekly-report/${encodeURIComponent(uid)}`,
    apiBaseUrl,
  ).toString();
  const response = await fetch(url, { method: "GET", headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Weekly report request failed: ${response.status} ${text}`);
  }
  const apiReport = (await response.json()) as WeeklyReportApiResponse;

  const { mapApiReportToWeeklyReportData, mapReportToWeeklyData } =
    await import("@/domain/report/adapter");
  const report = mapApiReportToWeeklyReportData(apiReport);
  const assetBaseUrl =
    process.env.EMAIL_ASSET_BASE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  return mapReportToWeeklyData(apiReport.app_user_id || uid, report, {
    assetBaseUrl,
    trackingBaseUrl: assetBaseUrl,
  });
}
