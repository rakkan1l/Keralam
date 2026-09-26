import { cx } from '../../utils/format';

export function Skeleton({ className = '' }) {
  return (
    <div className={cx('relative overflow-hidden rounded-[10px] bg-sand-200', className)} aria-hidden>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

export function CardSkeleton({ className = '' }) {
  return (
    <div className={className}>
      <Skeleton className="aspect-[4/3] rounded-[var(--radius-card)]" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8, className = 'grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' }) {
  return (
    <div className={className} role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
