"use client";

import { useCallback } from "react";
import { getUserTimezone, isUSTimezone } from "@/lib/timezone";

export function useUSCheck() {
  const checkUS = useCallback(async () => {
    try {
      let timezoneIsUS = true;
      try {
        const timezone = getUserTimezone();
        timezoneIsUS = isUSTimezone(timezone);
        console.log("Timezone check:", { timezone, isUS: timezoneIsUS });
      } catch (err) {
        console.warn("Error checking timezone:", err);
      }

      let geoIsUS = true;
      try {
        const res = await fetch("/api/geo");
        if (res.ok) {
          const data = await res.json();
          geoIsUS = data.isUS ?? true;
        } else {
          console.error("Geo API request failed:", res.status);
        }
      } catch (e) {
        console.error("Geo check failed", e);
      }

      const isInUS = timezoneIsUS || geoIsUS;
      console.log("Combined check result:", { timezoneIsUS, geoIsUS, isInUS });

      return isInUS;
    } catch (e) {
      console.error("Geo check fatal error", e);
      return true;
    }
  }, []);

  return { checkUS };
}
