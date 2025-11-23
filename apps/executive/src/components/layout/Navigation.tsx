'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface NavigationProps {
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Navigation({ breadcrumbs, title, description, actions }: NavigationProps) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname if not provided
  const defaultBreadcrumbs: BreadcrumbItem[] = pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, array) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href: index < array.length - 1 ? '/' + array.slice(0, index + 1).join('/') : undefined,
    }));

  const displayBreadcrumbs = breadcrumbs || defaultBreadcrumbs;

  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {displayBreadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
          <Link href="/" className="hover:text-gray-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
          {displayBreadcrumbs.map((item, index) => (
            <span key={index} className="flex items-center">
              <svg className="w-4 h-4 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {item.href ? (
                <Link href={item.href} className="hover:text-gray-700">
                  {item.name}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{item.name}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Header */}
      {(title || actions) && (
        <div className="flex items-start justify-between">
          <div>
            {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}
    </div>
  );
}

// Tab Navigation Component
interface TabItem {
  name: string;
  href: string;
  count?: number;
}

interface TabNavigationProps {
  tabs: TabItem[];
}

export function TabNavigation({ tabs }: TabNavigationProps) {
  const pathname = usePathname();

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                isActive
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.name}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'ml-2 py-0.5 px-2 rounded-full text-xs',
                    isActive ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default Navigation;
