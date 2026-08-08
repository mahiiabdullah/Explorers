'use client';

import { cn } from '@/lib/utils';
import React from 'react';

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    shimmerColor?: string;
    background?: string;
  }
>(({ children, className, shimmerColor = '#ffffff', background = 'rgba(245, 165, 36, 1)', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'group relative z-0 inline-flex h-12 items-center justify-center overflow-hidden rounded-md px-8 font-medium text-cinema-bg transition-all',
        className,
      )}
      style={{ background }}
      {...props}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ '--shimmer-color': shimmerColor } as React.CSSProperties}
      >
        <div className="absolute inset-0 [mask-image:linear-gradient(white,transparent)]">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
      </div>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
});
ShimmerButton.displayName = 'ShimmerButton';
