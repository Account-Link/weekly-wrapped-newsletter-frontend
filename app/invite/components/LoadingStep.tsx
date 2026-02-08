import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import LoadingGif from "@/assets/figma/invite/loading.gif";

type LoadingStepProps = {
  progress: number;
};

export const LoadingStep: React.FC<LoadingStepProps> = ({ progress }) => {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full"
    >
      <div className="w-full h-full flex flex-col items-center justify-center relative px-[3.2rem]">
        <p className="text-[2.4rem] font-bold text-center">
          Reading your watch history...
        </p>
        {/* Loading Graphic */}
        <div className="relative w-full my-[4rem]">
          <Image
            src={LoadingGif}
            alt="Loading"
            className="object-contain animate-pulse w-[33.2rem] h-[19.8rem]"
          />
        </div>
        <h2 className="text-[2.8rem] font-bold mb-2">{progress}%</h2>
      </div>
    </motion.div>
  );
};
