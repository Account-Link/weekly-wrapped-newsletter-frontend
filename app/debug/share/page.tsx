import React from "react";
import { Metadata } from "next";
import DebugShareContent from "./content";
import { getAppBaseUrl } from "@/lib/config";

export const metadata: Metadata = {
  title: "Debug Share",
  description: "Debug page for navigator.share",
  openGraph: {
    title: "Debug Share Title",
    description: "Debug Share Description",
    url: `${getAppBaseUrl()}/debug/share`,
    images: [
      {
        url: `${getAppBaseUrl()}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Debug Share Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Debug Share Title",
    description: "Debug Share Description",
    images: [`${getAppBaseUrl()}/images/og-image.png`],
  },
};

export default function DebugSharePage() {
  return <DebugShareContent />;
}
