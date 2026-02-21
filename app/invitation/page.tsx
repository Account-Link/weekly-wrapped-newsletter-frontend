import React from "react";
import type { Metadata } from "next";
import { getAppBaseUrl } from "@/lib/config";
import InviteFlow from "./InviteFlow";
import {
  getWeeklyDataByReportId,
  getTrendTopHashtag,
  getWeeklyReport,
} from "@/lib/api/report";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { eid, uid: paramUid } = await searchParams;
  const baseUrl = getAppBaseUrl();
  const resolvedEid = Array.isArray(eid) ? eid[0] : eid;
  const resolvedUid = Array.isArray(paramUid) ? paramUid[0] : paramUid;
  const imageUrl = `${baseUrl}/images/og-image.png`;

  return {
    openGraph: {
      title: "Who's the trendsetter?",
      description: "I just got my TikTok trend rank. Your turn.",
      url: `${baseUrl}/invitation?eid=${resolvedEid || ""}&uid=${resolvedUid || ""}`,
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
  const { eid, uid: paramUid } = await searchParams;
  const resolvedEid = Array.isArray(eid) ? eid[0] : eid;
  const resolvedUid = Array.isArray(paramUid) ? paramUid[0] : paramUid;
  let uid = "";
  let data;

  try {
    if (resolvedEid) {
      const result = await getWeeklyDataByReportId(resolvedEid);
      if (
        result.discovery_rank === null ||
        result.discovery_rank === undefined ||
        !result.discovery_rank
      ) {
        uid = "";
        data = undefined;
      } else {
        uid = result.app_user_id;
        data = {
          trend: {
            topic: `”${result.trend_name || ""}”`,
            rank: result.discovery_rank,
            totalDiscoverers: result.total_discoverers || 0,
          },
        };
      }
    } else if (resolvedUid) {
      const result = await getWeeklyReport(resolvedUid);
      if (
        result.discovery_rank === null ||
        result.discovery_rank === undefined ||
        !result.discovery_rank
      ) {
        uid = "";
        data = undefined;
      } else {
        uid = result.app_user_id;
        data = {
          trend: {
            topic: `”${result.trend_name || ""}”`,
            rank: result.discovery_rank,
            totalDiscoverers: result.total_discoverers || 0,
          },
        };
      }
    }
  } catch (error) {
    console.error("Error fetching weekly data:", error);
  }

  if (!data) {
    // /weekly-report/trends/hashtag/top
    const { hashtag_name } = await getTrendTopHashtag();
    uid = "";
    data = {
      trend: {
        topic: `”${hashtag_name}”`,
        rank: 0,
        totalDiscoverers: 0,
      },
    };
  }

  return <InviteFlow uid={uid} data={data} />;
}
