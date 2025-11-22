'use client';

import { useState } from 'react';
import { Search, Shield, AlertCircle, CheckCircle, Users } from 'lucide-react';
import Link from 'next/link';

const categories = [
  { id: 'all', name: 'All Categories', description: 'Delegate all your votes' },
  { id: 'healthcare', name: 'Healthcare', description: 'Medical policy, insurance, public health' },
  { id: 'economics', name: 'Economics', description: 'Taxation, budget, trade policy' },
  { id: 'education', name: 'Education', description: 'Schools, universities, curriculum' },
  { id: 'environment', name: 'Environment', description: 'Climate, conservation, energy' },
  { id: 'defense', name: 'Defense', description: 'Military, national security' },
  { id: 'infrastructure', name: 'Infrastructure', description: 'Transportation, utilities, housing' },
  { id: 'technology', name: 'Technology', description: 'Digital policy, privacy, AI regulation' },
];

const suggestedDelegates = [
  {
    id: 'del-1',
    name: 'Dr. Sarah Chen',
    avatar: 'SC',
    reputation: 94,
    expertise: ['healthcare', 'education'],
    delegators: 156,
    votingRecord: 98,
    description: 'Healthcare policy expert, former hospital administrator',
  },
  {
    id: 'del-2',
    name: 'Marcus Johnson',
    avatar: 'MJ',
    reputation: 89,
    expertise: ['economics', 'infrastructure'],
    delegators: 234,
    votingRecord: 95,
    description: 'Economist, infrastructure planning specialist',
  },
  {
    id: 'del-3',
    name: 'Elena Rodriguez',
    avatar: 'ER',
    reputation: 91,
    expertise: ['environment', 'technology'],
    delegators: 189,
    votingRecord: 97,
    description: 'Environmental scientist, clean tech advocate',
  },
];

export default function ManageDelegationPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDelegate, setSelectedDelegate] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/delegations"
          className="text-sm text-primary-600 hover:text-primary-700 mb-2 inline-block"
        >
          &larr; Back to Delegations
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create New Delegation
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose a category and find a trusted delegate
        </p>
      </div>

      {/* Step 1: Choose Category */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-primary-600 text-white rounded-full text-sm flex items-center justify-center">
            1
          </span>
          Choose Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-3 rounded-lg border-2 text-left transition-colors ${
                selectedCategory === cat.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              <p className="font-medium text-sm text-gray-900 dark:text-white">
                {cat.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Find Delegate */}
      {selectedCategory && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary-600 text-white rounded-full text-sm flex items-center justify-center">
              2
            </span>
            Find a Delegate
          </h2>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search delegates by name or expertise..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm"
            />
          </div>

          {/* Suggested Delegates */}
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Suggested delegates for {selectedCategory}:</p>
            {suggestedDelegates.map((delegate) => (
              <button
                key={delegate.id}
                onClick={() => setSelectedDelegate(delegate.id)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedDelegate === delegate.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold">
                    {delegate.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {delegate.name}
                      </h3>
                      <span className="badge badge-civic">{delegate.reputation} rep</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {delegate.description}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {delegate.delegators} delegators
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {delegate.votingRecord}% voting record
                      </span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {delegate.expertise.map((exp) => (
                        <span
                          key={exp}
                          className="badge bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedDelegate === delegate.id && (
                    <CheckCircle className="h-5 w-5 text-primary-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {selectedDelegate && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary-600 text-white rounded-full text-sm flex items-center justify-center">
              3
            </span>
            Confirm Delegation
          </h2>

          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Delegation Terms
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                  <li>&bull; Delegate will vote on your behalf for {selectedCategory === 'all' ? 'all categories' : selectedCategory}</li>
                  <li>&bull; You can override any individual vote</li>
                  <li>&bull; You can revoke this delegation at any time</li>
                  <li>&bull; All delegate votes are publicly visible</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-governance-alert/10 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-governance-alert mt-0.5" />
              <div>
                <p className="text-sm font-medium text-governance-alert">
                  Important Notice
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  By creating this delegation, the delegate will be able to vote on your
                  behalf until you revoke it. Make sure you trust this person&apos;s judgment.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="btn-primary flex-1">
              Create Delegation
            </button>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedDelegate(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
