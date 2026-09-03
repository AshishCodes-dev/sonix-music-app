export function CardSkeleton() {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="skeleton aspect-square rounded-xl mb-3" />
      <div className="skeleton h-4 w-2/3 rounded mb-2" />
      <div className="skeleton h-3 w-1/2 rounded" />
    </div>
  );
}

export function RowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}
