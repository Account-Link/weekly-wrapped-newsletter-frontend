// 文件功能：初始化 Firebase Admin
// 方法概览：Admin 单例初始化
import admin from "firebase-admin";

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
// export const adminStorage = admin.apps.length > 0 ? admin.storage() : null; // 未使用，已注释

// Re-export all types
export * from "@/domain/report/types";
