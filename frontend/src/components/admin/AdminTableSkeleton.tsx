"use client";

import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

/** Search bar + dense table — businesses-style admin pages. */
export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <SkeletonPage className="space-y-6">
      <div className="card-interactive flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-surface/80 backdrop-blur-md">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] text-muted">
            <tr>
              {Array.from({ length: 4 }).map((_, i) => (
                <th key={i} className="px-4 py-3 font-medium">
                  <Skeleton className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-b border-[var(--border)]/70">
                <td className="px-4 py-3">
                  <Skeleton className="mb-1 h-4 w-32" />
                  <Skeleton className="mb-1 h-3 w-40" />
                  <Skeleton className="h-3 w-36" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-8 w-28 rounded-xl" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="mb-1 h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16 rounded-xl" />
                    <Skeleton className="h-8 w-20 rounded-xl" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SkeletonPage>
  );
}

export default AdminTableSkeleton;
