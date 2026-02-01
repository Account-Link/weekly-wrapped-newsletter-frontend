# Firebase 埋点配置指南（FYP Scout）

本文档用于配置 **服务端埋点（Firestore）** 与 **客户端分享保存埋点（Firebase Analytics）**。

## 1. 创建 Firebase 项目
- 进入 Firebase 控制台创建项目
- 若要使用 Analytics，请在创建过程中启用 Google Analytics

## 2. 启用 Firestore
- 进入 Firestore Database
- 选择 Production 或 Test 模式初始化
- 默认会创建 `analytics_logs` 集合，系统会按需写入

## 3. 生成服务账号（服务端埋点必需）
- Project Settings → Service Accounts → Generate new private key
- 将下载的 JSON 内容复制到环境变量

本地 `.env.local` 示例：
```
FIREBASE_ADMIN_ENABLED=true
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

说明：
- `FIREBASE_SERVICE_ACCOUNT_KEY` 可直接填 JSON 字符串，或填 Base64(JSON)

## 4. 创建 Web App（客户端埋点必需）
- Project Settings → General → Your apps → Add app → Web
- 复制 SDK Config 中的字段

本地 `.env.local` 示例：
```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=1:xxx:web:xxx
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXX
```

## 5. 配置重定向白名单（点击追踪必需）
点击追踪接口会校验跳转域名，请将允许的域名加入白名单：
```
TRACK_REDIRECT_ALLOWLIST=weekly-wrapped-newsletter-frontend.vercel.app,feedling.app
```

说明：
- 白名单使用逗号分隔
- 系统默认允许当前请求域名

## 6. 生产环境配置
在 Vercel 项目设置中添加同名环境变量即可。

## 7. 验证建议
- 打开邮件，确认 Firestore `analytics_logs` 写入 `open` 事件
- 点击邮件内链接，确认 `click` / `unsubscribe` 事件写入
- 在 H5 下载页点击下载，确认 Analytics 事件 `share_saved` 上报
