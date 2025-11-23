'use client';

import { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { formatDate, formatDateTime } from '@/lib/utils';
import type { Report } from '@/types';

const reportTypes = [
  { value: 'tbl', label: 'Triple Bottom Line Report' },
  { value: 'policy', label: 'Policy Progress Report' },
  { value: 'resource', label: 'Resource Utilization Report' },
  { value: 'emergency', label: 'Emergency Response Report' },
  { value: 'custom', label: 'Custom Report' },
];

const formatOptions = [
  { value: 'pdf', label: 'PDF' },
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
];

// Mock reports
const recentReports: Report[] = [
  {
    id: 'rep-1',
    title: 'Q1 2024 TBL Performance Report',
    type: 'tbl',
    format: 'pdf',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    createdBy: 'Sarah Johnson',
    downloadUrl: '/reports/q1-2024-tbl.pdf',
    parameters: {},
  },
  {
    id: 'rep-2',
    title: 'Policy Implementation Status - February',
    type: 'policy',
    format: 'pdf',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    createdBy: 'Michael Chen',
    downloadUrl: '/reports/policy-feb.pdf',
    parameters: {},
  },
  {
    id: 'rep-3',
    title: 'Budget Utilization Report FY2024',
    type: 'resource',
    format: 'csv',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
    createdBy: 'Emily Rodriguez',
    downloadUrl: '/reports/budget-fy2024.csv',
    parameters: {},
  },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState('tbl');
  const [format, setFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);
    alert('Report generated successfully!');
  };

  return (
    <div className="space-y-6">
      <Navigation
        breadcrumbs={[
          { name: 'Metrics', href: '/metrics' },
          { name: 'Reports' },
        ]}
        title="Report Generator"
        description="Generate and download performance reports for your region."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Generator */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                  <Select
                    options={reportTypes}
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                  <Select
                    options={formatOptions}
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter report title..."
                />
              </div>

              {/* Report Type Specific Options */}
              {reportType === 'tbl' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">TBL Report Options</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
                      <span className="text-sm text-gray-700">Include People metrics</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
                      <span className="text-sm text-gray-700">Include Planet metrics</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
                      <span className="text-sm text-gray-700">Include Profit metrics</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
                      <span className="text-sm text-gray-700">Include trend analysis</span>
                    </label>
                  </div>
                </div>
              )}

              {reportType === 'policy' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Policy Report Options</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
                      <span className="text-sm text-gray-700">Include active policies</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300 text-primary-600" />
                      <span className="text-sm text-gray-700">Include completed policies</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
                      <span className="text-sm text-gray-700">Include milestone details</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline">Preview</Button>
                <Button onClick={handleGenerate} isLoading={isGenerating}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{report.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateTime(report.createdAt)} by {report.createdBy}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
                          {report.type.toUpperCase()}
                        </span>
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                          {report.format.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
