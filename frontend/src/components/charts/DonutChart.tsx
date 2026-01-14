import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { ChartDataPoint } from '../../types';
import { formatCompactNumber } from '../../lib/utils';

interface DonutChartProps {
  data: ChartDataPoint[];
  height?: number;
  colors?: string[];
  innerRadius?: number;
  outerRadius?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

const DEFAULT_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function DonutChart({
  data,
  height = 160,
  colors = DEFAULT_COLORS,
  innerRadius = 50,
  outerRadius = 70,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
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
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && <span className="metric-lg">{centerValue}</span>}
          {centerLabel && <span className="text-[11px] text-slate-400 mt-0.5">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}

interface DonutLegendProps {
  data: ChartDataPoint[];
  colors?: string[];
  compact?: boolean;
}

export function DonutLegend({ data, colors = DEFAULT_COLORS, compact = false }: DonutLegendProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-xs text-slate-500">{item.name}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={item.name} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-[13px] text-slate-600">{item.name}</span>
          </div>
          <span className="text-[13px] font-medium text-slate-900 tabular-nums">
            {formatCompactNumber(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
