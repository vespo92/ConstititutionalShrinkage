'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function CreatePodPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <Link href="/pods" className="inline-flex items-center text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} className="mr-1" />
        Back to Pods
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Propose New Pod</h1>
        <p className="mt-1 text-gray-600">
          Submit a proposal for creating a new regional governance pod
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pod Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pod-green-500 focus:border-pod-green-500"
                placeholder="e.g., Greater Portland Metro"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pod Code *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pod-green-500 focus:border-pod-green-500"
                  placeholder="e.g., OR-PDX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pod Type *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pod-green-500 focus:border-pod-green-500"
                >
                  <option value="">Select type...</option>
                  <option value="municipal">Municipal</option>
                  <option value="county">County</option>
                  <option value="regional">Regional</option>
                  <option value="state">State</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pod-green-500 focus:border-pod-green-500"
                placeholder="Describe the proposed pod, its geographic boundaries, and purpose..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Population
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pod-green-500 focus:border-pod-green-500"
                placeholder="e.g., 500000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proposed Headquarters
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pod-green-500 focus:border-pod-green-500"
                placeholder="e.g., Portland, OR"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Justification *
              </label>
              <textarea
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pod-green-500 focus:border-pod-green-500"
                placeholder="Why should this pod be created? What community needs does it address?"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button type="submit" isLoading={isSubmitting} className="w-full">
                Submit Proposal
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Your proposal will be reviewed by the regional coordinator
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
