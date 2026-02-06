"use client";

import { useEffect } from "react";
import VConsole from "vconsole";

export default function VConsoleComponent() {
  useEffect(() => {
    // Check if running in browser
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const shouldEnable = searchParams.get("debug") === "feedling";

      if (shouldEnable) {
        const vConsole = new VConsole();
        return () => {
          vConsole.destroy();
        };
      }
    }
  }, []);

  return null;
}
