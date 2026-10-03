"use client";

import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

export function AdminHealthSkeleton() {
  return (
    <SkeletonPage>
      <div className="card-interactive mx-auto max-w-2xl space-y-5 p-6 md:p-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[var(--border)] bg-surface-elevated/60 p-4"
            >
              <Skeleton className="mb-2 h-3 w-20" />
              <Skeleton className="h-7 w-24" />
              <Skeleton className="mt-2 h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonPage>
  );
}

export default AdminHealthSkeleton;
