import React from "react";
import type { Metadata } from "next";
import { isAxiosError } from "axios";
import { getWeeklyData } from "@/domain/report/service";
import { getAppBaseUrl } from "@/lib/config";
import InviteFlow from "./InviteFlow";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { uid } = await searchParams;
  const baseUrl = getAppBaseUrl();

  // Invite page specific overrides: specific URL with UID
  return {
    openGraph: {
      url: `${baseUrl}/invite?uid=${uid || ""}`,
    },
  };
}

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { uid, period_start, period_end } = await searchParams;

  if (!uid || Array.isArray(uid)) {
    return (
      <div className="h-dvh w-[40.2rem] bg-[#313131] flex items-center justify-center text-white">
        Missing or invalid UID
      </div>
    );
  }

  let data;
  const start = Array.isArray(period_start) ? period_start[0] : period_start;
  const end = Array.isArray(period_end) ? period_end[0] : period_end;

  try {
    data = await getWeeklyData(uid, start, end);
  } catch (error) {
    console.error("Error fetching weekly data:", error);
    const is404 = isAxiosError(error) && error.response?.status === 404;
    return (
      <div className="h-dvh w-[40.2rem] bg-[#313131] flex items-center justify-center text-white">
        {is404 ? "Report not found" : "Failed to load report"}
      </div>
    );
  }

  return <InviteFlow uid={uid as string} data={data} />;
}
