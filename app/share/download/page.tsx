// 文件功能：分享下载页入口，处于分享链路落地页
// 方法概览：挂载下载内容组件
import { Suspense } from "react";
import DownloadContent from "./content";

// 方法功能：渲染下载页入口并包裹 Suspense
export default function DownloadPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DownloadContent />
    </Suspense>
  );
}
