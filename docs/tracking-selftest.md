# 埋点自测文档（非邀请页）

## 0. 环境准备

- 本地启动前端：确保可访问页面与 API
- 若需测试邮件打开像素，在本地环境请设置 `ENABLE_DEV_TRACKING=true`
- 准备测试参数：
  - uid：`u_test`
  - eid（或 emailId）：`e_test`
  - weekStart：`2025-01-01`

---

## 1. 邮件打开率（Open Rate）

**触发方式**
访问邮件像素 URL（或打开真实邮件触发像素）。

**自测步骤**
1. 访问：
   ```
   http://localhost:3000/api/track?event=open&uid=u_test&eid=e_test
   ```
2. 返回 1x1 gif 即成功。

**期望结果**
- Firestore `analytics_logs` 新增一条 `event=open` 记录。
- `eid` 等于 `e_test`。

**实现位置**
- 打开像素生成：[server.ts](file:///Users/hx/Projects/weekly-wrapped-newsletter-frontend/src/lib/tracking/server.ts#L12-L32)
- 邮件模板嵌入像素：[fyp-scout-report.tsx](file:///Users/hx/Projects/weekly-wrapped-newsletter-frontend/emails/fyp-scout-report.tsx#L156-L275)

---

## 2. 按钮点击率（CTR）

### 2.1 Share my week / Share my scroll stats

**自测步骤**
1. 访问：
   ```
   http://localhost:3000/api/redirect?uid=u_test&eid=e_test&type=redirect&action=share_week&targetUrl=https%3A%2F%2Fexample.com
   ```
2. 页面应重定向到 `https://example.com`。

**期望结果**
- `event=click`、`action=share_week` 记录写入 `analytics_logs`。

**实现位置**
- 点击追踪 URL 生成：[server.ts](file:///Users/hx/Projects/weekly-wrapped-newsletter-frontend/src/lib/tracking/server.ts#L34-L73)
- 邮件模板使用追踪链接：[fyp-scout-report.tsx](file:///Users/hx/Projects/weekly-wrapped-newsletter-frontend/emails/fyp-scout-report.tsx#L156-L209)
- Redirect 记录埋点：[route.ts](file:///Users/hx/Projects/weekly-wrapped-newsletter-frontend/app/api/redirect/route.ts#L17-L81)

### 2.2 Invite Click

**自测步骤**
1. 访问：
   ```
   http://localhost:3000/api/redirect?uid=u_test&eid=e_test&type=redirect&action=invite_click&targetUrl=%2Finvite%3Fuid%3Du_test
   ```

**期望结果**
- `event=click`、`action=invite_click` 记录写入 `analytics_logs`。

---

## 3. 分享下载页（Download Page）

**自测步骤**
1. 访问：
   ```
   http://localhost:3000/share/download?url=https%3A%2F%2Fexample.com%2Fimg.png&filename=trend.png&type=trend_share_card&uid=u_test&weekStart=2025-01-01
   ```
2. 页面加载后立即触发 `page_view`。
3. 点击图片或按钮触发下载。

**期望结果**
- `event=page_view`、`type=download_page` 记录写入 `analytics_logs`。
- 点击下载后新增 `event=click`、`action=download` 记录。

**实现位置**
- 下载页埋点：[content.tsx](file:///Users/hx/Projects/weekly-wrapped-newsletter-frontend/app/share/download/content.tsx#L31-L78)

---

## 4. 分享图片保存（Share Image Saved）

**自测步骤**
1. 复用「分享下载页」步骤。
2. 点击下载触发 Firebase Analytics 事件。
3. 重复点击应被去重。

**期望结果**
- Firebase Analytics 记录 `share_saved` 事件，包含 `action=share_week` 或 `share_stats`。
- 同一 `uid + emailId + action` 重复点击不会再次记录。

**实现位置**
- Firebase 事件与去重：[client-analytics.ts](file:///Users/hx/Projects/weekly-wrapped-newsletter-frontend/src/lib/client-analytics.ts#L1-L48)
- 触发调用：[content.tsx](file:///Users/hx/Projects/weekly-wrapped-newsletter-frontend/app/share/download/content.tsx#L50-L78)

---

## 5. 退订流程（Unsubscribe）

**自测步骤**
1. 访问：
   ```
   http://localhost:3000/unsubscribe?uid=u_test&eid=e_test
   ```
2. 进入确认页即触发 `unsubscribe_page_view`。
3. 点击 “Yes, unsubscribe” 触发 `unsubscribe_confirm`。
4. 点击 “No, keep sending” 触发 `unsubscribe_cancel`（当前会话仅一次）。
5. 在成功页面点击 “Re-subscribe” 触发 `resubscribe`。

**期望结果**
- `unsubscribe_page_view`、`unsubscribe_confirm`、`unsubscribe_cancel`、`resubscribe` 按预期写入 `analytics_logs`。

**实现位置**
- 退订页面埋点：[content.tsx](file:///Users/hx/Projects/weekly-wrapped-newsletter-frontend/app/unsubscribe/content.tsx#L33-L187)

---

## 6. 统一埋点写入与检查

**检查入口**
- Firestore `analytics_logs` 集合

**记录格式**
- 文档 ID：`YYYYMMDDHHMMSS_uid_eid_event_type_action`

**实现位置**
- 统一写入与规范化：[route.ts](file:///Users/hx/Projects/weekly-wrapped-newsletter-frontend/app/api/track/route.ts#L30-L176)
