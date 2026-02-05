# 核心上下文总结 (2026-02-05) - Email ID 更新与 Git 修复

## 1. Git 推送问题修复

**问题描述**：用户误操作使用了 `git commit --amend` 修改了已推送的 commit，导致本地分支与远程分支分叉 (diverged)，无法正常推送。
**解决方案**：

- 执行 `git reset --soft origin/main`：将 HEAD 重置回远程状态，保留修改内容在暂存区。
- 执行 `git commit -m "记录 eid"`：将暂存区的修改重新提交为一个新的 commit。
- 执行 `git push`：成功推送到远程仓库。

## 2. Email ID 逻辑更新

**变更原因**：用户指定 `emailId` (eid) 应优先使用 URL params 中的 `id` 字段，而非 `weekStart`。
**代码变更**：

- **Types**: `WeeklyReportData` 和 `WeeklyData` 接口新增 `id?: number` 字段。
- **Adapter**: `mapApiReportToWeeklyReportData` 和 `mapReportToWeeklyData` 增加了 `id` 字段的透传映射。
- **Email Template (`emails/fyp-scout-report.tsx`)**:

  ```typescript
  // 变更前
  const emailId = data.weekStart;

  // 变更后
  const emailId = data.id ? String(data.id) : data.weekStart;
  ```

## 3. 下一步建议

- 验证邮件中的追踪链接 (Tracking URL) 是否正确携带了新的 `eid` 参数。
- 确认后端 API 返回的 `id` 字段值是否符合预期。
