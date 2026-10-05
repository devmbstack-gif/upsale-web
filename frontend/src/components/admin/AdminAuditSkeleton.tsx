"use client";

import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

export function AdminAuditSkeleton() {
  return (
    <SkeletonPage className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card-interactive space-y-2 p-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-56" />
          </div>
        ))}
      </div>
    </SkeletonPage>
  );
}

export default AdminAuditSkeleton;
