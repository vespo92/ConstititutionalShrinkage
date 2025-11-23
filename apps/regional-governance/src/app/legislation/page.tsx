'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Filter } from 'lucide-react';
import { mockLegislation, legislationStatusLabels } from '@/lib/mock-data';
import LegislationCard from '@/components/legislation/LegislationCard';
import SearchBar from '@/components/shared/SearchBar';
import Button from '@/components/ui/Button';
import type { LegislationStatus, LegislationScope } from '@/types';

export default function LegislationPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LegislationStatus | ''>('');
  const [scopeFilter, setScopeFilter] = useState<LegislationScope | ''>('');

  const filteredLegislation = mockLegislation.filter(leg => {
    if (search && !leg.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && leg.status !== statusFilter) return false;
    if (scopeFilter && leg.scope !== scopeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Local Legislation</h1>
          <p className="mt-1 text-gray-600">
            View and participate in local and regional legislation
          </p>
        </div>
        <Link href="/legislation/propose">
          <Button>
            <Plus size={18} className="mr-2" />
            Propose Legislation
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search legislation..."
              onSearch={setSearch}
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LegislationStatus | '')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-pod-green-500 focus:border-pod-green-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="review">Under Review</option>
              <option value="voting">Voting</option>
              <option value="passed">Passed</option>
              <option value="rejected">Rejected</option>
              <option value="enacted">Enacted</option>
            </select>

            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value as LegislationScope | '')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-pod-green-500 focus:border-pod-green-500"
            >
              <option value="">All Scopes</option>
              <option value="local">Local</option>
              <option value="regional">Regional</option>
              <option value="inter_pod">Inter-Pod</option>
              <option value="state">State</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <p className="text-sm text-gray-500 mb-4">
          {filteredLegislation.length} legislation items
        </p>
        <div className="space-y-4">
          {filteredLegislation.map((leg) => (
            <LegislationCard key={leg.id} legislation={leg} />
          ))}
        </div>
        {filteredLegislation.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No legislation found matching your filters
          </div>
        )}
      </div>
    </div>
  );
}
