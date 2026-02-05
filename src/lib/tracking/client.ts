import { TrackEventPayload } from "./types";

/**
 * Send a tracking event to the server.
 * Uses `keepalive: true` to ensure delivery even if the page unloads.
 */
export const trackEvent = async (payload: TrackEventPayload) => {
  try {
    const res = await fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });

    if (!res.ok) {
      if (process.env.NODE_ENV === "development") {
        console.error("Tracking failed:", res.statusText);
      }
    }
  } catch (error) {
    // Ensure tracking errors never block the main application flow
    if (process.env.NODE_ENV === "development") {
      console.error("Tracking error:", error);
    }
  }
};
