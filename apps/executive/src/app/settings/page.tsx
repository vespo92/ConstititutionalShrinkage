'use client';

import { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Tabs, TabPanel } from '@/components/shared/Tabs';

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'security', label: 'Security' },
];

const timezoneOptions = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      <Navigation
        title="Settings"
        description="Manage your account settings and preferences."
      />

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        <TabPanel id="profile" activeTab={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-3xl font-bold">
                  SJ
                </div>
                <div>
                  <Button variant="outline" size="sm">Change Photo</Button>
                  <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size of 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name" defaultValue="Sarah" />
                <Input label="Last Name" defaultValue="Johnson" />
                <Input label="Email" type="email" defaultValue="sarah.johnson@constitutional-shrinkage.gov" />
                <Input label="Phone" type="tel" defaultValue="+1 (555) 123-4567" />
                <Input label="Title" defaultValue="Regional Director" />
                <Input label="Department" defaultValue="Executive Office" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel id="notifications" activeTab={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Email Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Policy Updates</p>
                      <p className="text-sm text-gray-500">Receive updates when policies are modified</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Emergency Alerts</p>
                      <p className="text-sm text-gray-500">Critical emergency notifications</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Resource Alerts</p>
                      <p className="text-sm text-gray-500">Budget and resource allocation alerts</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Weekly Summary</p>
                      <p className="text-sm text-gray-500">Weekly digest of activities and metrics</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  </label>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-900">Push Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Desktop Notifications</p>
                      <p className="text-sm text-gray-500">Show browser notifications</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Sound Alerts</p>
                      <p className="text-sm text-gray-500">Play sound for critical alerts</p>
                    </div>
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline">Reset to Default</Button>
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel id="preferences" activeTab={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Timezone" options={timezoneOptions} defaultValue="America/Los_Angeles" />
                <Select label="Language" options={languageOptions} defaultValue="en" />
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Display Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Compact View</p>
                      <p className="text-sm text-gray-500">Show more content with smaller spacing</p>
                    </div>
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Show Sidebar</p>
                      <p className="text-sm text-gray-500">Always show navigation sidebar</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Auto-refresh Data</p>
                      <p className="text-sm text-gray-500">Automatically refresh dashboard data</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline">Reset to Default</Button>
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel id="security" activeTab={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Change Password</h3>
                <div className="space-y-4 max-w-md">
                  <Input label="Current Password" type="password" />
                  <Input label="New Password" type="password" />
                  <Input label="Confirm New Password" type="password" />
                </div>
                <Button>Update Password</Button>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Currently enabled via Authenticator App</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Current Session</p>
                      <p className="text-sm text-gray-500">Chrome on Windows - Last active: Now</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Active</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">Sign out all other sessions</Button>
              </div>
            </CardContent>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
}
