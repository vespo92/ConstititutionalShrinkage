'use client';

import Link from 'next/link';
import { Clock, CheckCircle, XCircle, Play } from 'lucide-react';

interface Simulation {
  id: string;
  billId: string;
  region: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

interface SimulationCardProps {
  simulation: Simulation;
}

export default function SimulationCard({ simulation }: SimulationCardProps) {
  const statusIcon = {
    pending: <Clock className="w-5 h-5 text-gray-500" />,
    running: <Play className="w-5 h-5 text-blue-500 animate-pulse" />,
    completed: <CheckCircle className="w-5 h-5 text-green-500" />,
    failed: <XCircle className="w-5 h-5 text-red-500" />
  };

  const statusText = {
    pending: 'Pending',
    running: 'Running',
    completed: 'Completed',
    failed: 'Failed'
  };

  const statusClass = {
    pending: 'bg-gray-100 text-gray-700',
    running: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700'
  };

  return (
    <Link
      href={`/${simulation.id}`}
      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {statusIcon[simulation.status]}
          <div>
            <h3 className="font-medium text-gray-900">Bill: {simulation.billId}</h3>
            <p className="text-sm text-gray-500">Region: {simulation.region}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 text-sm rounded-full ${statusClass[simulation.status]}`}>
            {statusText[simulation.status]}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(simulation.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
