'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Plus, MessageSquare, ThumbsUp, Clock } from 'lucide-react';
import { ThreadList } from '@/components/discussions/ThreadList';
import { useDiscussion } from '@/hooks/useDiscussion';

type SortOption = 'hot' | 'new' | 'top' | 'controversial';
type TimeframeOption = 'day' | 'week' | 'month' | 'year' | 'all';

export default function DiscussionsPage() {
  const [sort, setSort] = useState<SortOption>('hot');
  const [timeframe, setTimeframe] = useState<TimeframeOption>('week');
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { threads, loading, error, fetchThreads } = useDiscussion();

  useEffect(() => {
    fetchThreads({ sort, timeframe, category });
  }, [sort, timeframe, category]);

  const categories = [
    { id: 'all', label: 'All Discussions' },
    { id: 'legislation', label: 'Legislation' },
    { id: 'policy', label: 'Policy Debate' },
    { id: 'local', label: 'Local Issues' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'general', label: 'General' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discussions</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Engage in constructive civic discourse on legislation and policy
          </p>
        </div>
        <a
          href="/discussions/new"
          className="inline-flex items-center gap-2 bg-community-600 text-white px-4 py-2 rounded-lg hover:bg-community-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Start Discussion
        </a>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500"
            >
              <option value="hot">Hot</option>
              <option value="new">New</option>
              <option value="top">Top</option>
              <option value="controversial">Controversial</option>
            </select>

            {(sort === 'top' || sort === 'controversial') && (
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as TimeframeOption)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Thread List */}
      <ThreadList threads={threads} loading={loading} />
    </div>
  );
}
