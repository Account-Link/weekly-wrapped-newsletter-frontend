# 冒烟测试文档 (Smoke Test Plan)

**版本**: 1.0
**目标**: 验证核心业务流程的可用性，确保主链路无阻塞性 Bug。
**前置条件**:
- 本地环境已启动 (`pnpm dev`) 或 访问预览环境。
- `.env` 环境变量配置正确 (Firebase Creds, Base URL)。

## 1. 核心流程测试用例

### ✅ 用例 1: 邀请页流程 (Invite Flow)
**场景**: 用户访问邀请页，完成 TikTok 授权（模拟），进入加载页，最后看到成功页。
**路径**: `/invite?uid=TEST_UID&weekStart=2024-01-22`

| 步骤 | 操作 | 预期结果 |
| :--- | :--- | :--- |
| 1 | 浏览器访问 `/invite` 页面 | 页面正常加载，无 404/500 错误。Console 中打印 `page_view` 埋点日志。 |
| 2 | 点击 "Connect TikTok" (或类似按钮) | (PC端) 弹出二维码模态框 / (移动端) 尝试跳转 App 或显示授权指引。 |
| 3 | 模拟完成授权 (开发环境可能需手动触发状态变更) | 页面状态流转至 "Loading/Generating"。动画流畅显示。 |
| 4 | 等待加载完成 | 页面自动跳转至 "Success" 状态，显示分享/下一步按钮。 |

### ✅ 用例 2: 分享下载页 (Share Download)
**场景**: 用户通过邮件点击 "Share" 按钮，进入中间页预览并下载图片。
**路径**: `/share/download?url=https%3A%2F%2Fplacehold.co%2F600x400&filename=test.png&uid=TEST_UID`

| 步骤 | 操作 | 预期结果 |
| :--- | :--- | :--- |
| 1 | 访问带参数的 `/share/download` 链接 | 页面显示预览图片。Console 记录 `page_view` (type=download_page)。 |
| 2 | 点击 "Download" 按钮 | 浏览器触发文件下载行为。Console 记录 `click` (action=download)。 |
| 3 | 检查下载的文件 | 文件名与参数 `filename` 一致，内容为预览图内容。 |

### ✅ 用例 3: 邮件埋点跳转 (Redirect Tracking)
**场景**: 验证邮件中的短链能否正确记录数据并重定向。
**路径**: `/api/redirect?targetUrl=https%3A%2F%2Fgoogle.com&uid=TEST_UID&type=test_module&action=test_redirect`

| 步骤 | 操作 | 预期结果 |
| :--- | :--- | :--- |
| 1 | 浏览器访问上述 API 链接 | 浏览器最终跳转至 `google.com`。 |
| 2 | 检查 Firestore (`analytics_logs`) | 存在一条新记录：`type=test_module`, `action=test_redirect`, `uid=TEST_UID`。 |

### ✅ 用例 4: 埋点 API 健康检查
**场景**: 验证埋点接口是否接收数据。
**路径**: `/api/track`

| 步骤 | 操作 | 预期结果 |
| :--- | :--- | :--- |
| 1 | 发送 POST 请求至 `/api/track` <br> Body: `{"event": "smoke_test", "uid": "tester", "type": "smoke_test"}` | 返回 `200 OK` 或 `{ success: true }`。 |
| 2 | 检查 Firestore | 存在 `event=smoke_test` 的记录。 |

## 2. 单元测试 (Unit Tests)

项目包含针对埋点库的单元测试，确保核心逻辑的正确性。

**运行测试**:
```bash
pnpm test
```

**覆盖范围**:
- `src/lib/tracking/client.ts`: 客户端埋点发送逻辑 (keepalive, 错误处理)。
- `src/lib/tracking/server.ts`: 服务端埋点 URL 生成逻辑 (Open Pixel, Redirect URL)。

## 3. 异常测试 (Negative Testing)

*   **无效参数**: 访问 `/invite` 不带任何参数 -> 应显示 "Report not found" 或友好的错误提示，而非白屏崩溃。
*   **网络断开**: 在 `/invite` 流程中途断网 -> 点击按钮应有 Error Toast 提示，而非无响应。
*   **非美国 IP (Geo Check)**: 使用 VPN 模拟非 US IP -> 应触发 Geo Block 提示或降级 UI (取决于业务策略)。

## 3. 验收标准
- 所有 ✅ 用例均通过。
- 浏览器 Console 无红色的 Uncaught Error。
- 核心交互（点击、跳转、下载）响应时间 < 1s。
