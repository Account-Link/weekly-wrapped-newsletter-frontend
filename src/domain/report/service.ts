/**
 * Domain Service: Report Data Retrieval
 * (领域服务：报告数据获取)
 *
 * Handles the business logic for fetching and adapting weekly report data.
 * Acts as an intermediary between the raw API layer and the presentation/email layer.
 * (处理获取和适配周报数据的业务逻辑。充当原始 API 层和展示/邮件层之间的中介。)
 */
import { getWeeklyReport } from "@/lib/api/report";
import type { WeeklyData } from "@/domain/report/types";
import { createLogger } from "@/lib/logger";

const logger = createLogger("Domain/ReportService");

/**
 * Fetches weekly report data for a user and adapts it for the email template.
 * (获取用户的周报数据并将其适配为邮件模板所需的格式。)
 *
 * Steps (步骤):
 * 1. Calls the raw API to get report data. (调用原始 API 获取报告数据。)
 * 2. Adapts the API response to the internal domain model. (将 API 响应适配为内部领域模型。)
 * 3. Maps the domain model to the `WeeklyData` structure required by the email template. (将领域模型映射为邮件模板所需的 `WeeklyData` 结构。)
 *
 * @param uid - The user ID to fetch the report for. (要获取报告的用户 ID。)
 * @param global_report_id - Optional global report id for precise fetch. (可选的全局报告 ID。)
 * @returns A promise resolving to the fully populated `WeeklyData`. (解析为填充完整的 `WeeklyData` 的 Promise。)
 */
export async function getWeeklyData(
  uid: string,
  global_report_id?: string,
): Promise<WeeklyData> {
  return logger.measure(
    `getWeeklyData(uid=${uid}, global_report_id=${global_report_id ?? "n/a"})`,
    async () => {
      let apiReport;

      if (!apiReport) {
        logger.info("Fetching raw report from API...");
        // 重要逻辑：改用 global_report_id 作为查询条件，替代 period_start/period_end
        apiReport = await getWeeklyReport(uid, global_report_id);
      }

      logger.info(`API report fetched: ${JSON.stringify(apiReport)}`);
      logger.info("Adapting report data...");
      const { mapApiReportToWeeklyReportData, mapReportToWeeklyData } =
        await import("@/domain/report/adapter");
      const { getAssetBaseUrl } = await import("@/lib/config");

      const report = mapApiReportToWeeklyReportData(apiReport);
      const assetBaseUrl = getAssetBaseUrl();

      const weeklyData = mapReportToWeeklyData(
        apiReport.app_user_id || uid,
        report,
        {
          assetBaseUrl,
        },
      );

      return weeklyData;
    },
  );
}
