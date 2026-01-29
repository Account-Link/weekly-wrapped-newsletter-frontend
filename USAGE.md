# Weekly Wrapped Newsletter Frontend

## 🌟 项目简介 (Overview)

这是一个生成 "Weekly Wrapped"（年度/周度总结）风格邮件的前端项目。它模仿类似 Spotify Wrapped 的视觉体验，将用户的 TikTok 使用数据（如观看时间、趋势标签、互动内容）转化为精美的图表和分享卡片，并生成一封完整的 HTML 邮件。

**核心功能：**
1.  **数据映射**：将原始数据转换为视图层所需的数据结构。
2.  **图片生成**：使用 [Satori](https://github.com/vercel/satori) 将 React 组件渲染为 SVG/PNG 图片（用于邮件中的图表和分享卡片）。
3.  **邮件渲染**：使用 [React Email](https://react.email/) 构建响应式 HTML 邮件模板。
4.  **邮件发送**：集成 Nodemailer，支持发送测试邮件。

---

## 🚀 快速开始 (Quick Start)

### 1. 环境准备 (Prerequisites)
- Node.js (v18+)
- npm 或 pnpm

### 2. 安装依赖 (Installation)
```bash
npm install
```

### 3. 配置环境 (Configuration)
复制 `.env.example` (如果存在) 或直接创建 `.env.local` 文件，填入以下配置：

```env
# Firebase 配置 (用于获取真实数据，开发模式可选)
FIREBASE_SERVICE_ACCOUNT_KEY=...

# Vercel Blob (用于存储生成的图片，生产环境必需)
# 本地开发默认生成 Base64 图片，可不填
BLOB_READ_WRITE_TOKEN=...

# SMTP 邮件发送配置 (用于发送真实邮件)
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=你的邮箱@qq.com
SMTP_PASS=你的授权码
SMTP_FROM="FYP Scout" <你的邮箱@qq.com>
```

### 4. 启动开发服务器 (Development)
```bash
npm run dev
```
访问 `http://localhost:3000`。

---

## 🛠️ 功能使用指南 (Feature Guide)

### 1. 预览组件图片 (Satori Preview)
我们在邮件中嵌入了一些动态生成的图片（如柱状图、趋势进度条、分享卡片）。
访问：**`http://localhost:3000/satori-preview`**

- **用途**：调试 Satori 图片生成的样式。
- **操作**：修改 `src/components/satori/` 下的组件代码，刷新页面即时查看效果。

### 2. 预览完整邮件 (Email Preview)
查看最终生成的邮件 HTML 效果。
访问：**`http://localhost:3000/email-preview`**

- **用途**：检查邮件布局、文案和图片嵌入情况。
- **参数**：
    - `?case=curious` (默认)：展示 "好奇宝宝" 类型的用户数据。
    - `?case=fomo`：展示 "FOMO" 类型的用户数据。
    - `?case=earlyAdopter`：展示 "早期采用者" 类型的用户数据。

### 3. 发送测试邮件 (Send Test Email)
将预览的邮件发送到你的邮箱，在真实客户端中查看效果。
**API 接口**：`GET /api/send-test-email`

**使用方法**：
直接在浏览器访问：
```
http://localhost:3000/api/send-test-email?email=接收者邮箱@example.com&case=curious
```

**返回结果**：
- **成功**：返回 `success: true` 和 `messageId`。
- **Ethereal 模式**（未配置 SMTP）：返回一个 `previewUrl`，点击可在线查看伪造的邮件收件箱。

---

## 📂 项目结构 (Project Structure)

```
.
├── app/
│   ├── api/                # API 路由
│   │   ├── send-test-email # 发送邮件接口
│   │   └── wrapped/        # 数据处理接口
│   ├── email-preview/      # 邮件预览页面
│   └── satori-preview/     # 图片生成预览页面
├── emails/                 # React Email 邮件模板
│   ├── fyp-scout-report.tsx # 核心邮件组件
│   └── components/         # 邮件内部组件
├── src/
│   ├── components/
│   │   └── satori/         # Satori 图片组件 (被转换为图片)
│   │       ├── StatsShareCard.tsx
│   │       └── ...
│   ├── domain/             # 业务逻辑与数据模型
│   └── lib/                # 工具库
│       ├── email-generator.tsx # 邮件生成核心逻辑
│       ├── satori-assets.tsx   # 图片资源加载与渲染
│       └── firebase-admin.ts   # Firebase 初始化
├── public/                 # 静态资源 (字体、图片)
└── ...
```

## 🔄 数据流向 (Data Flow)

1.  **数据源**：
    - **Mock 数据** (`src/domain/report/mock.ts`)：开发预览时使用。
    - **Firebase**：生产环境从数据库读取用户报告。
2.  **数据适配 (`adapter.ts`)**：
    - 将原始 Report 数据转换为邮件模板所需的 `WeeklyData` 格式。
3.  **资源生成 (`email-generator.tsx`)**：
    - 调用 `satori-assets.tsx` 加载字体和图片素材。
    - 使用 `satori` 将 React 组件渲染为 SVG，再转为 PNG。
    - (可选) 上传 PNG 到 Vercel Blob 获取公开 URL。
4.  **邮件渲染**：
    - 将数据和图片 URL 注入 `FypScoutReportEmail` 组件。
    - 渲染为最终 HTML。
5.  **发送**：
    - 通过 Nodemailer 发送 HTML 内容。

---

## ❓ 常见问题 (FAQ)

**Q: 邮件里的图片为什么不显示？**
A: 本地开发默认使用 Base64 嵌入图片。Gmail 等部分客户端可能会拦截 Base64 图片。建议使用 Ethereal 预览链接或 Apple Mail 查看。生产环境应配置 Vercel Blob 以生成 http 链接。

**Q: 如何修改邮件样式？**
A: 编辑 `emails/fyp-scout-report.tsx`。我们使用了 Tailwind CSS 进行样式编写。

**Q: 按钮没有垂直居中？**
A: 确保 `Button` 组件使用了 `block` 样式而不是 `align-middle`，或者检查父容器的对齐方式。我们已在最新版本中修复了此问题。
