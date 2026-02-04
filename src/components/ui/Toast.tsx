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
          className="fixed left-1/2 z-[9999] px-[2.4rem] py-[1.2rem] bg-black/80 backdrop-blur-sm rounded-[1.2rem] text-white text-[1.6rem] font-medium shadow-lg max-w-[90vw] text-center"
          style={{ top: "10rem" }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
