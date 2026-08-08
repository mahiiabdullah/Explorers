import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  variant?: 'page' | 'card' | 'list';
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ variant = 'page', count = 1, className }: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={cn('space-y-4', className)}>
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="container space-y-8 py-12">
      <Skeleton className="h-12 w-1/2" />
      <Skeleton className="h-96 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
