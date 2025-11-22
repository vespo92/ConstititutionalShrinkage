'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { fetchBills } from '@/lib/api';
import { statusLabels, levelLabels } from '@/lib/mock-data';
import type { BillListItem, BillSearchFilters } from '@/lib/types';
import { GovernanceLevel, LawStatus } from '@constitutional-shrinkage/constitutional-framework';

export default function BillsListPage() {
  const [bills, setBills] = useState<BillListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BillSearchFilters>({});

  const loadBills = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBills(filters);
      setBills(data);
    } catch (error) {
      console.error('Failed to load bills:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  const handleFilterChange = (
    field: keyof BillSearchFilters,
    value: string | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bills</h1>
          <p className="mt-1 text-gray-600">
            Browse and search all proposed and active legislation
          </p>
        </div>
        <Link
          href="/bills/create"
          className="bg-gov-blue text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
        >
          + Create Bill
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.searchQuery || ''}
              onChange={(e) =>
                handleFilterChange('searchQuery', e.target.value)
              }
              placeholder="Search by title or content..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) =>
                handleFilterChange('status', e.target.value as LawStatus)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level
            </label>
            <select
              value={filters.level || ''}
              onChange={(e) =>
                handleFilterChange('level', e.target.value as GovernanceLevel)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-transparent"
            >
              <option value="">All Levels</option>
              {Object.entries(levelLabels)
                .filter(([key]) => key !== GovernanceLevel.IMMUTABLE)
                .map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {bills.length} bill{bills.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={clearFilters}
              className="text-sm text-gov-blue hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Bills List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gov-blue"></div>
        </div>
      ) : bills.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">&#128220;</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No bills found
          </h3>
          <p className="text-gray-500 mb-6">
            {hasActiveFilters
              ? 'Try adjusting your filters or search query'
              : 'Be the first to propose legislation!'}
          </p>
          <Link
            href="/bills/create"
            className="inline-block bg-gov-blue text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Create a Bill
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {bills.map((bill) => (
              <Link
                key={bill.id}
                href={`/bills/${bill.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h2 className="text-lg font-semibold text-gray-900 hover:text-gov-blue">
                        {bill.title}
                      </h2>
                      <span className={`status-badge status-${bill.status}`}>
                        {statusLabels[bill.status]}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Sponsored by {bill.sponsor}</span>
                      <span>&bull;</span>
                      <span>{levelLabels[bill.level]}</span>
                      <span>&bull;</span>
                      <span>
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    {bill.votesFor + bill.votesAgainst > 0 ? (
                      <div>
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-green-600 font-medium">
                            {bill.votesFor}
                          </span>
                          <span className="text-gray-400">/</span>
                          <span className="text-red-600 font-medium">
                            {bill.votesAgainst}
                          </span>
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (bill.votesFor /
                                  (bill.votesFor + bill.votesAgainst)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        No votes yet
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
