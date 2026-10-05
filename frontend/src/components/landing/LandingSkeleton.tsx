"use client";

import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

export function LandingSkeleton() {
  return (
    <SkeletonPage className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-8">
        <Skeleton className="h-8 w-28" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-center md:px-8 md:pt-16">
        <div className="space-y-4">
          <Skeleton className="mx-auto h-4 w-48" />
          <Skeleton className="mx-auto h-12 w-[90%]" />
          <Skeleton className="mx-auto h-12 w-[70%]" />
          <Skeleton className="mx-auto h-5 w-96 max-w-full" />
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Skeleton className="h-12 w-40 rounded-xl" />
            <Skeleton className="h-12 w-36 rounded-xl" />
          </div>
        </div>
        <div className="mt-14 flex justify-center">
          <Skeleton className="h-[480px] w-[240px] rounded-[2.5rem]" />
        </div>
      </div>
    </SkeletonPage>
  );
}

export default LandingSkeleton;
