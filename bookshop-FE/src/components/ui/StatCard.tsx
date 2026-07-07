import React from 'react';
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import { cn } from '@/lib/cn';

type Tone = 'brand' | 'emerald' | 'amber' | 'sky' | 'violet' | 'rose';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  tone?: Tone;
  trend?: { value: number; label?: string };
  footer?: React.ReactNode;
}

const toneStyles: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  tone = 'brand',
  trend,
  footer,
}) => {
  const up = (trend?.value ?? 0) >= 0;
  return (
    <div className="card p-5 transition-all hover:shadow-soft">
      <div className="flex items-start justify-between">
        <div className={cn('grid h-11 w-11 place-items-center rounded-xl', toneStyles[tone])}>
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
              up
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
            )}
          >
            {up ? <FiArrowUpRight size={13} /> : <FiArrowDownRight size={13} />}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
      {footer && <div className="mt-2 text-xs text-slate-400">{footer}</div>}
    </div>
  );
};

export default StatCard;
