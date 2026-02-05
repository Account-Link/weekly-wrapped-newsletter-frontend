import { describe, it, expect, vi, beforeEach } from "vitest";
import { trackEvent } from "./client";
import { getOpenPixelUrl, getClickTrackingUrl } from "./server";
import { TrackingModule, TrackingAction } from "./types";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Tracking Library", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      statusText: "OK",
    });
    // Reset env vars
    process.env.NEXT_PUBLIC_BASE_URL = "https://example.com";
  });

  describe("Client-side Tracking (trackEvent)", () => {
    it("should send a correct payload via POST", async () => {
      const payload = {
        event: "page_view",
        type: "invite_flow" as TrackingModule,
        uid: "user-123",
        extraData: { foo: "bar" },
      };

      await trackEvent(payload);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });

    it("should handle failures gracefully", async () => {
      vi.stubEnv("NODE_ENV", "development");

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await trackEvent({ event: "test" });

      // Should not throw
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
      vi.unstubAllEnvs();
    });
  });

  describe("Server-side URL Generators", () => {
    const mockBaseUrl = "https://example.com";

    // Helper to mock getTrackingBaseUrl which likely uses env vars or config
    // Since we can't easily mock the internal import of config, we rely on how the function behaves.
    // If getTrackingBaseUrl uses getAppBaseUrl which uses process.env.VERCEL_URL or similar.

    it("should generate correct open pixel URL", () => {
      // Mocking environment for this test
      vi.stubEnv("VERCEL_URL", "example.com");

      const uid = "user-123";
      const eid = "email-456";
      const url = getOpenPixelUrl(uid, eid);

      // In test env, it might be empty string if dev tracking is disabled.
      // We need to ensure we can test the logic.
      // If we are in "test" env (NODE_ENV=test), the code check:
      // if (process.env.NODE_ENV === "development" && process.env.ENABLE_DEV_TRACKING !== "true")
      // Vitest sets NODE_ENV to 'test' by default. So the check passes?
      // Wait, 'test' !== 'development', so it should pass.

      expect(url).toContain("/api/track");
      expect(url).toContain("event=open");
      expect(url).toContain(`uid=${encodeURIComponent(uid)}`);
      expect(url).toContain(`eid=${encodeURIComponent(eid)}`);
    });

    it("should generate correct click tracking URL", () => {
      const targetUrl = "https://target.com/page";
      const type = "email_share" as TrackingModule;
      const uid = "user-123";
      const emailId = "email-456";
      const action = "click" as TrackingAction;

      const trackingUrl = getClickTrackingUrl({
        targetUrl,
        type,
        uid,
        emailId,
        action,
      });

      expect(trackingUrl).toContain("/api/redirect");
      expect(trackingUrl).toContain(
        `targetUrl=${encodeURIComponent(targetUrl)}`,
      );
      expect(trackingUrl).toContain(`type=${type}`);
      expect(trackingUrl).toContain(`uid=${uid}`);
      expect(trackingUrl).toContain(`action=${action}`);
      expect(trackingUrl).toContain(`eid=${emailId}`);
    });
  });
});
