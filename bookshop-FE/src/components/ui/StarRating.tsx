import React, { useState } from 'react';
import { cn } from '@/lib/cn';

interface StarRatingProps {
  value: number;
  size?: number;
  onChange?: (value: number) => void;
  className?: string;
}

const Star: React.FC<{ fill: number; size: number }> = ({ fill, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0">
    <defs>
      <linearGradient id={`star-${fill}-${size}`}>
        <stop offset={`${fill * 100}%`} stopColor="#f59e0b" />
        <stop offset={`${fill * 100}%`} stopColor="transparent" stopOpacity="1" />
      </linearGradient>
    </defs>
    <path
      d="M12 2l2.9 6.26 6.9.6-5.2 4.55 1.55 6.74L12 16.9l-6.15 3.85L7.4 13.4 2.2 8.86l6.9-.6L12 2z"
      fill={fill > 0 ? `url(#star-${fill}-${size})` : 'transparent'}
      stroke="#f59e0b"
      strokeWidth="1.5"
      strokeLinejoin="round"
      className={fill === 0 ? 'opacity-40' : ''}
    />
  </svg>
);

/** Read-only when no onChange, interactive when onChange is provided. */
export const StarRating: React.FC<StarRatingProps> = ({ value, size = 16, onChange, className }) => {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className={cn('inline-flex items-center gap-0.5', onChange && 'cursor-pointer', className)}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, display - i + 1));
        return (
          <span
            key={i}
            onMouseEnter={() => onChange && setHover(i)}
            onMouseLeave={() => onChange && setHover(0)}
            onClick={() => onChange?.(i)}
          >
            <Star fill={fill} size={size} />
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
