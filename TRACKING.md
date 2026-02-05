
## 开发指南 (SDK Usage)

项目已统一埋点库至 `@/lib/tracking`。

### 客户端埋点 (Client Component)

```typescript
import { trackEvent } from "@/lib/tracking";

// 在交互或副作用中调用
trackEvent({
  event: "click",
  type: "invite_flow", // 模块名
  action: "submit_form", // 动作名
  uid: "u123",
  extraData: { foo: "bar" }
});
```

### 服务端/工具函数 (Server/Utils)

```typescript
import { getOpenPixelUrl, getClickTrackingUrl } from "@/lib/tracking/server";

// 生成邮件打开埋点像素 (开发环境默认返回空字符串)
const pixelUrl = getOpenPixelUrl(uid, emailId);

// 生成点击追踪链接 (Redirect)
const trackUrl = getClickTrackingUrl({
  uid,
  emailId,
  action: "share_week",
  targetUrl: "https://..."
});
```
