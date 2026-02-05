/**
 * Domain Service: Report Data Retrieval
 * (领域服务：报告数据获取)
 *
 * Handles the business logic for fetching and adapting weekly report data.
 * Acts as an intermediary between the raw API layer and the presentation/email layer.
 * (处理获取和适配周报数据的业务逻辑。充当原始 API 层和展示/邮件层之间的中介。)
 */
import { getWeeklyData as fetchWeeklyReport } from "@/lib/api/report";
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
 * @param period_start - Optional start date for the report period. (可选的报告周期开始日期。)
 * @param period_end - Optional end date for the report period. (可选的报告周期结束日期。)
 * @returns A promise resolving to the fully populated `WeeklyData`. (解析为填充完整的 `WeeklyData` 的 Promise。)
 */
export async function getWeeklyData(
  uid: string,
  period_start?: string,
  period_end?: string,
): Promise<WeeklyData> {
  return logger.measure(`getWeeklyData(uid=${uid})`, async () => {
    logger.info("Fetching raw report from API...");
    const apiReport = await fetchWeeklyReport(uid, period_start, period_end);
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

    // Inject period params if present (used for tracking/links)
    if (period_start) {
      weeklyData.period_start = period_start;
    }
    if (period_end) {
      weeklyData.period_end = period_end;
    }

    return weeklyData;
  });
}
