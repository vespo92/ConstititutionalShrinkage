'use client';

import { useState } from 'react';
import { ChartContainer } from '@/components/layouts/ChartContainer';
import { FileText, Download, Calendar, Plus, Clock, Check } from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: string;
  schedule?: string;
  lastRun?: string;
  status: 'ready' | 'generating' | 'scheduled';
}

const reports: Report[] = [
  { id: '1', name: 'Weekly Governance Summary', type: 'summary', schedule: 'Every Monday', lastRun: 'Jan 29, 2025', status: 'ready' },
  { id: '2', name: 'Regional Performance Report', type: 'regional', schedule: 'Monthly', lastRun: 'Jan 1, 2025', status: 'ready' },
  { id: '3', name: 'TBL Quarterly Analysis', type: 'tbl', schedule: 'Quarterly', lastRun: 'Jan 1, 2025', status: 'ready' },
  { id: '4', name: 'Citizen Engagement Metrics', type: 'engagement', lastRun: 'Feb 1, 2025', status: 'ready' },
  { id: '5', name: 'Policy Effectiveness Review', type: 'policy', schedule: 'Monthly', status: 'scheduled' },
];

const templates = [
  { id: 't1', name: 'Weekly Governance Summary', description: 'Overview of voting, legislation, and engagement', icon: FileText },
  { id: 't2', name: 'Regional Performance', description: 'Compare metrics across all regions', icon: FileText },
  { id: 't3', name: 'Policy Effectiveness', description: 'Analyze policy outcomes and TBL impact', icon: FileText },
  { id: 't4', name: 'Citizen Engagement', description: 'User activity, delegations, and retention', icon: FileText },
];

export default function ReportsPage() {
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">
            Generate, schedule, and export governance reports
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          Create Report
        </button>
      </div>

      {/* Report Templates */}
      <ChartContainer title="Report Templates">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((template) => (
            <button
              key={template.id}
              className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
            >
              <template.icon className="h-8 w-8 text-gray-400 group-hover:text-blue-500 mb-3" />
              <h4 className="font-medium text-gray-900">{template.name}</h4>
              <p className="text-sm text-gray-500 mt-1">{template.description}</p>
            </button>
          ))}
        </div>
      </ChartContainer>

      {/* Generated Reports */}
      <ChartContainer title="Your Reports">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Generated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{report.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {report.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.schedule ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {report.schedule}
                      </span>
                    ) : (
                      <span className="text-gray-400">One-time</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.lastRun || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                      report.status === 'ready' ? 'bg-green-100 text-green-800' :
                      report.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {report.status === 'ready' && <Check className="h-3 w-3" />}
                      {report.status === 'generating' && <Clock className="h-3 w-3 animate-spin" />}
                      {report.status === 'scheduled' && <Calendar className="h-3 w-3" />}
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {report.status === 'ready' && (
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={selectedFormat}
                          onChange={(e) => setSelectedFormat(e.target.value)}
                          className="text-sm border border-gray-200 rounded px-2 py-1"
                        >
                          <option value="pdf">PDF</option>
                          <option value="csv">CSV</option>
                          <option value="xlsx">Excel</option>
                          <option value="json">JSON</option>
                        </select>
                        <button className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Download className="h-4 w-4" />
                          Export
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartContainer>

      {/* Scheduled Reports */}
      <ChartContainer title="Scheduled Reports">
        <div className="space-y-4">
          {reports
            .filter((r) => r.schedule)
            .map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{report.name}</p>
                    <p className="text-sm text-gray-500">{report.schedule}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    Next run: {getNextRun(report.schedule || '')}
                  </span>
                  <button className="text-sm text-gray-500 hover:text-gray-700">
                    Edit
                  </button>
                  <button className="text-sm text-red-500 hover:text-red-700">
                    Disable
                  </button>
                </div>
              </div>
            ))}
        </div>
      </ChartContainer>
    </div>
  );
}

function getNextRun(schedule: string): string {
  const now = new Date();
  switch (schedule) {
    case 'Every Monday':
      const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + daysUntilMonday);
      return nextMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'Monthly':
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return nextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'Quarterly':
      const quarter = Math.floor(now.getMonth() / 3);
      const nextQuarter = new Date(now.getFullYear(), (quarter + 1) * 3, 1);
      return nextQuarter.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    default:
      return 'N/A';
  }
}
