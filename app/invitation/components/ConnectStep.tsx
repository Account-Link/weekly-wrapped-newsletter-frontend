import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import ConnectGif from "@/assets/figma/invitation/connect.gif";
import TiktokIcon from "@/assets/figma/invitation/tiktok-icon.svg";

type ConnectStepProps = {
  redirectUrl: string | null;
  onConnect: () => void;
};

export const ConnectStep: React.FC<ConnectStepProps> = ({
  redirectUrl,
  onConnect,
}) => {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
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

      {!redirectUrl ? (
        /* PREPARING STATE UI */
        // <div className="w-full h-full flex flex-col items-center justify-center relative z-[1]">
        //   <p className="text-[1.8rem] font-bold text-white mt-[20rem] animate-pulse">
        //     Preparing your experience...
        //   </p>
        // </div>
        <></>
      ) : (
        /* CONNECT STATE UI */
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full flex flex-col items-center justify-between flex-grow px-[3.2rem]"
        >
          <h2 className="w-full text-[2.8rem] text-center leading-[1.2] pt-[5rem] relative z-[1] font-invite-title">
            Your data goes in.
            <br />
            <span className="text-[#FF5678]">Only insights </span>
            come out.
          </h2>

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
              onClick={onConnect}
              className={`w-[33.4rem] h-[5.6rem] bg-white rounded-full flex items-center justify-center gap-[0.8rem] text-black font-bold text-[1.6rem] transition-colors mt-auto hover:bg-gray-100`}
            >
              <Image src={TiktokIcon} width={18} height={21} alt="TikTok" />
              Connect TikTok
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
