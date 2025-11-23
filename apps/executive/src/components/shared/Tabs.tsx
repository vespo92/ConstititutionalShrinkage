'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children: ReactNode;
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
}

export function Tabs({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
  children,
  variant = 'default',
  fullWidth = false,
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id);
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabClick = (tabId: string) => {
    setInternalActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const variants = {
    default: {
      container: 'border-b border-gray-200',
      tab: 'px-4 py-2 -mb-px border-b-2 transition-colors',
      active: 'border-primary-500 text-primary-600',
      inactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
    },
    pills: {
      container: 'bg-gray-100 p-1 rounded-lg',
      tab: 'px-4 py-2 rounded-md transition-colors',
      active: 'bg-white text-gray-900 shadow-sm',
      inactive: 'text-gray-500 hover:text-gray-700',
    },
    underline: {
      container: '',
      tab: 'px-4 py-2 border-b-2 transition-colors',
      active: 'border-primary-500 text-primary-600 font-medium',
      inactive: 'border-transparent text-gray-500 hover:text-gray-700',
    },
  };

  const style = variants[variant];

  return (
    <div>
      <div className={cn('flex', style.container, fullWidth && 'justify-evenly')}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabClick(tab.id)}
            className={cn(
              'flex items-center gap-2 text-sm font-medium',
              style.tab,
              activeTab === tab.id ? style.active : style.inactive,
              tab.disabled && 'opacity-50 cursor-not-allowed',
              fullWidth && 'flex-1 justify-center'
            )}
            disabled={tab.disabled}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'px-2 py-0.5 text-xs rounded-full',
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

// Tab Panel Component
interface TabPanelProps {
  id: string;
  activeTab: string;
  children: ReactNode;
}

export function TabPanel({ id, activeTab, children }: TabPanelProps) {
  if (id !== activeTab) return null;
  return <div>{children}</div>;
}

export default Tabs;
