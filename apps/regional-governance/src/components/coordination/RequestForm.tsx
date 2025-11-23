'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { CoordinationType, ResourceRequest } from '@/types';
import { coordinationTypeLabels } from '@/lib/mock-data';

interface RequestFormProps {
  onSubmit: (data: RequestFormData) => Promise<void>;
  availablePods: Array<{ id: string; name: string; code: string }>;
}

interface RequestFormData {
  type: CoordinationType;
  title: string;
  description: string;
  targetPods: string[];
  resources: ResourceRequest[];
  proposedStart: string;
  proposedEnd: string;
}

const requestTypes: CoordinationType[] = [
  'resource_sharing',
  'joint_initiative',
  'conflict_resolution',
  'boundary_adjustment',
  'policy_alignment',
  'emergency_response',
];

const resourceTypes = ['funding', 'personnel', 'equipment', 'expertise', 'infrastructure'] as const;

export default function RequestForm({ onSubmit, availablePods }: RequestFormProps) {
  const [formData, setFormData] = useState<RequestFormData>({
    type: 'joint_initiative',
    title: '',
    description: '',
    targetPods: [],
    resources: [],
    proposedStart: '',
    proposedEnd: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePod = (podId: string) => {
    setFormData((prev) => ({
      ...prev,
      targetPods: prev.targetPods.includes(podId)
        ? prev.targetPods.filter((id) => id !== podId)
        : [...prev.targetPods, podId],
    }));
  };

  const addResource = () => {
    setFormData((prev) => ({
      ...prev,
      resources: [...prev.resources, { type: 'funding', description: '' }],
    }));
  };

  const updateResource = (index: number, updates: Partial<ResourceRequest>) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.map((r, i) => (i === index ? { ...r, ...updates } : r)),
    }));
  };

  const removeResource = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Request Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Request Type
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as CoordinationType })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pod-green-500 focus:border-pod-green-500"
        >
          {requestTypes.map((type) => (
            <option key={type} value={type}>
              {coordinationTypeLabels[type]}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pod-green-500 focus:border-pod-green-500"
          placeholder="Enter a descriptive title..."
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pod-green-500 focus:border-pod-green-500"
          placeholder="Describe the coordination request..."
          required
        />
      </div>

      {/* Target Pods */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Pods
        </label>
        <div className="grid grid-cols-2 gap-2">
          {availablePods.map((pod) => (
            <label
              key={pod.id}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.targetPods.includes(pod.id)
                  ? 'border-pod-green-500 bg-pod-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.targetPods.includes(pod.id)}
                onChange={() => togglePod(pod.id)}
                className="sr-only"
              />
              <span className="text-sm font-medium text-gray-900">{pod.name}</span>
              <span className="text-xs text-gray-500 ml-auto">{pod.code}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proposed Start Date
          </label>
          <input
            type="date"
            value={formData.proposedStart}
            onChange={(e) => setFormData({ ...formData, proposedStart: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pod-green-500 focus:border-pod-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proposed End Date
          </label>
          <input
            type="date"
            value={formData.proposedEnd}
            onChange={(e) => setFormData({ ...formData, proposedEnd: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pod-green-500 focus:border-pod-green-500"
            required
          />
        </div>
      </div>

      {/* Resources */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Resource Requests (Optional)
          </label>
          <Button type="button" variant="ghost" size="sm" onClick={addResource}>
            <Plus size={16} className="mr-1" />
            Add Resource
          </Button>
        </div>
        <div className="space-y-3">
          {formData.resources.map((resource, index) => (
            <Card key={index} padding="sm" className="flex items-start space-x-3">
              <select
                value={resource.type}
                onChange={(e) => updateResource(index, { type: e.target.value as ResourceRequest['type'] })}
                className="px-2 py-1 text-sm border border-gray-300 rounded"
              >
                {resourceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={resource.description}
                onChange={(e) => updateResource(index, { description: e.target.value })}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="Description..."
              />
              <button
                type="button"
                onClick={() => removeResource(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </Card>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Submit Coordination Request
      </Button>
    </form>
  );
}
