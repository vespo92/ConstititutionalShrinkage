'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navigation } from './Navigation';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="flex-1 overflow-y-auto">
        <Navigation collapsed={collapsed} />
      </div>

      {/* Collapse toggle */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Distance tier legend (when expanded) */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Distance Tiers</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-distance-local" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Local (0-50 km)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-distance-regional" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Regional (50-200 km)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-distance-national" />
              <span className="text-xs text-slate-600 dark:text-slate-400">National (200-500 km)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-distance-international" />
              <span className="text-xs text-slate-600 dark:text-slate-400">International (500+ km)</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
