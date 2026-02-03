// 文件功能：应用根布局与基础元信息，处于 Next App 的入口层
// 方法概览：根布局组件
import "./globals.css";
export const metadata = {
  title: "FTikTok Weekly FYP Scout",
  description: "TikTok Weekly FYP Scout",
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
      <body className="bg-[#313131]">{children}</body>
    </html>
  );
}
