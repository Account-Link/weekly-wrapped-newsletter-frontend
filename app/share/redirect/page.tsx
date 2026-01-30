// 文件功能：分享跳转页入口，处于分享链路跳转入口
// 方法概览：挂载跳转内容组件
import { Suspense } from "react";
import RedirectContent from "./content";

// 方法功能：渲染跳转页入口并包裹 Suspense
export default function RedirectPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RedirectContent />
    </Suspense>
  );
}
