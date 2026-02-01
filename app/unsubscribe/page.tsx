import { Suspense } from "react";
import UnsubscribeClient from "./UnsubscribeClient";

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function UnsubscribePage() {
  return (
    <Suspense>
      <UnsubscribeClient />
    </Suspense>
  );
}
