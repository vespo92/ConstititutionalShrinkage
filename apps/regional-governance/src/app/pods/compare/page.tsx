'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { mockPods } from '@/lib/mock-data';
import PodCompare from '@/components/pods/PodCompare';
import Card from '@/components/ui/Card';

export default function PodComparePage() {
  const [selectedPods, setSelectedPods] = useState<string[]>([mockPods[0].id, mockPods[1].id]);

  const addPod = (podId: string) => {
    if (!selectedPods.includes(podId) && selectedPods.length < 4) {
      setSelectedPods([...selectedPods, podId]);
    }
  };

  const removePod = (podId: string) => {
    setSelectedPods(selectedPods.filter(id => id !== podId));
  };

  const availablePods = mockPods.filter(p => !selectedPods.includes(p.id));
  const podsToCompare = mockPods.filter(p => selectedPods.includes(p.id));

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link href="/pods" className="inline-flex items-center text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} className="mr-1" />
        Back to Pods
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Compare Pods</h1>
        <p className="mt-1 text-gray-600">
          Side-by-side comparison of regional pod metrics
        </p>
      </div>

      {/* Pod Selection */}
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500 mr-2">Comparing:</span>
          {selectedPods.map(podId => {
            const pod = mockPods.find(p => p.id === podId);
            if (!pod) return null;
            return (
              <span
                key={podId}
                className="inline-flex items-center px-3 py-1 bg-pod-green-100 text-pod-green-700 rounded-full text-sm"
              >
                {pod.name}
                <button
                  onClick={() => removePod(podId)}
                  className="ml-2 hover:text-pod-green-900"
                >
                  <X size={14} />
                </button>
              </span>
            );
          })}
          {selectedPods.length < 4 && availablePods.length > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addPod(e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-3 py-1 border border-dashed border-gray-300 rounded-full text-sm text-gray-500 bg-transparent"
            >
              <option value="">+ Add pod</option>
              {availablePods.map(pod => (
                <option key={pod.id} value={pod.id}>{pod.name}</option>
              ))}
            </select>
          )}
        </div>
      </Card>

      {/* Comparison Table */}
      <Card padding="none">
        <PodCompare pods={podsToCompare} />
      </Card>
    </div>
  );
}
