import React from 'react';
import { cn } from '@/lib/cn';

type Tone = 'gray' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

interface BadgeProps {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const tones: Record<Tone, string> = {
  gray: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  danger: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
  info: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400',
  purple: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
};

const dotColors: Record<Tone, string> = {
  gray: 'bg-slate-400',
  brand: 'bg-brand-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  purple: 'bg-violet-500',
};

export const Badge: React.FC<BadgeProps> = ({ tone = 'gray', children, className, dot }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
      tones[tone],
      className
    )}
  >
    {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[tone])} />}
    {children}
  </span>
);

export default Badge;
