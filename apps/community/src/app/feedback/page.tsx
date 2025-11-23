'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MessageCircle, BarChart3, Clock, CheckCircle } from 'lucide-react';

interface Policy {
  id: string;
  title: string;
  description: string;
  implementedDate: string;
  feedbackCount: number;
  averageRating: number;
  status: 'active' | 'under-review' | 'sunset';
}

export default function FeedbackPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'under-review' | 'sunset'>('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch policies
    setLoading(true);
    // Simulated data
    setPolicies([
      {
        id: '1',
        title: 'Renewable Energy Standards 2024',
        description: 'Requirements for utilities to source 50% renewable energy by 2030.',
        implementedDate: '2024-01-15',
        feedbackCount: 523,
        averageRating: 4.2,
        status: 'active',
      },
      {
        id: '2',
        title: 'Small Business Tax Credit Program',
        description: 'Tax credits for small businesses hiring from underserved communities.',
        implementedDate: '2023-06-01',
        feedbackCount: 891,
        averageRating: 3.8,
        status: 'under-review',
      },
      {
        id: '3',
        title: 'Public Transit Expansion Initiative',
        description: 'Expansion of bus routes to suburban areas.',
        implementedDate: '2023-03-01',
        feedbackCount: 1247,
        averageRating: 4.5,
        status: 'active',
      },
    ]);
    setLoading(false);
  }, [statusFilter]);

  const filteredPolicies = policies.filter(
    (p) => statusFilter === 'all' || p.status === statusFilter
  );

  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'under-review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    sunset: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Policy Feedback</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Share your experience with implemented policies and help improve them
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All Policies' },
          { id: 'active', label: 'Active' },
          { id: 'under-review', label: 'Under Review' },
          { id: 'sunset', label: 'Sunset' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === tab.id
                ? 'bg-community-600 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Policies List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : filteredPolicies.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No policies found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPolicies.map((policy) => (
            <PolicyCard key={policy.id} policy={policy} statusColors={statusColors} />
          ))}
        </div>
      )}
    </div>
  );
}

function PolicyCard({
  policy,
  statusColors,
}: {
  policy: Policy;
  statusColors: Record<string, string>;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[policy.status]}`}>
              {policy.status.replace('-', ' ')}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {policy.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
            {policy.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {policy.feedbackCount} feedback
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            {policy.averageRating.toFixed(1)} avg rating
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Since {new Date(policy.implementedDate).toLocaleDateString()}
          </div>
        </div>
        <a
          href={`/feedback/policy/${policy.id}`}
          className="px-4 py-2 bg-community-600 text-white rounded-lg text-sm hover:bg-community-700 transition-colors"
        >
          Give Feedback
        </a>
      </div>
    </div>
  );
}
