'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { mockCoordinationRequests, coordinationStatusLabels, coordinationTypeLabels } from '@/lib/mock-data';
import CoordinationCard from '@/components/coordination/CoordinationCard';
import SearchBar from '@/components/shared/SearchBar';
import Button from '@/components/ui/Button';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import type { CoordinationStatus, CoordinationType } from '@/types';

export default function CoordinationPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<CoordinationType | ''>('');

  const filteredRequests = mockCoordinationRequests.filter(req => {
    if (search && !req.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && req.type !== typeFilter) return false;
    return true;
  });

  const pendingRequests = filteredRequests.filter(r => r.status === 'pending' || r.status === 'negotiating');
  const activeRequests = filteredRequests.filter(r => r.status === 'accepted');
  const completedRequests = filteredRequests.filter(r => r.status === 'completed' || r.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inter-Pod Coordination</h1>
          <p className="mt-1 text-gray-600">
            Manage cross-regional coordination and collaboration
          </p>
        </div>
        <Link href="/coordination/requests">
          <Button>
            <Plus size={18} className="mr-2" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search coordination requests..."
              onSearch={setSearch}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as CoordinationType | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-pod-green-500 focus:border-pod-green-500"
          >
            <option value="">All Types</option>
            {Object.entries(coordinationTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeRequests.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="space-y-4">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((req) => (
                <CoordinationCard key={req.id} request={req} />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No pending coordination requests
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="space-y-4">
            {activeRequests.length > 0 ? (
              activeRequests.map((req) => (
                <CoordinationCard key={req.id} request={req} />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No active coordination requests
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-4">
            {completedRequests.length > 0 ? (
              completedRequests.map((req) => (
                <CoordinationCard key={req.id} request={req} />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No completed coordination requests
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
