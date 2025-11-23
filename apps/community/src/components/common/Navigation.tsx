'use client';

import { usePathname } from 'next/navigation';
import {
  Home,
  MessageSquare,
  FileSignature,
  Video,
  MessageCircle,
  Users,
  BarChart3,
  User,
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/discussions', label: 'Discussions', icon: MessageSquare },
  { href: '/petitions', label: 'Petitions', icon: FileSignature },
  { href: '/townhalls', label: 'Town Halls', icon: Video },
  { href: '/comments', label: 'Public Comments', icon: MessageCircle },
  { href: '/feedback', label: 'Policy Feedback', icon: BarChart3 },
  { href: '/groups', label: 'Groups', icon: Users },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-4rem)] bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-gray-700 p-4">
      <ul className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <li key={item.href}>
              <a
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'bg-community-50 text-community-700 dark:bg-community-900/30 dark:text-community-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>

      {/* Profile Quick Card */}
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        <a
          href="/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <div className="w-10 h-10 bg-community-100 dark:bg-community-900/30 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-community-600 dark:text-community-400" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white text-sm">
              Your Profile
            </div>
            <div className="text-xs text-gray-500">Rep: 1,234</div>
          </div>
        </a>
      </div>
    </nav>
  );
}
