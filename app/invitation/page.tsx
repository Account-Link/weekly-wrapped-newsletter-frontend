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
  const resolvedUid = Array.isArray(uid) ? uid[0] : uid;
  const imageUrl = `${baseUrl}/images/og-image.png`;

  return {
    openGraph: {
      title: "Who's the trendsetter?",
      description: "I just got my TikTok trend rank. Your turn.",
      url: `${baseUrl}/invitation?uid=${resolvedUid || ""}`,
      images: [
        {
          url: imageUrl,
          width: 240,
          height: 240,
          alt: "Who's the trendsetter?",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Who's the trendsetter?",
      description: "I just got my TikTok trend rank. Your turn.",
      images: [imageUrl],
    },
  };
}

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { eid } = await searchParams;
  const resolvedEid = Array.isArray(eid) ? eid[0] : eid;

  let data;
  if (!resolvedEid) {
    data = {
      trend: {
        topic: "xxxx",
        rank: null,
        totalDiscoverers: 0,
      },
    };
    return <InviteFlow uid="" data={data} />;
  }

  try {
    data = await getWeeklyData(resolvedEid);
  } catch (error) {
    console.error("Error fetching weekly data:", error);
    const is404 = isAxiosError(error) && error.response?.status === 404;
    return (
      <div className="h-dvh w-[40.2rem] bg-[#313131] flex items-center justify-center text-white">
        {is404 ? "Report not found" : "Failed to load report"}
      </div>
    );
  }

  return <InviteFlow uid={resolvedEid} data={data} />;
}
