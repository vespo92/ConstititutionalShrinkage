'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Plus, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { PetitionCard } from '@/components/petitions/PetitionCard';
import { usePetition } from '@/hooks/usePetition';

type StatusFilter = 'all' | 'active' | 'successful' | 'closed';

export default function PetitionsPage() {
  const [status, setStatus] = useState<StatusFilter>('active');
  const [category, setCategory] = useState<string>('all');
  const [region, setRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { petitions, loading, error, fetchPetitions } = usePetition();

  useEffect(() => {
    fetchPetitions({ status, category, region });
  }, [status, category, region]);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'environment', label: 'Environment' },
    { id: 'education', label: 'Education' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'transportation', label: 'Transportation' },
    { id: 'housing', label: 'Housing' },
    { id: 'economy', label: 'Economy' },
    { id: 'civil-rights', label: 'Civil Rights' },
  ];

  const statusTabs = [
    { id: 'active', label: 'Active', icon: TrendingUp },
    { id: 'successful', label: 'Successful', icon: CheckCircle },
    { id: 'closed', label: 'Closed', icon: Clock },
    { id: 'all', label: 'All', icon: null },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Petitions</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Create and sign citizen petitions to drive change
          </p>
        </div>
        <a
          href="/petitions/new"
          className="inline-flex items-center gap-2 bg-community-600 text-white px-4 py-2 rounded-lg hover:bg-community-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Petition
        </a>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatus(tab.id as StatusFilter)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              status === tab.id
                ? 'bg-community-600 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search petitions..."
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

          {/* Region Filter */}
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500"
          >
            <option value="all">All Regions</option>
            <option value="national">National</option>
            <option value="state">State</option>
            <option value="local">Local</option>
          </select>
        </div>
      </div>

      {/* Petition Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : petitions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No petitions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {petitions.map((petition) => (
            <PetitionCard key={petition.id} petition={petition} />
          ))}
        </div>
      )}
    </div>
  );
}
