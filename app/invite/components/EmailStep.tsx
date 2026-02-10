import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import RocketIcon from "@/assets/figma/invite/rocket.png";

type EmailStepProps = {
  onContinue: (email: string) => void;
  onInvalid?: (reason: "empty" | "format") => void;
  isSubmitting?: boolean;
};

export const EmailStep: React.FC<EmailStepProps> = ({
  onContinue,
  onInvalid,
  isSubmitting = false,
}) => {
  const [email, setEmail] = useState("");
  const { showToast } = useToast();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleContinue = () => {
    if (isSubmitting) return;
    if (!email) {
      onInvalid?.("empty");
      showToast("Please enter your email");
      return;
    }

    if (!validateEmail(email)) {
      onInvalid?.("format");
      showToast("Please enter a valid email address");
      return;
    }

    onContinue(email);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleContinue();
    }
  };

  return (
    <motion.div
      key="step-email"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full h-full flex-grow flex flex-col items-center px-[3.2rem] relative"
    >
      <div className="w-full flex-1 flex flex-col justify-center relative z-10">
        {/* Rocket Icon */}
        <div className="w-[9.3rem] h-[9.3rem] mb-[1.4rem]">
          <Image src={RocketIcon} alt="Rocket" className="object-contain" />
        </div>
        <h2 className="text-[2.4rem] text-white leading-none mb-[2.4rem] font-invite-title">
          Where should we send your TikTok Weekly Wrapped?
        </h2>

        <div className="w-full flex flex-col gap-[1.2rem]">
          <div className="relative w-full">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-[5.6rem] rounded-full bg-white/10 px-[2.4rem] text-white text-[1.6rem] placeholder:text-white/50 border border-transparent focus:border-white focus:outline-none transition-colors"
            />
          </div>

          <button
            onClick={handleContinue}
            disabled={isSubmitting}
            className={`w-full h-[5.6rem] bg-white rounded-full flex items-center justify-center text-black font-bold text-[1.6rem] transition-colors ${isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-100"}`}
          >
            {isSubmitting ? "Submitting..." : "Continue"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
