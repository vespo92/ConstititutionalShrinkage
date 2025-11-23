'use client';

import { useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-600">
            Manage your account and preferences
          </p>
        </div>
        <Button onClick={handleSave} isLoading={saving}>
          Save Changes
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    defaultValue="Alex Thompson"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pod-green-500 focus:border-pod-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue="alex@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pod-green-500 focus:border-pod-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Pod</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pod-green-500 focus:border-pod-green-500">
                    <option value="pod-ca-sf">San Francisco Bay Area (CA-SF)</option>
                    <option value="pod-tx-aus">Austin Metro (TX-AUS)</option>
                    <option value="pod-ny-nyc">New York City (NY-NYC)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'New legislation in your pod', defaultChecked: true },
                  { label: 'Voting reminders', defaultChecked: true },
                  { label: 'Coordination requests', defaultChecked: true },
                  { label: 'Community event announcements', defaultChecked: false },
                  { label: 'Weekly digest', defaultChecked: true },
                ].map((item, index) => (
                  <label key={index} className="flex items-center justify-between">
                    <span className="text-gray-700">{item.label}</span>
                    <input
                      type="checkbox"
                      defaultChecked={item.defaultChecked}
                      className="rounded border-gray-300 text-pod-green-600 focus:ring-pod-green-500"
                    />
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Show my profile to other members', defaultChecked: true },
                  { label: 'Display my voting history', defaultChecked: false },
                  { label: 'Allow messages from other members', defaultChecked: true },
                ].map((item, index) => (
                  <label key={index} className="flex items-center justify-between">
                    <span className="text-gray-700">{item.label}</span>
                    <input
                      type="checkbox"
                      defaultChecked={item.defaultChecked}
                      className="rounded border-gray-300 text-pod-green-600 focus:ring-pod-green-500"
                    />
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
