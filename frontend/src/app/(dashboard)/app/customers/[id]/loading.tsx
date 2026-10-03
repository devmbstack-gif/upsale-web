"use client";

import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

export default function CustomerDetailLoading() {
  return (
    <SkeletonPage className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-44" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-20 rounded-xl" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card-interactive p-5">
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      <div className="card-interactive space-y-4 p-6">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-surface/80">
          <table className="min-w-full text-sm">
            <thead className="border-b border-[var(--border)]">
              <tr>
                {Array.from({ length: 4 }).map((_, i) => (
                  <th key={i} className="px-4 py-3 md:px-6">
                    <Skeleton className="h-3 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-[var(--border)]/70">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-4 py-3.5 md:px-6">
                      <Skeleton className="h-4 w-20" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-surface/80">
          <table className="min-w-full text-sm">
            <thead className="border-b border-[var(--border)]">
              <tr>
                {Array.from({ length: 5 }).map((_, i) => (
                  <th key={i} className="px-4 py-3 md:px-6">
                    <Skeleton className="h-3 w-14" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-[var(--border)]/70">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3.5 md:px-6">
                      <Skeleton className="h-4 w-16" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SkeletonPage>
  );
}
