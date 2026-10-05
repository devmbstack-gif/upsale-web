"use client";

import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

export function LegalSkeleton() {
  return (
    <SkeletonPage className="mx-auto max-w-3xl space-y-8 px-4 py-12 md:px-8">
      <div className="space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="h-3 w-40" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[92%]" />
          <Skeleton className="h-4 w-[85%]" />
        </div>
      ))}
    </SkeletonPage>
  );
}

export default LegalSkeleton;
