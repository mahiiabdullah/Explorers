'use client';

import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export const TextGenerateEffect = ({
  words,
  className,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  duration?: number;
}) => {
  const [displayed, setDisplayed] = useState('');
  const wordsArray = words.split(' ');

  useEffect(() => {
    let mounted = true;
    let i = 0;
    const interval = setInterval(() => {
      if (!mounted) return;
      if (i < wordsArray.length) {
        setDisplayed((prev) => (prev ? prev + ' ' : '') + wordsArray[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, duration * 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [words, duration]);

  return (
    <AnimatePresence>
      <motion.div className={cn('font-display leading-tight tracking-wide', className)}>
        {displayed.split(' ').map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-block"
          >
            {word}&nbsp;
          </motion.span>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
