'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Grid, List, Filter } from 'lucide-react';
import { usePods } from '@/hooks/usePods';
import PodList from '@/components/pods/PodList';
import SearchBar from '@/components/shared/SearchBar';
import Button from '@/components/ui/Button';
import type { PodType, PodStatus } from '@/types';

export default function PodsPage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState<PodType | ''>('');
  const [statusFilter, setStatusFilter] = useState<PodStatus | ''>('');

  const { pods, loading, total } = usePods({
    search,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Regional Pods</h1>
          <p className="mt-1 text-gray-600">
            Explore and manage regional governance pods
          </p>
        </div>
        <Link href="/pods/create">
          <Button>
            <Plus size={18} className="mr-2" />
            Propose New Pod
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search pods by name or code..."
              onSearch={setSearch}
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as PodType | '')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-pod-green-500 focus:border-pod-green-500"
            >
              <option value="">All Types</option>
              <option value="municipal">Municipal</option>
              <option value="county">County</option>
              <option value="regional">Regional</option>
              <option value="state">State</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PodStatus | '')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-pod-green-500 focus:border-pod-green-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="forming">Forming</option>
              <option value="merging">Merging</option>
              <option value="dissolved">Dissolved</option>
            </select>

            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setView('grid')}
                className={`p-2 ${view === 'grid' ? 'bg-pod-green-100 text-pod-green-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 ${view === 'list' ? 'bg-pod-green-100 text-pod-green-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <p className="text-sm text-gray-500 mb-4">
          {loading ? 'Loading...' : `${total} pods found`}
        </p>
        <PodList pods={pods} view={view} loading={loading} />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/pods/compare" className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:border-pod-green-300 transition-colors">
          <h3 className="font-semibold text-gray-900">Compare Pods</h3>
          <p className="text-sm text-gray-500 mt-1">Side-by-side comparison of pod metrics</p>
        </Link>
        <Link href="/map" className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:border-pod-green-300 transition-colors">
          <h3 className="font-semibold text-gray-900">View on Map</h3>
          <p className="text-sm text-gray-500 mt-1">Interactive map of all regional pods</p>
        </Link>
      </div>
    </div>
  );
}
