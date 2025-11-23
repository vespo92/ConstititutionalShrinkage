'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Minus, Upload, Send } from 'lucide-react';

interface CommentFormProps {
  billId: string;
}

export function CommentForm({ billId }: CommentFormProps) {
  const [position, setPosition] = useState<'support' | 'oppose' | 'neutral'>('neutral');
  const [comment, setComment] = useState('');
  const [organization, setOrganization] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    // API call would go here
    console.log({ billId, position, comment, organization });
    setIsSubmitting(false);
    setComment('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Position Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Position
        </label>
        <div className="flex gap-2">
          {[
            { id: 'support', label: 'Support', icon: ThumbsUp, color: 'green' },
            { id: 'oppose', label: 'Oppose', icon: ThumbsDown, color: 'red' },
            { id: 'neutral', label: 'Neutral', icon: Minus, color: 'gray' },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setPosition(option.id as typeof position)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                position === option.id
                  ? option.color === 'green'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-2 ring-green-500'
                    : option.color === 'red'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-2 ring-red-500'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 ring-2 ring-gray-500'
                  : 'bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600'
              }`}
            >
              <option.icon className="w-4 h-4" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Comment
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your perspective on this legislation..."
          rows={6}
          required
          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length} characters
        </p>
      </div>

      {/* Organization (optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Representing Organization (optional)
        </label>
        <input
          type="text"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder="Organization name if submitting on behalf of one"
          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500 focus:border-transparent"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!comment.trim() || isSubmitting}
        className="flex items-center justify-center gap-2 w-full py-3 bg-community-600 text-white rounded-lg font-medium hover:bg-community-700 disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        {isSubmitting ? 'Submitting...' : 'Submit Comment'}
      </button>
    </form>
  );
}
