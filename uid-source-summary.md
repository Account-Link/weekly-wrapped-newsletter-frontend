# UID 来源与数据流向总结

## 核心问题
埋点去重逻辑（如 `tracked_referral_success_{uid}`）中使用的 `uid` 来源。

## 数据链路分析

1.  **URL 参数来源**: 用户点击邮件中的邀请链接，链接中携带查询参数 `uid`。
    *   示例: `https://your-domain.com/invite?uid=12345`
2.  **服务端获取**: 在 `app/invite/page.tsx` (Server Component) 中，通过 `searchParams` 获取 `uid`。
    *   代码位置: [app/invite/page.tsx:L11](file:///Users/hx/Projects/weekly-wrapped-newsletter-frontend/app/invite/page.tsx#L11)
3.  **组件传递**: 服务端组件将获取到的 `uid` 作为 Props 传递给 `InviteFlow` (Client Component)。
    *   代码位置: [app/invite/page.tsx:L36](file:///Users/hx/Projects/weekly-wrapped-newsletter-frontend/app/invite/page.tsx#L36)
4.  **客户端使用**: `InviteFlow` 组件接收 `uid` 并在埋点去重逻辑中使用。
    *   代码位置: [app/invite/InviteFlow.tsx:L33](file:///Users/hx/Projects/weekly-wrapped-newsletter-frontend/app/invite/InviteFlow.tsx#L33)
