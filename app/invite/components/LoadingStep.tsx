import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import LoadingGif from "@/assets/figma/invite/loading.gif";

type LoadingStepProps = {
  progress: number;
};

export const LoadingStep: React.FC<LoadingStepProps> = ({ progress }) => {
  const messages = [
    "Reading your watch history...",
    "AI crunching the numbers...",
    "Deleting raw data...",
    "Generating your report...",
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length]);

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
        <motion.h2
          key={progress}
          initial={{ scale: 0.9, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-[2.4rem] font-black leading-none"
        >
          {progress}%
        </motion.h2>
      </div>
    </motion.div>
  );
};
