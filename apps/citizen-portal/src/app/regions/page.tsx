import { RegionalPodCard } from '@/components/RegionalPodCard';
import { MapPin, Search, Globe, Users, TrendingUp } from 'lucide-react';

const regions = [
  {
    id: 'CA',
    name: 'California',
    type: 'State',
    population: 39500000,
    activeCitizens: 2450000,
    activeBills: 23,
    participationRate: 78,
    isJoined: true,
    description: 'Pacific Coast state with diverse economy and progressive policies',
  },
  {
    id: 'SF-BAY',
    name: 'San Francisco Bay Area',
    type: 'Metropolitan Pod',
    population: 7750000,
    activeCitizens: 890000,
    activeBills: 12,
    participationRate: 82,
    isJoined: true,
    description: 'Tech hub with focus on innovation and housing policy',
  },
  {
    id: 'US',
    name: 'United States',
    type: 'Federal',
    population: 331000000,
    activeCitizens: 28500000,
    activeBills: 127,
    participationRate: 65,
    isJoined: true,
    description: 'Federal governance with constitutional framework',
  },
  {
    id: 'TECH-POD',
    name: 'Technology Governance Pod',
    type: 'Interest Pod',
    population: null,
    activeCitizens: 125000,
    activeBills: 8,
    participationRate: 91,
    isJoined: false,
    description: 'Cross-regional pod focused on technology policy and digital rights',
  },
  {
    id: 'ENV-POD',
    name: 'Environmental Action Pod',
    type: 'Interest Pod',
    population: null,
    activeCitizens: 340000,
    activeBills: 15,
    participationRate: 88,
    isJoined: false,
    description: 'Climate-focused governance across all regions',
  },
  {
    id: 'OR',
    name: 'Oregon',
    type: 'State',
    population: 4240000,
    activeCitizens: 312000,
    activeBills: 9,
    participationRate: 74,
    isJoined: false,
    description: 'Pacific Northwest state with strong environmental policies',
  },
];

export default function RegionsPage() {
  const joinedRegions = regions.filter((r) => r.isJoined);
  const discoverRegions = regions.filter((r) => !r.isJoined);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Regional Governance
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Participate in governance at different levels - from local to federal
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/20 text-primary-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">3</p>
              <p className="text-xs text-gray-500">Regions Joined</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-governance-vote/10 text-governance-vote">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">162</p>
              <p className="text-xs text-gray-500">Active Bills</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-governance-delegate/10 text-governance-delegate">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">31.8M</p>
              <p className="text-xs text-gray-500">Total Citizens</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-governance-civic/10 text-governance-civic">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">75%</p>
              <p className="text-xs text-gray-500">Avg Participation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search regions, pods, or jurisdictions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm"
          />
        </div>
      </div>

      {/* Your Regions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Regions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {joinedRegions.map((region) => (
            <RegionalPodCard key={region.id} region={region} />
          ))}
        </div>
      </div>

      {/* Discover Regions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Discover More
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {discoverRegions.map((region) => (
            <RegionalPodCard key={region.id} region={region} />
          ))}
        </div>
      </div>
    </div>
  );
}
