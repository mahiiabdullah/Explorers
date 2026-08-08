'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import { motion } from 'framer-motion';

export const MovingBorder = ({
  children,
  className,
  duration = 2000,
  borderRadius = '0.5rem',
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  borderRadius?: string;
}) => {
  return (
    <button
      className={cn(
        'relative inline-flex h-12 items-center justify-center overflow-hidden bg-transparent p-[1px] text-sm',
        className,
      )}
      style={{ borderRadius }}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius }}
      >
        <motion.div
          className="absolute inset-0 h-full w-full"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, #F5A524 90deg, transparent 180deg)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: duration / 1000, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <div
        className="relative z-10 flex h-full w-full items-center justify-center bg-cinema-bg px-6 text-cinema-amber backdrop-blur-xl"
        style={{ borderRadius: `calc(${borderRadius} - 1px)` }}
      >
        {children}
      </div>
    </button>
  );
};
