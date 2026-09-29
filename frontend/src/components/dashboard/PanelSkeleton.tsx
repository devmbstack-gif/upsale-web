export function PanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="card-interactive space-y-3 p-5">
      <div className="skeleton h-5 w-40" />
      <div className="skeleton h-4 w-56" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-10 w-full" />
      ))}
    </div>
  );
}
