'use client';

import Link from 'next/link';
import { Bell, Search, User, Menu } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CS</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white hidden sm:block">
              Citizen Portal
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bills, delegations, citizens..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-700 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-600 transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 relative"
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-governance-alert rounded-full" />
            </button>
            {showNotifications && (
              <NotificationDropdown onClose={() => setShowNotifications(false)} />
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Jane Citizen
                </p>
                <p className="text-xs text-gray-500">Full Verified</p>
              </div>
            </button>
            {showUserMenu && (
              <UserDropdown onClose={() => setShowUserMenu(false)} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const notifications = [
    {
      id: 1,
      title: 'Vote Closing Soon',
      message: 'Infrastructure Bill voting ends in 24 hours',
      time: '1h ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Delegation Request',
      message: 'Alex Turner wants to delegate to you',
      time: '3h ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Bill Passed',
      message: 'Education Reform Act has been approved',
      time: '1d ago',
      unread: false,
    },
  ];

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
        <button className="text-xs text-primary-600 hover:text-primary-700">
          Mark all read
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer ${
              n.unread ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
            }`}
          >
            <div className="flex items-start gap-2">
              {n.unread && (
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {n.title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{n.message}</p>
                <p className="text-xs text-gray-500 mt-1">{n.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-gray-200 dark:border-slate-700">
        <Link
          href="/dashboard"
          className="block text-center text-sm text-primary-600 hover:text-primary-700 py-1"
          onClick={onClose}
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}

function UserDropdown({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-slate-700">
        <p className="font-medium text-gray-900 dark:text-white">Jane Citizen</p>
        <p className="text-sm text-gray-500">jane.citizen@email.com</p>
        <div className="mt-2 flex items-center gap-1">
          <span className="badge badge-civic">Full KYC</span>
          <span className="badge bg-gray-100 text-gray-600">Rep: 85</span>
        </div>
      </div>
      <div className="py-1">
        <DropdownLink href="/profile" onClick={onClose}>
          Profile Settings
        </DropdownLink>
        <DropdownLink href="/delegations" onClick={onClose}>
          My Delegations
        </DropdownLink>
        <DropdownLink href="/history" onClick={onClose}>
          Voting History
        </DropdownLink>
      </div>
      <div className="py-1 border-t border-gray-200 dark:border-slate-700">
        <button className="w-full text-left px-4 py-2 text-sm text-governance-alert hover:bg-gray-50 dark:hover:bg-slate-700">
          Sign Out
        </button>
      </div>
    </div>
  );
}

function DropdownLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
