"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import TopicIcon from "@/assets/figma/unsubscribe/topic.png";
import BannedIcon from "@/assets/figma/unsubscribe/banned.png";
import CatIcon from "@/assets/figma/unsubscribe/cat.gif";
import LockIcon from "@/assets/figma/unsubscribe/lock.png";
import BannedTikTokIcon from "@/assets/figma/unsubscribe/banned-tiktok.png";
import TiktokIcon from "@/assets/figma/invitation/tiktok-icon.svg";
import BackIcon from "@/assets/figma/unsubscribe/back.svg";
import { unsubscribe, resubscribe, disconnect } from "@/lib/api/report";
import { useToast } from "@/context/ToastContext";
import { trackEvent } from "@/lib/tracking";
import ConnectGif from "@/assets/figma/invitation/connect.gif";

type UnsubscribeState =
  | "confirm"
  | "unsubscribed"
  | "subscribed"
  | "disconnect"
  | "disconnected"
  | "disconnecting"; // Add disconnecting state

const defaultState: UnsubscribeState = "confirm";

const resolveState = (value?: string | null): UnsubscribeState => {
  if (!value) return defaultState;
  if (
    value === "unsubscribed" ||
    value === "subscribed" ||
    value === "confirm" ||
    value === "disconnect" ||
    value === "disconnected"
  ) {
    return value;
  }
  return defaultState;
};

