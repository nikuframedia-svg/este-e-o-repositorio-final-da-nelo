import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ChartDataPoint } from '../../types';
import { formatCompactNumber } from '../../lib/utils';

interface BarChartProps {
  data: ChartDataPoint[];
  height?: number;
  color?: string;
  secondaryColor?: string;
  showGrid?: boolean;
  showAxis?: boolean;
  horizontal?: boolean;
  stacked?: boolean;
}

export function BarChart({
  data,
  height = 160,
  color = '#3b82f6',
  secondaryColor,
  showGrid = false,
  showAxis = true,
  horizontal = false,
  stacked = false,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBar
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 4, right: 4, left: horizontal ? 0 : -20, bottom: 0 }}
        barCategoryGap="20%"
      >
        {showGrid && (
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e2e8f0" 
            vertical={!horizontal} 
            horizontal={horizontal}
            strokeOpacity={0.8}
          />
        )}
        {showAxis && (
          horizontal ? (
            <>
              <XAxis 
                type="number" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={formatCompactNumber}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#64748b' }}
                width={80}
              />
            </>
          ) : (
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
          )
        )}
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
        <Bar
          dataKey="value"
          fill={color}
          radius={[2, 2, 0, 0]}
          stackId={stacked ? 'stack' : undefined}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.value2 !== undefined && secondaryColor ? secondaryColor : color} />
          ))}
        </Bar>
        {secondaryColor && stacked && (
          <Bar dataKey="value2" fill={secondaryColor} radius={[2, 2, 0, 0]} stackId="stack" />
        )}
      </RechartsBar>
    </ResponsiveContainer>
  );
}
