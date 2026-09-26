import { cx } from '../../utils/format';

export function Skeleton({ className = '' }) {
  return (
    <div className={cx('relative overflow-hidden rounded-xl bg-sand-200', className)} aria-hidden>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </div>
  );
}

export function CardSkeleton({ className = '' }) {
  return (
    <div className={cx('card overflow-hidden', className)}>
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8, className = 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' }) {
  return (
    <div className={className} role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
