"use client";

import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

export default function LoginLoading() {
  return (
    <SkeletonPage className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Skeleton className="mx-auto mb-4 h-10 w-32" />
          <Skeleton className="mx-auto h-5 w-48" />
        </div>
        <div className="card-interactive space-y-4 p-6 md:p-8">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="mx-auto h-4 w-36" />
        </div>
      </div>
    </SkeletonPage>
  );
}
