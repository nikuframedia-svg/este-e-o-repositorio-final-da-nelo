import {
  AreaChart as RechartsArea,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ChartDataPoint } from '../../types';
import { formatCompactNumber } from '../../lib/utils';

interface AreaChartProps {
  data: ChartDataPoint[];
  height?: number;
  color?: string;
  showGrid?: boolean;
  showAxis?: boolean;
  showTooltip?: boolean;
  gradient?: boolean;
}

export function AreaChart({
  data,
  height = 160,
  color = '#3b82f6',
  showGrid = false,
  showAxis = true,
  showTooltip = true,
  gradient = true,
}: AreaChartProps) {
  const gradientId = `area-${color.replace('#', '')}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsArea data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        {gradient && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.12} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
        )}
        {showGrid && (
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e2e8f0" 
            vertical={false} 
            strokeOpacity={0.8}
          />
        )}
        {showAxis && (
          <>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={formatCompactNumber}
              width={45}
            />
          </>
        )}
        {showTooltip && (
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              boxShadow: '0 4px 12px rgb(0 0 0 / 0.15)',
            }}
            labelStyle={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}
            itemStyle={{ color: 'white', fontSize: 13, fontWeight: 500 }}
            formatter={(value) => [formatCompactNumber(value as number), '']}
          />
        )}
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={gradient ? `url(#${gradientId})` : 'none'}
        />
      </RechartsArea>
    </ResponsiveContainer>
  );
}
