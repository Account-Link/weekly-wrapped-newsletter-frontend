"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RedirectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get("url");
  const type = searchParams.get("type") || "unknown";
  const uid = searchParams.get("uid") || "anonymous";
  const [status, setStatus] = useState("Redirecting...");

  useEffect(() => {
    if (!url) {
      setStatus("Invalid URL");
      return;
    }

    // 1. Tracking
    console.log(`[Tracking] Redirect: ${type}`, {
      targetUrl: url,
      uid,
      timestamp: new Date().toISOString(),
    });

    // 2. Redirect
    // Use window.location for external links to ensure full page load
    const timer = setTimeout(() => {
        window.location.href = url;
    }, 500); // Small delay to ensure tracking (optional, or rely on beacon)

    return () => clearTimeout(timer);
  }, [url, type, uid, router]);

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-red-500">Error: No redirect URL provided.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-8 w-8 bg-gray-200 rounded-full mb-4"></div>
        <p className="text-gray-500">{status}</p>
      </div>
    </div>
  );
}
