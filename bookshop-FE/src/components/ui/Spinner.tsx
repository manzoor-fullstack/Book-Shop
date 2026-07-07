import React from 'react';
import { cn } from '@/lib/cn';

export const Spinner: React.FC<{ className?: string; size?: number }> = ({
  className,
  size = 20,
}) => (
  <svg
    className={cn('animate-spin text-brand-600', className)}
    style={{ width: size, height: size }}
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

export const PageLoader: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <Spinner size={32} />
    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
  </div>
);

export default Spinner;
