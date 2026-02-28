import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import WelcomeImage from "@/assets/figma/invitation/welcome.png";

type DuplicateStepProps = {
  email: string;
  username?: string;
  onRetry: () => void;
};

export const DuplicateStep: React.FC<DuplicateStepProps> = ({
  email,
  username,
  onRetry,
}) => {
  const maskedUsername = React.useMemo(() => {
    if (!username) return "—";
    if (username.length <= 3) return username;
    const start = username.slice(0, 3);
    const end = username.slice(-2);
    return `${start}***${end}`;
  }, [username]);

  return (
    <motion.div
      key="step-duplicate"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full h-full flex-grow flex flex-col items-center px-[3.2rem] relative"
    >
      <div className="w-full flex-1 flex flex-col justify-center items-center relative z-10">
        {/* Rocket Icon */}
        <div className="w-[17.4rem] h-[10.09rem] mb-[2.4rem] ml-[-4rem]">
          <Image src={WelcomeImage} alt="Welcome" className="object-contain" />
        </div>
        <h2 className="text-[2.4rem] text-white leading-none mb-[1.4rem] font-invite-title">
          Welcome back!
        </h2>
        <div className="text-[1.6rem] text-white/60 leading-1.5 text-center mb-[4.8rem]">
          This email is already connected to a TikTok account.
        </div>
        <div className="flex flex-col gap-[0.8rem] text-[1.6rem] text-white/60">
          <div>
            Email: <span className="text-white font-bold">{email}</span>
          </div>
          <div>
            Username:{" "}
            <span className="text-white font-bold">@{maskedUsername}</span>
          </div>
        </div>
        <div className="w-full h-[4.8rem]"></div>
        <div className="text-[1.6rem] leading-1.5 w-full text-white/60 text-center absolute bottom-0">
          Not you?
          <span onClick={onRetry} className="text-white underline ml-[0.4rem]">
            Use a different email →
          </span>
        </div>
      </div>
    </motion.div>
  );
};
