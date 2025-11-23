'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  BarChart3,
  Vote,
  FileText,
  MapPin,
  Target,
  Users,
  FileOutput,
  Settings,
  Activity,
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/', icon: BarChart3 },
  { name: 'Voting', href: '/voting', icon: Vote },
  { name: 'Legislation', href: '/legislation', icon: FileText },
  { name: 'Regions', href: '/regions', icon: MapPin },
  { name: 'TBL Metrics', href: '/tbl', icon: Target },
  { name: 'Engagement', href: '/engagement', icon: Users },
  { name: 'Reports', href: '/reports', icon: FileOutput },
  { name: 'Admin', href: '/admin', icon: Settings },
];

export function AnalyticsNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center gap-2">
            <Activity className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-xl text-gray-900">Analytics</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href ||
                      (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={clsx(
                            isActive
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                            'group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6'
                          )}
                        >
                          <item.icon
                            className={clsx(
                              isActive
                                ? 'text-blue-600'
                                : 'text-gray-400 group-hover:text-gray-500',
                              'h-5 w-5 shrink-0'
                            )}
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                    </span>
                    <span className="text-xs font-medium">Live Data</span>
                  </div>
                  <p className="text-xs opacity-90">
                    Real-time updates enabled
                  </p>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm">
        <Activity className="h-8 w-8 text-blue-600" />
        <span className="font-bold text-xl text-gray-900">Analytics</span>
      </div>
    </>
  );
}
