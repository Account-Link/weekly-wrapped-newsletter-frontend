# FYP Scout 周报脚手架使用文档

## 项目说明
本项目为 FYP Scout 周报产品提供完整的开发脚手架，包含 Firebase Admin 权限模拟、React Email 响应式模板与生产级 API 路由。
核心职责：服务端动态获取数据 -> 使用 Satori 生成可视化图表 -> 上传至 Vercel Blob -> 生成最终 HTML 邮件。

## 目录结构
- `app/api/wrapped/route.tsx`：核心 API 路由，处理完整的数据流与渲染
- `app/email-preview/page.tsx`：本地预览页面，支持多场景切换
- `emails/fyp-scout-report.tsx`：React Email 邮件模板（Tailwind CSS + 分层布局）
- `src/lib/satori-assets.tsx`：Satori 图片生成与 Vercel Blob 上传逻辑
- `src/lib/firebase-admin.ts`：Firebase Admin 单例与数据适配

## 开发流程

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量 (`.env.local`)
项目运行需要以下环境变量：

- **Firebase 配置 (必需)**
  `FIREBASE_SERVICE_ACCOUNT_KEY`: 服务账号 JSON 内容（建议 Base64 编码）
  
- **Vercel Blob (图片生成必需)**
  `BLOB_READ_WRITE_TOKEN`: 用于存储 Satori 生成的图表图片
  
- **API 安全 (可选)**
  `INTERNAL_API_KEY`: 后端请求校验密钥

### 3. 启动开发
```bash
npm run dev
```

### 4. 本地预览与调试
- **可视化预览**: 访问 `http://localhost:3000/email-preview`
  - 页面加载时会自动触发 Satori 图片生成流程。
  - 支持场景切换：`?case=curious` | `excited` | `sleepy` | `dizzy` | `cozy`
  - 示例：`http://localhost:3000/email-preview?case=excited`

- **API 调试**:
  ```bash
  curl -X POST http://localhost:3000/api/wrapped \
    -H "Content-Type: application/json" \
    -d '{"uid":"demo-uid"}'
  ```

## 核心功能说明

### Satori 图片生成流水线
为解决邮件客户端（尤其是 Outlook）对复杂 CSS/Flex 布局支持不佳的问题，Trend 进度条和 Diagnosis 柱状图采用服务端生成策略：
1. `src/lib/satori-assets.tsx` 使用 Satori + resvg 将 React 组件渲染为 PNG。
2. 图片自动上传至 Vercel Blob。
3. 返回公开 URL 填入邮件模板数据中。

### 样式与适配
- **Tailwind CSS**: 邮件模板全面使用 Tailwind 编写。
- **分层背景 (Layered Background)**: Trend Section 使用 Frames (边框) < PagerBG (纸张背景) < Content (内容) 的分层结构，以实现最佳的 PC/Mobile 响应式效果。

## Mock 流程
当前 `getWeeklyData` 返回符合最新数据结构（数值与单位分离、支持高亮字段）的 Mock 数据。
如需切换真实数据：
1. 确保 Firestore 数据结构匹配。
2. 在 `src/lib/firebase-admin.ts` 中替换 Mock 逻辑。

## 部署与上线
1. 确保生产环境配置了 `FIREBASE_SERVICE_ACCOUNT_KEY` 和 `BLOB_READ_WRITE_TOKEN`。
2. 构建: `npm run build`
3. 启动: `npm run start`
4. 调用: POST `/api/wrapped`

## 常用脚本
- `scripts/test-wrapped.mjs`: Node.js 测试脚本，用于验证 API 返回的 HTML 结构。
