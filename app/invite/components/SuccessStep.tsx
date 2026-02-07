import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import YouAreInGif from "@/assets/figma/invite/you-are-in.gif";

type SuccessStepProps = {
  onInvite: () => void;
};

export const SuccessStep: React.FC<SuccessStepProps> = ({ onInvite }) => {
  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-full"
    >
      <div className="w-full flex flex-col items-center pt-[5rem] z-10 h-full justify-between flex-grow relative px-[3.2rem]">
        <div className="flex flex-col items-center gap-[2rem] text-center relative z-[1]">
          <h2 className="text-[3.2rem] text-[#FF5678] font-invite-title">
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
            src={YouAreInGif}
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
            onClick={onInvite}
            className="w-[33.4rem] h-[5.6rem] bg-white gap-[0.8rem] rounded-full flex items-center justify-center text-black font-bold text-[1.6rem] hover:bg-gray-100 transition-colors"
          >
            Invite your friends?
          </button>
        </div>
      </div>
    </motion.div>
  );
};
