import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'accent';
  onClick?: () => void;
}

export function Card({ children, className, padding = 'md', variant = 'default', onClick }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };

  const variantClasses = {
    default: 'card',
    elevated: 'card-elevated',
    accent: 'card-accent',
  };

  return (
    <div 
      className={cn(variantClasses[variant], paddingClasses[padding], onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function CardHeader({ title, subtitle, action, size = 'md' }: CardHeaderProps) {
  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="min-w-0 flex-1">
        <h3 className={cn('font-semibold text-slate-900', titleSizes[size])}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// Section header
export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {action}
    </div>
  );
}

// Feature card with accent background (like the premium features card)
interface FeatureCardProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function FeatureCard({ title, description, action, className }: FeatureCardProps) {
  return (
    <Card variant="accent" padding="lg" className={cn('text-white relative z-10', className)}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-300 mb-4">{description}</p>
      {action}
    </Card>
  );
}
