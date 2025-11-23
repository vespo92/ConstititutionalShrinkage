'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Network,
  Calculator,
  Package,
  Receipt,
  Shield,
  FileText,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  children?: { name: string; href: string }[];
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Network',
    href: '/network',
    icon: Network,
    children: [
      { name: 'Overview', href: '/network' },
      { name: 'Explore', href: '/network/explore' },
    ],
  },
  {
    name: 'Distance Calculator',
    href: '/distance',
    icon: Calculator,
    children: [
      { name: 'Calculate', href: '/distance' },
      { name: 'Results', href: '/distance/results' },
    ],
  },
  {
    name: 'Product Tracking',
    href: '/tracking',
    icon: Package,
    children: [
      { name: 'Track Product', href: '/tracking' },
      { name: 'Verify', href: '/tracking/verify' },
    ],
  },
  {
    name: 'Taxes',
    href: '/taxes',
    icon: Receipt,
    children: [
      { name: 'Overview', href: '/taxes' },
      { name: 'Calculate', href: '/taxes/calculate' },
      { name: 'Rates', href: '/taxes/rates' },
      { name: 'Exemptions', href: '/taxes/exemptions' },
    ],
  },
  {
    name: 'Transparency',
    href: '/transparency',
    icon: Shield,
    children: [
      { name: 'Reports', href: '/transparency' },
      { name: 'Rankings', href: '/transparency/rankings' },
    ],
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    children: [
      { name: 'Generate', href: '/reports' },
      { name: 'Archive', href: '/reports/archive' },
    ],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

interface NavigationProps {
  collapsed?: boolean;
}

export function Navigation({ collapsed = false }: NavigationProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isChildActive = (href: string) => pathname === href;

  return (
    <nav className={cn('py-4 space-y-1', collapsed ? 'px-2' : 'px-4')}>
      {navigation.map(item => {
        const active = isActive(item.href);
        const Icon = item.icon;

        return (
          <div key={item.name}>
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                active
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.children && (
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 transition-transform',
                        active && 'rotate-90'
                      )}
                    />
                  )}
                </>
              )}
            </Link>

            {/* Sub-navigation */}
            {!collapsed && item.children && active && (
              <div className="ml-8 mt-1 space-y-1">
                {item.children.map(child => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      'block px-3 py-2 text-sm rounded-lg transition-colors',
                      isChildActive(child.href)
                        ? 'text-primary-700 dark:text-primary-300 font-medium'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                    )}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
