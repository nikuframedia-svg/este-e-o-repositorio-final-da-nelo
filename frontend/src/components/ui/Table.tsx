import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>;
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr 
      className={cn('table-row', onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableHeader({ children, className, align = 'left' }: { children: ReactNode; className?: string; align?: 'left' | 'center' | 'right' }) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  
  return (
    <th className={cn('table-header', alignClasses[align], className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className, align = 'left', mono = false }: { 
  children: ReactNode; 
  className?: string; 
  align?: 'left' | 'center' | 'right';
  mono?: boolean;
}) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  
  return (
    <td className={cn('table-cell', alignClasses[align], mono && 'font-mono', className)}>
      {children}
    </td>
  );
}
