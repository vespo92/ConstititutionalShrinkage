'use client';

import { User, Mail, Calendar } from 'lucide-react';
import type { Leader } from '@/types';
import { formatDate } from '@/lib/utils';

interface LeadershipPanelProps {
  leaders: Leader[];
  className?: string;
}

const roleLabels: Record<string, string> = {
  coordinator: 'Coordinator',
  council_member: 'Council Member',
  secretary: 'Secretary',
  treasurer: 'Treasurer',
  representative: 'Representative',
};

const roleColors: Record<string, string> = {
  coordinator: 'bg-purple-100 text-purple-700',
  council_member: 'bg-blue-100 text-blue-700',
  secretary: 'bg-green-100 text-green-700',
  treasurer: 'bg-amber-100 text-amber-700',
  representative: 'bg-pink-100 text-pink-700',
};

export default function LeadershipPanel({ leaders, className = '' }: LeadershipPanelProps) {
  if (leaders.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        No leadership assigned yet
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {leaders.map((leader) => (
        <div
          key={leader.id}
          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-pod-brown-100 rounded-full flex items-center justify-center">
              {leader.avatar ? (
                <img
                  src={leader.avatar}
                  alt={leader.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="text-pod-brown-600" size={20} />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{leader.name}</p>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[leader.role]}`}>
                  {roleLabels[leader.role]}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div className="flex items-center justify-end">
              <Calendar size={12} className="mr-1" />
              Since {formatDate(leader.since)}
            </div>
            {leader.term && (
              <p className="text-xs mt-1">
                Term ends {formatDate(leader.term.end)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
