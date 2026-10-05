"use client";

import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

export default function OfferDetailLoading() {
  return (
    <SkeletonPage className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <Skeleton className="h-[240px] w-[240px] rounded-2xl" />
        <div className="card-interactive space-y-4 p-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[var(--border)] p-3">
                <Skeleton className="mb-2 h-3 w-16" />
                <Skeleton className="h-7 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonPage>
  );
}
