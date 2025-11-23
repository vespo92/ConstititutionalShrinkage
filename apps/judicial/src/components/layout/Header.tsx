'use client';

import { Scale, Bell, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Header() {
  return (
    <header className="bg-judicial-primary text-white shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="h-8 w-8 text-judicial-secondary" />
            <div>
              <h1 className="text-xl font-bold">Judicial System</h1>
              <p className="text-xs text-gray-300">Constitutional Review & Case Management</p>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search cases, bills, precedents..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-judicial-secondary focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-compliance-violation" />
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-white/20">
              <div className="h-9 w-9 rounded-full bg-judicial-secondary flex items-center justify-center">
                <User className="h-5 w-5 text-judicial-dark" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">Judge Smith</p>
                <p className="text-xs text-gray-300">Constitutional Review</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
