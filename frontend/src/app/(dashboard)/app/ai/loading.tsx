"use client";

import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

export default function AiLoading() {
  return (
    <SkeletonPage className="mx-auto max-w-3xl space-y-8">
      <div className="card-interactive space-y-4 p-6 md:p-8">
        <div className="space-y-1">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-[var(--border)] p-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="mb-2 h-3 w-16" />
              <Skeleton className="h-5 w-10" />
            </div>
          ))}
        </div>
      </div>

      <div className="card-interactive space-y-4 p-6 md:p-8">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="space-y-3">
          <div>
            <Skeleton className="mb-1 h-3 w-12" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div>
            <Skeleton className="mb-1 h-3 w-16" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div>
            <Skeleton className="mb-1 h-3 w-28" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
        <Skeleton className="h-4 w-80" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-20 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    </SkeletonPage>
  );
}
