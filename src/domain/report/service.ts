// 文件功能：周报数据服务层，处理数据获取与组装
// 方法概览：getWeeklyData (获取并组装周报数据)
import { getWeeklyData as fetchWeeklyReport } from "@/lib/api/report";
import type { WeeklyData } from "@/domain/report/types";

// 方法功能：拉取周报数据并映射为 WeeklyData
// 重要逻辑：请求后端接口并统一映射，保证模板可直接使用
export async function getWeeklyData(
  uid: string,
  period_start?: string,
  period_end?: string,
): Promise<WeeklyData> {
  const apiReport = await fetchWeeklyReport(uid, period_start, period_end);

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

  if (period_start) {
    weeklyData.period_start = period_start;
  }
  if (period_end) {
    weeklyData.period_end = period_end;
  }

  return weeklyData;
}
