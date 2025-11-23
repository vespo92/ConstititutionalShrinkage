'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Users, MapPin, Tag } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  region: string;
  isJoined: boolean;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch groups
    setLoading(true);
    // Simulated data
    setGroups([
      {
        id: '1',
        name: 'Climate Action Coalition',
        description: 'Working together for environmental legislation and sustainable policies.',
        memberCount: 2456,
        category: 'environment',
        region: 'National',
        isJoined: true,
      },
      {
        id: '2',
        name: 'Education Advocates Network',
        description: 'Parents, teachers, and students advocating for education reform.',
        memberCount: 1823,
        category: 'education',
        region: 'State',
        isJoined: false,
      },
      {
        id: '3',
        name: 'Healthcare for All',
        description: 'Promoting accessible healthcare for every citizen.',
        memberCount: 3241,
        category: 'healthcare',
        region: 'National',
        isJoined: false,
      },
      {
        id: '4',
        name: 'Local Transit Riders Union',
        description: 'Improving public transportation in our community.',
        memberCount: 567,
        category: 'transportation',
        region: 'Local',
        isJoined: true,
      },
    ]);
    setLoading(false);
  }, [category]);

  const categories = [
    { id: 'all', label: 'All Groups' },
    { id: 'environment', label: 'Environment' },
    { id: 'education', label: 'Education' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'transportation', label: 'Transportation' },
    { id: 'housing', label: 'Housing' },
    { id: 'economy', label: 'Economy' },
  ];

  const filteredGroups = groups.filter((g) => {
    if (category !== 'all' && g.category !== category) return false;
    if (searchQuery && !g.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community Groups</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Connect with like-minded citizens and organize around issues you care about
          </p>
        </div>
        <a
          href="/groups/create"
          className="inline-flex items-center gap-2 bg-community-600 text-white px-4 py-2 rounded-lg hover:bg-community-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Group
        </a>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500 focus:border-transparent"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No groups found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupCard({ group }: { group: Group }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {group.name}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {group.memberCount.toLocaleString()} members
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {group.region}
            </span>
          </div>
        </div>
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs capitalize">
          {group.category}
        </span>
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
        {group.description}
      </p>
      <div className="flex items-center justify-between">
        <a
          href={`/groups/${group.id}`}
          className="text-community-600 hover:underline text-sm"
        >
          View Group
        </a>
        {group.isJoined ? (
          <span className="text-sm text-green-600 dark:text-green-400">Joined</span>
        ) : (
          <button className="px-4 py-1.5 bg-community-600 text-white rounded-lg text-sm hover:bg-community-700 transition-colors">
            Join
          </button>
        )}
      </div>
    </div>
  );
}
