import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function ChartContainer({
  title,
  subtitle,
  children,
  actions,
  className,
}: ChartContainerProps) {
  return (
    <div className={clsx('bg-white rounded-xl shadow-sm border border-gray-100', className)}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
