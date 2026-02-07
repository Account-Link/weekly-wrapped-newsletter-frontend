"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  isVisible,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          transition={{ duration: 0.3 }}
          className="fixed left-1/2 z-[9999] flex items-center justify-center w-full max-w-[33.4rem] h-[5.6rem] px-[2.4rem] bg-black/70 backdrop-blur-sm rounded-[16px] text-white text-[1.6rem] font-medium shadow-lg text-center"
          style={{ top: "10rem" }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
