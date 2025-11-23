'use client';

import { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { IncidentCard, mockIncidents } from '@/components/emergency/EmergencyPanel';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/shared/Modal';
import { cn } from '@/lib/utils';
import type { Incident } from '@/types';

const levelOptions = [
  { value: '', label: 'All Levels' },
  { value: 'advisory', label: 'Advisory' },
  { value: 'watch', label: 'Watch' },
  { value: 'warning', label: 'Warning' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'critical', label: 'Critical' },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'contained', label: 'Contained' },
  { value: 'resolved', label: 'Resolved' },
];

// Extended mock data
const allIncidents: Incident[] = [
  ...mockIncidents,
  {
    id: 'inc-3',
    title: 'Water Quality Alert - Metro Area',
    description: 'Elevated contamination levels detected in municipal water supply. Boil advisory in effect.',
    level: 'watch',
    status: 'active',
    type: 'health',
    location: 'Metro Water District 7',
    regionId: 'reg-1',
    reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
    affectedPopulation: 85000,
    resources: [],
    coordinators: [],
  },
  {
    id: 'inc-4',
    title: 'Wildfire Contained - Eastern Forests',
    description: 'Forest fire that affected 2,500 acres has been successfully contained.',
    level: 'advisory',
    status: 'contained',
    type: 'fire',
    location: 'Eastern Forest Reserve',
    regionId: 'reg-1',
    reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date().toISOString(),
    affectedPopulation: 12000,
    resources: [],
    coordinators: [],
  },
];

export default function EmergencyPage() {
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredIncidents = allIncidents.filter((incident) => {
    const matchesLevel = !levelFilter || incident.level === levelFilter;
    const matchesStatus = !statusFilter || incident.status === statusFilter;
    return matchesLevel && matchesStatus;
  });

  const activeCount = allIncidents.filter((i) => i.status === 'active' || i.status === 'monitoring').length;
  const criticalCount = allIncidents.filter((i) => i.level === 'critical' || i.level === 'emergency').length;

  return (
    <div className="space-y-6">
      <Navigation
        title="Emergency Management"
        description="Monitor and respond to emergencies across your region."
        actions={
          <Button onClick={() => setShowCreateModal(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Report Incident
          </Button>
        }
      />

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Incidents</p>
          <p className="text-3xl font-bold text-gray-900">{allIncidents.length}</p>
        </div>
        <div className={cn('rounded-lg border p-4', activeCount > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200')}>
          <p className="text-sm text-gray-500">Active</p>
          <p className={cn('text-3xl font-bold', activeCount > 0 ? 'text-yellow-600' : 'text-gray-900')}>{activeCount}</p>
        </div>
        <div className={cn('rounded-lg border p-4', criticalCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200')}>
          <p className="text-sm text-gray-500">Critical/Emergency</p>
          <p className={cn('text-3xl font-bold', criticalCount > 0 ? 'text-red-600' : 'text-gray-900')}>{criticalCount}</p>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <p className="text-sm text-gray-500">Resolved (30d)</p>
          <p className="text-3xl font-bold text-green-600">{allIncidents.filter((i) => i.status === 'resolved').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-48">
            <Select
              options={levelOptions}
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              placeholder="Filter by level"
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="Filter by status"
            />
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">All Incidents ({filteredIncidents.length})</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredIncidents.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              No incidents match your filters
            </div>
          ) : (
            filteredIncidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} detailed />
            ))
          )}
        </div>
      </div>

      {/* Create Incident Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Report New Incident"
        size="lg"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Incident title..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Describe the incident..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="advisory">Advisory</option>
                <option value="watch">Watch</option>
                <option value="warning">Warning</option>
                <option value="emergency">Emergency</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="weather">Weather</option>
                <option value="health">Health</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="fire">Fire</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Affected location..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Report Incident</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
