'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, Download, Calendar, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { formatDate, formatNumber } from '@/lib/utils';

interface ArchivedReport {
  id: string;
  name: string;
  type: string;
  format: string;
  generatedAt: Date;
  size: number;
}

const mockReports: ArchivedReport[] = [
  { id: '1', name: 'Monthly Summary - Oct 2024', type: 'supply_chain', format: 'PDF', generatedAt: new Date('2024-11-01'), size: 2540000 },
  { id: '2', name: 'Tax Report Q3 2024', type: 'tax', format: 'CSV', generatedAt: new Date('2024-10-15'), size: 890000 },
  { id: '3', name: 'Transparency Audit', type: 'transparency', format: 'PDF', generatedAt: new Date('2024-10-01'), size: 3200000 },
  { id: '4', name: 'Environmental Impact', type: 'environmental', format: 'JSON', generatedAt: new Date('2024-09-15'), size: 1500000 },
];

export default function ReportsArchivePage() {
  const columns: Column<ArchivedReport>[] = [
    {
      key: 'name',
      header: 'Report',
      render: (item) => (
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-slate-400" />
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
            <p className="text-sm text-slate-500 capitalize">{item.type.replace('_', ' ')}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'format',
      header: 'Format',
      render: (item) => (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
          {item.format}
        </span>
      ),
    },
    {
      key: 'generatedAt',
      header: 'Generated',
      render: (item) => (
        <div className="flex items-center gap-1 text-slate-500">
          <Calendar className="h-4 w-4" />
          {formatDate(item.generatedAt)}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'size',
      header: 'Size',
      render: (item) => `${(item.size / 1000000).toFixed(1)} MB`,
      sortable: true,
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'w-24',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/reports">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Report Archive
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Previously generated reports
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Archived Reports</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <DataTable
            data={mockReports}
            columns={columns}
            keyExtractor={(item) => item.id}
            searchable
            searchPlaceholder="Search reports..."
            emptyMessage="No archived reports"
          />
        </CardBody>
      </Card>
    </div>
  );
}
