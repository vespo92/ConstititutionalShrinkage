'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, MapPin, Users, Calendar } from 'lucide-react';
import { usePod } from '@/hooks/usePods';
import PodMetrics from '@/components/pods/PodMetrics';
import LeadershipPanel from '@/components/pods/LeadershipPanel';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import { formatDate, formatPopulation } from '@/lib/utils';
import { podTypeLabels, podStatusLabels, mockLegislation } from '@/lib/mock-data';
import LegislationCard from '@/components/legislation/LegislationCard';

export default function PodDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { pod, loading, error } = usePod(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pod-green-600"></div>
      </div>
    );
  }

  if (error || !pod) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Pod not found</p>
        <Link href="/pods" className="text-pod-green-600 hover:text-pod-green-700 mt-2 inline-block">
          Back to pods
        </Link>
      </div>
    );
  }

  const podLegislation = mockLegislation.filter(l => l.podId === pod.id);

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    forming: 'bg-yellow-100 text-yellow-800',
    merging: 'bg-blue-100 text-blue-800',
    dissolved: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link href="/pods" className="inline-flex items-center text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} className="mr-1" />
        Back to Pods
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-pod-green-100 rounded-xl flex items-center justify-center">
            <MapPin className="text-pod-green-600" size={32} />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">{pod.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[pod.status]}`}>
                {podStatusLabels[pod.status]}
              </span>
            </div>
            <p className="text-gray-600 mt-1">
              {pod.code} · {podTypeLabels[pod.type]} · {formatPopulation(pod.population)} residents
            </p>
          </div>
        </div>
        <Link href={`/pods/${pod.id}/manage`}>
          <Button variant="outline">
            <Settings size={18} className="mr-2" />
            Manage
          </Button>
        </Link>
      </div>

      {/* Overview Card */}
      <div className="bg-gradient-to-r from-pod-green-50 to-pod-brown-50 rounded-xl p-6 border border-pod-green-200">
        <p className="text-gray-700">{pod.description}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {pod.headquarters && (
            <div className="flex items-center text-gray-600">
              <MapPin size={14} className="mr-1" />
              {pod.headquarters}
            </div>
          )}
          <div className="flex items-center text-gray-600">
            <Calendar size={14} className="mr-1" />
            Established {formatDate(pod.createdAt)}
          </div>
          <div className="flex items-center text-gray-600">
            <Users size={14} className="mr-1" />
            {pod.leadership.length} leaders
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="metrics">
        <TabsList>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="leadership">Leadership</TabsTrigger>
          <TabsTrigger value="legislation">Legislation</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <Card>
            <PodMetrics metrics={pod.metrics} showTrends />
          </Card>
        </TabsContent>

        <TabsContent value="leadership">
          <Card>
            <CardHeader>
              <CardTitle>Pod Leadership</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadershipPanel leaders={pod.leadership} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legislation">
          <div className="space-y-4">
            {podLegislation.length > 0 ? (
              podLegislation.map((leg) => (
                <LegislationCard key={leg.id} legislation={leg} showPod={false} />
              ))
            ) : (
              <Card>
                <div className="text-center py-8 text-gray-500">
                  No legislation for this pod yet
                </div>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
