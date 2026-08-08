'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

function notify() {
  toastListeners.forEach((l) => l(toasts));
}

export function toast(t: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { ...t, id }];
  notify();
  setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== id);
    notify();
  }, 4000);
}

export function Toaster() {
  const [items, setItems] = React.useState<Toast[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const listener = (t: Toast[]) => setItems(t);
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {items.map((t) => {
          const Icon = t.type === 'success' ? CheckCircle2 : t.type === 'error' ? XCircle : Info;
          const color = t.type === 'success' ? 'text-cinema-success' : t.type === 'error' ? 'text-cinema-crimson' : 'text-cinema-amber';
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className="pointer-events-auto flex items-start gap-3 rounded-lg border border-cinema-border bg-cinema-surface p-4 shadow-2xl shadow-black/50"
            >
              <Icon className={`h-5 w-5 ${color} flex-shrink-0`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{t.title}</p>
                {t.description && <p className="mt-1 text-xs text-cinema-muted">{t.description}</p>}
              </div>
              <button
                onClick={() => {
                  toasts = toasts.filter((x) => x.id !== t.id);
                  notify();
                }}
                className="text-cinema-muted hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
