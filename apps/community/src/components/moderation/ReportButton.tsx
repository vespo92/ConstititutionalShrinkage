'use client';

import { useState } from 'react';
import { Flag, X } from 'lucide-react';

interface ReportButtonProps {
  contentType: 'discussion' | 'comment' | 'petition' | 'user';
  contentId: string;
}

export function ReportButton({ contentType, contentId }: ReportButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    { id: 'spam', label: 'Spam or advertising' },
    { id: 'harassment', label: 'Harassment or bullying' },
    { id: 'misinformation', label: 'Misinformation' },
    { id: 'hate-speech', label: 'Hate speech' },
    { id: 'off-topic', label: 'Off-topic content' },
    { id: 'other', label: 'Other' },
  ];

  const handleSubmit = async () => {
    if (!reason || isSubmitting) return;

    setIsSubmitting(true);
    // API call would go here
    console.log({ contentType, contentId, reason, details });
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setShowModal(false);
      setSubmitted(false);
      setReason('');
      setDetails('');
    }, 2000);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
      >
        <Flag className="w-4 h-4" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flag className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Report Submitted
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Thank you for helping keep our community safe.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Report Content
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason for reporting
                    </label>
                    <div className="space-y-2">
                      {reasons.map((r) => (
                        <label
                          key={r.id}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            reason === r.id
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="reason"
                            value={r.id}
                            checked={reason === r.id}
                            onChange={(e) => setReason(e.target.value)}
                            className="text-red-600"
                          />
                          <span className="text-gray-700 dark:text-gray-300">{r.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional details (optional)
                    </label>
                    <textarea
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Provide more context..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-red-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!reason || isSubmitting}
                      className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
