"use client";

import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

export default function ClaimPageLoading() {
  return (
    <SkeletonPage className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8">
        <header className="mb-8 flex items-center justify-between gap-4">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-16" />
        </header>
        <div className="flex flex-1 flex-col gap-6">
          <div className="card-interactive space-y-3 p-6 text-center">
            <Skeleton className="mx-auto h-3 w-32" />
            <Skeleton className="mx-auto h-7 w-64 max-w-full" />
            <Skeleton className="mx-auto h-4 w-48" />
          </div>
          <div className="card-interactive space-y-4 p-6">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-64 max-w-full" />
            <div className="space-y-4 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </SkeletonPage>
  );
}
