'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchBills } from '@/lib/api';
import { statusLabels, levelLabels } from '@/lib/mock-data';
import type { BillListItem } from '@/lib/types';
import { LawStatus } from '@constitutional-shrinkage/constitutional-framework';

export default function DashboardPage() {
  const [recentBills, setRecentBills] = useState<BillListItem[]>([]);
  const [votingBills, setVotingBills] = useState<BillListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [all, voting] = await Promise.all([
          fetchBills(),
          fetchBills({ status: LawStatus.VOTING }),
        ]);
        setRecentBills(all.slice(0, 5));
        setVotingBills(voting);
      } catch (error) {
        console.error('Failed to load bills:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    { label: 'Total Bills', value: '5', change: '+2 this month' },
    { label: 'Active Voting', value: votingBills.length.toString(), change: 'Ends in 3 days' },
    { label: 'Active Laws', value: '1', change: '23 regional' },
    { label: 'Participation Rate', value: '67%', change: '+5% from last month' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gov-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Legislative Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Track bills, participate in voting, and shape the future of governance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow p-6 border border-gray-200"
          >
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-gov-blue">{stat.value}</p>
            <p className="mt-1 text-sm text-gray-400">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Active Voting Section */}
      {votingBills.length > 0 && (
        <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-indigo-900">
              Active Voting - Your Voice Matters
            </h2>
            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
              {votingBills.length} bill{votingBills.length !== 1 ? 's' : ''} need your vote
            </span>
          </div>
          <div className="space-y-3">
            {votingBills.map((bill) => (
              <Link
                key={bill.id}
                href={`/vote/${bill.id}`}
                className="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{bill.title}</h3>
                    <p className="text-sm text-gray-500">
                      Sponsored by {bill.sponsor} | {levelLabels[bill.level]}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-green-600">
                        {bill.votesFor} for
                      </span>
                      <span className="text-red-600">
                        {bill.votesAgainst} against
                      </span>
                    </div>
                    <button className="mt-2 bg-indigo-600 text-white px-4 py-1 rounded text-sm hover:bg-indigo-700 transition-colors">
                      Vote Now
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bills */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Bills</h2>
          <Link
            href="/bills"
            className="text-gov-blue hover:text-blue-700 text-sm font-medium"
          >
            View all bills &rarr;
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sponsor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/bills/${bill.id}`}
                      className="text-gov-blue hover:underline font-medium"
                    >
                      {bill.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {bill.sponsor}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`status-badge status-${bill.status}`}>
                      {statusLabels[bill.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {levelLabels[bill.level]}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {bill.votesFor + bill.votesAgainst > 0 ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">{bill.votesFor}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-red-600">{bill.votesAgainst}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">No votes yet</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/bills/create"
          className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:border-gov-blue transition-colors group"
        >
          <div className="text-3xl mb-3">&#128221;</div>
          <h3 className="font-semibold text-gray-900 group-hover:text-gov-blue">
            Propose a Bill
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Draft and submit new legislation for community review
          </p>
        </Link>
        <Link
          href="/bills"
          className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:border-gov-blue transition-colors group"
        >
          <div className="text-3xl mb-3">&#128269;</div>
          <h3 className="font-semibold text-gray-900 group-hover:text-gov-blue">
            Browse Bills
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Explore, search, and review all proposed legislation
          </p>
        </Link>
        <a
          href="#"
          className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:border-gov-blue transition-colors group"
        >
          <div className="text-3xl mb-3">&#128202;</div>
          <h3 className="font-semibold text-gray-900 group-hover:text-gov-blue">
            View Metrics
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Track the impact of active laws with Triple Bottom Line metrics
          </p>
        </a>
      </div>
    </div>
  );
}
