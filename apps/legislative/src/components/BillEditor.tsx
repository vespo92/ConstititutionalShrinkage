'use client';

import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { GovernanceLevel } from '@constitutional-shrinkage/constitutional-framework';
import { levelLabels, regions } from '@/lib/mock-data';
import type { BillFormData } from '@/lib/types';

interface BillEditorProps {
  initialData?: Partial<BillFormData>;
  onSubmit: (data: BillFormData) => Promise<void>;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit' | 'fork';
}

export default function BillEditor({
  initialData,
  onSubmit,
  isSubmitting = false,
  mode = 'create',
}: BillEditorProps) {
  const [formData, setFormData] = useState<BillFormData>({
    title: initialData?.title || '',
    content: initialData?.content || getDefaultContent(),
    level: initialData?.level || GovernanceLevel.FEDERAL,
    regionId: initialData?.regionId,
    sunsetYears: initialData?.sunsetYears || 5,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Bill content is required';
    } else if (formData.content.length < 100) {
      newErrors.content = 'Bill content must be at least 100 characters';
    }

    if (formData.level === GovernanceLevel.REGIONAL && !formData.regionId) {
      newErrors.regionId = 'Region is required for regional bills';
    }

    if (formData.sunsetYears < 1 || formData.sunsetYears > 20) {
      newErrors.sunsetYears = 'Sunset period must be between 1 and 20 years';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await onSubmit(formData);
    }
  };

  const handleChange = (
    field: keyof BillFormData,
    value: string | number | GovernanceLevel
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const titles: Record<string, string> = {
    create: 'Create New Bill',
    edit: 'Edit Bill',
    fork: 'Fork Bill - Propose Changes',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {titles[mode]}
        </h2>

        {/* Title */}
        <div className="mb-6">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Bill Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Clean Energy Transition Act"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Governance Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="level"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Governance Level
            </label>
            <select
              id="level"
              value={formData.level}
              onChange={(e) =>
                handleChange('level', e.target.value as GovernanceLevel)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-transparent"
            >
              {Object.entries(levelLabels)
                .filter(([key]) => key !== GovernanceLevel.IMMUTABLE)
                .map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
            </select>
          </div>

          {/* Region (conditional) */}
          {(formData.level === GovernanceLevel.REGIONAL ||
            formData.level === GovernanceLevel.LOCAL) && (
            <div>
              <label
                htmlFor="regionId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Region
              </label>
              <select
                id="regionId"
                value={formData.regionId || ''}
                onChange={(e) => handleChange('regionId', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-transparent ${
                  errors.regionId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a region</option>
                {regions
                  .filter((r) => r.level === formData.level)
                  .map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
              </select>
              {errors.regionId && (
                <p className="mt-1 text-sm text-red-600">{errors.regionId}</p>
              )}
            </div>
          )}

          {/* Sunset Period */}
          <div>
            <label
              htmlFor="sunsetYears"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Sunset Period (years)
            </label>
            <input
              type="number"
              id="sunsetYears"
              min="1"
              max="20"
              value={formData.sunsetYears}
              onChange={(e) =>
                handleChange('sunsetYears', parseInt(e.target.value) || 5)
              }
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-transparent ${
                errors.sunsetYears ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.sunsetYears && (
              <p className="mt-1 text-sm text-red-600">{errors.sunsetYears}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              All legislation includes automatic sunset clauses for
              accountability
            </p>
          </div>
        </div>

        {/* Content Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              Bill Content (Markdown supported)
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-gov-blue hover:underline"
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          </div>

          {showPreview ? (
            <div className="w-full min-h-[400px] p-4 border border-gray-300 rounded-lg bg-gray-50 markdown-content overflow-y-auto">
              <ReactMarkdown>{formData.content}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={20}
              className={`w-full px-4 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-gov-blue focus:border-transparent ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="# Bill Title&#10;&#10;## Purpose&#10;&#10;## Section 1: ..."
            />
          )}
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Save as Draft
        </button>
        <div className="flex space-x-4">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-gov-blue text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? 'Submitting...'
              : mode === 'fork'
              ? 'Submit Fork'
              : 'Submit Bill'}
          </button>
        </div>
      </div>
    </form>
  );
}

function getDefaultContent(): string {
  return `# [Bill Title]

## Purpose
[Describe the purpose and goals of this legislation]

## Section 1: Definitions
[Define key terms used in this bill]

## Section 2: Provisions
[Main provisions of the bill]

## Section 3: Implementation
[How this bill will be implemented]

## Section 4: Enforcement
[Enforcement mechanisms and penalties]

## Section 5: Metrics and Reporting
[How success will be measured]
`;
}
