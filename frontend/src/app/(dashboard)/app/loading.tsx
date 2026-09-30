import { PanelSkeleton } from "@/components/dashboard/PanelSkeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-interactive p-6">
            <div className="skeleton mb-3 h-4 w-24" />
            <div className="skeleton h-9 w-20" />
          </div>
        ))}
      </div>
      <PanelSkeleton rows={5} />
      <PanelSkeleton rows={3} />
    </div>
  );
}
