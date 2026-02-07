"use client";

import React, { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useShareInvite } from "@/hooks/useShareInvite";
import Image from "next/image";
import monkeyPng from "@/assets/figma/invite/monkey.png";

export default function InviteSharePage() {
  const searchParams = useSearchParams();
  const { shareInvite } = useShareInvite();

  const buildInviteUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams();
    const uid = searchParams.get("uid");
    const periodStart = searchParams.get("period_start");
    const periodEnd = searchParams.get("period_end");

    if (uid) params.set("uid", uid);
    if (periodStart) params.set("period_start", periodStart);
    if (periodEnd) params.set("period_end", periodEnd);

    const inviteUrl = new URL("/invite", window.location.origin);
    inviteUrl.search = params.toString();
    return inviteUrl.toString();
  }, [searchParams]);

  const handleShare = async () => {
    const inviteUrl = buildInviteUrl();
    await shareInvite(inviteUrl);
  };

  return (
    <main
      className="h-dvh w-[40.2rem] mx-auto bg-[#313131] text-white flex flex-col justify-center px-[3.2rem]"
      style={{
        paddingTop: `calc(env(safe-area-inset-top) + 2rem)`,
        paddingBottom: `calc(env(safe-area-inset-bottom) + 2rem)`,
      }}
    >
      <Image
        src={monkeyPng}
        alt="Invite friends"
        className="w-[8.8rem] mb-[2.2rem]"
      />
      <h2 className="text-[2.4rem] text-white leading-none mb-[1.4rem] font-invite-title">
        Invite friends
      </h2>
      <p className="text-[1.6rem] leading-none text-white mb-[2.4rem]">
        Your friends probably scroll more than you. Prove it!
      </p>
      <button
        onClick={handleShare}
        className="w-full h-[5.6rem] gap-[0.8rem] bg-white rounded-full flex items-center justify-center text-black font-bold text-[1.6rem] hover:bg-gray-100 transition-colors"
      >
        Share invite link
        <svg
          width="16"
          height="12"
          viewBox="0 0 16 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 6H15M15 6L10 1M15 6L10 11"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </main>
  );
}
