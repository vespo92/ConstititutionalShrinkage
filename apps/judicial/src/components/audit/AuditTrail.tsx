'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { formatDateTime } from '@/lib/utils';
import { History, Filter, Download, Shield } from 'lucide-react';
import type { AuditEntry } from '@/types';

interface AuditTrailProps {
  entries: AuditEntry[];
  onFilter?: (filters: AuditFilters) => void;
}

interface AuditFilters {
  entityType?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function AuditTrail({ entries, onFilter }: AuditTrailProps) {
  const [filters, setFilters] = useState<AuditFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const getActionColor = (action: string): 'compliant' | 'warning' | 'violation' | 'info' | 'default' => {
    switch (action) {
      case 'created': return 'compliant';
      case 'approved': return 'compliant';
      case 'updated': return 'info';
      case 'deleted': return 'violation';
      case 'rejected': return 'violation';
      case 'assigned': return 'warning';
      default: return 'default';
    }
  };

  const columns = [
    {
      key: 'performedAt',
      header: 'Timestamp',
      sortable: true,
      render: (entry: AuditEntry) => (
        <span className="text-sm font-mono">{formatDateTime(entry.performedAt)}</span>
      ),
    },
    {
      key: 'entityType',
      header: 'Entity',
      render: (entry: AuditEntry) => (
        <div>
          <Badge variant="default" size="sm">{entry.entityType}</Badge>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{entry.entityId}</p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (entry: AuditEntry) => (
        <Badge variant={getActionColor(entry.action)}>{entry.action}</Badge>
      ),
    },
    {
      key: 'performedBy',
      header: 'Performed By',
      render: (entry: AuditEntry) => (
        <span className="text-sm">{entry.performedBy}</span>
      ),
    },
    {
      key: 'details',
      header: 'Details',
      render: (entry: AuditEntry) => (
        <div className="max-w-xs">
          {entry.previousValue && (
            <p className="text-xs text-gray-500 dark:text-slate-400">
              From: <span className="font-mono">{entry.previousValue.slice(0, 30)}...</span>
            </p>
          )}
          {entry.newValue && (
            <p className="text-xs text-gray-500 dark:text-slate-400">
              To: <span className="font-mono">{entry.newValue.slice(0, 30)}...</span>
            </p>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card variant="bordered" padding="none">
      <CardHeader className="px-6 py-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-judicial-primary" />
          <span>Audit Trail</span>
          <Badge variant="default">{entries.length} entries</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>

      {showFilters && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                Entity Type
              </label>
              <select
                value={filters.entityType || ''}
                onChange={(e) => setFilters({ ...filters, entityType: e.target.value || undefined })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              >
                <option value="">All Types</option>
                <option value="bill">Bill</option>
                <option value="case">Case</option>
                <option value="ruling">Ruling</option>
                <option value="review">Review</option>
                <option value="user">User</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                Action
              </label>
              <select
                value={filters.action || ''}
                onChange={(e) => setFilters({ ...filters, action: e.target.value || undefined })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              >
                <option value="">All Actions</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="deleted">Deleted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
              Clear
            </Button>
            <Button variant="primary" size="sm" onClick={() => onFilter?.(filters)}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      <CardContent className="p-0">
        <DataTable
          data={entries}
          columns={columns}
          keyExtractor={(entry) => entry.id}
          emptyMessage="No audit entries found"
        />
      </CardContent>
    </Card>
  );
}
