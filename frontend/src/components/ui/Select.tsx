import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';
import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  className?: string;
}

export function Select({ options, className, ...props }: SelectProps) {
  return (
    <div className="relative inline-flex">
      <select
        className={cn(
          'dropdown appearance-none pr-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown 
        size={16} 
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" 
      />
    </div>
  );
}

// Dropdown button style (like "Week" dropdown in reference)
interface DropdownButtonProps {
  value: string;
  onClick?: () => void;
  className?: string;
}

export function DropdownButton({ value, onClick, className }: DropdownButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn('dropdown', className)}
    >
      {value}
      <ChevronDown size={16} className="text-slate-400" />
    </button>
  );
}
