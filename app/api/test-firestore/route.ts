import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  if (!adminDb) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Firebase Admin not initialized. Set FIREBASE_ADMIN_ENABLED and FIREBASE_SERVICE_ACCOUNT_KEY.",
      },
      { status: 503 },
    );
  }

  try {
    const docRef = await adminDb.collection("test_collection").add({
      message: "Hello Firestore!",
      timestamp: new Date().toISOString(),
      user: "Zhang Haoxuan",
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      msg: "写入成功！快去网页控制台看看！",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
