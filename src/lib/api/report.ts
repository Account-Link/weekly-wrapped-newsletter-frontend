import axios from "axios";
import type { WeeklyReportApiResponse } from "@/domain/report/types";

const BASE_URL = process.env.NEXT_PUBLIC_REPORT_API_BASE_URL;

if (!BASE_URL) {
  console.warn("NEXT_PUBLIC_REPORT_API_BASE_URL is not defined");
}

const reportClient = axios.create({
  timeout: 15000,
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // 重要逻辑：所有后端接口统一携带固定 Authorization
    Authorization: "Bearer 11ce3f87b326b0aa",
  },
});

export async function getWeeklyData(
  uid: string,
  periodStart?: string,
  periodEnd?: string,
): Promise<WeeklyReportApiResponse> {
  const params: Record<string, string> = {};

  const response = await reportClient.get<WeeklyReportApiResponse>(
    `/weekly-report/${uid}`,
    { params },
  );
  return response.data;
}

export async function unsubscribe(
  uid: string,
): Promise<{ success: boolean; message?: string }> {
  const response = await reportClient.post("/weekly-report/unsubscribe", {
    app_user_id: uid,
  });
  return response.data;
}

export async function resubscribe(
  uid: string,
): Promise<{ success: boolean; message?: string }> {
  const response = await reportClient.post("/weekly-report/resubscribe", {
    app_user_id: uid,
  });
  return response.data;
}

export async function disconnect(
  uid: string,
): Promise<{ success: boolean; message?: string }> {
  const response = await reportClient.post("/weekly-report/disconnect", {
    app_user_id: uid,
  });
  return response.data;
}

export async function getWeeklyDataByReportId(
  report_id: string,
): Promise<WeeklyReportApiResponse> {
  const response = await reportClient.get<WeeklyReportApiResponse>(
    `/weekly-report/id/${report_id}`,
  );
  return response.data;
}
