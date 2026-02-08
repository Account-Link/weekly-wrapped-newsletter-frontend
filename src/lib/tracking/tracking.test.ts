import { describe, it, expect, vi, beforeEach } from "vitest";
import { trackEvent } from "./client";
import { getOpenPixelUrl, getClickTrackingUrl } from "./server";

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
        uid: "user-123",
        params: { foo: "bar" },
      };

      await trackEvent(payload);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body as string);
      expect(options).toMatchObject({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      });
      expect(body).toMatchObject({
        event: "page_view",
        uid: "user-123",
        params: { foo: "bar" },
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
      const event = "share_week";
      const uid = "user-123";

      const trackingUrl = getClickTrackingUrl({
        targetUrl,
        event,
        uid,
        params: { eid: "email-456" },
      });

      expect(trackingUrl).toContain("/api/redirect");
      expect(trackingUrl).toContain(
        `targetUrl=${encodeURIComponent(targetUrl)}`,
      );
      expect(trackingUrl).toContain(`uid=${uid}`);
      expect(trackingUrl).toContain(`event=${event}`);
      expect(trackingUrl).toContain(
        `params=${encodeURIComponent(JSON.stringify({ eid: "email-456" }))}`,
      );
    });
  });
});
