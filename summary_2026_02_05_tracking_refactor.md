# Tracking System Refactor Summary (2026-02-05)

## 核心变更 (Core Changes)

1.  **字段语义重定义**:
    *   **`type`**: 统一作为 **埋点 Code / 业务模块标识** (Tracking Code)。例如：`download_page`, `invite_flow`, `redirect`, `nudge_invite`。
    *   **`action`**: 统一作为 **具体交互动作** (Interaction)。例如：`share_week`, `download`, `find_out_start`。
    *   **`targetUrl`**: 从顶层字段迁移至 **`extraData.targetUrl`**，减少顶层参数污染。

2.  **API 更新**:
    *   `/api/track`: 增加 `normalizePayload` 函数，自动将 `targetUrl` 迁移至 `extraData`，并支持 `type`/`action` 字段。
    *   `/api/redirect`: 
        *   支持 `type` 和 `action` 参数透传。
        *   在记录埋点前自动将 `targetUrl` 放入 `extraData`。
        *   将 `email_button_click` 事件统一为 `click` (或其他组件指定事件)。

3.  **客户端组件更新**:
    *   **`DownloadContent`**: 
        *   `page_view` 事件使用 `type: "download_page"`。
        *   `click` 事件使用 `type: "download_page", action: "download"`。
        *   `targetUrl` 移入 `extraData`。
    *   **`RedirectContent`**:
        *   `click` 事件使用 `type` (来自 URL 参数，如 `nudge_invite`) 和 `action: "redirect"`。
        *   `targetUrl` 移入 `extraData`。
    *   **`InviteFlow` / `UnsubscribeContent`**:
        *   更新所有 `trackEvent` 调用，确保 `type` 为模块标识，`action` 为交互动作。

4.  **服务端/管线更新**:
    *   **`report-pipeline.tsx`**:
        *   生成的 `share/download` 链接包含 `type` (如 `trend_share_card`)，用于下载页区分卡片类型。
        *   生成的 `share/redirect` 链接包含 `type` (如 `nudge_invite`, `footer_tiktok`)，用于重定向页记录埋点 Code。
    *   **`emails/fyp-scout-report.tsx`**:
        *   `getClickTrackingUrl` 调用中明确指定 `type: "redirect"` 和对应 `action` (如 `share_week`, `invite_click`)。

5.  **文档更新**:
    *   `TRACKING.md` 已全面更新，反映最新的字段定义和事件字典。

## 验证结果 (Verification)

*   `src/core/pipeline/report-pipeline.tsx`: 链接构造逻辑正确，`type` 参数被正确传递给下游组件 (`DownloadContent`, `RedirectContent`) 用于埋点标识。
*   `app/share/redirect/content.tsx`: 已修复直接使用 `targetUrl` 的问题，并添加了 `action` 字段。
*   `app/api/redirect/route.ts`: 已修复直接使用 `targetUrl` 的问题，确保发往 `/api/track` 的 payload 符合规范。

## 下一步建议 (Next Steps)

*   在 Firestore 中监控新旧数据的兼容性（旧数据可能仍有顶层 `targetUrl`，但新代码已兼容读取）。
*   定期检查 `TRACKING.md` 以保持文档与代码同步。
