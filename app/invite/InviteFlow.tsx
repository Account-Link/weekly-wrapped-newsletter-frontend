"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { startTikTokLink, pollTikTokRedirect } from "@/lib/api/tiktok";
import { FeedlingState } from "@/domain/report/types";
import { useToast } from "@/context/ToastContext";
import { useShareInvite } from "@/hooks/useShareInvite";
// import { useUSCheck } from "@/hooks/useUSCheck";
import { trackEvent } from "@/lib/tracking";

import { LandingStep } from "./components/LandingStep";
import { EmailStep } from "./components/EmailStep";
import { ConnectStep } from "./components/ConnectStep";
import { LoadingStep } from "./components/LoadingStep";
import { SuccessStep } from "./components/SuccessStep";

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

type Step = "landing" | "email" | "connect" | "loading" | "success";

export default function InviteFlow({ uid, data }: InviteFlowProps) {
  const [step, setStep] = useState<Step>("landing");
  const [progress, setProgress] = useState(0);
  const [email, setEmail] = useState("");
  const { showToast } = useToast();
  const { shareInvite } = useShareInvite();

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
  // const { checkUS } = useUSCheck();

  // 重要逻辑：埋点去重，避免重复上报影响统计
  const trackOnce = useCallback(
    (action: string, callback: () => void) => {
      if (typeof window === "undefined") return;

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
    },
    [uid],
  );

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
    if (step === "connect") {
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
    } else if (step === "loading") {
      trackOnce("referral_processing_view", () => {
        trackEvent({
          event: "view",
          type: "invite_flow",
          action: "referral_processing_view",
          uid,
        });
      });
    } else if (step === "success") {
      trackOnce("referral_complete", () => {
        trackEvent({
          event: "view",
          type: "invite_flow",
          action: "referral_complete",
          uid,
        });
      });
    }
  }, [step, redirectUrl, uid, trackOnce]);

  const startAndPoll = async (currentEmail: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    // Reset redirectUrl to show Preparing state if retrying
    if (redirectUrl) {
      setRedirectUrl(null);
    }

    try {
      const { archive_job_id: newJobId } = await startTikTokLink(currentEmail);
      setJobId(newJobId);
      startPolling(newJobId, currentEmail);
    } catch (error) {
      console.error("Failed to start:", error);
      // Retry after delay
      setTimeout(() => startAndPoll(currentEmail), 2000);
    }
  };

  const startPolling = (currentJobId: string, currentEmail: string) => {
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

          // Clear saved job_id & email
          setJobId(null);

          // 埋点：连接成功
          trackOnce("referral_oauth_success", () => {
            trackEvent({
              event: "referral_oauth_success",
              type: "invite_flow",
              uid,
            });
          });
          setStep("loading");
        }

        // 3. Error/Expired state: Auto Retry
        if (
          statusRes.status === "expired" ||
          statusRes.status === "reauth_needed" ||
          statusRes.status === "error"
        ) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setJobId(null);
          startAndPoll(currentEmail);
        }
      } catch (error) {
        console.error("Polling error:", error);

        // Error handling: Auto Retry
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setJobId(null);
        startAndPoll(currentEmail);
      }
    }, 2000); // Poll every 2s
  };

  // Handle Loading Step
  useEffect(() => {
    if (step === "loading") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep("success");
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
    setStep("email");
  };

  const handleEmailContinue = async (inputEmail: string) => {
    // 重要逻辑：US 校验必须在发起邮箱上传接口前完成
    // const isUS = await checkUS();
    // if (!isUS) {
    //   setShowGeoModal(true);
    //   return;
    // }

    setEmail(inputEmail);
    setStep("connect");
    startAndPoll(inputEmail);
  };

  const handleConnect = () => {
    if (!redirectUrl) return;

    // Retry logic: If no job_id (cleared by error), restart session
    if (!jobId) {
      startAndPoll(email);
      return;
    }

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

  const handleInvite = async () => {
    const url = window.location.href;

    // 埋点：点击邀请/分享
    trackEvent({
      event: "click",
      type: "invite_flow",
      action: "referral_invite_click",
      uid,
    });

    await shareInvite(url);
  };

  return (
    <main
      className="h-dvh w-[40.2rem] mx-auto bg-[#313131] text-white flex flex-col items-center relative overflow-hidden font-poppins"
      style={{
        paddingTop: `calc(env(safe-area-inset-top) + 2rem)`,
        paddingBottom: `calc(env(safe-area-inset-bottom) + 2rem)`,
      }}
    >
      <AnimatePresence mode="wait">
        {step === "landing" && (
          <LandingStep trend={trend} onFindOut={handleFindOut} />
        )}
        {step === "email" && <EmailStep onContinue={handleEmailContinue} />}
        {step === "connect" && (
          <ConnectStep
            redirectUrl={redirectUrl}
            onConnect={handleConnect}
            showQrModal={showQrModal}
            setShowQrModal={setShowQrModal}
          />
        )}
        {step === "loading" && <LoadingStep progress={progress} />}
        {step === "success" && <SuccessStep onInvite={handleInvite} />}
      </AnimatePresence>
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
                Sorry, this experience is currently available only for users in
                the United States.
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
    </main>
  );
}
