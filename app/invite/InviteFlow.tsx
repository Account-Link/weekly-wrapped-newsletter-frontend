"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { startTikTokLink, pollTikTokRedirect } from "@/lib/api/tiktok";
import { FeedlingState } from "@/domain/report/types";

import TiktokIcon from "@/assets/figma/invite/tiktok-icon.svg";
import ScreenBg1 from "@/assets/figma/invite/screen-bg_1.gif";
import ScreenBg2 from "@/assets/figma/invite/screen-bg_2.gif";
import ScreenBg3 from "@/assets/figma/invite/screen-bg_3.gif";
import ScreenBg4 from "@/assets/figma/invite/screen-bg_4.gif";

type InviteFlowProps = {
  data: {
    trend: {
      topic: string;
      rank: number | null;
      totalDiscoverers: number;
    };
    feedlingState: FeedlingState;
  };
};

export default function InviteFlow({ data }: InviteFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [progress, setProgress] = useState(0);

  // TikTok Connect State
  const [isConnecting, setIsConnecting] = useState(false);
  const [tiktokToken, setTiktokToken] = useState<string | null>(null);
  const [appUserId, setAppUserId] = useState<string | null>(null);
  const [isRedirected, setIsRedirected] = useState(false);

  const { trend } = data;

  // Format numbers
  const rankStr = trend.rank ? trend.rank.toLocaleString() : "N/A";
  const totalStr = trend.totalDiscoverers
    ? trend.totalDiscoverers.toLocaleString()
    : "N/A";

  // Handle Loading Step
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

  const nextStep = () => {
    if (step < 4) setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
  };

  const resetState = () => {
    setIsConnecting(false);
    setIsRedirected(false);
    setTiktokToken(null);
    setAppUserId(null);
    // setAuthCode(null);
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setIsRedirected(false); // Reset redirect state

    try {
      const { archive_job_id: jobId } = await startTikTokLink();
      // Poll every 2 seconds
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await pollTikTokRedirect(jobId);

          if (statusRes.status === "ready" && statusRes.redirect_url) {
            // Open in new window as requested
            setIsRedirected((prev) => {
              if (!prev) {
                window.open(statusRes.redirect_url, "_blank");
                return true;
              }
              return prev;
            });
          }

          if (statusRes.status === "completed") {
            clearInterval(pollInterval);
            // Save credentials if returned
            if (statusRes.token && statusRes.app_user_id) {
              setTiktokToken(statusRes.token);
              setAppUserId(statusRes.app_user_id);
            }
          }

          if (
            statusRes.status === "expired" ||
            statusRes.status === "reauth_needed"
          ) {
            clearInterval(pollInterval);
            resetState();
            alert("Session expired or re-auth needed. Please try again.");
          }
        } catch (error) {
          console.error("Polling error:", error);
          resetState();
        }
      }, 3000);
    } catch (error) {
      console.error("Connection start error:", error);
      resetState();
      alert("Failed to start connection");
    }
  };

  return (
    <main
      className="h-dvh bg-[#313131] text-white flex flex-col items-center relative overflow-hidden px-[3.2rem]"
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
            <div className="w-full h-full flex flex-grow flex-col items-center justify-between">
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
                  <span className="text-[#FF5678]">#{rankStr}</span> to discover
                  out of <span className="text-[#FF5678]">{totalStr}</span>{" "}
                  people.
                  <br />
                  Were you earlier ?
                </p>

                <button
                  onClick={nextStep}
                  className="w-full h-[5.6rem] bg-white rounded-full flex items-center justify-center text-black font-bold text-[1.8rem] hover:bg-gray-100 transition-colors mt-[2rem]"
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

        {/* STEP 2: Privacy / Connect */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full h-full flex flex-col items-center flex-grow relative"
          >
            <div className="w-full h-full flex flex-col items-center justify-between flex-grow">
              <h2 className="w-full text-[2.8rem] font-bold text-center leading-[1.2] pt-[5rem] relative z-[1]">
                Your data goes in.
                <br />
                <span className="text-[#FF5678]">Only insights </span>
                come out.
              </h2>
              <div className="pointer-events-none flex-1 w-full flex items-center justify-center absolute top-[45%] translate-y-[-50%] z-[0]">
                <Image
                  src={ScreenBg2}
                  alt="Connecting"
                  className="object-contain w-[33.5rem] h-[33.5rem]"
                />
              </div>
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
                      AI processes your history data, then deletes it — no trace
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
                  disabled={isConnecting}
                  className={`w-[33.4rem] h-[5.6rem] bg-white rounded-full flex items-center justify-center gap-[0.4rem] text-black font-bold text-[1.6rem] transition-colors mt-auto ${
                    isConnecting
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {isConnecting ? (
                    "Connecting..."
                  ) : (
                    <>
                      <Image
                        src={TiktokIcon}
                        width={18}
                        height={21}
                        alt="TikTok"
                      />
                      Connect TikTok
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Loading */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col items-center justify-center relative"
          >
            <div className="flex flex-col items-center justify-center">
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
            className="w-full h-full flex flex-col items-center flex-grow"
          >
            <div className="w-full flex flex-col items-center pt-[5rem] z-10 h-full justify-between flex-grow">
              <div className="flex flex-col items-center gap-5 text-center">
                <h2 className="text-[3.2rem] font-bold text-[#FF5678]">
                  You&apos;re in!
                </h2>

                <p className="text-[1.6rem]">
                  Your first FYP Scout report arrives
                  <br />
                  Next Monday.
                </p>
              </div>
              <div className="relative w-[40.2rem] h-[33rem] mt-[4rem]">
                <Image
                  src={ScreenBg4}
                  alt="You-Are-In"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div className="mt-auto w-full flex flex-col items-center gap-8">
                <p className="text-[1.6rem] text-center">
                  Keep scrolling like normal.
                  <br />
                  We&apos;ll handle the rest.
                </p>

                <button className="w-[33.4rem] h-[5.6rem] bg-white rounded-full flex items-center justify-center gap-2 text-black font-bold text-[1.6rem] hover:bg-gray-100 transition-colors">
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
