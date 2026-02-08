# 数据埋点说明

## 1. 邮件打开率 (Open Rate)

**追踪方式**
在邮件 HTML 中嵌入 1x1 透明像素图片，用户打开邮件且允许加载图片时记录一次打开。

**局限性**
Tracking Pixel 是唯一的通用方案。因 Apple Mail Privacy Protection 会预加载图片导致打开率虚高，建议更重视 CTR 作为核心指标。

**可追踪情况**

| 情况                | 是否能追踪  |
| ------------------- | ----------- |
| 用户打开 + 加载图片 | ✅ 可追踪   |
| 用户打开 + 屏蔽图片 | ❌ 无法追踪 |
| Apple Mail 预加载   | ⚠️ 数据虚高 |

---

## 2. 按钮点击率 (Click-Through Rate)

通过重定向 URL 追踪以下按钮点击：

| Button                 | Event        | 去重逻辑                            |
| ---------------------- | ------------ | ----------------------------------- |
| Share my week          | share_week   | 同一 user_id + email_id，仅记录首次 |
| Share my scroll stats  | share_stats  | 同一 user_id + email_id，仅记录首次 |
| Share your invite link | invite_click | 同一 user_id + email_id，仅记录首次 |

---

## 3. 分享图片保存 (Share Image Saved)

点击分享按钮后，在客户端生成图片并调用系统保存/分享时触发埋点。

| Event             | 可否追踪                      | 去重逻辑                            |
| ----------------- | ----------------------------- | ----------------------------------- |
| share_week_saved  | ✅ 客户端点击 download button | 同一 user_id + email_id，仅记录首次 |
| share_stats_saved | ✅ 客户端点击 download button | 同一 user_id + email_id，仅记录首次 |

---

## 4. 退订 (Unsubscribe)

| Event                 | 触发点                       | 说明                                | 去重逻辑                               |
| --------------------- | ---------------------------- | ----------------------------------- | -------------------------------------- |
| unsubscribe_page_view | 打开确认页（第1屏）          | 用户点击了邮件里的 unsubscribe 链接 | 同一 user_id，每次访问都记录（可重复） |
| unsubscribe_confirm   | 点击 "Yes, unsubscribe"      | 用户确认退订                        | 同一 user_id，仅记录首次               |
| unsubscribe_cancel    | 点击 "No, keep sending"      | 用户取消退订，保持订阅              | 同一 user_id + session，仅记录首次     |
| resubscribe           | 点击 "Re-subscribe"（第2屏） | 用户反悔，重新订阅                  | 同一 user_id，每次都记录（可多次反悔） |

---

## 5. 邀请好友 + OAuth

| Event                     | 触发点                                          | 去重逻辑               | Timestamp |
| ------------------------- | ----------------------------------------------- | ---------------------- | --------- |
| referral_landing_view     | 打开邀请链接（第1屏）                           | 不去重，每次访问都记录 | ✅ 需要   |
| referral_landing_click    | 点击 Find out（第1屏）                          | 同一 device_id，仅首次 | ✅ 需要   |
| referral_email_view       | 显示邮箱填写页面                                | 同一 device_id，仅首次 | ✅ 需要   |
| referral_email_submit     | 点击 Continue 提交邮箱，并且成功                | 同一 device_id，仅首次 | ✅ 需要   |
| referral_email_invalid    | 邮箱格式错误                                    | 不去重，每次都记录     | -         |
| referral_email_duplicate  | 邮箱已被使用                                    | 不去重，每次都记录     | -         |
| referral_loading_start    | 开始加载 Connect 链接，进入链接就开始预加载     | 同一 device_id，仅首次 | ✅ 需要   |
| referral_loading_complete | 链接加载完成，显示隐私说明                      | 同一 device_id，仅首次 | ✅ 需要   |
| referral_oauth_start      | 点击 Connect TikTok                             | 同一 device_id，仅首次 | ✅ 需要   |
| referral_oauth_success    | TikTok 授权成功                                 | 同一 user_id，仅首次   | ✅ 需要   |
| referral_oauth_fail       | TikTok 授权失败/取消                            | 不去重，每次都记录     | ✅ 需要   |
| referral_processing_view  | 显示处理中页面（点击 connect 时跳转到 loading） | 同一 user_id，仅首次   | ✅ 需要   |
| referral_complete         | 查看成功页                                      | 同一 user_id，仅首次   | ✅ 需要   |
| referral_invite_click     | 点击 Invite your friends?                       | 不去重，每次都记录     | ✅ 需要   |

---

## 6. 时间计算指标

| 指标                  | 计算                                               |
| --------------------- | -------------------------------------------------- |
| loading_duration      | referral_loading_complete - referral_landing_click |
| privacy_read_duration | referral_oauth_start - referral_loading_complete   |
| landing_to_oauth      | referral_oauth_start - referral_landing_click      |

---

## 7. 核心指标定义

| 指标             | 计算方式                                                      |
| ---------------- | ------------------------------------------------------------- |
| Open Rate        | unique opens / emails delivered                               |
| CTR              | unique clicks (any button) / emails delivered                 |
| CTOR             | unique clicks / unique opens                                  |
| Share Rate       | (share_week + share_stats + share_image_saved) / unique opens |
| Invite Rate      | invite_click / unique opens                                   |
| Unsubscribe Rate | unsubscribe / emails delivered                                |
