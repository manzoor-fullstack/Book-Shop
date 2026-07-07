import React, { useId } from 'react';

export interface AreaPoint {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: AreaPoint[];
  height?: number;
  color?: string;
  valuePrefix?: string;
}

/** Lightweight dependency-free area chart with a smooth curve + gradient fill. */
export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  height = 220,
  color = '#4f46e5',
  valuePrefix = '',
}) => {
  const gid = useId();
  const W = 640;
  const H = height;
  const padX = 8;
  const padTop = 16;
  const padBottom = 28;

  if (!data.length) {
    return <div className="grid place-items-center text-sm text-slate-400" style={{ height }}>No data</div>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const stepX = (W - padX * 2) / Math.max(data.length - 1, 1);
  const scaleY = (v: number) => padTop + (1 - v / max) * (H - padTop - padBottom);

  const points = data.map((d, i) => ({
    x: padX + i * stepX,
    y: scaleY(d.value),
  }));

  // Smooth path via Catmull-Rom -> cubic bezier
  const linePath = points
    .map((p, i, arr) => {
      if (i === 0) return `M ${p.x},${p.y}`;
      const prev = arr[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `C ${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
    })
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x},${H - padBottom} L ${points[0].x},${H - padBottom} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* horizontal grid lines */}
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={padX}
          x2={W - padX}
          y1={padTop + t * (H - padTop - padBottom)}
          y2={padTop + t * (H - padTop - padBottom)}
          className="stroke-slate-200/70 dark:stroke-slate-800"
          strokeWidth={1}
        />
      ))}

      <path d={areaPath} fill={`url(#grad-${gid})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3} fill={color} className="stroke-white dark:stroke-slate-900" strokeWidth={2}>
            <title>{`${data[i].label}: ${valuePrefix}${data[i].value}`}</title>
          </circle>
          <text
            x={p.x}
            y={H - 8}
            textAnchor="middle"
            className="fill-slate-400 text-[11px]"
            style={{ fontSize: 11 }}
          >
            {data[i].label}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default AreaChart;
