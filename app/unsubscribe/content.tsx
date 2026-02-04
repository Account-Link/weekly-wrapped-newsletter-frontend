"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import TopicIcon from "./images/topic.png";
import BannedIcon from "./images/banned.png";
import CatIcon from "./images/cat.gif";
import { unsubscribe, resubscribe } from "@/lib/api/report";
import { useToast } from "@/context/ToastContext";

type UnsubscribeState = "confirm" | "unsubscribed" | "subscribed";

const defaultState: UnsubscribeState = "confirm";

const resolveState = (value?: string | null): UnsubscribeState => {
  if (!value) return defaultState;
  if (
    value === "unsubscribed" ||
    value === "subscribed" ||
    value === "confirm"
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

  const [state, setState] = useState<UnsubscribeState>(() =>
    resolveState(searchParams.get("state")),
  );

  const handleUnsubscribe = async () => {
    if (!uid) {
      showToast("Missing uid. Please open this page from the email.");
      return;
    }

    setIsSubmitting(true);

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

  return (
    <AnimatePresence mode="wait">
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
                onClick={() => setState("subscribed")}
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
            <div className="w-full flex flex-col items-center justify-center">
              <span className="block mb-[1rem] text-white/50 text-[1.4rem] leading-none">
                Change your mind?
              </span>
              <button
                type="button"
                onClick={handleResubscribe}
                disabled={!uid || isSubmitting}
                className={`block w-[33.4rem] h-[5.2rem] rounded-full text-[1.6rem] font-bold transition-opacity ${
                  isSubmitting ? "opacity-70" : "hover:opacity-90"
                } ${uid ? "" : "opacity-60 cursor-not-allowed"} bg-[#4A4A4A] text-white mb-[1.2rem]`}
              >
                Re-subscribe
              </button>
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
              <h1 className="text-[2.8rem] font-bold mb-[1.6rem] leading-none">
                You&apos;re <span className="text-[#FF4F7A]">subscribed</span> !
              </h1>
              <p className="text-[1.6rem] leading-[2.2rem] text-white/70 mb-[3.2rem] whitespace-pre-line">
                Your next report arrives Monday.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
