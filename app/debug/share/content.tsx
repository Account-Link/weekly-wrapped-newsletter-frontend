"use client";

import React, { useState, useEffect } from "react";

export default function DebugShareContent() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && !!navigator.share);
    if (typeof window !== "undefined") {
      setUrl(window.location.href);
    }
  }, []);

  const addLog = (msg: string) => {
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleShare = async () => {
    const shareData = {
      title: "Debug Share Title",
      text: "Debug Share Text",
      url: url,
    };

    addLog(`Attempting share with: ${JSON.stringify(shareData)}`);

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        addLog("Share successful");
      } catch (err: unknown) {
        if (err instanceof Error) {
          addLog(`Share failed: ${err.name} - ${err.message}`);
        } else {
          addLog(`Share failed: ${String(err)}`);
        }
      }
    } else {
      addLog("navigator.share is not supported");
      // Fallback copy
      try {
        await navigator.clipboard.writeText(url);
        addLog("Fallback: Copied to clipboard");
      } catch (err: unknown) {
        if (err instanceof Error) {
          addLog(`Fallback failed: ${err.message}`);
        } else {
          addLog(`Fallback failed: ${String(err)}`);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-2xl font-bold mb-4 text-[#FF5678]">
        Debug: Navigator.share
      </h1>

      <div className="mb-6 p-4 border border-gray-700 rounded bg-gray-900">
        <p>
          Status:{" "}
          {supported === null ? (
            "Checking..."
          ) : supported ? (
            <span className="text-green-400">Supported</span>
          ) : (
            <span className="text-red-400">Not Supported</span>
          )}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Note: Web Share API usually requires HTTPS and user interaction.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <label>
          Share URL:
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded"
          />
        </label>

        <button
          onClick={handleShare}
          className="bg-[#FF5678] text-black font-bold py-3 px-6 rounded-full hover:bg-[#ff7b95] active:scale-95 transition-all"
        >
          Test Share
        </button>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <h2 className="text-xl font-bold mb-2">Logs:</h2>
        <div className="bg-gray-900 p-4 rounded h-64 overflow-y-auto border border-gray-700 text-sm">
          {log.length === 0 ? (
            <span className="text-gray-500">No logs yet...</span>
          ) : (
            log.map((entry, i) => (
              <div key={i} className="mb-1 border-b border-gray-800 pb-1">
                {entry}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
