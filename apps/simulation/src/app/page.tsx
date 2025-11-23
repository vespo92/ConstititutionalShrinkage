'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Plus, BarChart3, FlaskConical, Clock } from 'lucide-react';
import SimulationCard from '@/components/common/SimulationCard';

interface Simulation {
  id: string;
  billId: string;
  region: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export default function SimulationDashboard() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    running: 0,
    pending: 0
  });

  useEffect(() => {
    fetchSimulations();
  }, []);

  async function fetchSimulations() {
    try {
      const response = await fetch('/api/simulations');
      const data = await response.json();
      setSimulations(data.simulations || []);

      // Calculate stats
      const sims = data.simulations || [];
      setStats({
        total: sims.length,
        completed: sims.filter((s: Simulation) => s.status === 'completed').length,
        running: sims.filter((s: Simulation) => s.status === 'running').length,
        pending: sims.filter((s: Simulation) => s.status === 'pending').length
      });
    } catch (error) {
      console.error('Failed to fetch simulations:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Policy Simulation Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Model policy impacts across People, Planet, and Profit dimensions
          </p>
        </div>
        <Link
          href="/new"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Simulation
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Simulations</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FlaskConical className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-green-600">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Play className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Running</p>
              <p className="text-2xl font-semibold text-blue-600">{stats.running}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-600">{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/sandbox"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h3 className="text-lg font-semibold text-gray-900">Quick Sandbox</h3>
          <p className="mt-2 text-sm text-gray-500">
            Run a quick simulation with preset scenarios
          </p>
        </Link>

        <Link
          href="/compare"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h3 className="text-lg font-semibold text-gray-900">Compare Policies</h3>
          <p className="mt-2 text-sm text-gray-500">
            Compare multiple policies side by side
          </p>
        </Link>

        <Link
          href="/library"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h3 className="text-lg font-semibold text-gray-900">Scenario Library</h3>
          <p className="mt-2 text-sm text-gray-500">
            Browse and manage saved scenarios
          </p>
        </Link>
      </div>

      {/* Recent Simulations */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Simulations</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading simulations...</p>
            </div>
          ) : simulations.length === 0 ? (
            <div className="text-center py-8">
              <FlaskConical className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No simulations yet</h3>
              <p className="mt-2 text-gray-500">Create your first simulation to get started</p>
              <Link
                href="/new"
                className="inline-flex items-center mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Simulation
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {simulations.slice(0, 5).map(simulation => (
                <SimulationCard key={simulation.id} simulation={simulation} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
