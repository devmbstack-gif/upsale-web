"use client";

import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

export default function ProfileLoading() {
  return (
    <SkeletonPage className="mx-auto max-w-3xl space-y-8">
      <div className="card-interactive space-y-6 p-6 md:p-8">
        <div className="space-y-1">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/50 p-4">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-20 rounded-xl" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`space-y-1.5 ${i === 4 ? "md:col-span-2" : ""}`}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
          <div className="space-y-1.5 md:col-span-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      <div className="card-interactive space-y-4 p-6 md:p-8">
        <div className="space-y-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="card-interactive space-y-6 p-6 md:p-8">
        <div className="space-y-1">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="card-interactive space-y-4 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Skeleton className="mb-2 h-3 w-12" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div>
            <Skeleton className="mb-2 h-3 w-24" />
            <Skeleton className="h-5 w-36" />
          </div>
        </div>
      </div>
    </SkeletonPage>
  );
}
