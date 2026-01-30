// 文件功能：Satori 资源相关导出聚合，处于兼容转发层
// 方法概览：无，导出渲染与上传方法
export {
  renderDiagnosisBarChartImage,
  renderStatsShareCardImage,
  renderTrendProgressImage,
  renderTrendShareCardImage,
} from "@/core/assets/satori-renderers";
export { uploadPngToNewApi, uploadToVercelBlob } from "@/core/uploader";
