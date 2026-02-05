// 文件功能：分享下载页内容组件，处于分享链路落地页
// 方法概览：解析参数、记录埋点、渲染下载入口
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/tracking";
import { trackShareSaved } from "@/lib/client-analytics";

// 方法功能：渲染分享下载页面内容
export default function DownloadContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const filename = searchParams.get("filename") || "image.png";
  const type = searchParams.get("type") || "unknown";
  const uid = searchParams.get("uid") || "anonymous";
  const weekStart = searchParams.get("weekStart");
  const periodStart = searchParams.get("period_start");
  const periodEnd = searchParams.get("period_end");
  const [isDownloading, setIsDownloading] = useState(false);

  // 重要逻辑：根据下载类型映射分享动作，保持统计口径一致
  const resolveShareAction = (value: string) => {
    if (value.includes("stats")) {
      return "share_stats" as const;
    }
    return "share_week" as const;
  };
  const emailId = weekStart || "unknown";

  useEffect(() => {
    // 重要逻辑：打开下载页即上报埋点
    if (!url) {
      return;
    }

    trackEvent({
      event: "page_view",
      type: "download_page", // 埋点 code
      uid,
      eid: emailId,
      source: "email",
      extraData: {
        targetUrl: url,
        filename,
      },
    });
  }, [type, url, uid, emailId, filename]);

  const handleDownload = async () => {
    if (!url || isDownloading) {
      return;
    }

    setIsDownloading(true);

    try {
      // 记录下载行为埋点
      trackEvent({
        event: "click",
        type: "download_page", // 埋点 code
        action: "download", // 具体动作
        uid,
        eid: emailId,
        extraData: {
          shareAction: resolveShareAction(type),
          targetUrl: url,
          filename,
        },
      });

      // 记录 Firebase Analytics 保存埋点
      await trackShareSaved({
        uid,
        emailId,
        action: resolveShareAction(type),
      });

      const link = document.createElement("a");
      if (url.startsWith("data:")) {
        link.href = url;
      } else {
        const apiUrl = new URL("/api/download", window.location.origin);
        apiUrl.searchParams.set("url", url);
        apiUrl.searchParams.set("filename", filename);
        if (periodStart) apiUrl.searchParams.set("period_start", periodStart);
        if (periodEnd) apiUrl.searchParams.set("period_end", periodEnd);
        link.href = apiUrl.toString();
      }
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again or right-click to save.");
    } finally {
      setIsDownloading(false);
    }
  };

  // 使用 Tailwind 的 dark: 前缀和 CSS 变量适配系统主题
  // 默认样式为浅色模式，dark: 类用于深色模式适配
  const textColor = "text-[#000] dark:text-[#fffffe]";
  const backgroundColor = "bg-[#e4e4e4] dark:bg-[#313131]";
  const borderColor =
    "border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.2)]";
  const buttonBg = "bg-[#651AE9] dark:bg-[#fff]";
  const buttonText = "text-[#fff] dark:text-[#000]";

  useEffect(() => {
    // 设置 iOS 顶部状态栏颜色
    // 对于支持 theme-color 的浏览器，动态设置 meta 标签
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    // 浅色模式下使用 #e4e4e4，深色模式下使用 #313131
    // 注意：这里简单判断系统主题，更完善的做法是监听 prefers-color-scheme
    const updateThemeColor = () => {
      const isDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          "content",
          isDarkMode ? "#313131" : "#e4e4e4",
        );
      } else {
        const meta = document.createElement("meta");
        meta.name = "theme-color";
        meta.content = isDarkMode ? "#313131" : "#e4e4e4";
        document.head.appendChild(meta);
      }
    };

    updateThemeColor();
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateThemeColor);
    return () => mediaQuery.removeEventListener("change", updateThemeColor);
  }, []);

  // 统一使用 9:16 的手机屏幕比例
  const aspectRatio = "9/16";

  if (!url) {
    return (
      <div
        className="h-dvh w-[40.2rem] bg-[#313131] flex flex-col items-center justify-center px-[2rem] py-[2.4rem] text-[#fffffe]"
        style={{
          paddingTop: `calc(env(safe-area-inset-top) + 2rem)`,
          paddingBottom: `calc(env(safe-area-inset-bottom) + 2rem)`,
        }}
      >
        <p className="text-[#ff4f7a] text-center text-[1.4rem]">
          Error: No image URL provided.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`h-[100dvh] mx-auto w-[40.2rem] flex flex-col items-center px-[5.5rem] ${backgroundColor} ${textColor} overflow-hidden box-border`}
      style={{
        paddingTop: `calc(env(safe-area-inset-top) + 2rem)`,
        paddingBottom: `calc(env(safe-area-inset-bottom) + 2rem)`,
      }}
    >
      <div className="flex-none flex flex-col items-center w-full pb-[2rem] flex-shrink-0">
        <h1 className="text-[2.4rem] leading-[3.2rem] font-bold m-0 text-center">
          Your Wrapped is Ready!
        </h1>
        <p className="text-[1.2rem] text-center w-[20rem]">
          Click the image below to download and share it with your friends.
        </p>
      </div>

      <div className="flex-1 min-h-0 w-full flex items-center justify-center">
        <div
          className={`w-full  overflow-hidden `}
          style={{ aspectRatio: `${aspectRatio}`, maxHeight: "100%" }}
        >
          <img
            src={url}
            onClick={handleDownload}
            alt={filename}
            className={`block mx-auto h-full w-auto object-contain rounded-[2rem] border ${borderColor} max-w-[39rem] 
              ${isDownloading ? "opacity-70" : "hover:opacity-95"}
            `}
          />
        </div>
      </div>

      <div className="flex-none flex flex-col items-center w-full pt-[2rem] flex-shrink-0">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className={`flex items-center justify-center h-[5.2rem] w-[20.8rem] rounded-[5.2rem] text-[1.6rem] font-bold ${buttonBg} ${buttonText} ${
            isDownloading ? "opacity-70 cursor-wait" : "hover:opacity-90"
          }`}
        >
          {isDownloading ? "Downloading..." : "Download PNG"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className={`${buttonText} ml-[0.8rem]`}
          >
            <path
              d="M7 8.71429L6.29289 9.42139L7 10.1285L7.70711 9.42139L7 8.71429ZM8 1C8 0.447715 7.55229 5.96046e-08 7 0C6.44772 0 6 0.447715 6 1L7 1L8 1ZM2.71429 13L2.71429 12H2.71429V13ZM11.2857 13V14V14V13ZM2.71429 4.42857L2.00718 5.13568L6.29289 9.42139L7 8.71429L7.70711 8.00718L3.42139 3.72146L2.71429 4.42857ZM7 8.71429L7.70711 9.42139L11.9928 5.13568L11.2857 4.42857L10.5786 3.72146L6.29289 8.00718L7 8.71429ZM7 8.71429H8L8 1L7 1L6 1L6 8.71429H7ZM2.71429 13L2.71429 14L11.2857 14V13V12L2.71429 12L2.71429 13ZM1 11.2857H2V10.4286H1H0V11.2857H1ZM13 11.2857H14V10.4286H13H12V11.2857H13ZM11.2857 13V14C12.7848 14 14 12.7848 14 11.2857H13H12C12 11.6802 11.6802 12 11.2857 12V13ZM2.71429 13V12C2.3198 12 2 11.6802 2 11.2857H1H0C0 12.7848 1.21523 14 2.71429 14V13Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <p className="text-[1.2rem] leading-[1.8rem] mt-[1.2rem] text-center">
          If download doesn&apos;t start, long press (mobile) or right click to
          save.
        </p>
      </div>
    </div>
  );
}
