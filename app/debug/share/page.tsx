import React from "react";
import { Metadata } from "next";
import DebugShareContent from "./content";

export const metadata: Metadata = {
  title: "Debug Share",
  description: "Debug page for navigator.share",
  openGraph: {
    title: "Debug Share Title",
    description: "Debug Share Description",
    images: [
      {
        url: "/images/og-image.png", // Use a valid image path from your public folder
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
    images: ["/images/og-image.png"],
  },
};

export default function DebugSharePage() {
  return <DebugShareContent />;
}
