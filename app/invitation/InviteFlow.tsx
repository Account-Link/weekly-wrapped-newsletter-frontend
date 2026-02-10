"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  startTikTokLink,
  pollTikTokRedirect,
  registerEmail,
  ApiRequestError,
} from "@/lib/api/tiktok";
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
  const [hasEmailSubmitted, setHasEmailSubmitted] = useState(false);
  const [isRegisteringEmail, setIsRegisteringEmail] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<
    "preconnect" | "postoauth" | null
  >(null);
  const { showToast } = useToast();
  const { shareInvite } = useShareInvite({
    title: "Who's the trendsetter?",
    text: "I just got my TikTok trend rank. Your turn.",
  });

  // TikTok Connect State
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startPollingRef = useRef<(jobId: string) => void>(() => {});
  const stepRef = useRef<Step>("landing");
  const loadingPhaseRef = useRef<"preconnect" | "postoauth" | null>(null);

  // Time Tracking Refs
  const landingClickTimeRef = useRef<number | null>(null);
  const loadingCompleteTimeRef = useRef<number | null>(null);
  const loadingStartTimeRef = useRef<number | null>(null);
  const pendingOauthCompletedRef = useRef(false);

  const [tiktokToken, setTiktokToken] = useState<string | null>(null);
  const [appUserId, setAppUserId] = useState<string | null>(null);
  const [oauthCompleted, setOauthCompleted] = useState(false);
  const oauthCompletedRef = useRef(false);

  // PC QR Code State
  const [isPc, setIsPc] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showGeoModal, setShowGeoModal] = useState(false);

  const { trend } = data;
  // const { checkUS } = useUSCheck();

  const trackOnce = useCallback(
    (eventName: string, callback: () => void) => {
      if (typeof window === "undefined") return;

      const isUserScoped = [
        "referral_oauth_success",
        "referral_processing_view",
        "referral_complete",
      ].includes(eventName);
      const isDeviceScoped = [
        "referral_landing_click",
        "referral_email_view",
        "referral_email_submit",
        "referral_loading_start",
        "referral_loading_complete",
        "referral_oauth_start",
      ].includes(eventName);

      let storageKey = `tracked_${eventName}`;
      if (isUserScoped) {
        storageKey = `tracked_${eventName}_${uid}`;
      } else if (isDeviceScoped) {
        let deviceId = localStorage.getItem("device_id");
        if (!deviceId) {
          deviceId = `device_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 9)}`;
          localStorage.setItem("device_id", deviceId);
        }
        storageKey = `tracked_${eventName}_${deviceId}`;
      }

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

  const startSession = useCallback(async (): Promise<string> => {
    // 重要逻辑：start 失败时持续重试直到成功
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const { archive_job_id: newJobId } = await startTikTokLink();
        setJobId(newJobId);
        return newJobId;
      } catch (error) {
        console.error("Failed to start:", error);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }, []);

  // Track Funnel Steps
  useEffect(() => {
    if (step === "connect") {
      if (!redirectUrl) {
        trackOnce("referral_loading_start", () => {
          trackEvent({ event: "referral_loading_start", uid });
        });
      } else {
        loadingCompleteTimeRef.current = Date.now();
        const duration = landingClickTimeRef.current
          ? loadingCompleteTimeRef.current - landingClickTimeRef.current
          : 0;

        trackOnce("referral_loading_complete", () => {
          trackEvent({
            event: "referral_loading_complete",
            uid,
            params: { duration },
          });
        });
      }
    } else if (step === "email") {
      trackOnce("referral_email_view", () => {
        trackEvent({ event: "referral_email_view", uid });
      });
    } else if (step === "success") {
      trackOnce("referral_complete", () => {
        trackEvent({ event: "referral_complete", uid });
      });
    }
  }, [step, redirectUrl, uid, trackOnce]);

  const startAndPoll = useCallback(async () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    // Reset redirectUrl to show Preparing state if retrying
    setRedirectUrl((prev) => (prev ? null : prev));

    const newJobId = await startSession();
    startPollingRef.current(newJobId);
  }, [startSession]);

  const resetToConnectAndRetry = useCallback(() => {
    setOauthCompleted(false);
    setLoadingPhase(null);
    setRedirectUrl(null);
    setShowQrModal(false);
    stepRef.current = "connect";
    loadingPhaseRef.current = null;
    setStep("connect");
    startAndPoll();
  }, [startAndPoll]);

  const startPolling = useCallback(
    (currentJobId: string) => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      const pollOnce = async () => {
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
            trackEvent({ event: "referral_oauth_success", uid });
          });
          setOauthCompleted(true);
          setShowQrModal(false);
          if (hasEmailSubmitted) {
            setLoadingPhase("postoauth");
            setStep("loading");
          } else {
            pendingOauthCompletedRef.current = true;
          }
        }

        // 3. Error/Expired state: Auto Retry
        if (
          statusRes.status === "expired" ||
          statusRes.status === "reauth_needed" ||
          statusRes.status === "error"
        ) {
          if (
            statusRes.status === "reauth_needed" ||
            statusRes.status === "error"
          ) {
            trackEvent({
              event: "referral_oauth_fail",
              uid,
              params: {
                status: statusRes.status,
                error: statusRes.error,
              },
            });
          }
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setJobId(null);
          if (
            stepRef.current === "loading" &&
            loadingPhaseRef.current === "postoauth"
          ) {
            // 重要逻辑：connect 后进度页失败/过期时提示并回退重试
            showToast("Request timed out. Try again.");
            resetToConnectAndRetry();
            return;
          }
          startAndPoll();
        }
      };

      pollIntervalRef.current = setInterval(async () => {
        try {
          await pollOnce();
        } catch (error) {
          console.error("Polling error:", error);

          // Error handling: Auto Retry
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setJobId(null);
          if (
            stepRef.current === "loading" &&
            loadingPhaseRef.current === "postoauth"
          ) {
            // 重要逻辑：connect 后进度页请求失败时提示并回退重试
            showToast("Request timed out. Try again.");
            resetToConnectAndRetry();
            return;
          }
          startAndPoll();
        }
      }, 2000); // Poll every 2s

      void pollOnce();
    },
    [
      hasEmailSubmitted,
      loadingPhase,
      resetToConnectAndRetry,
      showToast,
      startAndPoll,
      step,
      trackOnce,
      uid,
    ],
  );

  useEffect(() => {
    startPollingRef.current = startPolling;
  }, [startPolling]);

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

  useEffect(() => {
    trackEvent({ event: "referral_landing_view", uid });
  }, [uid]);

  useEffect(() => {
    oauthCompletedRef.current = oauthCompleted;
  }, [oauthCompleted]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    loadingPhaseRef.current = loadingPhase;
  }, [loadingPhase]);

  useEffect(() => {
    // 重要逻辑：开局 start 后立即进入 polling
    void startAndPoll();
  }, [startAndPoll]);

  // Handle Loading Step
  useEffect(() => {
    if (step === "loading") {
      loadingStartTimeRef.current = Date.now();
      setProgress(0);
      const interval = setInterval(() => {
        const startTime = loadingStartTimeRef.current;
        const elapsed = startTime ? Date.now() - startTime : 0;
        const completed = oauthCompletedRef.current;
        // 重要逻辑：loading 不同阶段的进度规则
        const isPostOauth = loadingPhase === "postoauth";
        const ratio = Math.min(elapsed / 10000, 1);
        const maxProgress = isPostOauth && completed ? 100 : 99;
        const next = Math.floor(ratio * maxProgress);
        setProgress((prev) => (next > prev ? next : prev));
        if (isPostOauth && completed && elapsed >= 10000) {
          clearInterval(interval);
          setProgress(100);
          setStep("success");
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [step, loadingPhase]);

  const handleFindOut = () => {
    // 埋点：点击 Find Out
    landingClickTimeRef.current = Date.now();
    trackOnce("referral_landing_click", () => {
      trackEvent({ event: "referral_landing_click", uid });
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

    if (isRegisteringEmail) return;
    setIsRegisteringEmail(true);
    // 重要逻辑：注册邮箱成功后再进入连接流程
    try {
      await registerEmail(inputEmail);
      trackOnce("referral_email_submit", () => {
        trackEvent({ event: "referral_email_submit", uid });
      });
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.code === "email_duplicate") {
          trackEvent({ event: "referral_email_duplicate", uid });
          showToast("This email has already been used");
          return;
        }
        if (error.code === "invalid_email") {
          showToast("Please enter a valid email address");
          return;
        }
      }
      console.error("Failed to register email:", error);
      showToast("Email registration failed. Please try again.");
      return;
    } finally {
      setIsRegisteringEmail(false);
    }
    setHasEmailSubmitted(true);
    if (pendingOauthCompletedRef.current) {
      pendingOauthCompletedRef.current = false;
      setLoadingPhase("postoauth");
      setStep("loading");
      return;
    }
    const ensuredJobId = jobId || (await startSession());
    startPolling(ensuredJobId);
    setLoadingPhase(null);
    setStep("connect");
  };

  const handleConnect = () => {
    if (!redirectUrl) return;

    // Retry logic: If no job_id (cleared by error), restart session
    if (!jobId) {
      startAndPoll();
      return;
    }

    // 重要逻辑：点击连接 TikTok 时计算并单独上报三个时长指标
    const now = Date.now();
    const landingClickTime = landingClickTimeRef.current;
    const loadingCompleteTime = loadingCompleteTimeRef.current;
    const duration = loadingCompleteTime ? now - loadingCompleteTime : 0;
    const loadingDuration =
      landingClickTime && loadingCompleteTime
        ? loadingCompleteTime - landingClickTime
        : 0;
    const privacyReadDuration = loadingCompleteTime
      ? now - loadingCompleteTime
      : 0;
    const landingDuration = landingClickTime ? now - landingClickTime : 0;

    trackOnce("referral_processing_view", () => {
      trackEvent({ event: "referral_processing_view", uid });
    });

    trackOnce("referral_oauth_start", () => {
      trackEvent({
        event: "referral_oauth_start",
        uid,
        params: { duration },
      });
    });

    trackEvent({
      event: "referral_duration_metrics",
      uid,
      params: {
        loading_duration: loadingDuration,
        privacy_read_duration: privacyReadDuration,
        landing_to_oauth: landingDuration,
      },
    });

    setOauthCompleted(false);
    setProgress(0);
    stepRef.current = "loading";
    loadingPhaseRef.current = "postoauth";
    setLoadingPhase("postoauth");
    setStep("loading");

    if (isPc) {
      setShowQrModal(true);
    } else {
      window.location.href = redirectUrl;
    }
  };

  const handleInvite = async () => {
    const url = window.location.href;

    // 埋点：点击邀请/分享
    trackEvent({ event: "referral_invite_click", uid });

    await shareInvite(url);
  };

  const handleRetry = () => {
    setOauthCompleted(false);
    setLoadingPhase(null);
    setStep("connect");
    startAndPoll();
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
        {step === "email" && (
          <EmailStep
            onContinue={handleEmailContinue}
            isSubmitting={isRegisteringEmail}
            onInvalid={(reason) => {
              trackEvent({
                event: "referral_email_invalid",
                uid,
                params: { reason },
              });
            }}
          />
        )}
        {step === "connect" && (
          <ConnectStep redirectUrl={redirectUrl} onConnect={handleConnect} />
        )}
        {step === "loading" && (
          <LoadingStep progress={progress} onRetry={handleRetry} />
        )}
        {step === "success" && <SuccessStep onInvite={handleInvite} />}
      </AnimatePresence>
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
                Open your camera app to scan this code and connect your TikTok
                account.
              </p>
            </motion.div>
          </motion.div>
        )}
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
