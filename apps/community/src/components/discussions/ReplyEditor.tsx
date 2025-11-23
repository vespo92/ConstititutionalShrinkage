'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';

interface ReplyEditorProps {
  placeholder?: string;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export function ReplyEditor({ placeholder, onSubmit, onCancel, autoFocus }: ReplyEditorProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Write a comment...'}
        rows={3}
        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-community-500 focus:border-transparent resize-none"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Cmd/Ctrl</kbd>+
          <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd> to submit
        </p>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-1 px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="flex items-center gap-1 px-4 py-1.5 bg-community-600 text-white rounded-lg hover:bg-community-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
