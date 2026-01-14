import { cn } from '../../lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  showValue?: boolean;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  color = 'primary',
  size = 'sm',
  showValue = false,
  className,
}: ProgressProps) {
  const percentage = Math.min(100, (value / max) * 100);

  const colors = {
    primary: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  };

  const heights = {
    sm: 'h-1',
    md: 'h-1.5',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('progress-bar flex-1', heights[size])}>
        <div
          className={cn('progress-fill', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <span className="text-xs font-medium text-slate-600 tabular-nums w-8 text-right">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

// Compact bar for inline use
export function MiniBar({ value, max = 100, color = 'primary' }: { value: number; max?: number; color?: 'primary' | 'success' | 'warning' | 'danger' }) {
  const percentage = Math.min(100, (value / max) * 100);
  const colors = {
    primary: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  };

  return (
    <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={cn('h-full rounded-full', colors[color])}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
