# 核心上下文总结 - 测试邮件支持真实数据

## 变更概述

修改了测试邮件发送 API (`/app/api/send-test-email/route.ts`) 和邮件生成器 (`/src/lib/email-generator.tsx`)，使其支持通过 `uid` 参数拉取真实用户数据进行邮件生成和发送。

## 修改详情

### 1. `src/lib/email-generator.tsx`

- **新增依赖**: 引入 `getWeeklyData` 方法用于拉取真实数据。
- **扩展类型**: `GenerateEmailOptions` 新增 `useRealData?: boolean` 字段。
- **逻辑更新**:
  - `generateEmailHtml` 函数现在接收 `useRealData` 选项。
  - 当 `useRealData: true` 且存在 `uidOverride` 时，调用 `getWeeklyData(uidOverride)` 获取真实数据。
  - 真实数据模式下，使用 `buildWeeklyAssetKeys` 生成资源路径 (归档至 `weekly/{uid}/...`)，而非预览路径。

### 2. `app/api/send-test-email/route.ts`

- **新增参数**: 解析 URL 查询参数中的 `uid`。
- **调用更新**: 在调用 `generateEmailHtml` 时，如果存在 `uid`，则传递 `useRealData: true` 和 `uidOverride: uid`。

## 使用方法

现在可以通过以下方式请求测试邮件接口，使用真实用户数据：

```bash
GET /api/send-test-email?email=target@example.com&uid=USER_123
```

如果未提供 `uid`，则保持原有行为（使用 Mock 数据）：

```bash
GET /api/send-test-email?email=target@example.com&case=excited
```
