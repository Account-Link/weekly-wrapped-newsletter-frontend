// 文件功能：应用根布局与基础元信息，处于 Next App 的入口层
// 方法概览：根布局组件
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import VConsoleComponent from "@/components/debug/VConsole";
import { getAppBaseUrl } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(getAppBaseUrl()),
  title: "FYP Scout - Your TikTok Wrapped",
  description: "Discover your TikTok persona and weekly insights!",
  openGraph: {
    title: "FYP Scout - Your TikTok Wrapped",
    description: "Discover your TikTok persona and weekly insights!",
    url: getAppBaseUrl(),
    siteName: "FYP Scout",
    images: [
      {
        url: `${getAppBaseUrl()}/images/og-image.png`,
        width: 240,
        height: 240,
        alt: "FYP Scout Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FYP Scout - Your TikTok Wrapped",
    description: "Discover your TikTok persona and weekly insights!",
    images: [`${getAppBaseUrl()}/images/og-image.png`],
  },
  icons: {
    icon: [{ url: `${getAppBaseUrl()}/favicon.ico` }],
    apple: [
      {
        url: `${getAppBaseUrl()}/images/og-image.png`,
        sizes: "240x240",
        type: "image/png",
      },
    ],
  },
};

// 方法功能：提供全局 HTML 与 body 容器
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />
      <meta name="theme-color" content="#313131" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />
      <body className="bg-[#313131]">
        <ToastProvider>
          {children}
          <VConsoleComponent />
        </ToastProvider>
      </body>
    </html>
  );
}
