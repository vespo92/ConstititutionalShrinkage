'use client';

import Link from 'next/link';
import { ArrowRight, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { CoordinationRequest } from '@/types';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { coordinationTypeLabels, coordinationStatusLabels } from '@/lib/mock-data';

interface CoordinationCardProps {
  request: CoordinationRequest;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  negotiating: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-700',
};

const typeColors: Record<string, string> = {
  resource_sharing: 'bg-purple-100 text-purple-700',
  joint_initiative: 'bg-blue-100 text-blue-700',
  conflict_resolution: 'bg-red-100 text-red-700',
  boundary_adjustment: 'bg-amber-100 text-amber-700',
  policy_alignment: 'bg-green-100 text-green-700',
  emergency_response: 'bg-red-100 text-red-700',
};

export default function CoordinationCard({ request }: CoordinationCardProps) {
  const approvedCount = request.votes.filter((v) => v.vote === 'approve').length;
  const totalPods = request.votes.length;

  return (
    <Link
      href={`/coordination/${request.id}`}
      className="block bg-white rounded-lg border border-gray-200 hover:border-pod-green-300 hover:shadow-md transition-all overflow-hidden"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{request.title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs ${typeColors[request.type]}`}>
                {coordinationTypeLabels[request.type]}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs ${statusColors[request.status]}`}>
                {coordinationStatusLabels[request.status]}
              </span>
            </div>
          </div>
        </div>

        {/* Pod Connection */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <span className="font-medium">{request.requestingPodName}</span>
          <ArrowRight size={14} className="mx-2 text-gray-400" />
          <span className="font-medium">
            {request.targetPodNames?.join(', ') || 'Multiple pods'}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{request.description}</p>

        {/* Timeline */}
        {request.timeline && (
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <Clock size={14} className="mr-1" />
            {formatDate(request.timeline.proposedStart)} - {formatDate(request.timeline.proposedEnd)}
          </div>
        )}

        {/* Votes Status */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center">
            <Users size={14} className="mr-1 text-gray-400" />
            <span className="text-sm text-gray-600">
              {approvedCount}/{totalPods} pods approved
            </span>
          </div>
          <div className="flex -space-x-1">
            {request.votes.slice(0, 4).map((vote, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-white ${
                  vote.vote === 'approve'
                    ? 'bg-green-100 text-green-600'
                    : vote.vote === 'reject'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {vote.vote === 'approve' ? '✓' : vote.vote === 'reject' ? '✗' : '?'}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500">
        Created {formatRelativeTime(request.createdAt)} by {request.createdBy}
      </div>
    </Link>
  );
}
