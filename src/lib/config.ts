// 统一管理项目的配置项
// 优先使用环境变量中显式配置的 Base URL
// 如果未配置，尝试使用 Vercel 提供的部署 URL
// 最后回退到本地开发地址

export const getAppBaseUrl = () => {
  // 1. 显式配置的 Base URL (通常包含协议头，如 https://myapp.com)
  if (process.env.EMAIL_ASSET_BASE_URL) {
    return process.env.EMAIL_ASSET_BASE_URL.replace(/\/+$/, "");
  }

  // 2. Vercel 自动注入的 URL (不含协议头，如 myapp.vercel.app)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. 本地开发默认值
  return "http://localhost:3000";
};

// 专门用于静态资源的 Base URL (目前与 App Base URL 一致，预留扩展空间)
export const getAssetBaseUrl = () => {
  return getAppBaseUrl();
};

// 专门用于埋点和跳转的 Base URL (目前与 App Base URL 一致)
export const getTrackingBaseUrl = () => {
  return getAppBaseUrl();
};

// 客户端渲染开关
// 如果开启，生成报告时不会在服务端生成和上传分享卡片，
// 而是依赖客户端页面 (share/download) 实时渲染并截图下载
export const ENABLE_CLIENT_SIDE_IMAGE_GENERATION = true;
