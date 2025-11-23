import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface DashboardGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function DashboardGrid({
  children,
  columns = 4,
  className
}: DashboardGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={clsx('grid gap-4 md:gap-6', gridCols[columns], className)}>
      {children}
    </div>
  );
}
