'use client';

import { useEffect, useState } from 'react';
import { CaseCard } from '@/components/cases/CaseCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCases } from '@/hooks/useCases';
import { Gavel, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function CasesPage() {
  const { cases, fetchCases, isLoading, activeCasesCount } = useCases();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    fetchCases({ status: statusFilter || undefined, type: typeFilter || undefined, search: searchQuery || undefined });
  }, [fetchCases, statusFilter, typeFilter, searchQuery]);

  const statusOptions = ['', 'filed', 'assigned', 'hearing', 'deliberation', 'ruled'];
  const typeOptions = ['', 'dispute', 'review', 'appeal', 'interpretation'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Gavel className="h-7 w-7 text-judicial-primary" />
            Case Management
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Manage disputes, appeals, and case proceedings
          </p>
        </div>
        <Link href="/cases/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            File New Case
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card variant="bordered">
        <CardContent className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cases..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-judicial-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
            >
              <option value="">All Status</option>
              {statusOptions.filter(Boolean).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
            >
              <option value="">All Types</option>
              {typeOptions.filter(Boolean).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <Badge variant="info">{activeCasesCount} active cases</Badge>
        </CardContent>
      </Card>

      {/* Cases Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-judicial-primary" />
        </div>
      ) : cases.length === 0 ? (
        <Card variant="bordered" className="text-center py-12">
          <CardContent>
            <Gavel className="h-12 w-12 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
            <p className="text-gray-500 dark:text-slate-400">
              No cases found matching your criteria
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {cases.map((caseData) => (
            <CaseCard key={caseData.id} caseData={caseData} />
          ))}
        </div>
      )}
    </div>
  );
}
