import { Suspense } from "react";
import DownloadContent from "./content";

export default function DownloadPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DownloadContent />
    </Suspense>
  );
}
