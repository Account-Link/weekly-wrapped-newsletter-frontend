import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import LoadingGif from "@/assets/figma/invitation/loading.gif";

type LoadingStepProps = {
  progress: number;
  onRetry: () => void;
};

export const LoadingStep: React.FC<LoadingStepProps> = ({
  progress,
  onRetry,
}) => {
  const messages = [
    "Reading your watch history...",
    "AI crunching the numbers...",
    "Deleting raw data...",
    "Generating your report...",
  ];
  const [messageIndex, setMessageIndex] = useState(0);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRetry(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full"
    >
      <div className="w-full h-full flex flex-col items-center justify-center relative px-[3.2rem]">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="text-[1.6rem] font-semibold text-center"
          >
            {messages[messageIndex]}
          </motion.p>
        </AnimatePresence>
        {/* Loading Graphic */}
        <div className="relative w-full my-[2.4rem]">
          <Image
            src={LoadingGif}
            alt="Loading"
            className="object-contain animate-pulse w-[33.2rem] h-[19.8rem]"
          />
        </div>
        <h2 className="text-[2.4rem] font-black leading-none">{progress}%</h2>

        {/* Retry Button */}
        <AnimatePresence>
          {showRetry && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-[2rem] w-full flex flex-col items-center justify-center gap-[1.6rem]"
            >
              <p className="text-[1.6rem] text-center leading-none ">
                Taking too long?
              </p>
              <button
                onClick={onRetry}
                className="w-[33.4rem] h-[5.6rem] bg-white gap-[0.8rem] rounded-full flex items-center justify-center text-black font-bold text-[1.6rem] hover:bg-gray-100 transition-colors"
              >
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
