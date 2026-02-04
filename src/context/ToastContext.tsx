"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Toast } from "@/components/ui/Toast";

interface ToastContextType {
  showToast: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [duration, setDuration] = useState(3000);

  const showToast = useCallback((msg: string, dur = 3000) => {
    setMessage(msg);
    setDuration(dur);
    setIsVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        message={message}
        isVisible={isVisible}
        onClose={hideToast}
        duration={duration}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
