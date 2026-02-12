# Weekly Wrapped Newsletter Frontend

基于 Next.js 的前端应用，用于生成、预览与分享每周 TikTok 活动报告，并提供邀请、退订与埋点统计等完整链路。

## 使用教程

### 环境要求

- Node.js 18+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 启动开发

```bash
pnpm dev
```

打开 http://localhost:3000

### 构建与运行

```bash
pnpm build
pnpm start
```

### 代码质量与测试

```bash
pnpm lint
pnpm typecheck
pnpm test
```

### 常用入口

- 邮件预览生成：`GET /api/wrapped?mock=true` 或 `GET /api/wrapped?uid=xxx`
- 生产生成：`POST /api/wrapped`（传 params 或 uid）
- 埋点收集：`GET/POST /api/track`
- 点击重定向：`GET /api/redirect`
- 资源下载代理：`GET /api/download?url=...&filename=...`
- 邀请页：`/invitation?eid=...` 或 `/invitation?uid=...`
- 退订页：`/unsubscribe?uid=...`
- 分享下载页：`/share/download?url=...&filename=...&type=...&eid=...`

## 环境变量

| 变量                                | 作用                    | 必填 |
| ----------------------------------- | ----------------------- | ---- |
| NEXT_PUBLIC_REPORT_API_BASE_URL     | 后端 API 基地址         | 是   |
| WEB_URL                             | 应用对外 Base URL       | 否   |
| VERCEL_URL                          | Vercel 自动注入 URL     | 否   |
| FIREBASE_ADMIN_ENABLED              | 是否启用 Admin 写入     | 否   |
| FIREBASE_SERVICE_ACCOUNT_KEY        | Firebase Admin 服务账号 | 否   |
| NEXT_PUBLIC_FIREBASE_API_KEY        | Firebase Web 配置       | 否   |
| NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN    | Firebase Web 配置       | 否   |
| NEXT_PUBLIC_FIREBASE_PROJECT_ID     | Firebase Web 配置       | 否   |
| NEXT_PUBLIC_FIREBASE_APP_ID         | Firebase Web 配置       | 否   |
| NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID | Firebase Web 配置       | 否   |
| TRACK_REDIRECT_ALLOWLIST            | 允许重定向的白名单      | 否   |
| ENABLE_DEV_TRACKING                 | 本地启用埋点写入        | 否   |

脚本 `scripts/test-wrapped.mjs` 额外可用：

- BASE_URL / API_KEY / EMAIL_TO / PAYLOAD_JSON

## 项目流程

1. `app/api/wrapped` 作为主入口，根据参数生成周报 HTML。
2. `src/domain/report` 拉取与适配后端数据，产出 `WeeklyData`。
3. `src/core/pipeline` 生成图表与分享卡片，上传资源并注入 URL。
4. `emails/fyp-scout-report.tsx` 渲染最终邮件 HTML。
5. `app/api/track` 与 `app/api/redirect` 负责埋点与点击跳转。
6. 邀请页与退订页通过客户端流程实现互动与埋点。

## 目录结构与功能

- `app/`：App Router 页面与 API 路由（邀请、退订、分享、埋点）
- `src/domain/`：周报数据模型与适配逻辑
- `src/core/`：报告生成流水线、Satori 资源渲染与上传
- `src/lib/`：API 客户端、配置、埋点、Firebase 工具
- `emails/`：邮件模板与组件
- `public/`：静态资源
- `docs/`：埋点实现与自测文档

## 项目核心点

- **服务端图像生成**：Satori + resvg 生成分享卡片与图表，保证邮件与分享图一致性。
- **统一埋点链路**：客户端 `trackEvent` + 服务端 `/api/track`，支持 click/open/redirect 统一采集。
- **可追踪分享链接**：`/api/redirect` 记录事件后跳转，支持白名单限制。
- **邀请与绑定流程**：TikTok OAuth 轮询、成功后写入新用户标识并追踪转化。
- **多环境配置**：Base URL 与 Firebase 配置统一管理，支持本地/线上切换。

## 相关文档

- `docs/tracking-implementation.md`：埋点设计与事件说明
- `docs/tracking-selftest.md`：埋点自测步骤
