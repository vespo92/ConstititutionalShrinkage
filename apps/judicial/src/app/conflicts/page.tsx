'use client';

import { useState } from 'react';
import { ConflictCard } from '@/components/conflicts/ConflictCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GitCompare, Filter } from 'lucide-react';
import Link from 'next/link';
import type { LegislativeConflict } from '@/types';

const mockConflicts: LegislativeConflict[] = [
  {
    id: 'conflict-001',
    title: 'Privacy vs Surveillance Requirements',
    description: 'Regional privacy protection law conflicts with federal surveillance mandates',
    status: 'under_review',
    severity: 'severe',
    conflictingLaws: [
      { id: 'law-001', title: 'Regional Privacy Protection Act', section: 'Section 5', clause: 'Citizens shall have absolute right to digital privacy...', effectiveDate: new Date('2023-01-01') },
      { id: 'law-002', title: 'Federal Security Enhancement Act', section: 'Section 12', clause: 'All communications shall be monitored...', effectiveDate: new Date('2024-01-01') },
    ],
    detectedAt: new Date('2024-01-15'),
  },
  {
    id: 'conflict-002',
    title: 'Tax Rate Discrepancy',
    description: 'Local and regional tax provisions contain contradictory rate specifications',
    status: 'detected',
    severity: 'moderate',
    conflictingLaws: [
      { id: 'law-003', title: 'Local Revenue Code', section: 'Article 3', clause: 'Property tax rate shall be 2.5%...', effectiveDate: new Date('2022-06-01') },
      { id: 'law-004', title: 'Regional Tax Reform Act', section: 'Section 8', clause: 'Maximum property tax rate is 1.8%...', effectiveDate: new Date('2023-09-01') },
    ],
    detectedAt: new Date('2024-01-10'),
  },
];

export default function ConflictsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');

  const filteredConflicts = statusFilter
    ? mockConflicts.filter(c => c.status === statusFilter)
    : mockConflicts;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <GitCompare className="h-7 w-7 text-judicial-primary" />
            Legislative Conflicts
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Detect and resolve conflicts between laws
          </p>
        </div>
        <Link href="/conflicts/resolve">
          <Button variant="primary">
            Resolution Tool
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-slate-400">Status:</span>
        </div>
        <div className="flex gap-2">
          {['', 'detected', 'under_review', 'resolved'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status || 'All'}
            </Button>
          ))}
        </div>
        <Badge variant="warning">{mockConflicts.filter(c => c.status !== 'resolved').length} unresolved</Badge>
      </div>

      {filteredConflicts.length === 0 ? (
        <Card variant="bordered" className="text-center py-12">
          <CardContent>
            <GitCompare className="h-12 w-12 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
            <p className="text-gray-500 dark:text-slate-400">
              No conflicts found for the selected filter
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredConflicts.map((conflict) => (
            <ConflictCard key={conflict.id} conflict={conflict} />
          ))}
        </div>
      )}
    </div>
  );
}
