'use client';

import { useState } from 'react';
import { AuditTrail } from '@/components/audit/AuditTrail';
import { History } from 'lucide-react';
import type { AuditEntry } from '@/types';

const mockAuditEntries: AuditEntry[] = [
  {
    id: 'audit-001',
    entityType: 'bill',
    entityId: 'bill-2024-001',
    action: 'created',
    performedBy: 'Legislative Clerk',
    performedAt: new Date('2024-01-15T10:30:00'),
    newValue: 'Regional Transportation Infrastructure Act',
  },
  {
    id: 'audit-002',
    entityType: 'review',
    entityId: 'review-001',
    action: 'assigned',
    performedBy: 'System',
    performedAt: new Date('2024-01-15T11:00:00'),
    newValue: 'Assigned to Judge Smith',
  },
  {
    id: 'audit-003',
    entityType: 'case',
    entityId: 'case-2024-001',
    action: 'updated',
    performedBy: 'Judge Smith',
    performedAt: new Date('2024-01-16T09:15:00'),
    previousValue: 'Status: filed',
    newValue: 'Status: hearing',
  },
  {
    id: 'audit-004',
    entityType: 'ruling',
    entityId: 'ruling-2024-001',
    action: 'approved',
    performedBy: 'Chief Justice',
    performedAt: new Date('2024-01-17T14:30:00'),
    newValue: 'Ruling approved and published',
  },
  {
    id: 'audit-005',
    entityType: 'bill',
    entityId: 'bill-2024-002',
    action: 'rejected',
    performedBy: 'Judge Williams',
    performedAt: new Date('2024-01-18T16:45:00'),
    newValue: 'Constitutional violation - Right to Privacy',
  },
];

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>(mockAuditEntries);

  const handleFilter = (filters: { entityType?: string; action?: string; dateFrom?: string; dateTo?: string }) => {
    let filtered = mockAuditEntries;

    if (filters.entityType) {
      filtered = filtered.filter(e => e.entityType === filters.entityType);
    }
    if (filters.action) {
      filtered = filtered.filter(e => e.action === filters.action);
    }
    // Add date filtering logic as needed

    setEntries(filtered);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <History className="h-7 w-7 text-judicial-primary" />
          Audit Trail
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Complete history of all judicial system activities
        </p>
      </div>

      <AuditTrail entries={entries} onFilter={handleFilter} />
    </div>
  );
}
