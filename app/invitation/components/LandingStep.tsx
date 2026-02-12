import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import FindOutGif from "@/assets/figma/invitation/find-out.gif";

type LandingStepProps = {
  trend: {
    topic: string;
    rank: number | null;
    totalDiscoverers: number;
  };
  useDefaultCopy?: boolean;
  defaultTrendLabel?: string;
  onFindOut: () => void;
};

export const LandingStep: React.FC<LandingStepProps> = ({
  trend,
  useDefaultCopy = false,
  defaultTrendLabel = "xxxx",
  onFindOut,
}) => {
  const rankStr = trend.rank ? trend.rank.toLocaleString() : "N/A";
  const totalStr = trend.totalDiscoverers
    ? trend.totalDiscoverers.toLocaleString()
    : "N/A";
  // 重要逻辑：无 uid 时使用默认文案与占位趋势名，后续可替换为接口结果
  const trendLabel = useDefaultCopy ? defaultTrendLabel : trend.topic;

  return (
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
            <h2 className="text-[4rem] leading-[1.1] text-[#FF5678] drop-shadow-lg font-invite-title">
              {trendLabel}
            </h2>
            <p className="text-[2.4rem] font-bold text-white mt-[1rem]">
              blew up this week
            </p>
          </div>

          {/* Cat Image */}
          <div className="w-[40.2rem] h-[34rem] mt-[4rem] absolute right-0 top-[9rem] z-[0]">
            <Image
              src={FindOutGif}
              alt="Find-Out"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="w-full flex flex-col items-center relative z-[1]">
          <p className="text-[2.4rem] leading-[1.2] text-center text-white font-invite-title">
            {useDefaultCopy ? (
              <>
                Did your FYP{" "}
                <span className="text-[#FF5678]">catch it early? </span> Find
                out your trend rank.
              </>
            ) : (
              <>
                Your friend was{" "}
                <span className="text-[#FF5678]">{rankStr}</span> to discover
                out of <span className="text-[#FF5678]">{totalStr}</span>{" "}
                people. Were you earlier ?
              </>
            )}
          </p>

          <button
            onClick={onFindOut}
            className="w-full h-[5.6rem] gap-[0.8rem] bg-white rounded-full flex items-center justify-center text-black font-bold text-[1.8rem] hover:bg-gray-100 transition-colors mt-[2rem]"
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
  );
};
