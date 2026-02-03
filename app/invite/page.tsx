import React from "react";
import { getWeeklyData } from "@/lib/firebase-admin";
import InviteFlow from "./InviteFlow";

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { uid } = await searchParams;

  if (!uid || Array.isArray(uid)) {
    return (
      <div className="h-dvh w-[40.2rem] bg-[#313131] flex items-center justify-center text-white">
        Missing or invalid UID
      </div>
    );
  }

  let data;
  try {
    data = await getWeeklyData(uid);
  } catch (error) {
    console.error("Error fetching weekly data:", error);
    return (
      <div className="h-dvh w-[40.2rem] bg-[#313131] flex items-center justify-center text-white">
        Failed to load report
      </div>
    );
  }

  return <InviteFlow data={data} />;
}
