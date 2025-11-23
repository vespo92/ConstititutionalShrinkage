'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Users, MapPin, Settings } from 'lucide-react';
import { usePod } from '@/hooks/usePods';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

export default function PodManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { pod, loading, error } = usePod(id);
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link href={`/pods/${pod.id}`} className="inline-flex items-center text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} className="mr-1" />
        Back to {pod.name}
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Pod</h1>
          <p className="text-gray-600 mt-1">{pod.name} ({pod.code})</p>
        </div>
        <Button onClick={handleSave} isLoading={saving}>
          <Save size={18} className="mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Basic Info</TabsTrigger>
          <TabsTrigger value="leadership">Leadership</TabsTrigger>
          <TabsTrigger value="boundaries">Boundaries</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Pod Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pod Name</label>
                  <input
                    type="text"
                    defaultValue={pod.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pod-green-500 focus:border-pod-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input
                    type="text"
                    defaultValue={pod.code}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pod-green-500 focus:border-pod-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    defaultValue={pod.description}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pod-green-500 focus:border-pod-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Headquarters</label>
                  <input
                    type="text"
                    defaultValue={pod.headquarters}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pod-green-500 focus:border-pod-green-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leadership">
          <Card>
            <CardHeader>
              <CardTitle>Manage Leadership</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Users size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Leadership management interface coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boundaries">
          <Card>
            <CardHeader>
              <CardTitle>Boundary Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Boundary editing interface coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Pod Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Settings size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Advanced settings coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
