# 埋点系统文档 (Tracking System Documentation)

本文档总结了 Weekly Wrapped Newsletter 项目中的所有埋点事件、参数定义及触发场景。

## 1. 核心概念 (Core Concepts)

所有埋点事件统一发送至 `/api/track` (客户端) 或 `/api/redirect` (邮件点击/服务端)，并最终存储在 Firestore 的 `analytics_logs` 集合中。

### 通用参数 (Common Parameters)

| 参数名        | 类型     | 说明                                      | 示例                                        |
| :------------ | :------- | :---------------------------------------- | :------------------------------------------ |
| **event**     | `string` | 事件类型 (必填)                           | `page_view`, `click`, `open`                |
| **type**      | `string` | **埋点 Code / 业务模块标识**              | `download_page`, `invite_flow`              |
| **action**    | `string` | **具体交互动作**                          | `share_week`, `unsubscribe_confirm`         |
| **uid**       | `string` | 用户 ID                                   | `user_12345`                                |
| **eid**       | `string` | 邮件 ID / 周期 ID (Email ID / Week Start) | `2025-02-03`                                |
| **source**    | `string` | 流量来源                                  | `email`, `web`, `email_redirect`            |
| **extraData** | `json`   | 额外元数据 (KV 结构)                      | `{ "targetUrl": "...", "filename": "..." }` |

> **注意**: `targetUrl` 已迁移至 `extraData.targetUrl`。

---

## 2. 埋点字典 (Event Dictionary)

### A. 邮件 (Email)

邮件中的埋点主要通过图片像素 (Open) 和 链接重定向 (Click) 触发。

| Event     | Type (Code)     | Action         | 触发场景                         | 关键参数                            |
| :-------- | :-------------- | :------------- | :------------------------------- | :---------------------------------- |
| **open**  | -               | -              | 用户打开邮件 (加载 1x1 像素)     | `uid`, `eid`                        |
| **click** | `redirect`      | `share_week`   | 点击 Trend 卡片的 Share 按钮     | `uid`, `eid`, `extraData.targetUrl` |
| **click** | `redirect`      | `share_stats`  | 点击 Stats 卡片的 Share 按钮     | `uid`, `eid`, `extraData.targetUrl` |
| **click** | `redirect`      | `invite_click` | 点击 "Get your wrapped" 邀请链接 | `uid`, `eid`                        |
| **click** | `redirect`      | `unsubscribe`  | 点击底部 Unsubscribe 链接        | `uid`, `eid`                        |
| **click** | `nudge_invite`  | -              | 点击 Weekly Nudge 区域           | `uid`, `eid`                        |
| **click** | `footer_tiktok` | -              | 点击底部 TikTok 链接             | `uid`, `eid`                        |

### B. 下载页 (Download Page)

路径: `/share/download`

| Event         | Type (Code)     | Action     | 触发场景                 | 关键参数                           |
| :------------ | :-------------- | :--------- | :----------------------- | :--------------------------------- |
| **page_view** | `download_page` | -          | 访问下载页               | `uid`, `eid`, `extraData.filename` |
| **click**     | `download_page` | `download` | 点击 "Download PNG" 按钮 | `extraData.shareAction`, `uid`     |

### C. 取消订阅页 (Unsubscribe Page)

路径: `/unsubscribe`

| Event                   | Type (Code)        | Action                | 触发场景                         | 关键参数     |
| :---------------------- | :----------------- | :-------------------- | :------------------------------- | :----------- |
| **page_view**           | `unsubscribe_flow` | -                     | 访问取消订阅确认页               | `uid`, `eid` |
| **click**               | `unsubscribe_flow` | `unsubscribe_confirm` | 点击 "Yes, unsubscribe" 确认按钮 | `uid`, `eid` |
| **unsubscribe_success** | `unsubscribe_flow` | -                     | 取消订阅 API 调用成功            | `uid`, `eid` |
| **click**               | `unsubscribe_flow` | `keep_subscription`   | 点击 "No, keep sending" 保留按钮 | `uid`, `eid` |
| **click**               | `unsubscribe_flow` | `resubscribe`         | 在已取消状态点击 "Resubscribe"   | `uid`, `eid` |
| **resubscribe_success** | `unsubscribe_flow` | -                     | 恢复订阅 API 调用成功            | `uid`, `eid` |

### D. 邀请流程 (Invite Flow)

路径: `/invite`

| Event                      | Type (Code)   | Action                 | 触发场景                          | 关键参数 |
| :------------------------- | :------------ | :--------------------- | :-------------------------------- | :------- |
| **page_view**              | `invite_flow` | -                      | 访问邀请落地页 (Step 1)           | `uid`    |
| **click**                  | `invite_flow` | `find_out_start`       | 点击 Step 1 "Find out" 按钮       | `uid`    |
| **click**                  | `invite_flow` | `connect_tiktok_click` | 点击 Step 2 "Connect TikTok" 按钮 | `uid`    |
| **connect_tiktok_success** | `invite_flow` | -                      | TikTok 授权成功 (轮询完成)        | `uid`    |
| **view**                   | `invite_flow` | `geo_warning_modal`    | 显示地理位置不支持弹窗            | `uid`    |
| **click**                  | `invite_flow` | `invite_share`         | 点击最终页 "Invite Friends" 按钮  | `uid`    |

---

## 3. 补充说明 (Notes)

1.  **Redirect API**:
    - `/api/redirect` 接口作为邮件点击的统一入口，会自动记录一条 `event: "click", type: <传入值>, action: <传入值>` 的日志，然后执行 307 跳转。
    - 如果 URL 参数中包含 `targetUrl`，它会被自动移动到 `extraData.targetUrl` 中存储。

2.  **数据去重**:
    - `eid` (Email ID) 通常对应 `weekStart` (如 `2025-02-03`)，用于标识具体的 Newsletter 期数。
