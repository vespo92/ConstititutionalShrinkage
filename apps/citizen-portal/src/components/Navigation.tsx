'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Vote,
  MapPin,
  UserCircle,
  FileText,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Delegations',
    href: '/delegations',
    icon: Users,
  },
  {
    name: 'Voting History',
    href: '/history',
    icon: Vote,
  },
  {
    name: 'Regional Pods',
    href: '/regions',
    icon: MapPin,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: UserCircle,
  },
];

const secondaryItems = [
  {
    name: 'Browse Bills',
    href: '/bills',
    icon: FileText,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    name: 'Help',
    href: '/help',
    icon: HelpCircle,
  },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 min-h-[calc(100vh-4rem)]">
      {/* Main Navigation */}
      <div className="flex-1 py-4">
        <div className="px-4 mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Main
          </span>
        </div>
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={pathname === item.href}
            />
          ))}
        </ul>

        <div className="px-4 mt-6 mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            More
          </span>
        </div>
        <ul className="space-y-1 px-2">
          {secondaryItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={pathname === item.href}
            />
          ))}
        </ul>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
            Your Stats
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Votes Cast</span>
              <span className="font-medium text-gray-900 dark:text-white">156</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Delegators</span>
              <span className="font-medium text-gray-900 dark:text-white">23</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Reputation</span>
              <span className="font-medium text-governance-civic">85</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavItem({
  name,
  href,
  icon: Icon,
  isActive,
}: {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={clsx(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
        )}
      >
        <Icon
          className={clsx(
            'h-5 w-5',
            isActive
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-400'
          )}
        />
        {name}
      </Link>
    </li>
  );
}
