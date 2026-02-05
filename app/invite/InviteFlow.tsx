"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { startTikTokLink, pollTikTokRedirect } from "@/lib/api/tiktok";
import { FeedlingState } from "@/domain/report/types";
import { useToast } from "@/context/ToastContext";
import { trackEvent } from "@/lib/tracking";
import { getUserTimezone, isUSTimezone } from "@/lib/timezone";

import TiktokIcon from "@/assets/figma/invite/tiktok-icon.svg";
import ScreenBg1 from "@/assets/figma/invite/screen-bg_1.gif";
import ScreenBg2 from "@/assets/figma/invite/screen-bg_2.gif";
import ScreenBg3 from "@/assets/figma/invite/screen-bg_3.gif";
import ScreenBg4 from "@/assets/figma/invite/screen-bg_4.gif";

const JOB_ID_KEY = "tiktok_auth_job_id";

type InviteFlowProps = {
  uid: string;
  data: {
    trend: {
      topic: string;
      rank: number | null;
      totalDiscoverers: number;
    };
    feedlingState: FeedlingState;
  };
};

export default function InviteFlow({ uid, data }: InviteFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [progress, setProgress] = useState(0);
  const { showToast } = useToast();

  // TikTok Connect State
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Time Tracking Refs
  const landingClickTimeRef = useRef<number | null>(null);
  const loadingCompleteTimeRef = useRef<number | null>(null);

  const [tiktokToken, setTiktokToken] = useState<string | null>(null);
  const [appUserId, setAppUserId] = useState<string | null>(null);

  // PC QR Code State
  const [isPc, setIsPc] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showGeoModal, setShowGeoModal] = useState(false);

  const { trend } = data;

  // Deduplication Helper
  const trackOnce = (action: string, callback: () => void) => {
    if (typeof window === "undefined") return;

    // Determine scope based on event type
    const isUserScoped = [
      "referral_oauth_success",
      "referral_processing_view",
      "referral_complete",
    ].includes(action);

    const storageKey = isUserScoped
      ? `tracked_${action}_${uid}`
      : `tracked_${action}`;

    if (localStorage.getItem(storageKey)) return;
    callback();

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
      now.getDate(),
    )}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    localStorage.setItem(storageKey, timestamp);
  };

  // Check if PC
  useEffect(() => {
    setIsPc(window.innerWidth >= 1024);
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // 记录页面访问埋点
  useEffect(() => {
    trackEvent({
      event: "page_view",
      type: "invite_flow",
      action: "referral_landing_view",
      uid,
      source: "web",
    });
  }, [uid]);

  // Track Funnel Steps
  useEffect(() => {
    if (step === 2) {
      if (!redirectUrl) {
        trackOnce("referral_loading_start", () => {
          trackEvent({
            event: "view",
            type: "invite_flow",
            action: "referral_loading_start",
            uid,
          });
        });
      } else {
        loadingCompleteTimeRef.current = Date.now();
        const duration = landingClickTimeRef.current
          ? loadingCompleteTimeRef.current - landingClickTimeRef.current
          : 0;

        trackOnce("referral_loading_complete", () => {
          trackEvent({
            event: "view",
            type: "invite_flow",
            action: "referral_loading_complete",
            uid,
            extraData: { duration },
          });
        });
      }
    } else if (step === 3) {
      trackOnce("referral_processing_view", () => {
        trackEvent({
          event: "view",
          type: "invite_flow",
          action: "referral_processing_view",
          uid,
        });
      });
    } else if (step === 4) {
      trackOnce("referral_complete", () => {
        trackEvent({
          event: "view",
          type: "invite_flow",
          action: "referral_complete",
          uid,
        });
      });
    }
  }, [step, redirectUrl, uid]);

  const checkGeoLocation = async () => {
    try {
      // 1. Check Timezone
      let timezoneIsUS = true; // Default to true (fail open)
      try {
        const timezone = getUserTimezone();
        timezoneIsUS = isUSTimezone(timezone);
        console.log("Timezone check:", { timezone, isUS: timezoneIsUS });
      } catch (err) {
        console.warn("Error checking timezone:", err);
      }

      // 2. Check Geo API (IP-based)
      let geoIsUS = true; // Default to true (fail open)
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
      return true; // Fail open
    }
  };

  const startPolling = (currentJobId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const statusRes = await pollTikTokRedirect(currentJobId);
        console.log("Poll status:", statusRes.status);

        // 1. Ready state: We got the URL
        if (statusRes.status === "ready" && statusRes.redirect_url) {
          setRedirectUrl(statusRes.redirect_url);
        }

        // 2. Completed state: User finished login
        if (statusRes.status === "completed") {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

          if (statusRes.token && statusRes.app_user_id) {
            setTiktokToken(statusRes.token);
            setAppUserId(statusRes.app_user_id);
          }

          // Clear saved job_id
          localStorage.removeItem(JOB_ID_KEY);

          // 埋点：连接成功
          trackOnce("referral_oauth_success", () => {
            trackEvent({
              event: "referral_oauth_success",
              type: "invite_flow",
              uid,
            });
          });

          // Check Geo Location
          const isUS = await checkGeoLocation();
          if (isUS) {
            setStep(3);
          } else {
            setShowGeoModal(true);
          }
        }

        // 3. Error/Expired state: Retry
        if (
          statusRes.status === "expired" ||
          statusRes.status === "reauth_needed"
        ) {
          console.log("Session expired, restarting...");
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          localStorage.removeItem(JOB_ID_KEY);
          startAndPoll(); // Recursive retry with new job
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000); // Poll every 2s
  };

  const startAndPoll = async () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    // Reset redirectUrl to show Preparing state if retrying
    if (redirectUrl) {
      setRedirectUrl(null);
    }

    try {
      const { archive_job_id: newJobId } = await startTikTokLink();
      setJobId(newJobId);
      localStorage.setItem(JOB_ID_KEY, newJobId);

      startPolling(newJobId);
    } catch (error) {
      console.error("Failed to start:", error);
      // Retry after delay
      setTimeout(startAndPoll, 2000);
    }
  };

  // Resume polling if job_id exists in localStorage
  useEffect(() => {
    const savedJobId = localStorage.getItem(JOB_ID_KEY);
    if (savedJobId) {
      setStep(2); // Go to Connect/Preparing step
      setJobId(savedJobId);
      startPolling(savedJobId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format numbers
  const rankStr = trend.rank ? trend.rank.toLocaleString() : "N/A";
  const totalStr = trend.totalDiscoverers
    ? trend.totalDiscoverers.toLocaleString()
    : "N/A";

  // Handle Loading Step (Step 3)
  useEffect(() => {
    if (step === 3) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep(4);
            return 100;
          }
          return prev + 2; // Increment speed
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleFindOut = () => {
    // 埋点：点击 Find Out
    landingClickTimeRef.current = Date.now();
    trackOnce("referral_landing_click", () => {
      trackEvent({
        event: "click",
        type: "invite_flow",
        action: "referral_landing_click",
        uid,
      });
    });
    setStep(2); // Immediately go to Step 2 (which shows Preparing initially)
    startAndPoll();
  };

  const handleConnect = () => {
    if (!redirectUrl) return;

    // 埋点：点击连接 TikTok
    const now = Date.now();
    const duration = loadingCompleteTimeRef.current
      ? now - loadingCompleteTimeRef.current
      : 0;

    trackOnce("referral_oauth_start", () => {
      trackEvent({
        event: "click",
        type: "invite_flow",
        action: "referral_oauth_start",
        uid,
        extraData: { duration },
      });
    });

    if (isPc) {
      setShowQrModal(true);
    } else {
      window.location.href = redirectUrl;
    }
  };

  const copyToClipboard = async (text: string) => {
    // Try navigator.clipboard API first (if available and secure context)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn("Clipboard API failed, falling back...", err);
      }
    }

    // Fallback for older browsers / non-secure contexts
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Ensure it's not visible but part of the DOM
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      return successful;
    } catch (err) {
      console.error("Fallback copy failed", err);
      return false;
    }
  };

  const handleInvite = async () => {
    const url = window.location.href;

    // 埋点：点击邀请/分享
    trackEvent({
      event: "click",
      type: "invite_flow",
      action: "referral_invite_click",
      uid,
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: "FYP Scout",
          text: "Check out my TikTok Wrapped!",
          url: url,
        });
        return;
      } catch (error) {
        console.log("Share failed or cancelled", error);
      }
    }

    const success = await copyToClipboard(url);
    if (success) {
      showToast("Link copied to clipboard!");
    } else {
      showToast("Failed to copy link");
    }
  };

  return (
    <main
      className="h-dvh w-[40.2rem] mx-auto bg-[#313131] text-white flex flex-col items-center relative overflow-hidden"
      style={{
        paddingTop: `calc(env(safe-area-inset-top) + 2rem)`,
        paddingBottom: `calc(env(safe-area-inset-bottom) + 2rem)`,
      }}
    >
      <AnimatePresence mode="wait">
        {/* STEP 1: Landing */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full h-full flex-grow"
          >
            {/* Main Content Container */}
            <div className="w-full h-full flex flex-grow flex-col items-center justify-between relative px-[3.2rem]">
              {/* Top Section */}
              <div className="flex flex-col items-center text-center w-full">
                {/* Trend Topic */}
                <div className="relative mt-[4.5rem] transform -rotate-6 z-[1]">
                  <h2 className="text-[4rem] leading-[1.1] font-bold text-[#FF5678] drop-shadow-lg">
                    {trend.topic}
                  </h2>
                  <p className="text-[2.4rem] font-bold text-white mt-[1rem]">
                    blew up this week
                  </p>
                </div>

                {/* Cat Image */}
                <div className="w-[40.2rem] h-[34rem] mt-[4rem] absolute right-0 top-[9rem] z-[0]">
                  <Image
                    src={ScreenBg1}
                    alt="Find-Out"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Bottom Section */}
              <div className="w-full flex flex-col items-center relative z-[1]">
                <p className="text-[2.4rem] leading-[1.2] font-bold text-center text-white">
                  Your friend was{" "}
                  <span className="text-[#FF5678]">{rankStr}</span> to discover
                  out of <span className="text-[#FF5678]">{totalStr}</span>{" "}
                  people.
                  <br />
                  Were you earlier ?
                </p>

                <button
                  onClick={handleFindOut}
                  className="w-full h-[5.6rem] gap-[0.4rem] bg-white rounded-full flex items-center justify-center text-black font-bold text-[1.8rem] hover:bg-gray-100 transition-colors mt-[2rem]"
                >
                  Find out
                  <svg
                    width="16"
                    height="12"
                    viewBox="0 0 16 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 6H15M15 6L10 1M15 6L10 11"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Privacy / Connect (Includes Preparing State) */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full h-full flex flex-col items-center flex-grow "
          >
            {/* Background Image (Shared between Preparing and Connect) */}
            <div className="pointer-events-none flex-1 w-full flex items-center justify-center absolute top-[45%] translate-y-[-50%] z-[0] px-[3.2rem]">
              <Image
                src={ScreenBg2}
                alt="Connecting"
                className="object-contain w-[33.5rem] h-[33.5rem]"
              />
            </div>

            {!redirectUrl ? (
              /* PREPARING STATE UI */
              <div className="w-full h-full flex flex-col items-center justify-center relative z-[1]">
                <p className="text-[1.8rem] font-bold text-white mt-[20rem] animate-pulse">
                  Preparing your experience...
                </p>
              </div>
            ) : (
              /* CONNECT STATE UI */
              <div className="w-full h-full flex flex-col items-center justify-between flex-grow">
                <h2 className="w-full text-[2.8rem] font-bold text-center leading-[1.2] pt-[5rem] relative z-[1]">
                  Your data goes in.
                  <br />
                  <span className="text-[#FF5678]">Only insights </span>
                  come out.
                </h2>

                <div className="relative z-[1]">
                  <div className="w-full flex flex-col gap-8 pb-[2.4rem]">
                    {/* Item 1 */}
                    <div className="flex items-center gap-3">
                      <div className="w-[12px] h-[12px] rounded-full bg-[#FF5678] shrink-0" />
                      <p className="text-[16px] leading-[1.2]">
                        We can&apos;t post, DM, or touch your account
                      </p>
                    </div>
                    {/* Item 2 */}
                    <div className="flex items-center gap-3">
                      <div className="w-[12px] h-[12px] rounded-full bg-[#651AE9] shrink-0" />
                      <p className="text-[16px] leading-[1.2]">
                        AI processes your history data, then deletes it — no
                        trace
                      </p>
                    </div>
                    {/* Item 3 */}
                    <div className="flex items-center gap-3">
                      <div className="w-[12px] h-[12px] rounded-full bg-[#22C083] shrink-0" />
                      <p className="text-[16px] leading-[1.2]">
                        No human can see your data. Not even us
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleConnect}
                    className="w-[33.4rem] h-[5.6rem] bg-white rounded-full flex items-center justify-center gap-[0.4rem] text-black font-bold text-[1.6rem] transition-colors mt-auto hover:bg-gray-100"
                  >
                    <Image
                      src={TiktokIcon}
                      width={18}
                      height={21}
                      alt="TikTok"
                    />
                    Connect TikTok
                  </button>
                </div>
              </div>
            )}

            {/* PC QR Code Modal */}
            <AnimatePresence>
              {showQrModal && redirectUrl && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                  onClick={() => setShowQrModal(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white rounded-3xl p-8 flex flex-col items-center gap-6 max-w-md w-full relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setShowQrModal(false)}
                      className="absolute top-4 right-4 text-black/50 hover:text-black transition-colors"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>

                    <h3 className="text-[2.4rem] font-bold text-black text-center leading-tight">
                      Scan to Connect
                    </h3>

                    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                      <QRCodeSVG
                        value={redirectUrl}
                        size={240}
                        level="H"
                        includeMargin={true}
                      />
                    </div>

                    <p className="text-[1.6rem] text-center text-gray-600">
                      Open your camera app to scan this code and connect your
                      TikTok account.
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Geo Warning Modal */}
            <AnimatePresence>
              {showGeoModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                  onClick={() => {}}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white rounded-3xl p-8 flex flex-col items-center gap-6 max-w-md w-full relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-2">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>

                    <h3 className="text-[2.4rem] font-bold text-black text-center leading-tight">
                      Region Not Supported
                    </h3>

                    <p className="text-[1.6rem] text-center text-gray-600">
                      Sorry, this experience is currently available only for
                      users in the United States.
                    </p>

                    <button
                      onClick={() => setShowGeoModal(false)}
                      className="w-full h-[4.8rem] bg-black text-white rounded-full font-bold text-[1.6rem] mt-2"
                    >
                      Got it
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* STEP 3: Loading */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <div className="flex flex-col items-center justify-center relative px-[3.2rem]">
              <p className="text-[2.4rem] font-bold text-center">
                Reading your watch history...
              </p>
              {/* Loading Graphic */}
              <div className="relative w-full flex-grow my-[4rem]">
                <Image
                  src={ScreenBg3}
                  alt="Loading"
                  className="object-contain animate-pulse w-[33.2rem] h-[19.8rem]"
                />
              </div>

              <h2 className="text-[2.8rem] font-bold mb-2">{progress}%</h2>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Success */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full"
          >
            <div className="w-full flex flex-col items-center pt-[5rem] z-10 h-full justify-between flex-grow relative px-[3.2rem]">
              <div className="flex flex-col items-center gap-[2rem] text-center relative z-[1]">
                <h2 className="text-[3.2rem] font-bold text-[#FF5678]">
                  You&apos;re in!
                </h2>

                <p className="text-[1.6rem]">
                  Your first FYP Scout report arrives
                  <br />
                  Next Monday.
                </p>
              </div>
              <div className="absolute right-0 top-[50%] translate-y-[-50%] z-0 w-[40.2rem] h-[33rem]">
                <Image
                  src={ScreenBg4}
                  alt="You-Are-In"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div className="mt-auto w-full flex flex-col items-center gap-[2rem] relative z-[1]">
                <p className="text-[1.6rem] text-center">
                  Keep scrolling like normal.
                  <br />
                  We&apos;ll handle the rest.
                </p>

                <button
                  onClick={handleInvite}
                  className="w-[33.4rem] h-[5.6rem] bg-white gap-[0.4rem] rounded-full flex items-center justify-center text-black font-bold text-[1.6rem] hover:bg-gray-100 transition-colors"
                >
                  Invite your friends?
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
