import React from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: React.ReactNode;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  size = 180,
  thickness = 22,
  centerLabel,
  centerValue,
}) => {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;

  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={cx}
            cy={cx}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            className="stroke-slate-100 dark:stroke-slate-800"
          />
          {total > 0 &&
            segments.map((seg, i) => {
              const len = (seg.value / total) * circumference;
              const dash = `${len} ${circumference - len}`;
              const el = (
                <circle
                  key={i}
                  cx={cx}
                  cy={cx}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={thickness}
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                />
              );
              offset += len;
              return el;
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue !== undefined && (
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{centerValue}</span>
          )}
          {centerLabel && <span className="text-xs text-slate-400">{centerLabel}</span>}
        </div>
      </div>

      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: seg.color }} />
            <span className="text-slate-600 dark:text-slate-300 capitalize">{seg.label}</span>
            <span className="ml-auto font-semibold text-slate-900 dark:text-white">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
