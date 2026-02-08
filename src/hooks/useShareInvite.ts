"use client";

import { useCallback } from "react";
import { useToast } from "@/context/ToastContext";

type ShareInviteOptions = {
  title?: string;
  text?: string;
  copiedToast?: string;
  failedToast?: string;
};

export function useShareInvite(options?: ShareInviteOptions) {
  const { showToast } = useToast();

  const copyToClipboard = useCallback(async (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn("Clipboard API failed, falling back...", err);
      }
    }

    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      return successful;
    } catch (err) {
      console.error("Fallback copy failed", err);
      return false;
    }
  }, []);

  const shareInvite = useCallback(
    async (url: string) => {
      if (!url) {
        showToast(options?.failedToast ?? "Failed to copy link");
        return;
      }

      if (navigator.share) {
        try {
          await navigator.share({
            title: options?.title ?? "FYP Scout - Your TikTok Wrapped",
            text: options?.text ?? "Check out my TikTok Wrapped!",
            url,
          });
          return;
        } catch (error) {
          console.log("Share failed or cancelled", error);
        }
      }

      const success = await copyToClipboard(url);
      if (success) {
        showToast(options?.copiedToast ?? "Link copied!");
      } else {
        showToast(options?.failedToast ?? "Failed to copy link");
      }
    },
    [
      copyToClipboard,
      options?.copiedToast,
      options?.failedToast,
      options?.text,
      options?.title,
      showToast,
    ],
  );

  return { shareInvite };
}
