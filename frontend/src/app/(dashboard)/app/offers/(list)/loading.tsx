"use client";

import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

export default function OffersLoading() {
  return (
    <SkeletonPage className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-surface/80">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)]">
            <tr>
              {["Offer", "Type", "Status", "Scans", "Redeem", "Expires", ""].map((h, i) => (
                <th key={i} className="px-4 py-3 md:px-6">
                  {h ? <Skeleton className="h-3 w-16" /> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b border-[var(--border)]/70">
                <td className="px-4 py-3.5 md:px-6">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-4 py-3.5 md:px-6">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </td>
                <td className="px-4 py-3.5 md:px-6">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </td>
                <td className="px-4 py-3.5 md:px-6">
                  <Skeleton className="h-4 w-8" />
                </td>
                <td className="px-4 py-3.5 md:px-6">
                  <Skeleton className="h-4 w-8" />
                </td>
                <td className="px-4 py-3.5 md:px-6">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-4 py-3.5 md:px-6">
                  <Skeleton className="h-4 w-16" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SkeletonPage>
  );
}
