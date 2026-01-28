# 项目上下文交接文档 (Project Context Handover)

## 1. 项目概览
本项目是一个基于 Next.js 和 React Email 的邮件生成服务，用于生成 "FYP Scout Weekly Newsletter"。核心功能包括动态获取数据、生成可视化图表（使用 Satori）、构建 HTML 邮件模板并提供预览/API 接口。

## 2. 技术栈
- **框架**: Next.js (App Router)
- **邮件构建**: React Email (`@react-email/components`)
- **样式**: Tailwind CSS (通过 `@react-email/tailwind` 集成)
- **图片生成**: Satori + @resvg/resvg-js (用于生成进度条和柱状图的静态图片)
- **文件存储**: Vercel Blob (用于存储生成的图片)
- **数据源**: Firebase Admin / Mock Data

## 3. 最近完成的核心变更

### A. 样式重构 (Tailwind CSS)
- 将 `emails/fyp-scout-report.tsx` 全面迁移至 Tailwind CSS。
- 引入了自定义 Tailwind 配置，包括品牌颜色 (`brand`, `bgDark` 等) 和字体设置。
- 解决了 Outlook 等客户端的兼容性问题（如清除 `<p>` 标签默认 margin）。

### B. Satori 图片生成流水线
为解决邮件客户端对复杂 CSS/Flex 布局支持不佳的问题，将复杂图表模块改为服务端生成图片：
1. **渲染逻辑**: 新增 `src/lib/satori-assets.tsx`，定义了 `renderTrendProgressImage` 和 `renderDiagnosisBarChartImage` 函数。
2. **上传逻辑**: 图片生成后自动上传至 Vercel Blob，获取公开访问 URL。
3. **数据流**:
   - `app/api/wrapped/route.tsx` 和 `app/email-preview/page.tsx` 负责调用生成函数。
   - 生成的 URL 回填至 `WeeklyData` 对象的 `trend.progressImageUrl` 和 `diagnosis.barChartImageUrl` 字段。
   - 邮件模板根据是否存在 URL 字段决定渲染图片还是降级组件。

### C. Git 配置更新
- 远程仓库地址已更新为: `https://github.com/Account-Link/weekly-wrapped-newsletter-frontend`

## 4. 核心文件索引

| 文件路径 | 说明 |
| :--- | :--- |
| [`emails/fyp-scout-report.tsx`] | 核心邮件模板，包含 Tailwind 配置和组件结构。 |
| [`src/lib/satori-assets.tsx`] | Satori 图片生成与 Vercel Blob 上传逻辑。 |
| [`app/api/wrapped/route.tsx`] | 生成邮件 HTML 的 API 接口，包含图片生成流程。 |
| [`src/lib/firebase-admin.ts`]| 数据类型定义，扩展了图片 URL 字段。 |

## 5. 环境变量要求
运行项目需要以下环境变量（用于 Vercel Blob）：
- `BLOB_READ_WRITE_TOKEN`

## 6. 使用说明
- **本地开发**: `npm run dev`
- **查看预览**: 访问 `http://localhost:3000/email-preview` (会自动触发图片生成)
- **API 生成**: `POST /api/wrapped` (body: `{"uid": "..."}`)

## 7. 待办/下一步建议
- 验证生产环境下的 Vercel Blob 权限配置。
- 检查邮件在不同客户端（如 Outlook, Gmail）的实际渲染效果。
