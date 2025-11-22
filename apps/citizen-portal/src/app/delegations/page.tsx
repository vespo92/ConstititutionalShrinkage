import { DelegationManager } from '@/components/DelegationManager';
import Link from 'next/link';
import { Plus, ArrowDownLeft, ArrowUpRight, Shield } from 'lucide-react';

export default function DelegationsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Delegation Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your liquid democracy delegations
          </p>
        </div>
        <Link href="/delegations/manage" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Delegation
        </Link>
      </div>

      {/* Delegation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-governance-delegate/10 text-governance-delegate">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">23</p>
              <p className="text-sm text-gray-500">Incoming Delegations</p>
              <p className="text-xs text-gray-400">People delegating to you</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/20 text-primary-600">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">4</p>
              <p className="text-sm text-gray-500">Outgoing Delegations</p>
              <p className="text-xs text-gray-400">Your delegations to others</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-governance-vote/10 text-governance-vote">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">24.0x</p>
              <p className="text-sm text-gray-500">Effective Voting Power</p>
              <p className="text-xs text-gray-400">Including delegations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liquid Democracy Explanation */}
      <div className="card p-4 mb-6 bg-gradient-to-r from-primary-50 to-governance-delegate/5 dark:from-primary-900/20 dark:to-governance-delegate/10 border-primary-200 dark:border-primary-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          How Liquid Democracy Works
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Delegate your voting power to trusted experts in specific domains. You can:
        </p>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-governance-civic rounded-full" />
            Delegate all votes or only specific categories
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-governance-civic rounded-full" />
            Revoke delegation at any time
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-governance-civic rounded-full" />
            Override delegate&apos;s vote on specific bills
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-governance-civic rounded-full" />
            See complete delegation chains for transparency
          </li>
        </ul>
      </div>

      <DelegationManager />
    </div>
  );
}
