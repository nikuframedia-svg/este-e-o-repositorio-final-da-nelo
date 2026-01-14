import { AreaChart, Area, ResponsiveContainer, Line, LineChart } from 'recharts';

interface SparkLineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  type?: 'area' | 'line';
}

export function SparkLine({ 
  data, 
  color = '#22c55e', 
  height = 24, 
  width = 60,
  type = 'area'
}: SparkLineProps) {
  const chartData = data.map((value, index) => ({ value, index }));
  const isPositive = data[data.length - 1] >= data[0];
  const autoColor = isPositive ? '#22c55e' : '#ef4444';
  const finalColor = color === 'auto' ? autoColor : color;

  if (type === 'line') {
    return (
      <ResponsiveContainer width={width} height={height}>
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={finalColor}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width={width} height={height}>
      <AreaChart data={chartData} margin={{ top: 1, right: 1, left: 1, bottom: 1 }}>
        <defs>
          <linearGradient id={`spark-${finalColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={finalColor} stopOpacity={0.2} />
            <stop offset="100%" stopColor={finalColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={finalColor}
          strokeWidth={1.5}
          fill={`url(#spark-${finalColor.replace('#', '')})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Mini bar chart for inline comparisons
interface MiniBarChartProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export function MiniBarChart({ data, color = '#3b82f6', height = 24, width = 60 }: MiniBarChartProps) {
  const max = Math.max(...data);
  const barWidth = (width - (data.length - 1) * 2) / data.length;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {data.map((value, i) => {
        const barHeight = (value / max) * height;
        return (
          <rect
            key={i}
            x={i * (barWidth + 2)}
            y={height - barHeight}
            width={barWidth}
            height={barHeight}
            fill={color}
            rx={1}
            opacity={0.7 + (i / data.length) * 0.3}
          />
        );
      })}
    </svg>
  );
}
