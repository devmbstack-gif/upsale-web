"use client";

import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

export default function DealsLoading() {
  return (
    <SkeletonPage className="mx-auto max-w-6xl space-y-8">
      <div className="card-interactive space-y-5 p-6 md:p-8">
        <div className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <Skeleton className="h-4 w-64 self-end" />
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-surface/80">
          <table className="min-w-full text-sm">
            <thead className="border-b border-[var(--border)]">
              <tr>
                {Array.from({ length: 6 }).map((_, i) => (
                  <th key={i} className="px-4 py-3 md:px-6">
                    <Skeleton className="h-3 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-[var(--border)]/70">
                  <td className="px-4 py-3.5 md:px-6">
                    <Skeleton className="mb-1 h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </td>
                  <td className="px-4 py-3.5 md:px-6">
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </td>
                  <td className="px-4 py-3.5 md:px-6">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3.5 md:px-6">
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </td>
                  <td className="px-4 py-3.5 md:px-6">
                    <Skeleton className="h-4 w-8" />
                  </td>
                  <td className="px-4 py-3.5 md:px-6">
                    <Skeleton className="h-4 w-24" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SkeletonPage>
  );
}
