'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { PolicyList } from '@/components/policies/PolicyCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useMockPolicies } from '@/hooks/usePolicies';
import type { PolicyStatus } from '@/types';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Education', label: 'Education' },
  { value: 'Environment', label: 'Environment' },
  { value: 'Economy', label: 'Economy' },
  { value: 'Housing', label: 'Housing' },
  { value: 'Infrastructure', label: 'Infrastructure' },
];

export default function PoliciesPage() {
  const { data: policiesData, isLoading } = useMockPolicies();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const filteredPolicies = (policiesData?.data || []).filter((policy) => {
    const matchesSearch = policy.title.toLowerCase().includes(search.toLowerCase()) ||
      policy.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || policy.status === status;
    const matchesCategory = !category || policy.category === category;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <Navigation
        title="Policy Management"
        description="View and manage all policy implementations across your region."
        actions={
          <Link href="/policies/create">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Policy
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search policies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              options={statusOptions}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Filter by status"
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              options={categoryOptions}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Filter by category"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg ${view === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg ${view === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{filteredPolicies.length} policies found</span>
      </div>

      {/* Policy List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : filteredPolicies.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No policies found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <PolicyList policies={filteredPolicies} view={view} />
      )}
    </div>
  );
}
