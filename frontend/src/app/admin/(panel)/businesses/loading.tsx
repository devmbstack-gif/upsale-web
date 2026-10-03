"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function BusinessesLoading() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-interactive space-y-3 p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mx-auto h-20 w-28 rounded-full" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </section>
      <div className="card-interactive flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-surface/80">
        <table className="min-w-full text-sm">
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-[var(--border)]/70">
                <td className="px-4 py-3">
                  <Skeleton className="mb-1 h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-8 w-28 rounded-xl" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-3 w-16" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
