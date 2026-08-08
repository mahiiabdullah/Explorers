import { cn } from '@/lib/utils';
import React from 'react';

export const BentoGrid = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('grid w-full grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3', className)}>
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        'group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-cinema-border bg-cinema-surface p-4 transition-all hover:border-cinema-amber/50 hover:shadow-2xl hover:shadow-cinema-amber/10',
        className,
      )}
    >
      {header}
      <div className="bento-item__header space-y-2 transition-transform group-hover/bento:translate-x-2">
        {icon}
        <div className="font-display text-xl text-white">{title}</div>
        <div className="text-sm text-cinema-muted">{description}</div>
      </div>
    </div>
  );
};
