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
      <body className="bg-[#313131]">{children}</body>
    </html>
  );
}
