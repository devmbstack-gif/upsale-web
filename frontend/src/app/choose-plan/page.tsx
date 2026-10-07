import { Suspense } from "react";
import ChoosePlanClient from "./ChoosePlanClient";

export default function ChoosePlanPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <ChoosePlanClient />
    </Suspense>
  );
}
