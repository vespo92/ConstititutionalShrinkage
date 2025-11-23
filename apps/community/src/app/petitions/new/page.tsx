'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Calendar, Target, MapPin } from 'lucide-react';
import { usePetition } from '@/hooks/usePetition';

interface PetitionFormData {
  title: string;
  description: string;
  category: string;
  region: string;
  goal: number;
  deadline?: string;
}

export default function NewPetitionPage() {
  const router = useRouter();
  const { createPetition, loading } = usePetition();
  const [formData, setFormData] = useState<PetitionFormData>({
    title: '',
    description: '',
    category: 'general',
    region: 'national',
    goal: 1000,
  });
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'environment', label: 'Environment' },
    { id: 'education', label: 'Education' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'transportation', label: 'Transportation' },
    { id: 'housing', label: 'Housing' },
    { id: 'economy', label: 'Economy' },
    { id: 'civil-rights', label: 'Civil Rights' },
    { id: 'general', label: 'General' },
  ];

  const regions = [
    { id: 'national', label: 'National' },
    { id: 'state', label: 'State-level' },
    { id: 'local', label: 'Local Community' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (formData.description.length < 100) {
      setError('Description must be at least 100 characters');
      return;
    }

    try {
      const petition = await createPetition(formData);
      router.push(`/petitions/${petition.id}`);
    } catch (err) {
      setError('Failed to create petition. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <a
        href="/petitions"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to petitions
      </a>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Create a Petition
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Petition Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="What change do you want to see?"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500 focus:border-transparent"
              maxLength={150}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/150 characters
            </p>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Explain why this petition matters and what action you want taken..."
              rows={8}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length} characters (minimum 100)
            </p>
          </div>

          {/* Category and Region */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Region
              </label>
              <select
                value={formData.region}
                onChange={(e) => setFormData((prev) => ({ ...prev, region: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500"
              >
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Goal and Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Target className="w-4 h-4 inline mr-1" />
                Signature Goal
              </label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData((prev) => ({ ...prev, goal: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500"
              >
                <option value={100}>100 signatures</option>
                <option value={500}>500 signatures</option>
                <option value={1000}>1,000 signatures</option>
                <option value={5000}>5,000 signatures</option>
                <option value={10000}>10,000 signatures</option>
                <option value={50000}>50,000 signatures</option>
                <option value={100000}>100,000 signatures</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Deadline (optional)
              </label>
              <input
                type="date"
                value={formData.deadline || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-community-600 text-white px-6 py-3 rounded-lg hover:bg-community-700 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create Petition'}
          </button>
        </div>
      </form>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            Signature Thresholds
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>100+ - Triggers local review</li>
            <li>1,000+ - Requires regional response</li>
            <li>10,000+ - State-level consideration</li>
            <li>100,000+ - Federal consideration</li>
          </ul>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Tips for Success
          </h3>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
            <li>Be specific about what action you want</li>
            <li>Explain why this matters now</li>
            <li>Share your petition on social media</li>
            <li>Respond to comments on your petition</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
