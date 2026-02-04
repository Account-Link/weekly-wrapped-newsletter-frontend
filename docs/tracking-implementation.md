# 埋点与重定向系统实现总结

## 核心架构
本项目采用了统一的埋点与重定向架构，将数据追踪（Tracking）与业务跳转（Redirect）分离，确保职责单一且易于维护。

### 1. API 接口设计
- **`/api/track` (纯埋点服务)**
    - **POST**: 接收 JSON 格式的埋点数据，写入 Firestore `analytics_logs` 集合。
    - **GET**: 接收 URL 参数埋点（如 Open Pixel），记录后返回 1x1 透明 GIF。
    - **特点**: 不处理重定向，专注于数据记录。

- **`/api/redirect` (重定向服务)**
    - **GET**: 接收 `targetUrl` 及埋点参数。
    - **逻辑**:
        1. 提取所有 URL 参数作为 `metadata`。
        2. 异步调用 `/api/track` 记录点击事件 (`type=redirect`)。
        3. 验证 `targetUrl` 是否在白名单内。
        4. 执行 HTTP 302 跳转。
    - **特殊处理**: 对 `unsubscribe` 动作自动跳转至取消订阅页。

### 2. 客户端埋点 (`src/lib/client-tracking.ts`)
封装了统一的 `trackEvent` 方法，前端组件直接调用此方法发送 POST 请求到 `/api/track`。

```typescript
trackEvent({
  event: "click",
  type: "download",
  uid: "...",
  metadata: { filename: "report.png" }
});
```

## 页面埋点实现
已完成以下核心页面的埋点覆盖：

### 邀请页 (`/invite`)
- **Page View**: `event: page_view`, `type: invite_page`
- **TikTok 连接**:
    - 点击连接: `event: click`, `type: connect_tiktok_start`
    - 连接成功: `event: connect_tiktok_success`
- **分享/复制链接**: `event: click`, `type: invite_share`

### 下载页 (`/share/download`)
- **Page View**: `event: page_view`, `type: download_page`, `metadata: { theme, filename }`
- **点击下载**: `event: click`, `type: download`, `action: share_week | share_stats`

### 取消订阅页 (`/unsubscribe`)
- **Page View**: `event: page_view`, `type: unsubscribe_page`
- **确认取消**: `event: click`, `type: unsubscribe_confirm`
- **重新订阅**: `event: click`, `type: resubscribe`

## 核心变更点
1. **去耦合**: `firebase-admin` 初始化仅保留 Firestore，移除不用的 Storage。
2. **统一入口**: 所有客户端埋点不再直接依赖 Firebase SDK，而是通过 API 路由统一入库，便于后续对接其他分析服务。
3. **参数灵活**: 支持 `metadata` 字段，允许传递任意业务参数（如 theme, filename）。
