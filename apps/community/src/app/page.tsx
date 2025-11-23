'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, FileSignature, Video, ThumbsUp, Users, TrendingUp } from 'lucide-react';
import { ActivityFeed } from '@/components/common/ActivityFeed';

interface CommunityStats {
  activeDiscussions: number;
  activePetitions: number;
  upcomingTownHalls: number;
  totalParticipants: number;
  commentsToday: number;
  signaturesThisWeek: number;
}

export default function CommunityHome() {
  const [stats, setStats] = useState<CommunityStats>({
    activeDiscussions: 156,
    activePetitions: 42,
    upcomingTownHalls: 8,
    totalParticipants: 24589,
    commentsToday: 1247,
    signaturesThisWeek: 8934,
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-community-600 to-community-800 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Community Hub</h1>
        <p className="text-community-100 text-lg">
          Engage in civic discourse, sign petitions, and participate in town halls
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<MessageSquare className="w-6 h-6" />}
          label="Active Discussions"
          value={stats.activeDiscussions}
          trend="+12 today"
          color="blue"
        />
        <StatCard
          icon={<FileSignature className="w-6 h-6" />}
          label="Active Petitions"
          value={stats.activePetitions}
          trend={`${stats.signaturesThisWeek.toLocaleString()} signatures this week`}
          color="green"
        />
        <StatCard
          icon={<Video className="w-6 h-6" />}
          label="Upcoming Town Halls"
          value={stats.upcomingTownHalls}
          trend="2 live now"
          color="red"
          live
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Community Members"
          value={stats.totalParticipants}
          trend="+156 this week"
          color="purple"
        />
        <StatCard
          icon={<ThumbsUp className="w-6 h-6" />}
          label="Comments Today"
          value={stats.commentsToday}
          trend="87% constructive"
          color="yellow"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Engagement Rate"
          value="78%"
          trend="+5% from last month"
          color="indigo"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <QuickAction
          href="/discussions/new"
          icon={<MessageSquare className="w-8 h-8" />}
          title="Start Discussion"
          description="Create a new discussion thread"
        />
        <QuickAction
          href="/petitions/new"
          icon={<FileSignature className="w-8 h-8" />}
          title="Create Petition"
          description="Start a citizen petition"
        />
        <QuickAction
          href="/townhalls"
          icon={<Video className="w-8 h-8" />}
          title="Join Town Hall"
          description="Participate in live events"
        />
        <QuickAction
          href="/groups"
          icon={<Users className="w-8 h-8" />}
          title="Find Groups"
          description="Connect with like-minded citizens"
        />
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Recent Activity
          </h2>
          <ActivityFeed />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Trending Topics
          </h2>
          <TrendingTopics />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend: string;
  color: string;
  live?: boolean;
}

function StatCard({ icon, label, value, trend, color, live }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {live && (
          <span className="live-indicator text-xs font-medium text-red-500">
            LIVE
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{trend}</div>
    </div>
  );
}

interface QuickActionProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function QuickAction({ href, icon, title, description }: QuickActionProps) {
  return (
    <a
      href={href}
      className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center group"
    >
      <div className="text-community-600 dark:text-community-400 mb-3 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </a>
  );
}

function TrendingTopics() {
  const topics = [
    { tag: '#ClimateAction', posts: 234, trend: 'up' },
    { tag: '#EducationReform', posts: 189, trend: 'up' },
    { tag: '#HealthcareBill2025', posts: 156, trend: 'stable' },
    { tag: '#TransportationFunding', posts: 98, trend: 'up' },
    { tag: '#HousingPolicy', posts: 87, trend: 'down' },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
      <ul className="space-y-3">
        {topics.map((topic, index) => (
          <li key={topic.tag} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm w-4">{index + 1}</span>
              <a href={`/discussions?tag=${topic.tag.slice(1)}`} className="text-community-600 dark:text-community-400 hover:underline">
                {topic.tag}
              </a>
            </div>
            <span className="text-sm text-gray-500">{topic.posts} posts</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
