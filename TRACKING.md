# 全局埋点文档 (Tracking Documentation)

本文档汇总了项目中的所有埋点事件、参数定义及触发场景。

## 核心字段定义 (Core Fields)

所有埋点事件统一包含以下核心字段：

| 字段名        | 类型     | 说明                                                         | 示例                                       |
| :------------ | :------- | :----------------------------------------------------------- | :----------------------------------------- |
| **event**     | `string` | 事件类型，如 `page_view`, `click`, `view` 或特定业务状态事件 | `page_view`, `click`                       |
| **type**      | `string` | **业务模块/场景标识 (Tracking Code)**，用于区分埋点来源模块  | `invite_flow`, `download_page`, `redirect` |
| **action**    | `string` | **具体交互动作 (Interaction)**，描述用户具体做了什么         | `download`, `share_week`, `find_out_start` |
| **uid**       | `string` | 用户 ID                                                      | `u123456`                                  |
| **eid**       | `string` | 邮件 ID (通常为 `weekStart`)                                 | `2025-02-03`                               |
| **source**    | `string` | 来源渠道                                                     | `email`, `web`, `email_redirect`           |
| **extraData** | `object` | 额外参数，包含 `targetUrl`, `filename`, `theme` 等           | `{ "targetUrl": "..." }`                   |

---

## 埋点清单 (Event List)

### 1. 邀请流程 (Invite Flow)

**Type Code:** `invite_flow`
**Source:** `web`

| Event                    | Action                 | 触发时机                        | 备注                        |
| :----------------------- | :--------------------- | :------------------------------ | :-------------------------- |
| `page_view`              | -                      | 用户访问邀请页 Landing 步骤     |                             |
| `click`                  | `find_out_start`       | 用户点击 "Find Out" 按钮        | 开始流程                    |
| `click`                  | `connect_tiktok_click` | 用户点击 "Connect TikTok" 按钮  |                             |
| `connect_tiktok_success` | -                      | TikTok 授权完成并轮询成功       | **关键转化指标**            |
| `click`                  | `invite_share`         | 用户点击最后一步的分享/复制链接 |                             |
| `view`                   | -                      | 触发地区限制弹窗 (Geo Warning)  | Type 为 `geo_warning_modal` |

### 2. 下载页 (Download Page)

**Type Code:** `download_page`
**Source:** `email`

| Event       | Action     | 触发时机           | 备注                                                           |
| :---------- | :--------- | :----------------- | :------------------------------------------------------------- |
| `page_view` | -          | 用户访问图片下载页 | 携带 `extraData.filename`                                      |
| `click`     | `download` | 用户点击下载按钮   | `extraData.shareAction` 区分是 `share_stats` 还是 `share_week` |

### 3. 退订流程 (Unsubscribe Flow)

**Type Code:** `unsubscribe_flow`
**Source:** `email_redirect`

| Event                 | Action                | 触发时机                    | 备注             |
| :-------------------- | :-------------------- | :-------------------------- | :--------------- |
| `page_view`           | -                     | 用户访问退订确认页          |                  |
| `click`               | `unsubscribe_confirm` | 用户点击 "Yes, unsubscribe" |                  |
| `click`               | `keep_subscription`   | 用户点击 "No, keep sending" |                  |
| `unsubscribe_success` | -                     | 退订接口调用成功            | **关键流失指标** |
| `click`               | `resubscribe`         | 用户点击 "Re-subscribe"     |                  |
| `resubscribe_success` | -                     | 重新订阅接口调用成功        |                  |

### 4. 邮件点击与重定向 (Email Clicks & Redirects)

邮件中的点击通过 `/api/redirect` (服务端) 或 `/share/redirect` (客户端) 中转，统一记录为 `click` 事件。

**Event:** `click`
**Source:** `email` / `email_redirect`

| Type (Module)   | Action         | 触发场景                | 目标 URL                 |
| :-------------- | :------------- | :---------------------- | :----------------------- |
| `redirect`      | `share_week`   | 点击 "Share Trend" 按钮 | 跳转至 Trend Card 下载页 |
| `redirect`      | `share_stats`  | 点击 "Share Stats" 按钮 | 跳转至 Stats Card 下载页 |
| `redirect`      | `invite_click` | 点击邀请链接            | 跳转至 `/invite`         |
| `redirect`      | `unsubscribe`  | 点击退订链接            | 跳转至 `/unsubscribe`    |
| `nudge_invite`  | `redirect`     | 点击 Nudge 区域链接     | 跳转至配置的 `linkUrl`   |
| `footer_tiktok` | `redirect`     | 点击底部 TikTok Logo    | 跳转至配置的 TikTok URL  |

---

## 链路示例 (Flow Examples)

### 示例 1：用户分享周报

1.  **邮件内点击**:
    - 用户点击 "Share This Week" 按钮。
    - 请求 `/api/redirect?type=redirect&action=share_week&url=...`。
    - **埋点**: `event: click`, `type: redirect`, `action: share_week`。
2.  **跳转下载页**:
    - 浏览器跳转至 `/share/download?type=trend_share_card...`。
    - **埋点**: `event: page_view`, `type: download_page`。
3.  **点击下载**:
    - 用户点击 "Download PNG"。
    - **埋点**: `event: click`, `type: download_page`, `action: download`。

### 示例 2：用户接受邀请

1.  **邮件内点击**:
    - 用户点击 Nudge 区域的链接。
    - 浏览器跳转至 `/share/redirect?type=nudge_invite&url=...`。
    - **埋点**: `event: click`, `type: nudge_invite`, `action: redirect`。
2.  **跳转邀请页**:
    - 浏览器跳转至 `/invite`。
    - **埋点**: `event: page_view`, `type: invite_flow`。
