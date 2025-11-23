'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  FileText,
  Users,
  MessageSquare,
  Map,
  Settings,
  HelpCircle,
} from 'lucide-react';

const mainNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Pods', href: '/pods', icon: MapPin },
  { name: 'Legislation', href: '/legislation', icon: FileText },
  { name: 'Coordination', href: '/coordination', icon: Users },
  { name: 'Community', href: '/community', icon: MessageSquare },
  { name: 'Map', href: '/map', icon: Map },
];

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`w-64 bg-white border-r border-gray-200 min-h-screen ${className}`}>
      <div className="flex flex-col h-full">
        {/* Main Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {mainNavigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-pod-green-100 text-pod-green-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={20} className="mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="px-4 py-4 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Your Pod Stats
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Participation</span>
              <span className="font-medium text-pod-green-600">68%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Active Bills</span>
              <span className="font-medium">3</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Pending Votes</span>
              <span className="font-medium text-amber-600">2</span>
            </div>
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="px-4 py-4 border-t border-gray-200">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <Icon size={18} className="mr-3" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
