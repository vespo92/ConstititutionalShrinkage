'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchBill, proposeNewAmendment } from '@/lib/api';
import DiffViewer from '@/components/DiffViewer';
import type { Bill, AmendmentFormData } from '@/lib/types';

export default function ProposeAmendmentPage() {
  const params = useParams();
  const router = useRouter();
  const billId = params.billId as string;

  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState<AmendmentFormData>({
    description: '',
    proposedChanges: '',
  });

  useEffect(() => {
    async function loadBill() {
      try {
        const data = await fetchBill(billId);
        setBill(data);
        if (data) {
          setFormData((prev) => ({
            ...prev,
            proposedChanges: data.content,
          }));
        }
      } catch (err) {
        console.error('Failed to load bill:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBill();
  }, [billId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.description.trim()) {
      setError('Please provide a description for your amendment');
      return;
    }

    if (formData.proposedChanges === bill?.content) {
      setError('Your proposed changes must differ from the original bill');
      return;
    }

    setIsSubmitting(true);

    try {
      await proposeNewAmendment(billId, formData);
      router.push(`/bills/${billId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to propose amendment');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gov-blue"></div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Bill not found</h2>
        <Link href="/bills" className="mt-4 inline-block text-gov-blue hover:underline">
          &larr; Back to Bills
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav>
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-gov-blue">Dashboard</Link>
          </li>
          <li>&gt;</li>
          <li>
            <Link href="/bills" className="hover:text-gov-blue">Bills</Link>
          </li>
          <li>&gt;</li>
          <li>
            <Link href={`/bills/${bill.id}`} className="hover:text-gov-blue">
              {bill.title}
            </Link>
          </li>
          <li>&gt;</li>
          <li className="text-gray-900">Propose Amendment</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Propose Amendment</h1>
        <p className="mt-2 text-gray-600">
          Propose changes to: <strong>{bill.title}</strong>
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amendment Description */}
        <div className="bg-white rounded-lg shadow p-6">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Amendment Description
          </label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="e.g., Extend deadline for rural utilities"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-transparent"
          />
          <p className="mt-2 text-sm text-gray-500">
            Provide a brief summary of what your amendment changes
          </p>
        </div>

        {/* Editor / Preview Toggle */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Proposed Changes</h3>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className={`px-3 py-1 rounded text-sm ${
                  !showPreview
                    ? 'bg-gov-blue text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className={`px-3 py-1 rounded text-sm ${
                  showPreview
                    ? 'bg-gov-blue text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Preview Diff
              </button>
            </div>
          </div>

          {showPreview ? (
            <div className="p-6">
              <DiffViewer
                oldContent={bill.content}
                newContent={formData.proposedChanges}
                oldLabel="Current Bill"
                newLabel="Your Amendment"
              />
            </div>
          ) : (
            <div className="p-6">
              <textarea
                value={formData.proposedChanges}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    proposedChanges: e.target.value,
                  }))
                }
                rows={25}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-gov-blue focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                Edit the bill content above to reflect your proposed changes.
                Markdown formatting is supported.
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Amendment Process</h4>
          <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
            <li>Submit your proposed amendment</li>
            <li>Other citizens review and comment on your changes</li>
            <li>The bill sponsor may accept, reject, or modify your amendment</li>
            <li>If accepted, the amendment becomes part of the bill</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            href={`/bills/${bill.id}`}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-gov-blue text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Amendment'}
          </button>
        </div>
      </form>
    </div>
  );
}
