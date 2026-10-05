"use client";

import { Skeleton, SkeletonPage, SkeletonStagger, SkeletonItem } from "@/components/ui/Skeleton";

export function PanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <SkeletonPage>
      <div className="card-interactive space-y-3 p-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
        <SkeletonStagger className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonItem key={i}>
              <Skeleton className="h-10 w-full" />
            </SkeletonItem>
          ))}
        </SkeletonStagger>
      </div>
    </SkeletonPage>
  );
}
