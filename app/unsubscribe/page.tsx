import { Suspense } from "react";
import UnsubscribeContent from "./content";

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
