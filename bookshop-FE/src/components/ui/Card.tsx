import React from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  padded = true,
  hover = false,
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'card',
      padded && 'p-5 sm:p-6',
      hover && 'transition-all hover:shadow-soft hover:-translate-y-0.5',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className }) => (
  <div className={cn('flex items-start justify-between gap-4 mb-5', className)}>
    <div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export default Card;
