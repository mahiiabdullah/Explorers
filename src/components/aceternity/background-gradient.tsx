import { cn } from '@/lib/utils';
import React from 'react';

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  const variants = {
    initial: {
      backgroundPosition: '0% 50%',
    },
    animate: {
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    },
  };
  return (
    <div className={cn('group relative p-[1px]', containerClassName)}>
      <div
        className={cn(
          'absolute inset-0 rounded-3xl bg-gradient-to-r from-cinema-amber via-cinema-gold to-cinema-amber opacity-50 blur-xl transition-all duration-500 group-hover:opacity-80',
          animate && 'animate-gradient',
        )}
        style={{
          backgroundSize: animate ? '400% 400%' : undefined,
        }}
      />
      <div
        className={cn(
          'relative rounded-3xl bg-cinema-surface',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
};
