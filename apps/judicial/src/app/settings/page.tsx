'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Settings, User, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    newCases: true,
    reviewAssignments: true,
    rulingDeadlines: true,
    conflictAlerts: true,
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    compactView: false,
    showLegalCitations: true,
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Settings className="h-7 w-7 text-judicial-primary" />
          Settings
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Configure your judicial system preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card variant="bordered" padding="none">
        <CardHeader className="px-6 py-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-judicial-primary" />
            <span>Profile</span>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-judicial-secondary flex items-center justify-center">
              <User className="h-8 w-8 text-judicial-dark" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Justice Smith</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">Constitutional Review Panel</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">j.smith@judicial.gov</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                defaultValue="Justice Smith"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Assigned Region
              </label>
              <input
                type="text"
                defaultValue="Northeast Region"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card variant="bordered" padding="none">
        <CardHeader className="px-6 py-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-judicial-primary" />
            <span>Notifications</span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, [key]: !value })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-judicial-primary' : 'bg-gray-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card variant="bordered" padding="none">
        <CardHeader className="px-6 py-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-judicial-primary" />
            <span>Display Preferences</span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Object.entries(preferences).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </p>
                </div>
                <button
                  onClick={() => setPreferences({ ...preferences, [key]: !value })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-judicial-primary' : 'bg-gray-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card variant="bordered" padding="none">
        <CardHeader className="px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-judicial-primary" />
            <span>Security</span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Alert variant="info">
            <p className="text-sm">
              Security settings are managed by the central authentication service.
              Contact your administrator for access changes.
            </p>
          </Alert>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Role: <span className="font-medium text-gray-900 dark:text-white">Judge</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Last login: <span className="font-medium text-gray-900 dark:text-white">Today at 9:00 AM</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Two-factor authentication: <span className="font-medium text-compliance-compliant">Enabled</span>
            </p>
          </div>
        </CardContent>
        <CardFooter className="px-6 py-4">
          <Button variant="outline">Change Password</Button>
        </CardFooter>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary">Save Changes</Button>
      </div>
    </div>
  );
}
