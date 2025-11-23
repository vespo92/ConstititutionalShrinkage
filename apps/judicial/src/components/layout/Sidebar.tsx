'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  FileCheck,
  Shield,
  Gavel,
  GitCompare,
  History,
  BookOpen,
  Settings,
  ChevronDown,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  {
    name: 'Constitutional Review',
    href: '/review',
    icon: FileCheck,
    children: [
      { name: 'Pending Reviews', href: '/review' },
      { name: 'Review History', href: '/review/history' },
    ],
  },
  {
    name: 'Compliance',
    href: '/compliance',
    icon: Shield,
    children: [
      { name: 'Overview', href: '/compliance' },
      { name: 'Check Tool', href: '/compliance/check' },
      { name: 'Violations', href: '/compliance/violations' },
      { name: 'Reports', href: '/compliance/reports' },
    ],
  },
  {
    name: 'Cases',
    href: '/cases',
    icon: Gavel,
    children: [
      { name: 'All Cases', href: '/cases' },
      { name: 'File New Case', href: '/cases/new' },
    ],
  },
  {
    name: 'Conflicts',
    href: '/conflicts',
    icon: GitCompare,
    children: [
      { name: 'Active Conflicts', href: '/conflicts' },
      { name: 'Resolution Tool', href: '/conflicts/resolve' },
    ],
  },
  { name: 'Audit Trail', href: '/audit', icon: History },
  { name: 'Precedents', href: '/precedents', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:top-16 lg:border-r lg:border-gray-200 dark:lg:border-slate-700 lg:bg-white dark:lg:bg-slate-900">
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={clsx(
                  'group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-judicial-primary text-white'
                    : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  {item.name}
                </div>
                {item.children && (
                  <ChevronDown
                    className={clsx(
                      'h-4 w-4 transition-transform',
                      isActive && 'rotate-180'
                    )}
                  />
                )}
              </Link>

              {item.children && isActive && (
                <div className="mt-1 ml-8 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={clsx(
                        'block px-3 py-2 rounded-lg text-sm transition-colors',
                        pathname === child.href
                          ? 'text-judicial-primary font-medium bg-judicial-primary/10'
                          : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
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

      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <div className="rounded-lg bg-judicial-primary/10 p-4">
          <p className="text-sm font-medium text-judicial-primary">Quick Stats</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-500 dark:text-slate-400">Pending</p>
              <p className="text-lg font-bold text-judicial-primary">12</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-slate-400">Active Cases</p>
              <p className="text-lg font-bold text-judicial-primary">8</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
