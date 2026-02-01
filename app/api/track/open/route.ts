import admin from "firebase-admin";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// 方法功能：透明像素常量，用于打开埋点响应
const transparentGif = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  "base64",
);

// 方法功能：打开埋点查询参数类型定义
type OpenTrackQuery = {
  uid: string;
  eid: string;
};

// 方法功能：构建去重文档 ID
const buildDocId = (uid: string, emailId: string, eventType: string) =>
  `${uid}_${emailId}_${eventType}`;

// 方法功能：写入打开埋点数据
const recordOpenEvent = async (query: OpenTrackQuery, request: Request) => {
  if (!adminDb) return;

  // 重要逻辑：以 uid + emailId + eventType 去重，只记录首次打开
  const docId = buildDocId(query.uid, query.eid, "open");
  await adminDb
    .collection("analytics_logs")
    .doc(docId)
    .set(
      {
        event_type: "open",
        action: null,
        uid: query.uid,
        email_id: query.eid,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        user_agent: request.headers.get("user-agent") || "",
      },
      { merge: true },
    );
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const uid = url.searchParams.get("uid") || "";
  const eid = url.searchParams.get("eid") || "";

  if (uid && eid) {
    // 重要逻辑：异步写入打开事件，不阻塞像素响应
    void recordOpenEvent({ uid, eid }, request);
  }

  return new NextResponse(transparentGif, {
    status: 200,
    headers: {
      "content-type": "image/gif",
      "cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}
