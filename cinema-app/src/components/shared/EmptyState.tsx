import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Ticket } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'Nothing here yet',
  description = 'Start exploring to see content here.',
  actionLabel,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-16 text-center', className)}>
      <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-cinema-border bg-cinema-surface">
        {icon ?? <Ticket className="h-10 w-10 text-cinema-muted" />}
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-2xl text-white">{title}</h3>
        <p className="max-w-md text-sm text-cinema-muted">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="default">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
