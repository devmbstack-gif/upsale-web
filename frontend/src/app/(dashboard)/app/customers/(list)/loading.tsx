"use client";

import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

export default function CustomersLoading() {
  return (
    <SkeletonPage className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-xl" />
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-surface/80">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)]">
            <tr>
              {["Customer", "Joined", "Last visit", "Visits", "Spend", "Tags", "Actions"].map(
                (h, i) => (
                  <th key={i} className="px-4 py-3 md:px-6">
                    {h ? <Skeleton className="h-3 w-16" /> : null}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b border-[var(--border)]/70">
                <td className="px-4 py-3.5 md:px-6">
                  <Skeleton className="mb-1 h-4 w-28" />
                  <Skeleton className="h-3 w-24" />
                </td>
                <td className="px-4 py-3.5 md:px-6">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-4 py-3.5 md:px-6">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-4 py-3.5 md:px-6">
                  <Skeleton className="h-4 w-8" />
                </td>
                <td className="px-4 py-3.5 md:px-6">
                  <Skeleton className="h-4 w-8" />
                </td>
                <td className="px-4 py-3.5 md:px-6">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </td>
                <td className="px-4 py-3.5 md:px-6">
                  <Skeleton className="h-4 w-12" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SkeletonPage>
  );
}
