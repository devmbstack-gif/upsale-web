"use client";

import { PanelSkeleton } from "@/components/dashboard/PanelSkeleton";
import { Skeleton, SkeletonPage, SkeletonStagger, SkeletonItem } from "@/components/ui/Skeleton";

export function DashboardHomeSkeleton() {
  return (
    <SkeletonPage className="space-y-8">
      <SkeletonStagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonItem key={i}>
            <div className="card-interactive p-6">
              <Skeleton className="mb-3 h-4 w-24" />
              <Skeleton className="h-9 w-20" />
            </div>
          </SkeletonItem>
        ))}
      </SkeletonStagger>
      <PanelSkeleton rows={5} />
      <PanelSkeleton rows={3} />
    </SkeletonPage>
  );
}

export default DashboardHomeSkeleton;
