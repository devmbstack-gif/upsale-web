"use client";

import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

/** Compact settings/form card skeleton used by admin platform/trial pages. */
export function FormCardSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <SkeletonPage>
      <div className="card-interactive mx-auto max-w-2xl space-y-4 p-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
    </SkeletonPage>
  );
}
