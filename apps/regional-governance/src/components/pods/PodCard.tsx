'use client';

import Link from 'next/link';
import { MapPin, Users, TrendingUp, ChevronRight } from 'lucide-react';
import type { Pod } from '@/types';
import { formatPopulation } from '@/lib/utils';
import { podTypeLabels, podStatusLabels } from '@/lib/mock-data';

interface PodCardProps {
  pod: Pod;
  compact?: boolean;
}

export default function PodCard({ pod, compact = false }: PodCardProps) {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    forming: 'bg-yellow-100 text-yellow-800',
    merging: 'bg-blue-100 text-blue-800',
    dissolved: 'bg-gray-100 text-gray-800',
  };

  if (compact) {
    return (
      <Link
        href={`/pods/${pod.id}`}
        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-pod-green-300 hover:shadow-sm transition-all"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-pod-green-100 rounded-lg flex items-center justify-center">
            <MapPin className="text-pod-green-600" size={20} />
          </div>
          <div>
            <p className="font-medium text-gray-900">{pod.name}</p>
            <p className="text-sm text-gray-500">{pod.code}</p>
          </div>
        </div>
        <ChevronRight className="text-gray-400" size={20} />
      </Link>
    );
  }

  return (
    <Link
      href={`/pods/${pod.id}`}
      className="block bg-white rounded-lg border border-gray-200 hover:border-pod-green-300 hover:shadow-md transition-all overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-pod-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="text-pod-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{pod.name}</h3>
              <p className="text-sm text-gray-500">{pod.code} · {podTypeLabels[pod.type]}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[pod.status]}`}>
            {podStatusLabels[pod.status]}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-3 gap-4">
        <div>
          <div className="flex items-center text-gray-500 mb-1">
            <Users size={14} className="mr-1" />
            <span className="text-xs">Population</span>
          </div>
          <p className="font-semibold text-gray-900">{formatPopulation(pod.population)}</p>
        </div>
        <div>
          <div className="flex items-center text-gray-500 mb-1">
            <TrendingUp size={14} className="mr-1" />
            <span className="text-xs">TBL Score</span>
          </div>
          <p className="font-semibold text-pod-green-600">{pod.metrics.tblScore.overall.toFixed(1)}</p>
        </div>
        <div>
          <div className="text-gray-500 mb-1">
            <span className="text-xs">Participation</span>
          </div>
          <p className="font-semibold text-gray-900">{pod.metrics.participationRate}%</p>
        </div>
      </div>

      {/* TBL Mini Bars */}
      <div className="px-4 pb-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${pod.metrics.tblScore.people}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">People</p>
          </div>
          <div className="flex-1">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${pod.metrics.tblScore.planet}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Planet</p>
          </div>
          <div className="flex-1">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${pod.metrics.tblScore.profit}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Profit</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
