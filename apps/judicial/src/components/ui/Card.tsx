'use client';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className, variant = 'default', padding = 'md' }: CardProps) {
  const variantClasses = {
    default: 'bg-white dark:bg-slate-800',
    elevated: 'bg-white dark:bg-slate-800 shadow-lg',
    bordered: 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={twMerge(
        clsx('rounded-lg', variantClasses[variant], paddingClasses[padding], className)
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, action }: CardHeaderProps) {
  return (
    <div className={twMerge(clsx('flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-700', className))}>
      <div className="font-semibold text-lg text-gray-900 dark:text-white">{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={twMerge(clsx('py-4', className))}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={twMerge(clsx('pt-4 border-t border-gray-200 dark:border-slate-700', className))}>
      {children}
    </div>
  );
}
