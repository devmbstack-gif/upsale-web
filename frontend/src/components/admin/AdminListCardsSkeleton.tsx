"use client";

import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

/** Two-column list + editor layout used by packages/cms. */
export function AdminListCardsSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <SkeletonPage className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="card-interactive space-y-2 p-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-3 w-52" />
          </div>
        ))}
      </div>
      <div className="card-interactive space-y-3 p-5">
        <Skeleton className="h-6 w-36" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
    </SkeletonPage>
  );
}

export default AdminListCardsSkeleton;
