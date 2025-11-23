'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Download, Calendar, Filter, Clock, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExportButton } from '@/components/shared/ExportButton';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('supply_chain');
  const [dateRange, setDateRange] = useState('month');

  const reportTypes = [
    { id: 'supply_chain', name: 'Supply Chain Analysis', description: 'Network metrics and flow analysis' },
    { id: 'tax', name: 'Tax Summary', description: 'Revenue and transaction breakdown' },
    { id: 'transparency', name: 'Transparency Audit', description: 'Organization transparency scores' },
    { id: 'environmental', name: 'Environmental Impact', description: 'Carbon footprint and sustainability' },
  ];

  const handleGenerate = (format: 'pdf' | 'csv' | 'json') => {
    console.log(`Generating ${reportType} report as ${format} for ${dateRange}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Report Generator
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Generate custom reports for supply chain analysis
          </p>
        </div>
        <Link href="/reports/archive">
          <Button variant="outline" leftIcon={<Clock className="h-4 w-4" />}>
            View Archive
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Report Type
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reportTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      reportType === type.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                    }`}
                  >
                    <p className="font-medium text-slate-900 dark:text-white">{type.name}</p>
                    <p className="text-sm text-slate-500 mt-1">{type.description}</p>
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date Range
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {['week', 'month', 'quarter', 'year', 'custom'].map(range => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                      dateRange === range
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {range === 'week' ? 'Last Week' :
                     range === 'month' ? 'Last Month' :
                     range === 'quarter' ? 'Last Quarter' :
                     range === 'year' ? 'Last Year' : 'Custom'}
                  </button>
                ))}
              </div>

              {dateRange === 'custom' && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-input" />
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Generate Button */}
          <Card>
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Ready to generate</p>
                <p className="text-sm text-slate-500">
                  {reportTypes.find(t => t.id === reportType)?.name} for{' '}
                  {dateRange === 'custom' ? 'custom date range' : `last ${dateRange}`}
                </p>
              </div>
              <ExportButton onExport={handleGenerate} label="Generate Report" />
            </CardBody>
          </Card>
        </div>

        {/* Quick Reports */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Reports</CardTitle>
              <CardDescription>Pre-configured reports for common use cases</CardDescription>
            </CardHeader>
            <CardBody className="space-y-3">
              {[
                { name: 'Monthly Summary', desc: 'Overview of all metrics' },
                { name: 'Tax Statement', desc: 'Tax transactions and totals' },
                { name: 'Top Producers', desc: 'Best performing producers' },
                { name: 'Distance Analysis', desc: 'Supply chain distances' },
              ].map(report => (
                <button
                  key={report.name}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{report.name}</p>
                    <p className="text-sm text-slate-500">{report.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="text-slate-500 text-sm mb-4">
                Set up automatic report generation on a schedule.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Configure Schedule
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
