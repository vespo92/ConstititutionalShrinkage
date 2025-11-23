'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FileText, ArrowLeft, Download, Calendar } from 'lucide-react';
import Link from 'next/link';

const mockReports = [
  {
    id: 'report-001',
    title: 'Monthly Compliance Report - January 2024',
    type: 'monthly',
    date: '2024-01-31',
    status: 'completed',
  },
  {
    id: 'report-002',
    title: 'Weekly Summary Report - Week 4',
    type: 'weekly',
    date: '2024-01-28',
    status: 'completed',
  },
  {
    id: 'report-003',
    title: 'Critical Violations Analysis Q4 2023',
    type: 'quarterly',
    date: '2024-01-15',
    status: 'completed',
  },
];

export default function ComplianceReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/compliance">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FileText className="h-7 w-7 text-judicial-primary" />
              Compliance Reports
            </h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
              Generated compliance reports and analytics
            </p>
          </div>
        </div>
        <Button variant="primary">
          Generate New Report
        </Button>
      </div>

      <Card variant="bordered" padding="none">
        <CardHeader className="px-6 py-4">
          <span>Available Reports</span>
          <Badge variant="default">{mockReports.length}</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {mockReports.map((report) => (
              <div
                key={report.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800">
                    <FileText className="h-5 w-5 text-judicial-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {report.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-slate-400">
                        {report.date}
                      </span>
                      <Badge variant="default" size="sm">{report.type}</Badge>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
