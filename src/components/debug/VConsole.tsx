"use client";

import { useEffect } from "react";
import VConsole from "vconsole";

export default function VConsoleComponent() {
  useEffect(() => {
    // Check if running in browser
    if (typeof window !== "undefined") {
      const vConsole = new VConsole();
      return () => {
        vConsole.destroy();
      };
    }
  }, []);

  return null;
}
