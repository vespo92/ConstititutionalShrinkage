'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, Send, Clock, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Question {
  id: string;
  content: string;
  author: { name: string };
  upvotes: number;
  hasUpvoted: boolean;
  isAnswered: boolean;
  createdAt: string;
}

interface QAPanelProps {
  eventId: string;
  isPreview?: boolean;
}

export function QAPanel({ eventId, isPreview }: QAPanelProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');

  useEffect(() => {
    // Simulated questions
    setQuestions([
      {
        id: '1',
        content: 'What is the timeline for implementing the new energy standards?',
        author: { name: 'Alice Johnson' },
        upvotes: 45,
        hasUpvoted: false,
        isAnswered: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
      {
        id: '2',
        content: 'How will small businesses be affected by the proposed changes?',
        author: { name: 'Bob Smith' },
        upvotes: 32,
        hasUpvoted: true,
        isAnswered: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      },
      {
        id: '3',
        content: 'Are there any exemptions for rural communities?',
        author: { name: 'Carol White' },
        upvotes: 28,
        hasUpvoted: false,
        isAnswered: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
    ]);
  }, [eventId]);

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim() || isSubmitting) return;

    setIsSubmitting(true);
    // API call would go here
    const question: Question = {
      id: Date.now().toString(),
      content: newQuestion,
      author: { name: 'You' },
      upvotes: 1,
      hasUpvoted: true,
      isAnswered: false,
      createdAt: new Date().toISOString(),
    };
    setQuestions((prev) => [question, ...prev]);
    setNewQuestion('');
    setIsSubmitting(false);
  };

  const handleUpvote = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            upvotes: q.hasUpvoted ? q.upvotes - 1 : q.upvotes + 1,
            hasUpvoted: !q.hasUpvoted,
          };
        }
        return q;
      })
    );
  };

  const sortedQuestions = [...questions].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.upvotes - a.upvotes;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="h-full flex flex-col">
      {/* Question Input */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitQuestion()}
            placeholder="Ask a question..."
            maxLength={300}
            className="flex-1 px-3 py-2 bg-slate-700 border-none rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-community-500 text-sm"
          />
          <button
            onClick={handleSubmitQuestion}
            disabled={!newQuestion.trim() || isSubmitting}
            className="px-3 py-2 bg-community-600 text-white rounded-lg hover:bg-community-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="px-4 py-2 flex gap-2">
        <button
          onClick={() => setSortBy('popular')}
          className={`px-3 py-1 rounded text-sm ${
            sortBy === 'popular'
              ? 'bg-community-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Popular
        </button>
        <button
          onClick={() => setSortBy('recent')}
          className={`px-3 py-1 rounded text-sm ${
            sortBy === 'recent'
              ? 'bg-community-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Recent
        </button>
      </div>

      {/* Questions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedQuestions.map((question) => (
          <div
            key={question.id}
            className={`p-3 rounded-lg ${
              question.isAnswered
                ? 'bg-green-900/20 border border-green-700'
                : 'bg-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Upvote */}
              <button
                onClick={() => handleUpvote(question.id)}
                className={`flex flex-col items-center ${
                  question.hasUpvoted ? 'text-community-400' : 'text-gray-400'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-xs font-medium">{question.upvotes}</span>
              </button>

              {/* Content */}
              <div className="flex-1">
                <p className="text-white text-sm">{question.content}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <span>{question.author.name}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                  </span>
                  {question.isAnswered && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        Answered
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
