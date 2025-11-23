'use client';

import { useState } from 'react';
import { Check, FileSignature } from 'lucide-react';

interface SignButtonProps {
  petitionId: string;
  onSign: (petitionId: string, params: { publicSignature: boolean; comment?: string }) => Promise<void>;
  hasSigned?: boolean;
}

export function SignButton({ petitionId, onSign, hasSigned }: SignButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [publicSignature, setPublicSignature] = useState(true);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSign = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSign(petitionId, { publicSignature, comment: comment || undefined });
      setShowForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasSigned) {
    return (
      <div className="flex items-center justify-center gap-2 w-full py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-medium">
        <Check className="w-5 h-5" />
        You've signed this petition
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center justify-center gap-2 w-full py-3 bg-community-600 text-white rounded-lg font-medium hover:bg-community-700 transition-colors"
      >
        <FileSignature className="w-5 h-5" />
        Sign This Petition
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Visibility Option */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="publicSignature"
          checked={publicSignature}
          onChange={(e) => setPublicSignature(e.target.checked)}
          className="w-4 h-4 text-community-600 rounded focus:ring-community-500"
        />
        <label htmlFor="publicSignature" className="text-sm text-gray-700 dark:text-gray-300">
          Show my name publicly
        </label>
      </div>

      {/* Optional Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Add a comment (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Why are you signing?"
          rows={2}
          maxLength={500}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500 focus:border-transparent resize-none text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">{comment.length}/500</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowForm(false)}
          className="flex-1 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSign}
          disabled={isSubmitting}
          className="flex-1 py-2 bg-community-600 text-white rounded-lg font-medium hover:bg-community-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Signing...' : 'Confirm Signature'}
        </button>
      </div>
    </div>
  );
}
