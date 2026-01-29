"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RedirectContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const type = searchParams.get("type") || "unknown";
  const uid = searchParams.get("uid") || "anonymous";
  const weekStart = searchParams.get("weekStart");
  const [status, setStatus] = useState("Redirecting...");

  useEffect(() => {
    if (!url) {
      setStatus("Invalid URL");
      return;
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "email_button_click",
        type,
        uid,
        weekStart: weekStart || null,
        source: "email",
        targetUrl: url,
      }),
    }).catch(() => null);

    const timer = setTimeout(() => {
      window.location.href = url;
    }, 500);

    return () => clearTimeout(timer);
  }, [url, type, uid, weekStart]);

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
