'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Link as LinkIcon } from 'lucide-react';
import { useDiscussion } from '@/hooks/useDiscussion';

interface DiscussionFormData {
  title: string;
  content: string;
  category: string;
  billId?: string;
  tags: string[];
}

export default function NewDiscussionPage() {
  const router = useRouter();
  const { createThread, loading } = useDiscussion();
  const [formData, setFormData] = useState<DiscussionFormData>({
    title: '',
    content: '',
    category: 'general',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'legislation', label: 'Legislation', description: 'Discuss specific bills or laws' },
    { id: 'policy', label: 'Policy Debate', description: 'Broader policy discussions' },
    { id: 'local', label: 'Local Issues', description: 'Community-specific topics' },
    { id: 'feedback', label: 'Feedback', description: 'Suggestions and feedback' },
    { id: 'general', label: 'General', description: 'Open discussion' },
  ];

  const handleAddTag = () => {
    if (tagInput && !formData.tags.includes(tagInput) && formData.tags.length < 5) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.toLowerCase().replace(/[^a-z0-9]/g, '')],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    try {
      const thread = await createThread(formData);
      router.push(`/discussions/${thread.id}`);
    } catch (err) {
      setError('Failed to create discussion. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <a
        href="/discussions"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to discussions
      </a>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Start a Discussion
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="What would you like to discuss?"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500 focus:border-transparent"
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/300 characters
            </p>
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.category === cat.id
                      ? 'border-community-500 bg-community-50 dark:bg-community-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.id}
                    checked={formData.category === cat.id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{cat.label}</div>
                    <div className="text-sm text-gray-500">{cat.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Link to Bill (optional) */}
          {formData.category === 'legislation' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <LinkIcon className="w-4 h-4 inline mr-1" />
                Link to Bill (optional)
              </label>
              <input
                type="text"
                value={formData.billId || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, billId: e.target.value }))}
                placeholder="Enter bill ID (e.g., HR-2025-0042)"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Share your thoughts, questions, or ideas..."
              rows={8}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Markdown formatting is supported
            </p>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (up to 5)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-community-100 dark:bg-community-900/30 text-community-700 dark:text-community-300 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-community-900"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500 focus:border-transparent"
                disabled={formData.tags.length >= 5}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={formData.tags.length >= 5}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-community-600 text-white px-6 py-3 rounded-lg hover:bg-community-700 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Creating...' : 'Start Discussion'}
          </button>
        </div>
      </form>

      {/* Guidelines */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
          Community Guidelines
        </h3>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
          <li>Be respectful and constructive in your discussions</li>
          <li>Stay on topic and contribute meaningfully</li>
          <li>Cite sources when making factual claims</li>
          <li>Report content that violates community standards</li>
        </ul>
      </div>
    </div>
  );
}
