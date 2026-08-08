'use client';

import { cn } from '@/lib/utils';
import React from 'react';

export const Marquee = ({
  children,
  className,
  reverse = false,
  pauseOnHover = false,
}: {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
}) => {
  return (
    <div
      className={cn(
        'group flex w-full overflow-hidden [--duration:40s] [--gap:1rem] [gap:var(--gap)]',
        className,
      )}
    >
      <div
        className={cn(
          'flex shrink-0 justify-around [gap:var(--gap)] animate-marquee',
          reverse && '[animation-direction:reverse]',
          pauseOnHover && 'group-hover:[animation-play-state:paused]',
        )}
        style={{ animationDuration: 'var(--duration)' }}
      >
        {children}
      </div>
      <div
        className={cn(
          'flex shrink-0 justify-around [gap:var(--gap)] animate-marquee',
          reverse && '[animation-direction:reverse]',
          pauseOnHover && 'group-hover:[animation-play-state:paused]',
        )}
        style={{ animationDuration: 'var(--duration)' }}
      >
        {children}
      </div>
    </div>
  );
};
