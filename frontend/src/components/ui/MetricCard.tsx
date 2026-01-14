import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  description?: string;
  sparkline?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  action?: ReactNode;
}

export function MetricCard({
  label,
  value,
  change,
  changeLabel,
  description,
  sparkline,
  size = 'md',
  className,
  action,
}: MetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  const valueClasses = {
    sm: 'metric-md',
    md: 'metric-lg',
    lg: 'metric-xl',
    hero: 'metric-hero',
  };

  return (
    <div className={cn('card p-5', className)}>
      <div className="flex items-start justify-between mb-3">
        <span className="label">{label}</span>
        {action}
      </div>
      
      <div className="flex items-end justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className={valueClasses[size]}>{value}</div>
          
          {description && (
            <p className="text-description mt-1">{description}</p>
          )}
          
          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className={cn(
                'inline-flex items-center gap-1',
                isPositive && 'trend-up',
                isNegative && 'trend-down',
                !isPositive && !isNegative && 'text-slate-400'
              )}>
                {isPositive && <TrendingUp size={14} />}
                {isNegative && <TrendingDown size={14} />}
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
              {changeLabel && (
                <span className="label-muted">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        
        {sparkline && (
          <div className="flex-shrink-0">{sparkline}</div>
        )}
      </div>
    </div>
  );
}

// Large metric display for hero sections
interface HeroMetricProps {
  value: string | number;
  label: string;
  sublabel?: string;
}

export function HeroMetric({ value, label, sublabel }: HeroMetricProps) {
  return (
    <div className="text-center">
      <div className="metric-hero">{value}</div>
      <div className="label mt-1">{label}</div>
      {sublabel && <div className="text-xs text-slate-400">{sublabel}</div>}
    </div>
  );
}

// Inline metric for compact displays
interface InlineMetricProps {
  label: string;
  value: string | number;
  change?: number;
}

export function InlineMetric({ label, value, change }: InlineMetricProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-slate-500">{label}</span>
      <div className="flex items-center gap-3">
        <span className="metric-md">{value}</span>
        {change !== undefined && (
          <span className={cn(
            'text-sm font-medium',
            isPositive && 'trend-up',
            isNegative && 'trend-down'
          )}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
