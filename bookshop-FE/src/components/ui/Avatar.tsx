import React from 'react';
import { cn } from '@/lib/cn';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
};

const initials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
};

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        className={cn('rounded-full object-cover ring-2 ring-white dark:ring-slate-800', sizes[size], className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'rounded-full grid place-items-center font-semibold bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 ring-2 ring-white dark:ring-slate-800',
        sizes[size],
        className
      )}
    >
      {initials(name)}
    </div>
  );
};

export default Avatar;