export default function UnsubscribeClient() {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const uid = searchParams.get("uid") ?? "";
  const emailId = searchParams.get("eid") || searchParams.get("email_id") || "";

  const [state, setState] = useState<UnsubscribeState>(() =>
    resolveState(searchParams.get("state")),
  );

  const hasTrackedCancel = useRef(false);

  useEffect(() => {
    if (!uid) return;
    trackEvent({
      event: "unsubscribe_page_view",
      uid,
      params: { eid: emailId },
    });
  }, [uid, emailId]);

  const handleUnsubscribe = async () => {
    if (!uid) {
      showToast("Missing uid. Please open this page from the email.");
      return;
    }

    setIsSubmitting(true);

    const key = `tracked_unsubscribe_confirm_${uid}`;
    if (typeof window !== "undefined" && !localStorage.getItem(key)) {
      trackEvent({
        event: "unsubscribe_confirm",
        uid,
        params: { eid: emailId },
      });
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
        now.getDate(),
      )}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      localStorage.setItem(key, timestamp);
    }

    try {
      const { success } = await unsubscribe(uid);
      if (!success) {
        showToast("Unsubscribe failed. Please try again.");
        return;
      }
      setState("unsubscribed");
    } catch {
      showToast("Unsubscribe failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResubscribe = async () => {
    if (!uid) {
      showToast("Missing uid. Please open this page from the email.");
      return;
    }

    setIsSubmitting(true);

    trackEvent({
      event: "resubscribe",
      uid,
      params: { eid: emailId },
    });

    try {
      const { success } = await resubscribe(uid);
      if (!success) {
        showToast("Re-subscribe failed. Please try again.");
        return;
      }
      setState("subscribed");
    } catch {
      showToast("Re-subscribe failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!uid) {
      showToast("Missing uid. Please open this page from the email.");
      return;
    }

    setIsSubmitting(true);
    // 先切换到 loading 状态
    setState("disconnecting");

    trackEvent({
      event: "disconnect_tiktok",
      uid,
      params: { eid: emailId },
    });

    try {
      const { success } = await disconnect(uid);
      if (!success) {
        showToast("Disconnect failed. Please try again.");
        // 失败回退到 disconnect 确认页
        setState("disconnect");
        return;
      }
      setState("disconnected");
    } catch {
      showToast("Disconnect failed. Please try again.");
      setState("disconnect");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {state !== "confirm" && state !== "disconnecting" && (
        <motion.div
          key="back"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 0.6, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.3 }}
          className="absolute left-[3.4rem] cursor-pointer w-[6.2rem] h-[3.8rem] flex items-center justify-between z-[1] text-white text-[2rem] opacity-60"
          style={{
            top: `calc(env(safe-area-inset-top) + 2rem)`,
          }}
          onClick={() => setState("confirm")}
        >
          <Image src={BackIcon} alt="back" className="w-[0.9rem] h-[1.6rem]" />
          Back
        </motion.div>
      )}
      {state === "confirm" && (
        <motion.div
          key="confirm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative h-dvh mx-auto w-[40.2rem] bg-[#313131] text-white"
          style={{
            paddingTop: `calc(env(safe-area-inset-top) + 2rem)`,
            paddingBottom: `calc(env(safe-area-inset-bottom) + 2rem)`,
          }}
        >
          <div className="flex flex-col justify-end items-center h-full">
            <Image
              src={TopicIcon}
              className="absolute z-[0] object-contain left-0 top-0 w-[50.9rem] h-auto"
              alt=""
            />
            <div className="w-full flex flex-col items-center text-center relative z-[1]">
              <h1 className="text-[2.8rem] leading-[3.4rem] font-bold mb-[4rem]">
                Are you sure you want to{" "}
                <span className="text-[#FF4F7A]">unsubscribe </span>?
              </h1>
              <button
                type="button"
                onClick={handleUnsubscribe}
                disabled={!uid || isSubmitting}
                className={`block w-[33.4rem] h-[5.2rem] rounded-full text-[1.6rem] font-bold transition-opacity ${
                  isSubmitting ? "opacity-70" : "hover:opacity-90"
                } ${uid ? "" : "opacity-60 cursor-not-allowed"} bg-[#4A4A4A] text-white mb-[1.2rem]`}
              >
                {isSubmitting ? "Unsubscribing..." : "Yes, unsubscribe"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!hasTrackedCancel.current) {
                    trackEvent({
                      event: "unsubscribe_cancel",
                      uid,
                      params: { eid: emailId },
                    });
                    hasTrackedCancel.current = true;
                  }
                  setState("subscribed");
                }}
                disabled={!uid}
                className={`block w-[33.4rem] h-[5.2rem] rounded-full text-[1.6rem] font-bold transition-opacity ${
                  uid ? "hover:opacity-90" : "opacity-60 cursor-not-allowed"
                } bg-white text-black`}
              >
                No, keep sending
              </button>
            </div>
          </div>
        </motion.div>
      )}
      {state === "unsubscribed" && (
        <motion.div
          key="unsubscribed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative h-dvh mx-auto w-[40.2rem] bg-[#313131] text-white"
          style={{
            paddingTop: `calc(env(safe-area-inset-top) + 2rem)`,
            paddingBottom: `calc(env(safe-area-inset-bottom) + 2rem)`,
          }}
        >
          <div className="h-full w-full flex flex-col justify-end items-center text-center px-[3.4rem]">
            <div className="absolute w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="inline-block mb-[3rem] text-center">
                <Image
                  src={BannedIcon}
                  alt="Unsubscribed cat"
                  className="w-[9.7rem] h-[9.7rem] object-contain"
                />
              </div>
              <h1 className="text-[2.8rem] font-bold mb-[1.6rem] leading-none">
                You&apos;ve been{" "}
                <span className="text-[#FF4F7A]">unsubscribed</span>.
              </h1>
              <p className="text-[1.6rem] leading-[2.2rem] text-white/70 mb-[3.2rem] whitespace-pre-line">
                You won&apos;t receive TikTok Weekly Scout Reports anymore.
              </p>
            </div>
            <div className="w-full flex flex-col items-center justify-center mb-">
              <p className="w-[33.4rem] text-[1.4rem] leading-[2.4rem] text-white/60 mb-[3.2rem] whitespace-pre-line">
                Change your mind?{" "}
                <span
                  className="text-white underline"
                  onClick={handleResubscribe}
                >
                  Resubscribe→
                </span>
                <br />
                Want to disconnect TikTok entirely?
                <br />
                <span
                  className="text-white underline cursor-pointer"
                  onClick={() => setState("disconnect")}
                >
                  Manage data access→
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      )}
      {state === "subscribed" && (
        <motion.div
          key="subscribed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative h-dvh mx-auto w-[40.2rem] bg-[#313131] text-white"
          style={{
            paddingTop: `env(safe-area-inset-top)`,
            paddingBottom: `env(safe-area-inset-bottom)`,
          }}
        >
          <div className="relative h-full w-full flex flex-col items-center text-center px-[3.4rem] py-[2rem]">
            <div className="absolute w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="inline-block mb-[1rem] text-center">
                <Image
                  src={CatIcon}
                  alt="Subscribed cat"
                  className="w-[24rem] h-[24rem] object-contain"
                />
              </div>
              <h1 className="text-[2.8rem] font-bold mb-[1.6rem] leading-none text-[#FF4F7A]">
                You&apos;re subscribed!
              </h1>
              <p className="text-[1.6rem] leading-[2.2rem] text-white/70 mb-[3.2rem] whitespace-pre-line">
                Your next report arrives Monday.
              </p>
            </div>
          </div>
        </motion.div>
      )}
      {state === "disconnect" && (
        <motion.div
          key="disconnect"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative h-dvh mx-auto w-[40.2rem] bg-[#313131] text-white"
          style={{
            paddingTop: `calc(env(safe-area-inset-top) + 2rem)`,
            paddingBottom: `calc(env(safe-area-inset-bottom) + 2rem)`,
          }}
        >
          <div className="h-full w-full flex flex-col justify-end items-center text-center px-[3.4rem]">
            <div className="absolute w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="inline-block mb-[1.6rem] text-center">
                <Image
                  src={BannedTikTokIcon}
                  alt="Disconnect TikTok"
                  className="w-[9.7rem] h-[9.7rem] object-contain"
                />
              </div>
              <h1 className="text-[2.8rem] font-bold mb-[1.6rem] leading-none text-[#FF4F7A]">
                Are you sure?
              </h1>
              <div className="w-[33.4rem] mx-auto flex flex-col gap-[0.8rem] pb-[2.4rem] text-left">
                {/* Item 1 */}
                <div className="flex items-center gap-[1.2rem]">
                  <div className="w-[1.2rem] h-[1.2rem] rounded-full bg-[#FF5678] shrink-0" />
                  <p className="text-[1.6rem] leading-[1.8rem]">
                    This will permanently revoke TikTok access and delete your
                    data.
                  </p>
                </div>
                {/* Item 2 */}
                <div className="flex items-center gap-[1.2rem]">
                  <div className="w-[1.2rem] h-[1.2rem] rounded-full bg-[##22C083] shrink-0" />
                  <p className="text-[1.6rem] leading-[1.8rem]">
                    You&apos;ll need to reconnect to use our service again.
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={!uid || isSubmitting}
                className={`block w-[33.4rem] h-[5.2rem] rounded-full text-[1.6rem] font-bold transition-opacity ${
                  isSubmitting ? "opacity-70" : "hover:opacity-90"
                } ${uid ? "" : "opacity-60 cursor-not-allowed"} bg-] bg-white flex items-center justify-center gap-[0.8rem] text-black transition-colors mt-auto hover:bg-gray-100`}
              >
                Disconnect TikTok
                <Image src={TiktokIcon} width={18} height={21} alt="TikTok" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
      {state === "disconnecting" && (
        <motion.div
          key="disconnecting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full h-full flex flex-col items-center flex-grow "
        >
          {/* Background Image (Shared between Preparing and Connect) */}
          <div className="pointer-events-none flex-1 w-full flex items-center justify-center absolute top-[45%] translate-y-[-50%] z-[0] px-[3.2rem]">
            <Image
              src={ConnectGif}
              alt="Connecting"
              className="object-contain w-[33.5rem] h-[33.5rem]"
            />
          </div>
        </motion.div>
      )}
      {state === "disconnected" && (
        <motion.div
          key="disconnected"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative h-dvh mx-auto w-[40.2rem] bg-[#313131] text-white"
          style={{
            paddingTop: `calc(env(safe-area-inset-top) + 2rem)`,
            paddingBottom: `calc(env(safe-area-inset-bottom) + 2rem)`,
          }}
        >
          <div className="h-full w-full flex flex-col justify-end items-center text-center px-[3.4rem]">
            <div className="absolute w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="inline-block mb-[1.6rem] text-center">
                <Image
                  src={LockIcon}
                  alt="TikTok disconnected"
                  className="w-[7.1rem] h-[7.5rem] object-contain"
                />
              </div>
              <h1 className="w-[33.4rem] mx-auto text-[2.8rem] font-bold mb-[1.6rem] leading-none text-[#FF4F7A]">
                TikTok disconnected.
              </h1>
              <p className=" w-[33.4rem] mx-auto text-[1.6rem] leading-[2.2rem] text-white whitespace-pre-line">
                We no longer have access to your account. See you later!
              </p>
            </div>
            <div className="w-full flex flex-col items-center justify-center mb-">
              <p className="w-[33.4rem] text-[1.4rem] leading-[2.4rem] text-white/60 mb-[3.2rem] whitespace-pre-line">
                Want to reconnect?
                <span className="text-white underline"> Connect TikTok→</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
