'use client';

import { useState } from 'react';
import { Settings, User, Bell, Shield, Database, Globe } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    taxAlerts: true,
    transparencyUpdates: true,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Manage your account and application preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <Card className="lg:col-span-1 h-fit">
          <CardBody className="p-2">
            {[
              { icon: User, label: 'Profile', active: false },
              { icon: Bell, label: 'Notifications', active: true },
              { icon: Shield, label: 'Privacy', active: false },
              { icon: Database, label: 'Data', active: false },
              { icon: Globe, label: 'Language', active: false },
            ].map(item => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  item.active
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </CardBody>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Manage how you receive updates and alerts</CardDescription>
            </CardHeader>
            <CardBody className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
                { key: 'push', label: 'Push Notifications', description: 'Browser push notifications' },
                { key: 'taxAlerts', label: 'Tax Alerts', description: 'Notifications about tax changes and deadlines' },
                { key: 'transparencyUpdates', label: 'Transparency Updates', description: 'Updates when organization scores change' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      notifications[item.key as keyof typeof notifications]
                        ? 'bg-primary-600'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        notifications[item.key as keyof typeof notifications]
                          ? 'translate-x-7'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Display Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Display Preferences
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="form-label">Distance Unit</label>
                <select className="form-select">
                  <option value="km">Kilometers (km)</option>
                  <option value="mi">Miles (mi)</option>
                </select>
              </div>
              <div>
                <label className="form-label">Currency</label>
                <select className="form-select">
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound (GBP)</option>
                </select>
              </div>
              <div>
                <label className="form-label">Date Format</label>
                <select className="form-select">
                  <option value="mdy">MM/DD/YYYY</option>
                  <option value="dmy">DD/MM/YYYY</option>
                  <option value="ymd">YYYY-MM-DD</option>
                </select>
              </div>
            </CardBody>
          </Card>

          {/* Data Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Export
              </CardTitle>
              <CardDescription>Export your data for backup or analysis</CardDescription>
            </CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline">Export All Data</Button>
                <Button variant="outline">Export Calculations</Button>
                <Button variant="outline">Export Reports</Button>
              </div>
              <p className="text-sm text-slate-500 mt-4">
                Data exports are generated in JSON format and may take a few minutes for large datasets.
              </p>
            </CardBody>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
