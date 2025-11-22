import { Dashboard } from '@/components/Dashboard';
import { NotificationCenter } from '@/components/NotificationCenter';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your governance overview and active items
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Dashboard />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <NotificationCenter />

          {/* Quick Delegation Status */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Delegation Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Incoming Delegations
                </span>
                <span className="font-medium text-governance-delegate">23</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Outgoing Delegations
                </span>
                <span className="font-medium text-primary-600">4</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Effective Voting Power
                </span>
                <span className="font-medium text-governance-vote">24.0x</span>
              </div>
            </div>
          </div>

          {/* Reputation Card */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Your Reputation
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200 dark:text-slate-700"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={175.9}
                    strokeDashoffset={175.9 * (1 - 0.85)}
                    className="text-governance-civic"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-900 dark:text-white">
                  85
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Excellent Standing
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Top 15% of citizens
                </p>
                <div className="mt-1 flex gap-1">
                  <span className="badge badge-civic text-xs">Consistent Voter</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
